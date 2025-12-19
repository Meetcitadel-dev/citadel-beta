const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { authenticate } = require('../middleware/auth');

// Get all matches for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const matches = await Match.find({
      $or: [{ user1Id: req.userId }, { user2Id: req.userId }],
    })
      .populate('user1Id', 'name imageUrl')
      .populate('user2Id', 'name imageUrl')
      .sort({ createdAt: -1 });

    // Format matches to include the other user
    const formattedMatches = matches.map(match => ({
      id: match._id,
      user1Id: match.user1Id._id,
      user2Id: match.user2Id._id,
      otherUser: match.user1Id._id.toString() === req.userId.toString() 
        ? match.user2Id 
        : match.user1Id,
      adjective: match.adjective,
      createdAt: match.createdAt,
    }));

    res.json({ matches: formattedMatches });
  } catch (error) {
    next(error);
  }
});

// Get match count for a specific user
router.get('/count/:userId', authenticate, async (req, res, next) => {
  try {
    const count = await Match.countDocuments({
      $or: [{ user1Id: req.params.userId }, { user2Id: req.params.userId }],
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

