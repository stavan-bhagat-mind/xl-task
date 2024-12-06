const IndexRoute = require("express").Router();
// const userRoute = require("../Routers/UserRouter");
const dataRoute = require("../Routers/dataRoute");
const {LoggerMiddleware} = require("../Middlewares/LoggerMiddleware");


// IndexRoute.use("/v1/users", LoggerMiddleware , userRoute);
IndexRoute.use("/v1/xl-data", LoggerMiddleware , dataRoute);

module.exports = IndexRoute;
