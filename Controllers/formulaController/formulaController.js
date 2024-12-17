const { Models, sequelize } = require("../../models");
const { Op } = require("sequelize");
const { http } = require("../../utility/constant");
const { messages } = require("../../utility/message");
const { validateFormula } = require("../../validations/formulaValidation");

module.exports.addFormula = async (req, res) => {
  try {
    const userId = req.userId;
    const dbTransaction = await sequelize.transaction();
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
    const formulas = value.map((value) => {
      return { formula: value, created_by: userId };
    });

    const data = await Models.Formula.bulkCreate(formulas, {
      transaction: dbTransaction,
    });
    await dbTransaction.commit();
    return res.status(http.OK.code).send({
      success: true,
      data,
      message: http.OK.message,
    });
  } catch (e) {
    await dbTransaction.rollback();
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Unique Constraint Error",
        message: messages.FORMULA_SHOULD_BE_UNIQUE,
        // details: e.errors.map((e) => e.message),
      });
    }
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
