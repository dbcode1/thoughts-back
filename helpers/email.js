// /helpers/email.js
const nodeMailer = require("nodemailer");
const config = require("config");
require("dotenv").config();


exports.sendEmailWithNodemailer = (req, res, emailData) => {
  console.log("nodemailer")
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "dmbrusky@gmail.com",
      pass:  process.env.GOOGLE_RESET,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      return res.json({
        message: `Email has been sent to your email. Follow the instruction to activate your account`,
      });
    })
    .catch((err) => console.log(`Problem sending email: ${err}`));
};
