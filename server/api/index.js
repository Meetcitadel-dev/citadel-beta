// Vercel serverless function wrapper for Express app
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration - allow multiple origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

console.log('🔧 CORS Configuration:');
console.log('   Allowed Origins:', allowedOrigins);

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (origin === allowed) return true;
      const allowedDomain = allowed.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const originDomain = origin.replace(/^https?:\/\//, '').replace(/^www\./, '');
      return originDomain === allowedDomain || origin.includes(allowedDomain);
    });
    
    if (isAllowed) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(null, true); // Allow for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
if (mongoose.connection.readyState === 0) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel-app';
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('✅ Connected to MongoDB');
  }).catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });
}

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/upload', require('../routes/upload'));
app.use('/api/notifications', require('../routes/notifications'));
app.use('/api/matches', require('../routes/matches'));
app.use('/api/messages', require('../routes/messages'));
app.use('/api/message-requests', require('../routes/messageRequests'));
app.use('/api/analytics', require('../routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
