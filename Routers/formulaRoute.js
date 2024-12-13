const authenticationMiddleware = require("../Middlewares/authenticationMiddleware.js");
const {
  addFormula,
} = require("../Controllers/formulaController/formulaController.js");
const formulaRoute = require("express").Router();
formulaRoute.post("/add", authenticationMiddleware, addFormula);
// accountRoute.post("/add", createData);
formulaRoute.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = formulaRoute;
