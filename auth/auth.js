const jwt = require("jsonwebtoken");
const config = require("config");
require("dotenv").config();

module.exports = function (req, res, next) {
  if (!req.body.token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const { token } = req.body;
  console.log("token", token)
  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: "Token is not valid" });
      } else {
        req.user = decoded.user;
        console.log(req.user)
        next();
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ msg: "Server Error" });
  }
};
