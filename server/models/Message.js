const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient conversation queries
messageSchema.index({ fromUserId: 1, toUserId: 1, createdAt: 1 });
messageSchema.index({ toUserId: 1, fromUserId: 1, createdAt: 1 });
messageSchema.index({ toUserId: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);

