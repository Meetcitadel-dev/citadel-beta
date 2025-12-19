const mongoose = require('mongoose');

const messageRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  toUserId: {
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
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate requests
messageRequestSchema.index({ fromUserId: 1, toUserId: 1 });
messageRequestSchema.index({ toUserId: 1, status: 1 });
messageRequestSchema.index({ fromUserId: 1, status: 1 });

module.exports = mongoose.model('MessageRequest', messageRequestSchema);

