const fs = require("fs");
const { Models } = require("../models/index");
const path = require("path");
const axios = require("axios");
const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const { salt } = require("../utility/constant");
const { validateTransaction } = require("../validations/transactionValidation");
const { http } = require("../utility/constant");

module.exports.readXLData = async (file, res, userId) => {
  try {
    const CHUNK_SIZE = 2;
    const errors = [];
    const maxErrors = 100;
    const uniqueTransactions = new Set();
    const values = [{ accountNames: [] }];
    var workbook = XLSX.readFile(file);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const xlData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    console.log("xlData", xlData);

    for (let index = 0; index < xlData.length; index += CHUNK_SIZE) {
      const chunk = xlData.slice(index, index + CHUNK_SIZE);
      for (const transaction of chunk) {
        if (errors.length >= maxErrors) {
          break;
        }

        if (transaction.date) {
          const [month, day, year] = transaction.date.split("-");
          transaction.date = new Date(Date.UTC(year, month - 1, day));
        }
        const { success, error, value } = validateTransaction(
          transaction,
          uniqueTransactions
        );

        if (!success) {
          errors.push({
            row: index + 1,
            details: [
              {
                message: error.message.replace(/\"/g, ""),
              },
            ],
          });
        } else {
          values[0].accountNames.push(value.name);
          values.push(value);
        }
      }
      if (errors.length >= maxErrors) {
        break;
      }
      if (values.length > 0) {
        const conditions = values.slice(1).map((t) => ({
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

        // Create a map of existing transactions for quick looku
        existingTransactions.forEach((t) => {
          const b = `${t["Account.name"]}-${t.category}-${new Date(
            t.date
          ).toISOString()}-${t.amount}`;
        console.log(  uniqueTransactions.has(b))
          if (
            uniqueTransactions.has(
              `${t["Account.name"]}-${t.category}-${new Date(
                t.date
              ).toISOString()}-${t.amount}`
            )
          ) {
            errors.push({
              row: index + idx + 1,
              details: [
                {
                  message: `Duplicate transaction found in database for account: ${
                    transaction.name
                  }, date: ${transaction.date.toISOString()}, amount: ${
                    transaction.amount
                  }, category: ${transaction.category}`,
                },
              ],
            });
          }
        });

        // Check for duplicates and add errors
      }
    }
    if (errors.length > 0) {
      const errorMessage =
        errors.length >= maxErrors
          ? "More than 100 errors found. Please correct the inputs."
          : "Errors found";
      return res.status(http.BAD_REQUEST.code).send({
        success: false,
        data: errors,
        message: errorMessage,
      });
    } else {
      return values;
    }
  } catch (e) {
    if (e.message) {
      return res.status(http.BAD_REQUEST.code).send({
        success: false,
        data: null,
        message: e.message,
      });
    }
  }
};

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
