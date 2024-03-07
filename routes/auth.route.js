const router = require("express").Router();

const {
  login,
  registerUser,
  resendOTP,
  forgotPassword,
  verifyEmail,
  verifyForgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

// login
router.post("/login", login);

// register
router.post("/register", registerUser);
router.post("/resend-otp", resendOTP);
router.post("/verify-email", verifyEmail);

// forgot password
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password", verifyForgotPassword);
router.post("/reset-password", resetPassword);

///Admin

router.post("/admin/forgot-password", forgotPassword);
router.post("/admin/verify-forgot-password", verifyForgotPassword);
router.post("/admin/reset-password", resetPassword);

module.exports = router;
