const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "please Provide a email"],
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: null,
    },
    wishlist: [{ type: mongoose.Types.ObjectId, ref: "boatSchema" }],
    password: { type: String, required: true },
    setNewPwd: { type: Boolean, default: false },
    role: { type: String, enum: ["admin", "user", "vendor"], default: "user" },
  },
  {
    timestamps: true,
  }
);
User.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
User.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};
User.methods.createJWT = function () {
  // console.log(this);
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};
User.methods.campareForgotPasswordOtp = async function (forgotPasswordOtp) {
  const isMatch = await bcrypt.compare(
    forgotPasswordOtp,
    this.forgotPasswordOtp
  );
  return isMatch;
};
module.exports = mongoose.model("User", User);
