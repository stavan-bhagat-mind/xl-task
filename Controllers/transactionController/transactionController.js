const { Models } = require("../../models");
const { readXLData } = require("../../utility/helper");
const { Op } = require("sequelize");
const { http } = require("../../utility/constant");

module.exports.createTransaction = async (req, res) => {
  try {
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

    // Create transactions
    const transactions = result.values.slice(1).map((transaction) => ({
      account_id: accountMap[transaction.name],
      user_id: userId,
      category: transaction.category,
      date: transaction.date,
      amount: transaction.amount,
    }));

    await Models.Transaction.bulkCreate(transactions);

    return res.status(http.OK.code).send({
      success: true,
      message: "Transactions created successfully",
      data: {
        totalProcessed: transactions.length,
        accounts: Object.keys(accountMap).length,
      },
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(http.INTERNAL_SERVER_ERROR.code).send({
      success: false,
      message: "Error creating transaction",
      error: error.message,
    });
  }
};
// if (errors.length > 0) {
//   return res.send({
//     errors,
//     message: "Failed",
//   });
// }

// // // Step 1: Fetch existing accounts
// const accountData = await Models.Account.findAll({
//   where: {
//     name: { [Op.in]: data[0].accountNames },
//     user_id: userId,
//   },
// });

// // Step 2: Create a mapping of existing accounts
// const accountMap = {};
// accountData.forEach((account) => {
//   accountMap[account.dataValues.name] = account.dataValues.id;
// });
// console.log("data------", data);
// console.log("accountData", accountData);
// console.log("accountMap", accountMap);

// const createdTransactions = await Models.Transaction.findAndCountAll({})
// // Step 3: Identify missing accounts
// const missingAccountNames = data[0].accountNames.filter(
//   (name) => !accountMap[name]
// );

// // Step 4: Insert missing accounts
// const newAccounts = missingAccountNames.map((name) => ({
//   name,
//   user_id: userId,
// }));

// // Insert new accounts if there are any
// if (newAccounts.length > 0) {
//   const createdAccounts = await Models.Account.bulkCreate(newAccounts);
//   // Update the accountMap with newly created accounts
//   createdAccounts.forEach((account) => {
//     accountMap[account.dataValues.name] = account.dataValues.id;
//   });
// }

// // Step 5: Remove the first element (accountNames) from data
// data.shift();

// // Step 6: Transform the transaction data to include account IDs
// const transactionData = data.map((transaction) => {
//   return {
//     account_id: accountMap[transaction.name],
//     category: transaction.category,
//     date: transaction.date,
//     amount: transaction.amount,
//     created_by: userId,
//   };
// });

// // Step 7: Perform the bulk insert for transactions
// const createdTransactions = await Models.Transaction.bulkCreate(
//   transactionData
// );
// console.log("Created Transactions:", createdTransactions);
// --------------------------
// console.log(data[0].accountNames);
// const accountData = await Models.Account.findAll({
//   where: {
//     name: { [Op.in]: data[0].accountNames },
//     user_id: userId,
//   },
// });
// console.log("accountData", accountData);
// const accountDetails = accountData.map((account) => {
//   return {
//     id: account.dataValues.id,
//     name: account.dataValues.name,
//   };
// });
// console.log("accountData", accountDetails);
// data.shift();
// const transactionData = await Models.Transaction.bulkCreate(data);
// console.log("transactionData", transactionData);
// const data = await Models.User.create({ name });

//     return res.send({
//       data,
//       // accountData,
//       message: "success",
//     });
//   } catch (e) {
//     // return res.send({
//     //   data: null,
//     //   message: "Something went wrong.",
//     // });
//   }
// };
