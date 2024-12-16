const { Models, sequelize } = require("../../models");
const { Op } = require("sequelize");
const { http } = require("../../utility/constant");
const { messages } = require("../../utility/message");
const { validateFormula } = require("../../validations/formulaValidation");

module.exports.addFormula = async (req, res) => {
  try {
    const userId = req.userId;
    const { value, error, synonyms } = validateFormula(req.body);
    if (error) {
      return res.status(http.BAD_REQUEST.code).send({
        success: false,
        data: error,
        message: http.BAD_REQUEST.message,
      });
    }

    const accountData = await Models.Account.findAll({
      distinct: true,
      where: {
        synonym: { [Op.in]: synonyms },
      },
    });
    const synonymsArray = accountData.map(
      (account) => account.dataValues.synonym
    );

    const result = synonyms.every((synonym) => synonymsArray.includes(synonym));
    if (!result) {
      return res.status(http.BAD_REQUEST.code).send({
        success: false,
        data: null,
        message: messages.SYNONYMS_NOT_FOUND,
      });
    }
    const data = await Models.Formula.create({
      formula: value.formula,
      created_by: userId,
    });

    return res.status(http.OK.code).send({
      success: true,
      data: value,
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
