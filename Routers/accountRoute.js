const {
  createAccount,
} = require("../Controllers/accountController/accountController");
const accountRoute = require("express").Router();
const authenticationMiddleware = require("../Middlewares/authenticationMiddleware.js");
const upload = require("../config/multerConfig");

accountRoute.post("/add", authenticationMiddleware, createAccount);
// accountRoute.post("/add", createData);
accountRoute.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = accountRoute;
