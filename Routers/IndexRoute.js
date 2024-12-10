const IndexRoute = require("express").Router();
const userRoute = require("./userRoute");
const dataRoute = require("./transactionRoute");
const accountRoute = require("./accountRoute");

IndexRoute.use("/v1/user", userRoute);
IndexRoute.use("/v1/account", accountRoute);
IndexRoute.use("/v1/xl-data", dataRoute);

module.exports = IndexRoute;
