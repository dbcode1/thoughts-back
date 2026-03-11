// main entry
require("dotenv").config();
const path = require("path");
const express = require("express");
var cors = require("cors");
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();
mongoose.set("debug", true);

mongoose.set("bufferCommands", false);
(async () => {
  try {
    await mongoose
      .connect(
        process.env.DATABASE_URI,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
        () => {
          console.log("Connected!");
        },
      )
      .asPromise();
  } catch (err) {
    console.log(err);
  }
})();

mongoose.connection.on("error", (err) => console.log("Connection Error:", err));
mongoose.connection.once("open", () => console.log("Connected to MongoDB"));

app.use(
  cors({
    origin: "*",
  }),
);

if (mongoose.connection.readyState === 1) {
  console.log("Database is connected");
} else {
  console.log(
    "Database is not connected. Current state: " +
      mongoose.connection.readyState,
  );
}

//solving cors issue
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Credentials: true")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
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
app.use("/password", require("./routes/password.js"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
