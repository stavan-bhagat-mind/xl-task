const {
  getListOfUsers,
  getUserDataFromId,
  createUser,
  loginUser,
  deleteUser,
  getAuthenticationToken,
} = require("../Controllers/UserController/UserController.js");
const authenticationMiddleware = require("../Middlewares/authenticationMiddleware.js");
const userRoute = require("express").Router();

userRoute.post("/register", createUser);
userRoute.post("/login", loginUser);
userRoute.get("/refresh", authenticationMiddleware, getAuthenticationToken);
userRoute.get("/list", getListOfUsers);
userRoute.get("/:id", getUserDataFromId);
userRoute.delete("/:id", deleteUser);

module.exports = userRoute;
