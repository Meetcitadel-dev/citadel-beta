const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Test route to verify upload router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Upload router is working!', path: '/api/upload/test' });
});

// Upload profile image
router.post('/profile-image', authenticate, (req, res, next) => {
  console.log('📤 Upload request received:', {
    userId: req.userId,
    contentType: req.headers['content-type'],
    hasBody: !!req.body
  });

  // Multer middleware with error handling
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer upload error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected file field. Use "image" as the field name.' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    try {
      console.log('📁 File received:', {
        file: req.file ? {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          originalname: req.file.originalname
        } : 'No file'
      });

      if (!req.file) {
        console.error('❌ No file in request');
        return res.status(400).json({ error: 'No image file provided. Make sure to use FormData with field name "image".' });
      }

      // On Vercel serverless, files in /tmp are temporary and not accessible via HTTP
      // Convert image to base64 and return it so frontend can store it
      try {
        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);
        const base64Image = fileBuffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        
        // Clean up temp file
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.warn('⚠️ Could not delete temp file:', unlinkError.message);
        }
        
        console.log('✅ Image uploaded and converted to base64:', {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          base64Length: base64Image.length
        });
        
        res.json({
          success: true,
          imageUrl: imageUrl,
          filename: req.file.filename,
          size: req.file.size
        });
      } catch (readError) {
        console.error('❌ Error reading uploaded file:', readError);
        res.status(500).json({ error: 'Failed to process uploaded image' });
      }
    } catch (error) {
      console.error('❌ Upload processing error:', error);
      res.status(500).json({ error: error.message || 'Failed to process uploaded image' });
    }
  });
});

module.exports = router;
