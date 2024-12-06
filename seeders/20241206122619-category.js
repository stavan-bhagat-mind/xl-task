"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "categories",
      [
        {
          name: "Groceries",
          description: "Expenses related to groceries",
          type: "Expense",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Utilities",
          description: "Expenses related to utilities",
          type: "Expense",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Salary",
          description: "Income from salary",
          type: "Income",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Rent",
          description: "Expenses related to rent or mortgage",
          type: "Expense",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Entertainment",
          description: "Expenses related to entertainment activities",
          type: "Expense",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Health",
          description: "Expenses related to health and medical care",
          type: "Expense",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Investment Income",
          description: "Income from investments",
          type: "Income",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Freelance Income",
          description: "Income from freelance work",
          type: "Income",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Interest Income",
          description: "Income from interest on savings or investments",
          type: "Income",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Transportation",
          description: "Expenses related to transportation",
          type: "Expense",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Education",
          description: "Expenses related to education",
          type: "Expense",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
