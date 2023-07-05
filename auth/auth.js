const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {

  if (!req.body.token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  
  const { token } = req.body;
  try {
    jwt.verify(token, config.get("JWT_SECRET"), (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: "Token is not valid" });
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ msg: "Server Error" });
  }
};
