const Joi = require("joi");
const { http, role } = require("../utility/constant");

const validateAccount = (data, res) => {
  const accountValidationSchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(30)
      .required()
      .lowercase()
      .custom((value, helpers) => {
        const regex = /^[a-zA-Z_]+$/;
        if (!regex.test(value)) {
          return helpers.message(
            "Name should only contain letters, and underscores"
          );
        }
        return value;
      }),
    balance: Joi.string().default(1000),
  });
  const { error, value } = accountValidationSchema.validate(data);
  if (error) {
    throw new Error(error.details.map((detail) => detail.message).join(", "));
  }
  return {
    success: true,
    value,
  };
};

module.exports = {
  validateAccount,
};
