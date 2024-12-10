const Joi = require("joi");
const { http, role } = require("../utility/constant");

const validateUserRegister = (data, res) => {
  const userValidationSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "user").required(),
    address: Joi.string().optional(),
  });
  const { error, value } = userValidationSchema.validate(data);
  if (error) {
    return res.status(http.BAD_REQUEST.code).send({
      data: null,
      message: http.BAD_REQUEST.message,
      details: error.details.map((detail) => detail.message),
    });
  }
  return {
    success: true,
    value,
  };
};

const validateLogin = (data, res) => {
  const loginValidationSchema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    password: Joi.string().min(6).required(),
  });
  const { error, value } = loginValidationSchema.validate(data);
  if (error) {
    return res.status(http.BAD_REQUEST.code).send({
      success: false,
      message: http.BAD_REQUEST.message,
      details: error.details.map((detail) => detail.message),
    });
  }
  return {
    success: true,
    value,
  };
};

module.exports = { validateUserRegister, validateLogin };
