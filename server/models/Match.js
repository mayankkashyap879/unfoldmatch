// server/models/Match.js
const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['active', 'pending_friendship', 'friends', 'rejected', 'expired'],
    default: 'active'
  },
  messageCount: { type: Number, default: 0 },
  friendshipInitiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Match', MatchSchema);