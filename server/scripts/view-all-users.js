/**
 * Script to view all users who have logged in/registered
 * Shows all users from MongoDB database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { getAllLoggedEmails } = require('../utils/userLogger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citadel-app';

async function viewAllUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users from database
    const users = await User.find({})
      .select('name email phone gender age college year skills createdAt')
      .sort({ createdAt: -1 }); // Most recent first
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name || 'No name'}`);
        console.log(`   Email: ${user.email || 'No email'}`);
        console.log(`   Phone: ${user.phone || 'No phone'}`);
        console.log(`   Gender: ${user.gender || 'Not set'}`);
        console.log(`   Age: ${user.age || 'Not set'}`);
        console.log(`   College: ${user.college || 'Not set'}`);
        console.log(`   Year: ${user.year || 'Not set'}`);
        console.log(`   Skills: ${(user.skills || []).join(', ') || 'None'}`);
        console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}`);
        console.log('-'.repeat(80));
      });
    }

    // Also show emails from log file
    console.log('\n\n📧 Emails logged in new-users-emails.txt:');
    console.log('='.repeat(80));
    const loggedEmails = getAllLoggedEmails();
    if (loggedEmails.length === 0) {
      console.log('No emails found in log file.');
    } else {
      console.log(`Total logged emails: ${loggedEmails.length}\n`);
      loggedEmails.forEach((email, index) => {
        console.log(`${index + 1}. ${email}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing users:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

viewAllUsers();
