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
const validateTransaction = (data) => {
  const transactionValidationSchema =
    // Joi.array().items({
    Joi.object({
      name: Joi.string().required(),
      category: Joi.valid(...dataValue).required(),
      date: Joi.date().required(),
      amount: Joi.number().required(),
    });

  const { error, value } = transactionValidationSchema.validate(data, {
    abortEarly: false,
  });
  const errors = [];

  if (error) {
    // const errors = error.details.map((detail) => ({
    //   path: detail.path.join("."),
    //   message: detail.message,
    // }));
    // console.log(errors);
    return {
      error,
    };
  }

  // if (error) {
  //   const errorMap = {};
  //   error.details.forEach((detail) => {
  //     const path = detail.path.join(".");
  //     const row = parseInt(path.split(".")[0]) + 1;
  //     const field = path.split(".")[1];
  //     if (!errorMap[row]) {
  //       errorMap[row] = {};
  //     }
  //     if (!errorMap[row][field]) {
  //       errorMap[row][field] = detail.message;
  //     }
  //   });

  //   const errors = Object.entries(errorMap).map(([row, fields]) => ({
  //     row,
  //     errors: Object.entries(fields).map(([field, message]) => ({
  //       field,
  //       message,
  //     })),
  //   }));
  //   return {
  //     success: false,
  //     errors,
  //   };
  // }
  return {
    success: true,
    value,
  };
};

module.exports = {
  validateTransaction,
};
