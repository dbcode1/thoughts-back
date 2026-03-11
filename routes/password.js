const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const User = require("../models/User");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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

  console.log("generate tokens");
  const emailToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15 min",
  });

  user.updateOne({ resetPasswordLink: emailToken }, (err, success) => {
    if (err) {
      console.log("Reset Password Link Error", err);
      return res.status(400).json({
        error: "Database connection error on user password forgot request",
      });
    }
  });
  const { data, error } = await resend.emails.send({
    from: "dan@thoughtpad.org",
    to: email,
    subject: "Reset your password",
    html: `
                      <h1>Please use the following link to reset your password</h1>
                      <a href="${process.env.CLIENT_URL}/reset/${emailToken}">RESET</a>
                      <hr />
                      <p>This email may contain sensitive information</p>

                  `,
  });
  return res.json({
    message: "Check your email for reset instructions"
  });
});

router.put("/reset", async (req, res) => {
  console.log("Reset Password");

  const { resetPasswordLink, newPassword } = req.body;

  console.log(resetPasswordLink);

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
          console.log("user", user);
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
