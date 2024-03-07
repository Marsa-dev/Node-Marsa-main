const CustomAPIError = require("./custom");

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = NotFoundError;
