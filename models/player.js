const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  discordID: { type: String, unique: true },
  username: { type: String },
  totalRp: { type: Number },
  ranks: { type: [mongoose.Schema.Types.ObjectId], ref: 'assignable' },
});
const Player = mongoose.model('Player', playerSchema);
module.exports = { Player };