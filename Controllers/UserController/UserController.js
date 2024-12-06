// const Models  =require("../");

module.exports.getListOfUsers = async (req, res) => {
  try {
    const data = await Models.Author.findAndCountAll({
      offset: 0,
      limit: 2,
    });
    res.send({
      data,
    });
  } catch (e) {
    console.log(e);
    res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};

module.exports.getUserDataFromId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await Models.User.findOne({
      where: {
        id,
      },
    });
    if (!data) {
      return res.status(404).send({
        data,
        message: "User with given id does not exist",
      });
    }
    res.send({
      data,
      message: "Success",
    });
  } catch (e) {
    res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Models.User.destroy({
      where: {
        id,
      },
    });
    res.send({
      message: "User removed successfully.",
    });
  } catch (e) {
    res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name } = req.body;
    const data = await Models.User.create({ name });
    res.send({
      data,
      message: "Success",
    });
  } catch (e) {
    res.send({
      data: null,
      message: "Something went wrong.",
    });
  }
};
