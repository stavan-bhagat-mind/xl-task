"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("accounts", "synonym", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "default",
    });
    await queryInterface.sequelize.query(
      `UPDATE accounts SET synonym = 'default' WHERE synonym IS NULL`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("accounts", "synonym");
  },
};
