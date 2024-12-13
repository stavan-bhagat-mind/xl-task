const { Models ,sequelize} = require("../../models");
const { readXLData } = require("../../utility/helper");
const { http } = require("../../utility/constant");

module.exports.createTransaction = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    const BATCH_SIZE = 100;
    const userId = req.userId;
    // Process the Excel file
    const result = await readXLData(
      "/Users/mind/Documents/demo/xl task/xl-task.xlsx",
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
    console.error("Error creating transaction:", error);
    return res.status(http.INTERNAL_SERVER_ERROR.code).send({
      success: false,
      message: "Error creating transaction",
      error: error.message,
    });
  }
};
