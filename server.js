// main entry
const path = require("path");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

connectDB();

app.use("/user", require("./routes/user"));
app.use("/password", require("./routes/password"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
