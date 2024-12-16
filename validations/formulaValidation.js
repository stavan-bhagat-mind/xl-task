const Joi = require("joi");

const validateFormula = (data) => {
  const synonyms = [];
  const formulaValidationSchema = Joi.object({
    formula: Joi.string()
      .required()
      .pattern(/^[a-zA-Z_:\d\s+\-*/()]+/) // Allow only valid formula characters
      .pattern(/[a-zA-Z_]+:\d{4}(-\d{2}(-\d{2})?)?/) // Require at least one synonym:date
      .pattern(/^[^+\-*/].*[^+\-*/]$/) // Formula can't start or end with operators
      .custom((value, helpers) => {
        // Check for invalid operator sequences
        if (/[+\-*/]{2,}/.test(value)) {
          return helpers.message(
            "Invalid operator sequence (e.g., ++, --, +-)."
          );
        }

        // Check for operators at the start or end of the formula
        if (/^[+\-*/]|[+\-*/]$/.test(value)) {
          return helpers.message(
            "Formula cannot start or end with an operator."
          );
        }
        // Extract synonym names
        const synonymPattern = /([a-zA-Z_]+):\d{4}(-\d{2}(-\d{2})?)?/g;

        let match;

        while ((match = synonymPattern.exec(value)) !== null) {
          synonyms.push(match[1]);
        }

        // Basic math expression validation
        try {
          const testFormula = value
            .replace(/[a-zA-Z_]+:\d{4}(-\d{2}(-\d{2})?)?/g, "1")
            .trim();
          Function(`"use strict"; return (${testFormula})`)();
          return value;
        } catch {
          return helpers.message("Invalid mathematical expression.");
        }
      })
      .messages({
        "string.empty": "Formula is required.",
        "string.pattern.base":
          "Formula contains invalid characters or structure.",
      }),
  });

  const { error, value } = formulaValidationSchema.validate(data);
  if (error) {
    return { success: false, error: error.details.map((err) => err.message) };
  }
  return {
    success: true,
    value,
    synonyms,
  };
};

module.exports = {
  validateFormula,
};
