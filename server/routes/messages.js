const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Match = require('../models/Match');
const MessageRequest = require('../models/MessageRequest');
const { authenticate } = require('../middleware/auth');

// Get messages for a conversation between two users
router.get('/conversation/:otherUserId', authenticate, async (req, res, next) => {
  try {
    const { otherUserId } = req.params;

    // Verify users can message each other (matched or accepted request)
    const match = await Match.findOne({
      $or: [
        { user1Id: req.userId, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: req.userId },
      ],
    });

    const acceptedRequest = await MessageRequest.findOne({
      $or: [
        { fromUserId: req.userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: req.userId },
      ],
      status: 'accepted',
    });

    if (!match && !acceptedRequest) {
      return res.status(403).json({ error: 'Cannot access this conversation' });
    }

    const messages = await Message.find({
      $or: [
        { fromUserId: req.userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: req.userId },
      ],
    })
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

// Send a message
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { toUserId, text } = req.body;

    if (!toUserId || !text) {
      return res.status(400).json({ error: 'toUserId and text are required' });
    }

    // Verify users can message each other
    const match = await Match.findOne({
      $or: [
        { user1Id: req.userId, user2Id: toUserId },
        { user1Id: toUserId, user2Id: req.userId },
      ],
    });

    const acceptedRequest = await MessageRequest.findOne({
      $or: [
        { fromUserId: req.userId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: req.userId },
      ],
      status: 'accepted',
    });

    if (!match && !acceptedRequest) {
      return res.status(403).json({ error: 'Cannot send message to this user' });
    }

    const message = new Message({
      fromUserId: req.userId,
      toUserId,
      text,
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    next(error);
  }
});

// Mark messages as read
router.patch('/read/:otherUserId', authenticate, async (req, res, next) => {
  try {
    await Message.updateMany(
      {
        fromUserId: req.params.otherUserId,
        toUserId: req.userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

