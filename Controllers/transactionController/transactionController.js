// const Models = require("../../models/index");
const { Models } = require("../../models");
const { readXLData } = require("../../utility/helper");
// const {
//   validateTransaction,
// } = require("../../validations/transactionValidation");

module.exports.createTransaction = async (req, res) => {
  try {
    // console.log("hello", req.file.path);
    // if (!req.file) {
    //   return res.status(400).json({ error: "No  file uploaded" });
    // }
    // const fileUrl = req.file.path;
    // console.log(fileUrl);

    const data = await readXLData(
      "/Users/mind/Documents/demo/xl task/xl-task.xlsx",
      res
    );
    console.log("data", data);

    // const [accountData] = await Promise.all([Models.Account.findAll({})]);

    // const data = await Models.User.create({ name });
    return res.send({
      data,
      message: "Success",
    });
  } catch (e) {
    // return res.send({
    //   data: null,
    //   message: "Something went wrong.",
    // });
  }
};
