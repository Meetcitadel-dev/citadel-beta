const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

// Register/Login - simplified for demo (in production, use proper OTP/email verification)
router.post('/login', async (req, res, next) => {
  try {
    const { phone, email } = req.body;
    
    if (!phone && !email) {
      return res.status(400).json({ error: 'Phone or email is required' });
    }

    let user = await User.findOne({ $or: [{ phone }, { email }] });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = generateToken(user._id.toString());
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { name, gender, college, year, age, skills, imageUrl, phone, email } = req.body;

    // Check if user already exists
    if (phone || email) {
      const existing = await User.findOne({ $or: [{ phone }, { email }] });
      if (existing) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    const user = new User({
      name,
      gender,
      college,
      year,
      age,
      skills: skills || [],
      imageUrl: imageUrl || '',
      phone,
      email,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Phone or email already exists' });
    }
    next(error);
  }
});

// Get current user info
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

