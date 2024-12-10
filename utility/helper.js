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
//   const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { dateNF: 'YYYY-MM-DD' });

//   // Convert date serial numbers to Date objects
//   xlData.forEach(row => {
//     if (row.date) {
//       row.date = XLSX.SSF.parse_date_code(row.date);
//     }
//   });

//   return xlData;
// };
// ----------------------

module.exports.readXLData = async (file, res) => {
  try {
    var workbook = XLSX.readFile(file);
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    xlData.forEach((row) => {
      if (row.date) {
        const excelDate = new Date((row.date - 25569) * 86400 * 1000);
        // Format the date to DD-MM-YYYY
        const day = String(excelDate.getDate()).padStart(2, "0");
        const month = String(excelDate.getMonth() + 1).padStart(2, "0");
        const year = excelDate.getFullYear();
        row.date = `${day}-${month}-${year}`;
      }
    });
    // data = validateTransaction(xlData);
    const { success, errors, value } = validateTransaction(xlData);
    if (success) {
      return value;
    } else {
      return errors;
    }
    return xlData;
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
