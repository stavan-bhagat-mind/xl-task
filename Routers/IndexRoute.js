const IndexRoute = require("express").Router();
const userRoute = require("./userRoute");
const dataRoute = require("./transactionRoute");
const accountRoute = require("./accountRoute");
const formulaRoute = require("./formulaRoute");

IndexRoute.use("/v1/user", userRoute);
IndexRoute.use("/v1/account", accountRoute);
IndexRoute.use("/v1/xl-data", dataRoute);
IndexRoute.use("/v1/formula", formulaRoute);

module.exports = IndexRoute;
