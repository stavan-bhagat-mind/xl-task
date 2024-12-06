// const Models = require("../../models/index");
const { readXLData } = require("../utility/helper");
module.exports.createData = async (req, res) => {
  try {
    console.log("hello");
    if (!req.file) {
      return res.status(400).json({ error: "No  file uploaded" });
    }
    const fileUrl = req.file.path;
    console.log(fileUrl);
    const data = readXLData(fileUrl);
    console.log("data", data);
    const tData = {
      name: String,
      category: String,
      date: Number,
      amount: Number,
    };
    // const data = await Models.User.create({ name });
    // res.send({
    //   data,
    //   message: "Success", 
    // });
  } catch (e) {
    res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};
