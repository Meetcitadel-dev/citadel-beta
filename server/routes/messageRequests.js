const express = require('express');
const router = express.Router();
const MessageRequest = require('../models/MessageRequest');
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

    const populatedRequest = await MessageRequest.findById(request._id)
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl');

    res.json({ request: populatedRequest });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

