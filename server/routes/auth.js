const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');
const { sendVerificationEmail, sendOTPEmail } = require('../services/email');
const { logNewUserEmail } = require('../utils/userLogger');

// Request OTP for login or signup
router.post('/request-otp', async (req, res, next) => {
  // Initialize userExists at the very top to ensure it's always defined
  let userExists = false;
  
  try {
    let { email, phone } = req.body;
    
    // Normalize email to lowercase (MongoDB schema has lowercase: true)
    if (email) {
      email = email.trim().toLowerCase();
    }
    if (phone) {
      phone = phone.trim();
    }
    
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required', userExists: false });
    }

    // Find existing user - use exact match, not $or with null values
    let user = null;
    if (email) {
      user = await User.findOne({ email: email });
    } else if (phone) {
      user = await User.findOne({ phone: phone });
    }
    
    // Check if user exists and is a complete user (not TEMP_USER)
    // A complete user must have: name (not TEMP_USER), college (not TEMP), and gender (not 'other')
    if (user && user.name && user.name !== 'TEMP_USER' && 
        user.college && user.college !== 'TEMP' &&
        user.gender && user.gender !== 'other') {
      userExists = true;
    }
    
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      // Existing user (complete or incomplete) - save OTP for login/signup
      user.otp = otp;
      user.otpExpires = otpExpires;
      // Ensure email/phone matches what was requested (in case of TEMP_USER)
      if (email && !user.email) {
        user.email = email;
      }
      if (phone && !user.phone) {
        user.phone = phone;
      }
      // Skip validation when only updating OTP fields
      await user.save({ validateBeforeSave: false });
    } else {
      // New user - create temporary user record with just email/phone and OTP for signup
      // This allows OTP verification before full registration
      // Provide placeholder values for required fields (will be replaced during registration)
      user = new User({
        email: email || undefined,
        phone: phone || undefined,
        otp: otp,
        otpExpires: otpExpires,
        // Mark as temporary (will be completed during registration)
        name: 'TEMP_USER',
        // Placeholder values for required fields (will be replaced during registration)
        gender: 'other',
        college: 'TEMP',
        year: '1st Year',
        age: 18,
      });
      // Skip validation for temp user - we'll validate when updating with real data
      await user.save({ validateBeforeSave: false });
      // Ensure userExists is false for new temp users
      userExists = false;
    }

    // Send OTP via email if email exists
    if (email) {
      try {
        console.log(`📧 Attempting to send OTP to: ${email}`);
        const emailResult = await sendOTPEmail(email, otp);
        console.log('✅ OTP email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send OTP email:', emailError);
        console.error('Error details:', JSON.stringify(emailError, null, 2));
        // In development, still return OTP so user can test
        // In production, you might want to return an error
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            error: 'Failed to send OTP email. Please try again later.',
            details: emailError.message,
            userExists: userExists
          });
        }
      }
    }

    // Explicitly construct response to ensure userExists is always included
    const response = {
      message: 'OTP sent successfully',
      otp: otp,
      userExists: Boolean(userExists)
    };
    res.json(response);
  } catch (error) {
    console.error('Request OTP error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', '), userExists: false });
    }
    // Ensure userExists is always included in error responses
    return res.status(500).json({ error: 'Internal server error', userExists: false });
  }
});

// Verify OTP and login (or proceed to signup)
router.post('/verify-otp', async (req, res, next) => {
  try {
    let { email, phone, otp } = req.body;
    
    // Normalize email to lowercase
    if (email) {
      email = email.trim().toLowerCase();
    }
    if (phone) {
      phone = phone.trim();
    }
    
    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }

    // Find user by exact email or phone match (not $or with null values)
    let user = null;
    if (email) {
      user = await User.findOne({ email: email });
    } else if (phone) {
      user = await User.findOne({ phone: phone });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please request OTP first.' });
    }

    // Check if OTP is valid and not expired
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save({ validateBeforeSave: false });

    // Check if this is a temporary user (signup flow) or existing user (login flow)
    const isTemporaryUser = user.name === 'TEMP_USER';

    if (isTemporaryUser) {
      // For signup flow, just verify OTP and return success (don't generate token yet)
      // User will complete registration in the next step
      res.json({
        verified: true,
        message: 'OTP verified. Please complete your registration.',
        isNewUser: true,
      });
    } else {
      // For login flow, generate JWT token and return user data
    const token = generateToken(user._id.toString());
    
    res.json({
      token,
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
        isPremium: user.isPremium,
          emailVerified: user.emailVerified,
      },
        isNewUser: false,
    });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    next(error);
  }
});

// Register new user (after OTP verification)
router.post('/register', async (req, res, next) => {
  try {
    let { name, gender, college, year, age, skills, imageUrl, phone, email, note } = req.body;

    // Normalize email to lowercase
    if (email) {
      email = email.trim().toLowerCase();
    }
    if (phone) {
      phone = phone.trim();
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required for registration' });
    }

    // Find existing user by exact email match first (most important)
    // Then check phone if email doesn't match
    let user = await User.findOne({ email: email });
    
    // If no user found by email, check by phone (but only if phone is provided)
    if (!user && phone) {
      user = await User.findOne({ phone: phone });
    }
    
    // If user exists and is not a temporary user, check if they're trying to register again
    if (user && user.name !== 'TEMP_USER') {
      // Check if this is a complete registered user (has all required fields filled)
      // A complete user should have: name, college (not TEMP), and proper gender
      const isCompleteUser = user.name && 
                            user.name !== 'TEMP_USER' && 
                            user.college && 
                            user.college !== 'TEMP' &&
                            user.gender &&
                            user.gender !== 'other';
      
      if (isCompleteUser) {
        // This is a fully registered user - they should login instead
        return res.status(400).json({ 
          error: 'User already exists with this email. Please login instead.' 
        });
      }
      // If user exists but is incomplete (maybe from a failed registration), allow registration to complete it
      // We'll update this user below
    }
    
    // IMPORTANT: If user exists but has a different email, this is a conflict
    // This prevents registering nisarg.argg@gmail.com when nisargofficial22@gmail.com exists
    if (user && user.email && user.email !== email) {
      return res.status(400).json({ 
        error: 'Email mismatch. Please use the correct email address.' 
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (user) {
      // Update existing user (either TEMP_USER or incomplete user) with full registration data
      // Ensure email matches exactly what was requested
      user.email = email; // Always set to the exact email from request
      if (phone) {
        user.phone = phone;
      }
      user.name = name;
      user.gender = gender;
      user.college = college;
      user.year = year;
      user.age = age;
      user.skills = skills || [];
      user.imageUrl = imageUrl || '';
      user.note = (note || '').trim();
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      user.emailVerified = false;
      // Validate before saving the updated user data
      await user.save({ validateBeforeSave: true });
    } else {
      // Create new user (fallback if no user was found)
      user = new User({
      name,
      gender,
      college,
      year,
      age,
      skills: skills || [],
      imageUrl: imageUrl || '',
        note: (note || '').trim(),
        phone: phone || undefined,
        email: email,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        emailVerified: false,
      });
    await user.save();
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Still create user, but they'll need to request verification again
    }

    // Generate JWT token (user can use app but email not verified)
    const token = generateToken(user._id.toString());

    // Log new user email to file
    if (email) {
      await logNewUserEmail(email);
    }

    res.status(201).json({
      token,
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
        emailVerified: false,
      },
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Phone or email already exists' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    next(error);
  }
});

// Verify email
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Resend verification email
router.post('/resend-verification', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      res.json({ message: 'Verification email sent successfully' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (error) {
    next(error);
  }
});

// Get current user info
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-__v -otp -otpExpires -emailVerificationToken -emailVerificationExpires');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return user with all fields
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
        isPremium: user.isPremium,
        emailVerified: user.emailVerified,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Legacy login endpoint (for backward compatibility)
router.post('/login', async (req, res, next) => {
  try {
    let { phone, email } = req.body;
    
    // Normalize email to lowercase
    if (email) {
      email = email.trim().toLowerCase();
    }
    if (phone) {
      phone = phone.trim();
    }
    
    if (!phone && !email) {
      return res.status(400).json({ error: 'Phone or email is required' });
    }

    // Find user by exact match
    let user = null;
    if (email) {
      user = await User.findOne({ email: email });
    } else if (phone) {
      user = await User.findOne({ phone: phone });
    }

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
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
