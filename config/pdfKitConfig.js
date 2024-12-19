const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const reportsDir = path.join(__dirname, "reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir); 
}

const createPDF = (report, reportType) => {
  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    size: "A4",
  });

  const fileName = `${reportType}_report_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  const filePath = path.join(reportsDir, fileName);
  doc.pipe(fs.createWriteStream(filePath));

  let currentY = 50; // Track vertical position

  // Header
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fillColor("#1a237e")
    .text(
      reportType === "yearly"
        ? "Annual Financial Report"
        : "Monthly Financial Report",
      50,
      currentY,
      {
        align: "center",
        width: 500,
      }
    );

  currentY += 40; // Move down after title

  doc
    .fontSize(10)
    .fillColor("#666")
    .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, currentY, {
      align: "right",
      width: 500,
    });

  currentY += 40; // Space before summary section

  // Summary section
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor("#2c3e50")
    .text("Summary", 50, currentY, {
      underline: true,
      width: 500,
    });

  currentY += 30; // Space after summary header

  // Summary boxes
  const currentTotal = report.totalCurrentYear || report.totalCurrentMonth;
  const previousTotal = report.totalPreviousYear || report.totalPreviousMonth;
  const period = reportType === "yearly" ? "year" : "month";

  // Draw boxes
  const boxHeight = 70;

  // Current period box
  doc.rect(50, currentY, 250, boxHeight).fillAndStroke("#f8f9fa", "#dee2e6");

  doc
    .fontSize(12)
    .fillColor("#2c3e50")
    .text(`Current ${period}`, 60, currentY + 10)
    .fontSize(20)
    .text(`${currentTotal} INR`, 60, currentY + 30)
    .fontSize(10)
    .fillColor("#6c757d");

  // Previous period box
  doc.rect(310, currentY, 250, boxHeight).fillAndStroke("#f8f9fa", "#dee2e6");

  doc
    .fontSize(12)
    .fillColor("#2c3e50")
    .text(`Previous ${period}`, 320, currentY + 10)
    .fontSize(20)
    .text(`${previousTotal} INR`, 320, currentY + 30);

  currentY += boxHeight + 40; // Space after summary boxes

  // Account details section
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor("#2c3e50")
    .text("Account Details", 50, currentY, {
      underline: true,
      width: 500,
    });

  currentY += 30; // Space after account details header

  // Table headers
  const tableHeaders = ["Account", "Current", "Previous", "Change", "% Change"];
  const columnWidth = 100;

  // Header background
  doc.rect(50, currentY, 500, 25).fill("#2c3e50");

  // Header text
  doc.fontSize(10).fillColor("#ffffff");

  tableHeaders.forEach((header, i) => {
    doc.text(header, 50 + i * columnWidth, currentY + 7, {
      width: columnWidth,
      align: "center",
    });
  });

  currentY += 25; // Move to start of table rows

  // Table rows
  Object.entries(report.accounts).forEach(([name, data], i) => {
    // Row background
    doc.rect(50, currentY, 500, 25).fill(i % 2 === 0 ? "#f8f9fa" : "#ffffff");

    // Row data
    doc
      .fontSize(9)
      .fillColor("#2c3e50")
      .text(name, 50, currentY + 7, {
        width: columnWidth,
        align: "left",
      })
      .text(
        `${data.currentYearTotal || data.currentMonthTotal}`,
        50 + columnWidth,
        currentY + 7,
        { width: columnWidth, align: "right" }
      )
      .text(
        `${data.previousYearTotal || data.previousMonthTotal}`,
        50 + columnWidth * 2,
        currentY + 7,
        { width: columnWidth, align: "right" }
      )
      .text(`${data.absoluteChange}`, 50 + columnWidth * 3, currentY + 7, {
        width: columnWidth,
        align: "right",
      })
      .text(`${data.percentageChange}`, 50 + columnWidth * 4, currentY + 7, {
        width: columnWidth,
        align: "right",
      });

    currentY += 25; // Move to next row
  });

  // Footer with page number
  doc.fontSize(8).text("Page 1 of 1", 0, doc.page.height - 50, {
    align: "center",
    width: doc.page.width,
  });

  doc.end();
  return filePath;
};

module.exports = {
  createPDF,
};
