const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine upload directory based on environment
// Vercel serverless: use /tmp (writable)
// Local/dev: use server/uploads/profile-images
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const uploadDir = isVercel 
  ? path.join(os.tmpdir(), 'uploads', 'profile-images')
  : path.join(__dirname, '../uploads/profile-images');

// Ensure upload directory exists (only if we can write)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  console.log('✅ Upload directory ready:', uploadDir);
} catch (error) {
  console.warn('⚠️ Could not create upload directory:', error.message);
  console.warn('⚠️ Uploads may not work in this environment');
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp-originalname
    // req.userId is set by authenticate middleware
    const userId = req.userId || 'temp';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const ext = path.extname(originalName) || '.jpg';
    const baseName = path.basename(originalName, ext);
    const filename = `${userId}-${timestamp}-${randomStr}${ext}`;
    cb(null, filename);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
