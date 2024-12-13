"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Formula extends Model {}
  Formula.init(
    {
      formula: {
        type: DataTypes.STRING,
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
      modelName: "Formula",
      tableName: "formulas",
    }
  );
  return Formula;
};
