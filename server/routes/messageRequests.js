const express = require('express');
const router = express.Router();
const MessageRequest = require('../models/MessageRequest');
const Match = require('../models/Match');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get all message requests for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const query = { toUserId: req.userId };
    if (status) {
      query.status = status;
    }

    const requests = await MessageRequest.find(query)
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

// Get message requests sent by current user
router.get('/sent', authenticate, async (req, res, next) => {
  try {
    const requests = await MessageRequest.find({ fromUserId: req.userId })
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

// Get accepted conversations
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const requests = await MessageRequest.find({
      $or: [{ fromUserId: req.userId }, { toUserId: req.userId }],
      status: 'accepted',
    })
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

// Create a message request
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { toUserId, adjective } = req.body;

    if (!toUserId || !adjective) {
      return res.status(400).json({ error: 'toUserId and adjective are required' });
    }

    // Only premium users can send message requests
    const sender = await User.findById(req.userId).select('isPremium');
    if (!sender) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!sender.isPremium) {
      return res.status(403).json({ error: 'Only premium users can send message requests.' });
    }

    // Check if request already exists
    const existing = await MessageRequest.findOne({
      fromUserId: req.userId,
      toUserId,
    });

    if (existing) {
      return res.json({ request: existing });
    }

    const request = new MessageRequest({
      fromUserId: req.userId,
      toUserId,
      adjective,
      status: 'pending',
    });

    await request.save();

    const populatedRequest = await MessageRequest.findById(request._id)
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl');

    res.status(201).json({ request: populatedRequest });
  } catch (error) {
    next(error);
  }
});

// Update message request status (accept/decline)
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or declined' });
    }

    const request = await MessageRequest.findOne({
      _id: req.params.id,
      toUserId: req.userId, // Only the recipient can update
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    await request.save();

    let match = null;

    // If accepted, create or reuse a Match so this moves into "matches"
    if (status === 'accepted') {
      const { fromUserId, toUserId, adjective } = request;
      match = await Match.findOne({
        $or: [
          { user1Id: fromUserId, user2Id: toUserId },
          { user1Id: toUserId, user2Id: fromUserId },
        ],
      });

      if (!match) {
        match = new Match({
          user1Id: fromUserId,
          user2Id: toUserId,
          adjective,
        });
        await match.save();
      }
    }

    const populatedRequest = await MessageRequest.findById(request._id)
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl');

    res.json({
      request: populatedRequest,
      match: match
        ? {
            id: match._id,
            user1Id: match.user1Id,
            user2Id: match.user2Id,
            adjective: match.adjective,
            createdAt: match.createdAt,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

