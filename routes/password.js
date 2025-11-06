const express = require("express");
const router = express.Router();
const { sendEmailWithNodemailer } = require("../helpers/email");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
require("dotenv").config();
const config = require("config");
const User = require("../models/User");

router.post("/forgot", async (req, res) => {
  const { email } = req.body;

  const user = User.findOne({ email: email });

  //return res.json({ message: "working" });
  if (!user) {
    return res.json({ message: "No user with that email." });
  }

  const payload = {
    user: {
      id: user.id,
    },
  };

  let key;

  jwt.sign(
    payload,
    config.get("JWT_SECRET"),
    { expiresIn: "2 days" },
    (err, token) => {
      if (err) throw err;
      key = token;

      const emailData = {
        from: "dmbrusky@gmail.com",
        to: email,
        subject: "PASSWORD RESET LINK",
        html: `
                      <h1>Please use the following link to reset your password</h1>
                      <a href="${process.env.CLIENT_URL}/reset/${token}">Activate</a>
                      <hr />
                      <p>This email may contain sensitive information</p>

                  `,
      };

      return user.updateOne({ resetPasswordLink: token }, (err, success) => {
        if (err) {
          console.log("Reset Password Link Error", err);
          return res.status(400).json({
            error: "Database connection error on user password forgot request",
          });
        } else {
          sendEmailWithNodemailer(req, res, emailData);
        }
      });
    }
  );
});

router.put("/reset", async (req, res) => {
  console.log("Reset Password");
  const { resetPasswordLink, newPassword } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      config.get("JWT_SECRET"),
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
