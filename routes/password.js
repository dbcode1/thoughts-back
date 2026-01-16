const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const User = require("../models/User");
const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js");

router.post("/forgot", async (req, res) => {
  const { email } = req.body;

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create("thoughtpad.org", {
      from: "dmbrusky@gmail.com",
      to: "dmbrusky@gmail.com",
      subject: "Hello DANIEL BRUSKY",
      text: "Congratulations, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log("data", data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
});

router.put("/reset", async (req, res) => {
  console.log("Reset Password");
  const { resetPasswordLink, newPassword } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          return res.status(400).json({
            error: "Expired link. Try again. ",
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: "Something went wrong. Try later",
            });
          }

          const updatedFields = {
            password: hash,
            resetPasswordLink: "",
          };

          user = _.extend(user, updatedFields);
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "Error reseting user password",
              });
            }
            res.json({
              message: "Great you can login with your new password",
            });
          });
        });
      }
    );
  }
});
module.exports = router;
