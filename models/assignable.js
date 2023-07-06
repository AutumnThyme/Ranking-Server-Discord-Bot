const mongoose = require('mongoose');

const assignableSchema = new mongoose.Schema({
  category: { type: String },
  rank: { type: String },
  rp: { type: Number },
  image: { type: String },
});

const Assignable = mongoose.model('assignable', assignableSchema);
module.exports = { Assignable };
