const Joi = require("joi");
const { http, role } = require("../utility/constant");
const dataValue = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Rent",
  "Health",
  "Education",
  "Miscellaneous",
];

const validateTransaction = (data, existingEntries) => {
  const transactionValidationSchema =
    // Joi.array().items({
    Joi.object({
      name: Joi.string().required(),
      category: Joi.valid(...dataValue).required(),
      date: Joi.date().required(),
      amount: Joi.number().required(),
      synonym: Joi.string().min(3).max(8).required(),
    }).custom((value, helpers) => {
      const uniqueKey = `${value.name}-${
        value.category
      }-${value.date.toISOString()}-${value.amount}`;
      if (existingEntries.has(uniqueKey)) {
        return helpers.error("any.duplicate", {
          message: `Duplicate entry found for name: ${value.name}, category: ${
            value.category
          }, date: ${value.date.toISOString()}`,
        });
      }
      existingEntries.add(uniqueKey);
      return value;
    });

  const { error, value } = transactionValidationSchema.validate(data, {
    abortEarly: false,
    messages: {
      "any.duplicate": "{{#message}}",
    },
  });
  if (error) {
    return {
      success: false,
      error,
      value: data,
    };
  }

  return {
    success: true,
    value,
    error: null,
  };
};

module.exports = {
  validateTransaction,
};
