const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Match = require('../models/Match');
const { authenticate } = require('../middleware/auth');

// Get all notifications for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ toUserId: req.userId })
      .populate('fromUserId', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

// Get notifications sent by current user
router.get('/sent', authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ fromUserId: req.userId })
      .populate('toUserId', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

// Create a new notification (send a vibe/adjective)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { toUserId, adjective } = req.body;

    if (!toUserId || !adjective) {
      return res.status(400).json({ error: 'toUserId and adjective are required' });
    }

    // Check if already sent (optional - you might want to allow multiple)
    // const existing = await Notification.findOne({
    //   fromUserId: req.userId,
    //   toUserId,
    //   adjective,
    // });
    // if (existing) {
    //   return res.status(400).json({ error: 'Already sent this adjective' });
    // }

    const notification = new Notification({
      fromUserId: req.userId,
      toUserId,
      adjective,
    });

    await notification.save();

    // Check for match: if the other user sent the same adjective
    const reverseNotification = await Notification.findOne({
      fromUserId: toUserId,
      toUserId: req.userId,
      adjective,
    });

    let match = null;
    if (reverseNotification) {
      // It's a match!
      const existingMatch = await Match.findOne({
        $or: [
          { user1Id: req.userId, user2Id: toUserId },
          { user1Id: toUserId, user2Id: req.userId },
        ],
      });

      if (!existingMatch) {
        match = new Match({
          user1Id: req.userId,
          user2Id: toUserId,
          adjective,
        });
        await match.save();
      } else {
        match = existingMatch;
      }
    }

    const populatedNotification = await Notification.findById(notification._id)
      .populate('fromUserId', 'name imageUrl')
      .populate('toUserId', 'name imageUrl');

    res.status(201).json({
      notification: populatedNotification,
      match: match ? { id: match._id, adjective: match.adjective } : null,
    });
  } catch (error) {
    next(error);
  }
});

// Get count of vibes sent today
router.get('/count/today', authenticate, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await Notification.countDocuments({
      fromUserId: req.userId,
      createdAt: { $gte: today },
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

