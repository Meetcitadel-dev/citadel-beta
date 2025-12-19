const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
});

// Compound index for efficient queries
notificationSchema.index({ fromUserId: 1, toUserId: 1 });
notificationSchema.index({ toUserId: 1, createdAt: -1 });
notificationSchema.index({ fromUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

