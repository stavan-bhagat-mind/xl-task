"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    // static associate(models) {
    // // define association here
    // Book.belongsTo(models.Author, {
    //   source_key: "id",
    //   foreignKey: "author_id",
    // });
    // }
  }
  Transaction.init(
    {
      account_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          "Food",
          "Transport",
          "Utilities",
          "Entertainment",
          "Rent",
          "Health",
          "Education",
          "Miscellaneous"
        ),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      modelName: "Transaction",
      tableName: "transactions",
    }
  );
  return Transaction;
};
