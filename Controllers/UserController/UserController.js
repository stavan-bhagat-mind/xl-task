const { Models } = require("../../models/index");
const { errors, role, messages } = require("../../utility/message");
const { http } = require("../../utility/constant");
const { hashConvert, hashVerify } = require("../../utility/helper");
const {
  validateUserRegister,
  validateLogin,
} = require("../../validations/userValidation");

var jwt = require("jsonwebtoken");

module.exports.getListOfUsers = async (req, res) => {
  try {
    const data = await Models.User.findAndCountAll({
      offset: 0,
      limit: 20,
    });
    return res.send({
      data,
    });
  } catch (e) {
    console.log(e);
    return res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};

module.exports.getUserDataFromId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await Models.User.findOne({
      where: {
        id,
      },
    });
    if (!data) {
      return res.status(404).send({
        data,
        message: "User with given id does not exist",
      });
    }
    res.send({
      data,
      message: "Success",
    });
  } catch (e) {
    res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Models.User.destroy({
      where: {
        id,
      },
    });
   return res.send({
      message: "User removed successfully.",
    });
  } catch (e) {
   return res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { value } = validateUserRegister(req.body, res);
    const hashPassword = await hashConvert(value.password);
    const newUser = await Models.User.create({
      name: value.name,
      password: hashPassword,
      role: value.role,
      address: value.address,
      email: value.email,
    });

    return res.status(http.CREATED.code).send({
      success: true,
      data: {
        userName: newUser.user_name,
      },
      message: http.CREATED.message,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Unique Constraint Error",
        message: messages.EMAIL_SHOULD_BE_UNIQUE,
        details: error.errors.map((e) => e.message),
      });
    }
    return res.status(http.INTERNAL_SERVER_ERROR.code).send({
      success: false,
      data: null,
      message: http.INTERNAL_SERVER_ERROR.message,
    });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { value } = validateLogin(req.body, res);
    const User = await Models.User.findOne({
      where: {
        email: value.email,
      },
    });

    if (!User) {
      return res.status(http.NOT_FOUND.code).send({
        success: false,
        message: http.NOT_FOUND.message.replace("##", "User"),
      });
    }
    await hashVerify(value.password, User.dataValues.password);
    const accessToken = jwt.sign(
      {
        data: { email: User.dataValues.email, id: User.dataValues.id },
      },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPIRE_TIME }
    );

    const refreshToken = jwt.sign(
      {
        data: { email: User.dataValues.email, id: User.dataValues.id },
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME }
    );

    return res.status(http.ACCEPTED.code).send({
      success: true,
      data: {
        userName: User.dataValues.user_name,
      },
      accessToken,
      refreshToken,
      message: http.ACCEPTED.message,
    });
  } catch (e) {
    return res.status(http.INTERNAL_SERVER_ERROR.code).send({
      success: false,
      data: null,
      message: http.INTERNAL_SERVER_ERROR.message,
    });
  }
};

module.exports.getAuthenticationToken = async (req, res) => {
  try {
    const refreshToken = req.headers["refresh-token"];
    if (!refreshToken)
      throw { isError: true, message: errors.TOKEN_NOT_PROVIDED };
    const token = refreshToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_KEY);

    const accessToken = jwt.sign(
      {
        data: decoded.data,
      },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPIRE_TIME }
    );
    return  res.status(http.CREATED.code).send({
      success: true,
      accessToken,
      message: http.CREATED.message,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return  res.status(http.UNAUTHORIZED.code).send({
        success: false,
        data: null,
        message: errors.TOKEN_EXPIRE,
        errorName: error.name,
      });
    } else if (error.name === "JsonWebTokenError") {
      return  res.status(http.FORBIDDEN.code).send({
        success: false,
        data: null,
        message: errors.INVALID_TOKEN,
        errorName: error.name,
      });
    } else {
      return  res.status(http.INTERNAL_SERVER_ERROR.code).send({
        success: false,
        data: null,
        message: http.INTERNAL_SERVER_ERROR.message,
      });
    }
  }
};
