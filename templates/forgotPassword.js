const forgotPasswordTemplate = (otp) => {
  return `
    <!DOCTYPE html>
<html>
<head>
  <title>Password Reset OTP</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h1>Password Reset Request</h1>
  <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
  <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
  <p>Enter this OTP in the provided section on our website to reset your password.</p>
  <p>If you didn't initiate this request, no further action is needed.</p>
  <p>Thank you,<br>The Support Team</p>
</body>
</html>
`;
};
module.exports = forgotPasswordTemplate;
