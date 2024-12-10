const { Models } = require("../../models/index");
const { http } = require("../../utility/constant");
const { messages } = require("../../utility/message");
const { validateAccount } = require("../../validations/accountValidation");

module.exports.createAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { value } = validateAccount(req.body, res);
    const data = await Models.Account.create({
      name: value.name,
      balance: value.balance,
      user_id: userId,
    });

    return res.status(http.OK.code).send({
      success: true,
      data,
      message: http.OK.message,
    });
  } catch (e) {
    if (e.message) {
      return res.status(http.BAD_REQUEST.code).send({
        success: false,
        data: null,
        message: e.message,
      });
    }
    return res.status(http.INTERNAL_SERVER_ERROR.code).send({
      success: false,
      data: null,
      message: http.INTERNAL_SERVER_ERROR.message,
    });
  }
};
