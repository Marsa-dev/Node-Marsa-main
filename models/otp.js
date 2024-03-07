const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 300 },
    },
    reason: {
      type: String,
      enum: ["email_verify", "forgot_password"],
      default: "email_verify",
    },
  },
  { timestamps: true }
);

otpSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(12);
  this.otp = await bcrypt.hash(this.otp, salt);
});

otpSchema.methods.compareOTP = async function (otp) {
  return await bcrypt.compare(otp, this.otp);
};

const OTPModel = mongoose.model("otp", otpSchema);
module.exports = OTPModel;
