const errors = {
  TOKEN_NOT_PROVIDED: "No auth token provided!",
  TOKEN_EXPIRE: "token expired ",
  INVALID_TOKEN: "invalid token",
};
const messages = {
  REMOVED: "removed successfully.",
  UPDATED: "updated successfully.",
  EMAIL_SHOULD_BE_UNIQUE: "Email already registered",
  FORMULA_SHOULD_BE_UNIQUE: "Formula already exists",
  SYNONYMS_NOT_FOUND: "synonyms does not exists",
  TRANSACTION_SHOULD_BE_UNIQUE: "Same transaction already exists",
};

module.exports = {
  errors,
  messages,
};
