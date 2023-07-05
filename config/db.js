const mongoose = require("mongoose");
const config = require("config");
const db = config.get("DATABASE_URI");
require("dotenv").config();

const connectDB = mongoose.connect(
  process.env.DATABASE_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);
module.exports = connectDB;
