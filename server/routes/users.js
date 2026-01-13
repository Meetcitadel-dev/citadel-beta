const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get all users (for discover feed)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('name gender college year age skills imageUrl note isPremium')
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
      .select('name gender college year age skills imageUrl note isPremium');
    
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

    const { name, gender, college, year, age, skills, imageUrl, note } = req.body;
    
    const updateObj = {
      name,
      gender,
      college,
      year,
      age,
      skills,
      imageUrl: imageUrl || '',
      note: note || ''
    };
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true, runValidators: true }
    ).select('name gender college year age skills imageUrl note isPremium email phone _id');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user with all fields in consistent format
    res.json({ 
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        college: user.college,
        year: user.year,
        skills: user.skills || [],
        imageUrl: user.imageUrl || '',
        note: user.note || '',
        isPremium: user.isPremium,
      }
    });
    
    console.log(`✅ Profile updated for user ${user._id}:`, {
      imageUrlLength: user.imageUrl ? user.imageUrl.length : 0,
      note: user.note || '(empty)',
      noteLength: user.note ? user.note.length : 0
    });
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

