const NotFoundError = require("./not-found");
const UnauthenticatedError = require("./unauthenticated");
const BadRequestError = require("./bad-request");
const ForbiddenError = require("./for-bidden");

module.exports = {
  NotFoundError,
  UnauthenticatedError,
  ForbiddenError,
  BadRequestError,
};
