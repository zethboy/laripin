const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  avatarId: { type: String, default: 'pingo' },
  provider: { type: String, default: 'email' },
  isGuest: { type: Boolean, default: false },
  totalGames: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // percentage
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
