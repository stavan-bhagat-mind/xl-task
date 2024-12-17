const {
  createTransaction,
  getMonthlyReport,
} = require("../Controllers/transactionController/transactionController.js");
const authenticationMiddleware = require("../Middlewares/authenticationMiddleware.js");
const transactionRoute = require("express").Router();
const upload = require("../config/multerConfig");

transactionRoute.post(
  "/add",
  upload.single("file"),
  authenticationMiddleware,
  createTransaction
);

transactionRoute.get(
  "/get-user-report",
  authenticationMiddleware,
  getMonthlyReport
);
// transactionRoute.post(
//   "/add",
//   upload.single("file"),
//   authenticationMiddleware,
//   createTransaction
// );

module.exports = transactionRoute;
