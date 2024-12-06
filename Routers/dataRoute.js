const { createData } = require("../Controllers/dataController.js");
const dataRoute = require("express").Router();
const upload = require("../config/multerConfig");

dataRoute.post("/add", upload.single("file"), createData);
dataRoute.use((err, req, res, next) => {
    console.error(err);
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = dataRoute;
