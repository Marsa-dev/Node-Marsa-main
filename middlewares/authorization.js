const { ForbiddenError } = require("../errors");

const authorization = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ForbiddenError("Permission denied");
  }

  next();
};

module.exports = authorization;
