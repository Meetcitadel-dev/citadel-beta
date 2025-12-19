const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get all users (for discover feed)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('name gender college year age skills imageUrl isPremium')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name gender college year age skills imageUrl isPremium');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
});

// Update user profile
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    // Only allow users to update their own profile
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, college, year, age, skills, imageUrl } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, college, year, age, skills, imageUrl },
      { new: true, runValidators: true }
    ).select('name gender college year age skills imageUrl isPremium');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update premium status
router.patch('/:id/premium', authenticate, async (req, res, next) => {
  try {
    const { isPremium, premiumExpiresAt } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isPremium, premiumExpiresAt },
      { new: true }
    ).select('isPremium premiumExpiresAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

