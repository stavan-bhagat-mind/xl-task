const { Models, sequelize, Sequelize } = require("../../models");
const { readXLData } = require("../../utility/helper");
const { http } = require("../../utility/constant");
const { messages } = require("../../utility/message");
const { Op } = require("sequelize");
const moment = require("moment");
const models = require("../../models");

module.exports.createTransaction = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    const BATCH_SIZE = 100;
    const userId = req.userId;
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    // Process the Excel file
    const result = await readXLData(
      // "/Users/mind/Documents/demo/xl task/xl-task.xlsx",
      req.file.path,
      userId
    );

    if (!result.success) {
      const errorMessage =
        result.errors.length >= 100
          ? "More than 100 errors found. Please correct the inputs."
          : "Errors found";
      await dbTransaction.rollback();
      return res.status(http.BAD_REQUEST.code).send({
        success: false,
        data: result.errors,
        message: errorMessage,
      });
    }

    // Get account data for the user
    const accountData = await Models.Account.findAll({
      where: {
        name: { [Models.Sequelize.Op.in]: result.values[0].accountNames },
        user_id: userId,
      },
    });

    // Create account mapping
    const accountMap = {};
    accountData.forEach((account) => {
      accountMap[account.dataValues.name] = account.dataValues.id;
    });

    // Step 3: Identify missing accounts
    const missingAccountNames = result.values[0].accountNames.filter(
      (name) => !accountMap[name]
    );

    // Step 4: Insert missing accounts
    const newAccounts = missingAccountNames.map((name) => ({
      name,
      user_id: userId,
      synonym: name.synonym,
    }));

    // Insert new accounts if there are any
    if (newAccounts.length > 0) {
      const createdAccounts = await Models.Account.bulkCreate(newAccounts, {
        transaction: dbTransaction,
      });
      // Update the accountMap with newly created accounts
      createdAccounts.forEach((account) => {
        accountMap[account.dataValues.name] = account.dataValues.id;
      });
    }
    //Step 5: Create transactions in batches
    const transactionBatchPromises = [];
    let batch = [];

    for (const transaction of result.values.slice(1)) {
      batch.push({
        account_id: accountMap[transaction.name],
        user_id: userId,
        category: transaction.category,
        date: transaction.date,
        amount: transaction.amount,
      });

      if (batch.length === BATCH_SIZE) {
        transactionBatchPromises.push(
          Models.Transaction.bulkCreate(batch, {
            transaction: dbTransaction,
          })
        );
        batch = [];
      }
    }

    // Handle the remaining transactions (less than batch size)
    if (batch.length > 0) {
      transactionBatchPromises.push(
        Models.Transaction.bulkCreate(batch, {
          transaction: dbTransaction,
        })
      );
    }

    await Promise.all(transactionBatchPromises);
    await dbTransaction.commit();
    return res.status(http.OK.code).send({
      success: true,
      message: "Transactions created successfully",
      data: {
        totalProcessed: result.values.length - 1,
        accounts: Object.keys(accountMap).length,
      },
    });
  } catch (error) {
    await dbTransaction.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Unique Constraint Error",
        message: messages.TRANSACTION_SHOULD_BE_UNIQUE,
        // details: e.errors.map((e) => e.message),
      });
    }
    console.error("Error creating transaction:", error);
    return res.status(http.INTERNAL_SERVER_ERROR.code).send({
      success: false,
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

module.exports.getMonthlyReport = async (userId) => {
  try {
    // const userId = req.userId;
    const currentMonthTransactions = await Models.Transaction.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.gte]: moment().startOf("month").toDate(),
          [Op.lt]: moment().add(1, "month").startOf("month").toDate(),
        },
      },
      group: ["account_id", "transactionAccount.name"],
      attributes: [
        "account_id",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
      ],
      include: [
        {
          model: Models.Account,
          as: "transactionAccount",
          attributes: ["name"],
        },
      ],
      raw: true,
    });

    const previousMonthTransactions = await Models.Transaction.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.gte]: moment().subtract(1, "months").startOf("month").toDate(),
          [Op.lt]: moment().startOf("month").toDate(),
        },
      },
      include: [
        {
          model: Models.Account,
          as: "transactionAccount",
          attributes: ["name"],
        },
      ],
      group: ["account_id", "transactionAccount.name"],
      attributes: [
        "account_id",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
      ],
      raw: true,
    });

    const report = {
      accounts: {},
      totalCurrentMonth: 0,
      totalPreviousMonth: 0,
    };

    // Process current month transactions
    currentMonthTransactions.forEach((transaction) => {
      const accountName = transaction["transactionAccount.name"];
      const totalAmount = parseFloat(transaction.totalAmount);

      // Initialize account data if not already present
      if (!report.accounts[accountName]) {
        report.accounts[accountName] = {
          currentMonthTotal: 0,
          previousMonthTotal: 0,
          absoluteChange: 0,
          percentageChange: 0,
        };
      }

      // Update current month total for the account
      report.accounts[accountName].currentMonthTotal += totalAmount;
      report.totalCurrentMonth += totalAmount;
    });

    // previous month transactions
    previousMonthTransactions.forEach((transaction) => {
      const accountName = transaction["transactionAccount.name"];
      const totalAmount = parseFloat(transaction.totalAmount);

      if (!report.accounts[accountName]) {
        report.accounts[accountName] = {
          currentMonthTotal: 0,
          previousMonthTotal: 0,
          absoluteChange: 0,
          percentageChange: 0,
        };
      }

      report.accounts[accountName].previousMonthTotal += totalAmount;
      report.totalPreviousMonth += totalAmount;
    });

    // Calculate absolute and percentage changes for each account
    for (const accountName in report.accounts) {
      const accountData = report.accounts[accountName];
      const absoluteChange =
        accountData.currentMonthTotal - accountData.previousMonthTotal;
      const percentageChange =
        accountData.previousMonthTotal === 0
          ? 0
          : (absoluteChange / accountData.previousMonthTotal) * 100;

      accountData.absoluteChange = absoluteChange.toFixed(2);
      accountData.percentageChange = percentageChange.toFixed(2) + "%";
    }

    return report;
  } catch (e) {
    console.log(e);
  }
};

module.exports.getYearlyReport = async (userId) => {
  try {
    const currentYear = moment().year();
    const startOfYear = moment().startOf("year").toDate();
    const endOfYear = moment().endOf("year").toDate();

    // Fetch current year transactions
    const currentYearTransactions = await Models.Transaction.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.gte]: startOfYear,
          [Op.lt]: endOfYear,
        },
      },
      group: ["account_id", "transactionAccount.name"],
      attributes: [
        "account_id",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
      ],
      include: [
        {
          model: Models.Account,
          as: "transactionAccount",
          attributes: ["name"],
        },
      ],
      raw: true,
    });

    // Fetch previous year transactions
    const previousYearTransactions = await Models.Transaction.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.gte]: moment().subtract(1, "year").startOf("year").toDate(),
          [Op.lt]: moment().subtract(1, "year").endOf("year").toDate(),
        },
      },
      group: ["account_id", "transactionAccount.name"],
      attributes: [
        "account_id",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
      ],
      include: [
        {
          model: Models.Account,
          as: "transactionAccount",
          attributes: ["name"],
        },
      ],
      raw: true,
    });

    const report = {
      accounts: {},
      totalCurrentYear: 0,
      totalPreviousYear: 0,
    };

    // Process current year transactions
    currentYearTransactions.forEach((transaction) => {
      const accountName = transaction["transactionAccount.name"];
      const totalAmount = parseFloat(transaction.totalAmount);

      // Initialize account data if not already present
      if (!report.accounts[accountName]) {
        report.accounts[accountName] = {
          currentYearTotal: 0,
          previousYearTotal: 0,
          absoluteChange: 0,
          percentageChange: 0,
        };
      }

      // Update current year total for the account
      report.accounts[accountName].currentYearTotal += totalAmount;
      report.totalCurrentYear += totalAmount;
    });

    // Process previous year transactions
    previousYearTransactions.forEach((transaction) => {
      const accountName = transaction["transactionAccount.name"];
      const totalAmount = parseFloat(transaction.totalAmount);

      // Initialize account data if not already present
      if (!report.accounts[accountName]) {
        report.accounts[accountName] = {
          currentYearTotal: 0,
          previousYearTotal: 0,
          absoluteChange: 0,
          percentageChange: 0,
        };
      }

      report.accounts[accountName].previousYearTotal += totalAmount;
      report.totalPreviousYear += totalAmount;
    });

    // Calculate absolute and percentage changes for each account
    for (const accountName in report.accounts) {
      const accountData = report.accounts[accountName];
      const absoluteChange =
        accountData.currentYearTotal - accountData.previousYearTotal;
      const percentageChange =
        accountData.previousYearTotal === 0
          ? 0
          : (absoluteChange / accountData.previousYearTotal) * 100;

      accountData.absoluteChange = absoluteChange.toFixed(2);
      accountData.percentageChange = percentageChange.toFixed(2) + "%";
    }
    return report;
  } catch (e) {
    console.log(e);
    throw new Error("Error generating yearly report");
  }
};
