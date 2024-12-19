const authenticationMiddleware = require("../Middlewares/authenticationMiddleware.js");
const {
  addFormula,
  formulaCalculationsReport,
} = require("../Controllers/formulaController/formulaController.js");
const formulaRoute = require("express").Router();
formulaRoute.post("/add", authenticationMiddleware, addFormula);
formulaRoute.get("/get/formula/calculation-report", authenticationMiddleware, formulaCalculationsReport);
formulaRoute.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = formulaRoute;
