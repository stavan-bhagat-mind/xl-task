const nodemailer = require("nodemailer");
require("dotenv").config();
const { createPDF } = require("../config/pdfKitConfig");
const { createFormulaExcel, createSecurePDF } = require("../config/xlConfig");
const path = require("path");
const ejs = require("ejs");
// const logo = `https://i.ibb.co/tX1c3N3/download.jpg`;
const logo = `https://i.ibb.co/VTr9mPc/dfcaw75-45c477a9-14f7-4dcc-a09c-8405e5011f72.gif`;
// Create transporters for different email accounts
const transporters = {
  verification: nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  }),
  report: nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  }),
};

// Function to send verification email
async function sendVerificationEmail(email, token) {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Verify Your Email",
    text: `Please verify your email using this token: ${token}`,
  };

  await transporters.verification.sendMail(mailOptions);
  console.log(`Verification email sent to ${email}`);
}

// Function to send report email
async function sendReport(email, report, reportType, username) {
  const filePath = createPDF(report, reportType);

  const templatePath = path.join(__dirname, "../views/reportMailTemplate.ejs");
  const html = await ejs.renderFile(templatePath, {
    username,
    reportType,
    logo,
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject:
      reportType === "yearly" ? "Your Yearly Report" : "Your Monthly Report",
    text: `Please find attached your ${reportType} report.`,
    html: html,
    attachments: [
      {
        filename: `${reportType}_report.pdf`,
        path: filePath,
      },
    ],
  };

  await transporters.report.sendMail(mailOptions);
  console.log(
    `${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    } report sent to ${email}`
  );
}
// Function to send formula report email
async function sendFormulaReport(email, report, reportType, username) {
  const filePath = await createFormulaExcel(report, email);
  // const filePath = await createSecurePDF(report, email);

  // Render the EJS template for plain text
  const templatePath = path.join(__dirname, "../views/reportMailTemplate.ejs");
  const html = await ejs.renderFile(templatePath, {
    username,
    reportType,
    logo,
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: reportType,
    text: `Please find attached your ${reportType}.`,
    html: html,
    attachments: [
      {
        path: filePath,
      },
    ],
  };

  transporters.report.sendMail(mailOptions);
  console.log(
    `${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    } report sent to ${email}`
  );
}
module.exports = {
  sendVerificationEmail,
  sendReport,
  sendFormulaReport,
};
