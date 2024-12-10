"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "super man",
          email: "super@example.com",
          password: "test@123",
          address: "Washington DC",
          role: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Selena Gomez",
          email: "sel@example.com",
          password: "test@123",
          address: "Grand Prairie Texas",
          role: "user",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
