const CustomAPIError = require("./custom");

class ForbiddenError extends CustomAPIError {
  constructor(message) {
    super(message, 403);
  }
}

module.exports = ForbiddenError;
