const fs = require("fs");
const { Models } = require("../models/index");
const path = require("path");
const axios = require("axios");
const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const { salt } = require("../utility/constant");
const { validateTransaction } = require("../validations/transactionValidation");
const { http } = require("../utility/constant");

const excelDateToJSDate = (excelDate) => {
  // Excel dates are number of days since Dec 30, 1899
  const utcDays = Math.floor(excelDate - 25569);
  const utcValue = utcDays * 86400 * 1000;
  return new Date(utcValue);
};

module.exports.readXLData = async (file, userId) => {
  try {
    const errors = [];
    const maxErrors = 100;
    const uniqueTransactions = new Set();
    const values = [{ accountNames: [] }];

    const workbook = XLSX.readFile(file, {
      stream: true,
      sheets: [0],
      density: true,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Read headers
    const headers = {};
    const headerRow = range.s.r;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
      const cell = worksheet[cellAddress];
      if (cell) headers[col] = cell.v;
    }

    // Process rows in batches
    const batchSize = 1000;
    let currentBatch = [];

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const rowData = {};

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (cell && headers[col]) {
          rowData[headers[col]] = cell.v;
        }
      }

      if (Object.keys(rowData).length === 0) continue;

      if (rowData.date) {
        rowData.date = excelDateToJSDate(rowData.date);
      }

      const { success, error, value } = validateTransaction(
        rowData,
        uniqueTransactions
      );

      if (!success) {
        errors.push({
          row: row + 1,
          details: [{ message: error.message.replace(/\"/g, "") }],
        });
      } else {
        values[0].accountNames.push(value.name);
        currentBatch.push(value);
      }

      if (currentBatch.length >= batchSize) {
        await processBatch(currentBatch, userId, errors, row - batchSize + 1);
        currentBatch = [];
      }

      if (errors.length >= maxErrors) break;
    }

    if (currentBatch.length > 0) {
      await processBatch(
        currentBatch,
        userId,
        errors,
        range.e.r - currentBatch.length + 1
      );
    }

    return {
      success: errors.length === 0,
      errors,
      values,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ message: error.message || "Error processing Excel file" }],
      values: null,
    };
  }
};

const processBatch = async (batch, userId, errors, startRow) => {
  try {
    const conditions = batch.map((t) => ({
      [Models.Sequelize.Op.and]: {
        date: t.date,
        amount: t.amount,
        category: t.category,
      },
    }));

    const existingTransactions = await Models.Transaction.findAll({
      where: {
        user_id: userId,
        [Models.Sequelize.Op.or]: conditions,
      },
      include: [
        {
          model: Models.Account,
          attributes: ["name"],
        },
      ],
      attributes: ["account_id", "category", "date", "amount", "user_id"],
      raw: true,
    });

    existingTransactions.forEach((transaction, idx) => {
      const key = `${transaction["Account.name"]}-${
        transaction.category
      }-${new Date(transaction.date).toISOString()}-${transaction.amount}`;

      if (uniqueTransactions.has(key)) {
        errors.push({
          row: startRow + idx,
          details: [
            {
              message: `Duplicate transaction found in database for account: ${
                transaction["Account.name"]
              }, date: ${new Date(transaction.date).toISOString()}, amount: ${
                transaction.amount
              }, category: ${transaction.category}`,
            },
          ],
        });
      }
    });
  } catch (error) {
    errors.push({
      row: startRow,
      details: [{ message: "Error processing batch: " + error.message }],
    });
  }
};

//     for (let index = 0; index < xlData.length; index += CHUNK_SIZE) {
//       const chunk = xlData.slice(index, index + CHUNK_SIZE);
//       for (const transaction of chunk) {
//         if (errors.length >= maxErrors) {
//           break;
//         }

//         if (transaction.date) {
//           const [month, day, year] = transaction.date.split("-");
//           transaction.date = new Date(Date.UTC(year, month - 1, day));
//         }
//         const { success, error, value } = validateTransaction(
//           transaction,
//           uniqueTransactions
//         );

//         if (!success) {
//           errors.push({
//             row: index + 1,
//             details: [
//               {
//                 message: error.message.replace(/\"/g, ""),
//               },
//             ],
//           });
//         } else {
//           values[0].accountNames.push(value.name);
//           values.push(value);
//         }
//       }
//       if (errors.length >= maxErrors) {
//         break;
//       }
//       if (values.length > 0) {
//         const conditions = values.slice(1).map((t) => ({
//           [Models.Sequelize.Op.and]: {
//             date: t.date,
//             amount: t.amount,
//             category: t.category,
//           },
//         }));
//         const existingTransactions = await Models.Transaction.findAll({
//           where: {
//             user_id: userId,
//             [Models.Sequelize.Op.or]: conditions,
//           },
//           include: [
//             {
//               model: Models.Account,
//               attributes: ["name"],
//             },
//           ],
//           attributes: ["account_id", "category", "date", "amount", "user_id"],
//           raw: true,
//         });

//         // Create a map of existing transactions for quick looku
//         existingTransactions.forEach((t) => {
//           const b = `${t["Account.name"]}-${t.category}-${new Date(
//             t.date
//           ).toISOString()}-${t.amount}`;
//           console.log(uniqueTransactions.has(b));
//           if (
//             uniqueTransactions.has(
//               `${t["Account.name"]}-${t.category}-${new Date(
//                 t.date
//               ).toISOString()}-${t.amount}`
//             )
//           ) {
//             errors.push({
//               row: index + idx + 1,
//               details: [
//                 {
//                   message: `Duplicate transaction found in database for account: ${
//                     transaction.name
//                   }, date: ${transaction.date.toISOString()}, amount: ${
//                     transaction.amount
//                   }, category: ${transaction.category}`,
//                 },
//               ],
//             });
//           }
//         });

//         // Check for duplicates and add errors
//       }
//     }
//     if (errors.length > 0) {
//       const errorMessage =
//         errors.length >= maxErrors
//           ? "More than 100 errors found. Please correct the inputs."
//           : "Errors found";
//       return res.status(http.BAD_REQUEST.code).send({
//         success: false,
//         data: errors,
//         message: errorMessage,
//       });
//     } else {
//       return values;
//     }
//   } catch (e) {
//     if (e.message) {
//       return res.status(http.BAD_REQUEST.code).send({
//         success: false,
//         data: null,
//         message: e.message,
//       });
//     }
//   }
// };

module.exports.hashConvert = async (plainPassword) => {
  return new Promise((resolve, reject) => {
    try {
      bcrypt.hash(plainPassword, salt, function (err, hash) {
        if (err) throw err;
        resolve(hash);
        reject(err);
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.hashVerify = async (password, hashPassword) => {
  return new Promise((resolve, reject) => {
    try {
      bcrypt.compare(password, hashPassword, (err, data) => {
        if (err) throw err;
        if (data) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

// module.exports.readXLData = async (fileUrl) => {
//   try {
//     // Download the file from Cloudinary
//     const response = await axios({
//       method: "get",
//       url: fileUrl,
//       responseType: "stream",
//     });

//     // Create a temporary file path
//     const tempFilePath = path.join(__dirname, "temp.xlsx");

//     // Pipe the response data to a file
//     const writer = fs.createWriteStream(tempFilePath);
//     response.data.pipe(writer);

//     // Wait for the file to finish writing
//     return new Promise((resolve, reject) => {
//       writer.on("finish", () => {
//         // Read the Excel file
//         const workbook = XLSX.readFile(tempFilePath);
//         const sheetNameList = workbook.SheetNames;
//         const xlData = XLSX.utils.sheet_to_json(
//           workbook.Sheets[sheetNameList[0]]
//         );
//         console.log("xlData", xlData);

//         // Clean up the temporary file
//         fs.unlinkSync(tempFilePath); // Delete the temporary file

//         resolve(xlData);
//       });

//       writer.on("error", (error) => {
//         reject(error);
//       });
//     });
//   } catch (error) {
//     console.error("Error reading Excel data:", error);
//     throw error;
//   }
// };
