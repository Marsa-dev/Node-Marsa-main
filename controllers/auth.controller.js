const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
  ForbiddenError,
} = require("../errors");
const BoatModel = require("../models/boat.model");
const BookingModel = require("../models/booking.model");
const OTPModel = require("../models/otp");
const UserModel = require("../models/user.model");
const forgotPasswordTemplate = require("../templates/forgotPassword");
const verificationOTP = require("../templates/otpVerification");
const sendEmail = require("../util/send-email");

exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    throw new BadRequestError("Please provide all required fields.");
  }
  const user = await UserModel.create({
    fullName,
    email,
    password,
  });

  await OTPModel.deleteMany({ email });

  const otp = (Math.floor(Math.random() * 8999) + 1000).toString();
  console.log("otp", otp);

  await OTPModel.create({ email, otp });
  const emailTemplate = verificationOTP(otp);
  sendEmail({
    to: email,
    subject: "Please verify your email",
    html: emailTemplate,
  });

  return res
    .status(200)
    .json({ success: true, message: "User registered successfully" });
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found");
  }
  await OTPModel.deleteMany({ email, reason: "email_verify" });

  const otp = (Math.floor(Math.random() * 8999) + 1000).toString();

  console.log("resend otp", otp);

  await OTPModel.create({ email, otp });
  const emailTemplate = verificationOTP(otp);
  sendEmail({
    to: email,
    subject: "Please verify your email",
    html: emailTemplate,
  });

  return res
    .status(200)
    .json({ success: true, message: "OTP resend successfully." });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please enter your email and password");
  }
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    throw new NotFoundError("Invalid email or password");
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid email or password");
  }
  if (!user.verified) {
    await OTPModel.deleteMany({ email, reason: "email_verify" });
    const otp = (Math.floor(Math.random() * 8999) + 1000).toString();
    await OTPModel.create({ email, otp });
    const emailTemplate = verificationOTP(otp);
    sendEmail({
      to: email,
      subject: "Please verify your email",
      html: emailTemplate,
    });
    return res.status(400).json({
      success: false,
      message: "Please verify your account.",
      verified: false,
    });
  }

  if (user.blocked) {
    throw new ForbiddenError("Your account has been diactivated.");
  }

  const token = await user.createJWT();

  const boats = await BoatModel.find({ vendorId: user._id });
  const mainBoat = boats.find((boat) => boat.isMain === true);

  let bookingCount = 0;
  if (mainBoat) {
    const boatIds = boats.map((boat) => boat._id);
    const bookings = await BookingModel.find({ boatId: { $in: boatIds } });
    bookingCount = bookings.length;
  }

  return res.status(200).json({
    success: true,
    data: {
      token,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      verified: user.verified,
      boatCount: boats.length,
      bookingCount,
      experience: mainBoat ? mainBoat.experience : null,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { otp, email } = req.body;
  if (!otp) {
    throw new BadRequestError("Otp is required");
  }

  const findOTP = await OTPModel.findOne({ email, reason: "email_verify" });
  if (!findOTP) {
    throw new BadRequestError("OTP is expired");
  }

  const isOTPValid = await findOTP.compareOTP(otp);
  if (!isOTPValid) {
    throw new BadRequestError("OTP is not valid");
  }
  await OTPModel.findByIdAndRemove(findOTP._id);

  const user = await UserModel.findOneAndUpdate(
    { email },
    { verified: true },
    { new: true }
  );

  const token = await user.createJWT();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully.",
    data: {
      token,
      fullName: user.fullName,
      email: user.email,
    },
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundError("No user exists with given email");
  }

  await OTPModel.deleteMany({ email, reason: "forgot_password" });
  const otp = (Math.floor(Math.random() * 8999) + 1000).toString();

  console.log("otp", otp);

  await OTPModel.create({ email, otp, reason: "forgot_password" });

  const emailTemplate = forgotPasswordTemplate(otp);

  sendEmail({
    to: email,
    subject: "Forgot your password",
    html: emailTemplate,
  });

  return res
    .status(200)
    .json({ success: true, message: "Forgot your password" });
};

exports.verifyForgotPassword = async (req, res) => {
  const { email, otp } = req.body;
  if (!otp) {
    throw new BadRequestError("OTP is required");
  }
  const findOTP = await OTPModel.findOne({ email, reason: "forgot_password" });
  if (!findOTP) {
    throw new BadRequestError("OTP is expired");
  }

  const isOTPValid = await findOTP.compareOTP(otp);
  if (!isOTPValid) {
    throw new BadRequestError("OTP is not valid");
  }

  await OTPModel.findByIdAndRemove(findOTP._id);

  await UserModel.findOneAndUpdate({ email }, { setNewPwd: true });

  return res
    .status(200)
    .json({ success: true, message: "OTP verfied successfully" });
};

exports.resetPassword = async (req, res) => {
  let { email, password } = req.body;

  if (!password) {
    throw new BadRequestError("Please provide new password");
  }

  let user = await UserModel.findOne({ email });
  if (!user) {
    throw new NotFoundError("No user found");
  }

  if (!user.setNewPwd) {
    throw new BadRequestError("Password cannot be changed.");
  }
  user.password = password;
  user.setNewPwd = false;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Passwords updated successfully" });
};
