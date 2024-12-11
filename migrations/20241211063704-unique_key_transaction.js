"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("transactions", {
      fields: ["account_id", "category", "date"],
      type: "unique",
      name: "unique_account_category_date",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "transactions",
      "unique_account_category_date"
    );
  },
};
