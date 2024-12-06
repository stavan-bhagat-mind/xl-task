"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "John Cena",
          email: "john@example.com",
          password: "password123",
          address: "123 Elm Street",
          role: "user",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Henry Cavill",
          email: "henry@example.com",
          password: "password456",
          address: "456 Oak Avenue",
          role: "user",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Selena Gomez",
          email: "sel@example.com",
          role: "user",
          password: "password789",
          address: "789 Maple Lane",
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
