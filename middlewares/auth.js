const { UnauthenticatedError } = require("../errors");
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const authenticationMiddlware = async (req, res, next) => {
  let token = req.headers["authorization"];
  // console.log("token", token);
  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(payload.userId).select(
      "-password -setNewPwd"
    );

    if (!user) {
      throw new UnauthenticatedError("Authentication invalid");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

module.exports = authenticationMiddlware;
