const {getListOfUsers, getUserDataFromId, createUser, deleteUser} =  require("../Controllers/UserController/UserController.js");

const userRoute = require("express").Router();

// userRoute.post("/add", createData);

module.exports =  userRoute;

// userRoute.get("/all", getListOfUsers);
// userRoute.get("/:id", getUserDataFromId);
// userRoute.delete("/:id", deleteUser);