// main entry
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const app = express();
var cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
process.env.DEBUG = true;

connectDB();
console.log("url", process.env.DATABASE_URL);

app.use("/user", require("./routes/user"));
app.use("/password", require("./routes/password"));
//app.use("/user/thoughts")

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));
}
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
