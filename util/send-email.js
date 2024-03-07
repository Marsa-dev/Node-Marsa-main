const nodemailer = require("nodemailer");
require("dotenv").config();
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.FROM_EMAIL_ADDRESS,
      pass: process.env.PASSWORD,
    },
  });
  let info = await transporter.sendMail({
    from: `${process.env.FROM} <${process.env.FROM_EMAIL_ADDRESS}>`,
    to,
    subject,
    html,
  });

  console.log("email sent successfully...!!!");
  //   console.log(info);
};

module.exports = sendEmail;
