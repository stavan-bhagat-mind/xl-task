const { Models, sequelize, Sequelize } = require("../../models");
const { Op } = require("sequelize");
const { http } = require("../../utility/constant");
const { messages } = require("../../utility/message");
const { validateFormula } = require("../../validations/formulaValidation");
const { SELECT } = require("sequelize/lib/query-types");
const { sendFormulaReport } = require("../../config/emailConfig");

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

module.exports.formulaCalculationsReport = async (req, res) => {
  try {
    const userId = req.userId;
    const [formulas, user] = await Promise.all([
      await Models.Formula.findAll({
        where: { created_by: userId },
        raw: true,
      }),
      await Models.User.findAll({
        where: { id: userId },
        raw: true,
      }),
    ]);

    const results = [];

    for (const formula of formulas) {
      try {
        // Extract all placeholders like sav:2022 or fix:2022-05
        const placeholderRegex = /([a-zA-Z]+):(\d{4}(?:-\d{2})?)/g;
        const formulaString = formula.formula;
        const matches = [...formulaString.matchAll(placeholderRegex)];

        let evaluatedFormula = formulaString;

        for (const match of matches) {
          const [fullMatch, synonym, datePart] = match;
          const [year, month] = datePart.split("-");

          // date range
          const startDate = new Date(year, month ? month - 1 : 0, 1);
          const endDate = new Date(
            year,
            month ? month - 1 : 11,
            month ? new Date(year, month, 0).getDate() : 31
          );
          // Query to get sum of one synonym ex sav:2024 or sav:2024-05
          const total = await Models.Transaction.findAll({
            where: {
              user_id: userId,
              date: {
                [Op.between]: [startDate, endDate],
              },
            },
            group: ["account_id", "transactionAccount.id"],
            attributes: [
              "account_id",
              [Sequelize.col("transactionAccount.synonym"), "synonym"],
              [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
            ],
            include: [
              {
                model: Models.Account,
                as: "transactionAccount",
                where: {
                  synonym,
                },
                attributes: [],
              },
            ],
            raw: true,
          });

          // Replace placeholder with the actual value
          evaluatedFormula = evaluatedFormula.replace(
            fullMatch,
            total[0]?.totalAmount || 0
          );
        }

        // Replace all operators with spaces first to safely split
        const sanitizedFormula = evaluatedFormula
          .replace(/[^0-9\+\-\*\/\(\)\.\s]/g, "")
          .trim();

        // Use Function constructor instead of eval for better security
        const calculateResult = eval(sanitizedFormula);

        results.push({
          id: formula.id,
          formula: formula.formula,
          evaluatedFormula: sanitizedFormula,
          result: calculateResult.toFixed(2),
        });
      } catch (formulaError) {
        //  one formula fails, add error ,others will be continue
        results.push({
          id: formula.id,
          formula: formula.formula,
          error: "Invalid formula or calculation error",
        });
      }
    }

    sendFormulaReport(
      user[0].email,
      results,
      "Formula Calculation Report",
      user[0].name
    );
    return res.status(200).json(results);
  } catch (error) {
    console.error("Formula calculation error:", error);
    res.status(500).json({
      error: "An error occurred while calculating the formulas.",
    });
  }
};
