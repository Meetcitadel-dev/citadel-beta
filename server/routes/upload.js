const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

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
      // Compress and resize image, then convert to base64 to reduce size
      try {
        const filePath = req.file.path;
        const originalSize = req.file.size;
        
        // Compress and resize image using sharp
        // Max dimensions: 800x800, quality: 80, format: JPEG (smaller than PNG)
        const compressedBuffer = await sharp(filePath)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toBuffer();
        
        const compressedSize = compressedBuffer.length;
        const base64Image = compressedBuffer.toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        
        // Clean up temp file
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.warn('⚠️ Could not delete temp file:', unlinkError.message);
        }
        
        const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        
        console.log('✅ Image uploaded, compressed, and converted to base64:', {
          filename: req.file.filename,
          originalSize: originalSize,
          compressedSize: compressedSize,
          base64Length: base64Image.length,
          compressionRatio: `${compressionRatio}%`,
          mimetype: 'image/jpeg'
        });
        
        // Warn if still too large (Vercel has 4.5MB request limit)
        if (base64Image.length > 3 * 1024 * 1024) {
          console.warn('⚠️ Base64 image is still large:', base64Image.length, 'bytes');
        }
        
        res.json({
          success: true,
          imageUrl: imageUrl,
          filename: req.file.filename,
          size: compressedSize,
          originalSize: originalSize
        });
      } catch (readError) {
        console.error('❌ Error processing uploaded file:', readError);
        res.status(500).json({ error: 'Failed to process uploaded image: ' + readError.message });
      }
    } catch (error) {
      console.error('❌ Upload processing error:', error);
      res.status(500).json({ error: error.message || 'Failed to process uploaded image' });
    }
  });
});

module.exports = router;
