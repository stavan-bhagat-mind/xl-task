"use strict";

module.exports = {
  async up(queryInterface) {
    // First, get the user IDs
    const users = await queryInterface.select(null, "users");

    await queryInterface.bulkInsert(
      "accounts",
      [
        {
          name: "Savings Account",
          account_number: "SAV001",
          balance: 1000.0,
          account_type: "Savings",
          user_id: users[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Checking Account",
          account_number: "CHK001",
          balance: 500.0,
          account_type: "Checking",
          user_id: users[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Savings Account",
          account_number: "SAV002",
          balance: 1500.0,
          account_type: "Savings",
          user_id: users[1].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Investment Account",
          account_number: "INV001",
          balance: 2500.0,
          account_type: "Investment",
          user_id: users[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Joint Account",
          account_number: "JNT001",
          balance: 3000.0,
          account_type: "Joint",
          user_id: users[1].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Business Account",
          account_number: "BUS001",
          balance: 5000.0,
          account_type: "Business",
          user_id: users[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Student Account",
          account_number: "STU001",
          balance: 100.0,
          account_type: "Student",
          user_id: users[1].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Retirement Account",
          account_number: "RET001",
          balance: 10000.0,
          account_type: "Retirement",
          user_id: users[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("accounts", null, {});
  },
};
