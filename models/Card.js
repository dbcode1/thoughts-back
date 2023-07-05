const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardSchema = new mongoose.Schema({
  text: {
    type: String
  },
  user: {
    type: Schema.ObjectId,
  },
});

module.exports = mongoose.model("card", CardSchema);
