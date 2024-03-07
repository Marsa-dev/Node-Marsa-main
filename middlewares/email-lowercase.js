const { BadRequestError } = require("../errors");
const validateEmail = require("../util/email-validate");

const emailLowerCase = (req, res, next) => {
  if (!req.body.email) {
    throw new BadRequestError("Please enter a valid email address");
  }
  if (!validateEmail(req.body.email)) {
    throw new BadRequestError("Please enter a valid email address");
  }
  req.body.email = req.body.email.toLowerCase().trim();
  next();
};

module.exports = emailLowerCase;
