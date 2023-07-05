const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ContainerSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true
  },
  user: {
    type: Schema.ObjectId,
  },
});

module.exports = mongoose.model('container', ContainerSchema);