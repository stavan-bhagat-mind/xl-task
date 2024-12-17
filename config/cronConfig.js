const cron = require("node-cron");
const { Models } = require("../models/index");
const { sendReport } = require("../config/emailConfig");
const {
  getMonthlyReport,
  getYearlyReport,
} = require("../Controllers/transactionController/transactionController");

// Schedule: first day of every month at 10:00 AM
cron.schedule("0 10 1 * *", async () => {
  console.log("Generating and sending monthly reports...");
  await generateAndSendReports("monthly");
});
// Schedule: every year on January 1st at 10:00 AM
cron.schedule("0 10 1 1 *", async () => {
  console.log("Running annual task...");
  await generateAndSendReports("yearly");
});

// Schedule the task to run every minute
    // cron.schedule("* * * * *", async () => {
    //   await generateAndSendReports("monthly");
    //   await generateAndSendReports("yearly");
    // });

async function generateAndSendReports(reportType) {
  const users = await Models.User.findAll();

  for (const user of users) {
    let report;

    // Determine which report to generate based on the reportType
    if (reportType === "yearly") {
      report = await getYearlyReport(user.id);
      sendReport(user.email, report, "yearly", user.name);
      console.log(`Yearly report sent to ${user.email}`);
    } else if (reportType === "monthly") {
      report = await getMonthlyReport(user.id);
      sendReport(user.email, report, "monthly", user.name);
      console.log(`Monthly report sent to ${user.email}`);
    } else {
      console.error("Invalid report type specified.");
    }
  }
}
