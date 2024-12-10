const { http } = require("../utility/constant");
const { errors } = require("../utility/message");

require("dotenv").config;
const jwt = require("jsonwebtoken");

const authenticationMiddleware = (req, res, next) => {
  try {
    const authenticationToken = req.headers["authorization"];
    if (!authenticationToken) {
      res.status(http.UNAUTHORIZED.code).send({
        success: false,
        data: null,
        message: errors.TOKEN_NOT_PROVIDED,
      });
    }
    const token = authenticationToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.data.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(http.UNAUTHORIZED.code).send({
        data: null,
        message: errors.TOKEN_EXPIRE,
        errorName: error.name,
      });
    } else if (error.name === "JsonWebTokenError") {
      res.status(http.FORBIDDEN.code).send({
        data: null,
        message: errors.INVALID_TOKEN,
        errorName: error.name,
      });
    } else {
      res.status(http.INTERNAL_SERVER_ERROR.code).send({
        data: null,
        message: http.INTERNAL_SERVER_ERROR.message,
      });
    }
  }
};

module.exports = authenticationMiddleware;
