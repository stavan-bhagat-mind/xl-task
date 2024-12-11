const fs = require("fs");
const path = require("path");
const axios = require("axios");
const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const { salt } = require("../utility/constant");
const { validateTransaction } = require("../validations/transactionValidation");
const { http } = require("../utility/constant");

// module.exports.readXLData = (file) => {
//   const workbook = XLSX.readFile(file);
//   const sheet_name_list = workbook.SheetNames;
//   const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
//     dateNF: "YYYY-MM-DD",
//   });
//   // Convert date serial numbers to Date objects
//   xlData.forEach((row) => {
//     if (row.date) {
//       row.date = XLSX.SSF.parse_date_code(row.date);
//     }
//   });

//   return xlData;
// };
// ----------------------

module.exports.readXLData = async (file, res) => {
  try {
    const errors = [];
    const maxErrors = 100;
    const uniqueTransactions = new Set();
    const values = [{ accountNames: [] }];
    var workbook = XLSX.readFile(file);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const xlData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    for (let index = 0; index < xlData.length; index++) {
      if (errors.length >= maxErrors) {
        break;
      }

      const row = xlData[index];
      if (row.date) {
        const [month, day, year] = row.date.split("-");
        row.date = new Date(`${year}-${month}-${day}`);
      }

      const { success, error, value } = validateTransaction(
        row,
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
