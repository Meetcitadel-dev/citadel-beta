const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Match = require('../models/Match');
const User = require('../models/User');
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

    // Check if user has uploaded a profile image - MUST validate before allowing vibe
    const sender = await User.findById(req.userId).select('imageUrl');
    if (!sender) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const hasImage = sender.imageUrl && 
                    typeof sender.imageUrl === 'string' && 
                    sender.imageUrl.trim() !== '';
    
    if (!hasImage) {
      return res.status(403).json({ error: 'Your profile isn\'t public yet. Upload a photo to send and receive vibes.' });
    }

    // Do not allow sending more than one vibe to the same user
    const existing = await Notification.findOne({
      fromUserId: req.userId,
      toUserId,
    });
    if (existing) {
      return res.status(400).json({ error: 'You have already sent a vibe to this user.' });
    }

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

