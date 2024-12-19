const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createFormulaExcel = async (formulaResults, password) => {
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, "xlReports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.properties.password = password; // Set workbook-level password
  workbook.properties.protection = {
    lockStructure: true,
    lockWindows: true,
  };

  const worksheet = workbook.addWorksheet("Formula Calculations");

  // Add columns and data structure
  worksheet.columns = [
    { header: "Original Formula", key: "formula", width: 40 },
    { header: "Evaluated Formula", key: "evaluatedFormula", width: 40 },
    { header: "Result", key: "result", width: 15 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "2C3E50" },
  };
  worksheet.getRow(1).font = { color: { argb: "FFFFFF" }, bold: true };

  // Add title
  worksheet.insertRow(1, ["Formula Calculations Report"]);
  worksheet.mergeCells("A1:C1");
  worksheet.getRow(1).font = { size: 16, bold: true };
  worksheet.getRow(1).alignment = { horizontal: "center" };

  // Add generation date
  worksheet.insertRow(2, [`Generated on: ${new Date().toLocaleDateString()}`]);
  worksheet.mergeCells("A2:C2");
  worksheet.getRow(2).font = { size: 10, color: { argb: "666666" } };
  worksheet.getRow(2).alignment = { horizontal: "right" };

  // Add data rows
  let currentRow = 4;
  formulaResults.forEach((result, index) => {
    worksheet.addRow({
      formula: result.formula,
      evaluatedFormula: result.evaluatedFormula,
      result: result.result,
    });

    // Lock all cells in this row
    worksheet.lastRow.eachCell((cell) => {
      cell.protection = {
        locked: true,
      };
    });

    // Alternate row colors
    if (index % 2 === 0) {
      worksheet.getRow(currentRow).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F8F9FA" },
      };
    }
    currentRow++;
  });

  // Add number formatting for the Result column
  worksheet.getColumn(3).numFmt = "#,##0.00";

  // Add cell styling and protection
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.protection = { locked: true };
      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      };
    });
  });

  // Enable worksheet protection
  worksheet.protect(password, {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false,
  });

  const fileName = `formula_calculations_${
    new Date().toISOString().split("T")[0]
  }_protected.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  // Save with encryption
  await workbook.xlsx.writeFile(filePath, {
    filename: filePath,
    useStyles: true,
    useSharedStrings: true,
    password: password, // This is the key for file-level encryption
    lockStructure: true,
    lockWindows: true,
  });

  return filePath;
};

const createSecurePDF = async (formulaResults, password) => {
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, "pdfReports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document with encryption
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        userPassword: password, // Password required to open the document
        ownerPassword: password, // Password required to edit the document
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false,
        },
      });

      const fileName = `formula_calculations_${
        new Date().toISOString().split("T")[0]
      }_secure.pdf`;
      const filePath = path.join(reportsDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      // Pipe the PDF to the file
      doc.pipe(writeStream);

      // Add company logo or header image (using a placeholder rectangle for this example)
      doc.save().rect(50, 50, 50, 50).fill("#2C3E50");

      // Add title
      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor("#2C3E50")
        .text("Formula Calculations Report", 120, 60);

      // Add generation date
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#666666")
        .text(`Generated on: ${new Date().toLocaleDateString()}`, {
          align: "right",
        });

      // Add some spacing
      doc.moveDown(2);

      // Add table headers with background
      const tableTop = 150;
      const tableHeaders = ["Original Formula", "Evaluated Formula", "Result"];
      const columnWidth = (doc.page.width - 100) / 3;

      // Draw header background
      doc.rect(50, tableTop - 5, doc.page.width - 100, 30).fill("#2C3E50");

      // Add header text
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(12);

      tableHeaders.forEach((header, i) => {
        doc.text(header, 50 + i * columnWidth, tableTop, {
          width: columnWidth,
          align: "center",
          padding: 10,
        });
      });

      // Add table rows
      let yPosition = tableTop + 40;

      formulaResults.forEach((result, index) => {
        // Add alternating row background
        if (index % 2 === 0) {
          doc.rect(50, yPosition - 5, doc.page.width - 100, 30).fill("#F8F9FA");
        }

        doc.fillColor("#000000").font("Helvetica").fontSize(11);

        // Add row data
        doc.text(result.formula, 50, yPosition, { width: columnWidth });
        doc.text(result.evaluatedFormula, 50 + columnWidth, yPosition, {
          width: columnWidth,
        });

        // Convert result to a number and check validity
        const resultValue = parseFloat(result.result);
        if (!isNaN(resultValue)) {
          doc.text(resultValue.toFixed(2), 50 + 2 * columnWidth, yPosition, {
            width: columnWidth,
            align: "right", // Align result to the right for better readability
          });
        } else {
          // Handle the case where result.result is not a valid number
          doc.text("N/A", 50 + 2 * columnWidth, yPosition, {
            width: columnWidth,
            align: "right",
          });
        }

        yPosition += 40;

        // Add new page if needed
        if (yPosition > doc.page.height - 100) {
          doc.addPage();
          yPosition = 50;
        }
      });

      // Add footer
      doc
        .fontSize(8)
        .fillColor("#666666")
        .text(
          "CONFIDENTIAL - This document is password protected",
          50,
          doc.page.height - 50,
          { align: "center" }
        );

      // Finalize the PDF
      doc.end();

      writeStream.on("finish", () => {
        resolve(filePath);
      });

      writeStream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createSecurePDF, createFormulaExcel };
