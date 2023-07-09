// main entry
const path = require("path");
const express = require("express");
var cors = require("cors");
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

mongoose
  .connect(
    process.env.DATABASE_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("Connected to DB!");
    }
  )


//solving cors issue
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Credentials: true")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // res.header("Access-Control-Max-Age", "1000")
  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("hello world");
});
app.use("/user", require("./routes/user"));
app.use("/password", require("./routes/password"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
