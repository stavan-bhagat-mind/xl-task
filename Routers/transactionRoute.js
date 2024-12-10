const {
  createTransaction,
} = require("../Controllers/transactionController/transactionController.js");
const authenticationMiddleware = require("../Middlewares/authenticationMiddleware.js");
const accountRoute = require("express").Router();
const upload = require("../config/multerConfig");

accountRoute.post("/add", upload.single("file"), createTransaction);
//   userRoute.post("/login", loginUser);
//   userRoute.get("/refresh", authenticationMiddleware, getAuthenticationToken);
//   userRoute.get("/list", getListOfUsers);
//   userRoute.get("/:id", getUserDataFromId);
//   userRoute.delete("/:id", deleteUser);

module.exports = accountRoute;
