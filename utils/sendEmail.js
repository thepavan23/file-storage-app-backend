const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // App Password
    },
  });

  await transporter.sendMail({
    from: '"File Storage App" <your-email@gmail.com>',
    to: email,
    subject,
    text: message,
  });

  console.log(`Email sent to ${email}`);
};

module.exports = sendEmail;
