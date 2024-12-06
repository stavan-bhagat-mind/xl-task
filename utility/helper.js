const fs = require("fs");
const path = require("path"); // Add this line
const axios = require("axios");
const XLSX = require("xlsx");
// module.exports.readXLData = () => {
//   var workbook = XLSX.readFile("xl-task.xlsx");
//   var sheet_name_list = workbook.SheetNames;
//   var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
//   console.log("xlData", xlData);
//   return xlData;
// };

module.exports.readXLData = async (fileUrl) => {
  try {
    // Download the file from Cloudinary
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    });

    // Create a temporary file path
    const tempFilePath = path.join(__dirname, "temp.xlsx");

    // Pipe the response data to a file
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    // Wait for the file to finish writing
    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        // Read the Excel file
        const workbook = XLSX.readFile(tempFilePath);
        const sheetNameList = workbook.SheetNames;
        const xlData = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetNameList[0]]
        );
        console.log("xlData", xlData);

        // Clean up the temporary file
        fs.unlinkSync(tempFilePath); // Delete the temporary file

        resolve(xlData);
      });

      writer.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error reading Excel data:", error);
    throw error;
  }
};
