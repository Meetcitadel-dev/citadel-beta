const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  adjective: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate matches
matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
matchSchema.index({ user1Id: 1, createdAt: -1 });
matchSchema.index({ user2Id: 1, createdAt: -1 });

module.exports = mongoose.model('Match', matchSchema);

