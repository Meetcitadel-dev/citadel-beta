// Vercel serverless function wrapper for Express app
try {
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
console.log('   NODE_ENV:', process.env.NODE_ENV);

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
  
  // Log connection string info (without password) for debugging
  if (MONGODB_URI) {
    const uriPreview = MONGODB_URI.replace(/:[^:@]+@/, ':****@'); // Hide password
    console.log('🔗 MongoDB URI:', uriPreview);
    console.log('🔗 URI starts with mongodb:// or mongodb+srv://?', 
      MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'));
  } else {
    console.warn('⚠️ MONGODB_URI is not set!');
  }
  
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('✅ Connected to MongoDB');
  }).catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('❌ Full error:', error);
    if (error.message.includes('Invalid scheme')) {
      console.error('💡 Fix: Make sure MONGODB_URI starts with mongodb:// or mongodb+srv://');
      console.error('💡 Current URI preview:', MONGODB_URI ? MONGODB_URI.substring(0, 50) + '...' : 'NOT SET');
    }
  });
}

// Health check - handle both /api/health and /health (Vercel might strip /api)
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check called at /api/health');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  console.log('🏥 Health check called at /health');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug middleware - place BEFORE routes to catch all requests
app.use((req, res, next) => {
  console.log('📥 Request received:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
  next();
});

// Routes - handle both /api/* and /* (Vercel might strip /api prefix)
app.use('/api/auth', require('../routes/auth'));
app.use('/auth', require('../routes/auth'));

app.use('/api/users', require('../routes/users'));
app.use('/users', require('../routes/users'));

app.use('/api/upload', require('../routes/upload'));
app.use('/upload', require('../routes/upload'));

app.use('/api/notifications', require('../routes/notifications'));
app.use('/notifications', require('../routes/notifications'));

app.use('/api/matches', require('../routes/matches'));
app.use('/matches', require('../routes/matches'));

app.use('/api/messages', require('../routes/messages'));
app.use('/messages', require('../routes/messages'));

app.use('/api/message-requests', require('../routes/messageRequests'));
app.use('/message-requests', require('../routes/messageRequests'));

app.use('/api/analytics', require('../routes/analytics'));
app.use('/analytics', require('../routes/analytics'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({ 
    error: `Cannot ${req.method} ${req.path}`,
    receivedPath: req.path,
    receivedUrl: req.url,
    originalUrl: req.originalUrl
  });
});

  // Export for Vercel serverless
  module.exports = app;
} catch (error) {
  console.error('❌ Fatal error during server initialization:', error);
  console.error('Stack:', error.stack);
  // Export a minimal error handler
  const express = require('express');
  const errorApp = express();
  errorApp.use((req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  module.exports = errorApp;
}
