/**
 * Script to remove all fake users from the database
 * This will delete all users except those created through the registration flow
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel-app';

async function clearFakeUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all users from the database
    const result = await User.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} users from the database`);
    console.log('✅ All fake users have been removed');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing fake users:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

clearFakeUsers();
