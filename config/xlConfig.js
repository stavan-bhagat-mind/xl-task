const XlsxPopulate = require("xlsx-populate");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createFormulaExcel = async (formulaResults, password) => {
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, "xlReports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // Create a new workbook
  const workbook = await XlsxPopulate.fromBlankAsync();
  const sheet = workbook.sheet(0);

  // Rename the sheet
  sheet.name("Formula Calculations");

  // Set column widths
  sheet.column("A").width(40);
  sheet.column("B").width(40);
  sheet.column("C").width(15);

  // Add title
  sheet.cell("A1").value("Formula Calculations Report").style({
    fontSize: 16,
    bold: true,
    horizontalAlignment: "center",
  });
  sheet.range("A1:C1").merged(true);

  // Add generation date
  sheet
    .cell("A2")
    .value(`Generated on: ${new Date().toLocaleDateString()}`)
    .style({
      fontSize: 10,
      fontColor: "666666",
      horizontalAlignment: "right",
    });
  sheet.range("A2:C2").merged(true);

  // Add headers
  const headers = ["Original Formula", "Evaluated Formula", "Result"];
  headers.forEach((header, index) => {
    sheet
      .cell(3, index + 1)
      .value(header)
      .style({
        bold: true,
        fill: "2C3E50",
        fontColor: "FFFFFF",
      });
  });

  // Add data rows
  formulaResults.forEach((result, index) => {
    const rowNum = index + 4;
    sheet.cell(rowNum, 1).value(result.formula);
    sheet.cell(rowNum, 2).value(result.evaluatedFormula);
    sheet
      .cell(rowNum, 3)
      .value(result.result)
      .style({ numberFormat: "#,##0.00" });

    // Add alternate row coloring
    if (index % 2 === 0) {
      sheet.range(`A${rowNum}:C${rowNum}`).style({
        fill: "F8F9FA",
      });
    }
  });

  // Apply general styling to all cells
  const dataRange = sheet.range(`A1:C${formulaResults.length + 3}`);
  dataRange.style({
    verticalAlignment: "center",
    wrapText: true,
  });

  const fileName = `formula_calculations_${
    new Date().toISOString().split("T")[0]
  }_protected.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  // Save with password protection
  await workbook.toFileAsync(filePath, { password: password });

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
