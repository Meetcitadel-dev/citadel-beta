# How to View All Users Who Have Logged In

## 📍 **Where User Data is Stored:**

### **1. MongoDB Database (Primary Storage)**
All registered users are stored in MongoDB.

**Location:** MongoDB database `citadel-app` (or as configured in `MONGODB_URI`)

**Collection:** `users`

**To view all users:**
```bash
node server/scripts/view-all-users.js
```

This script will show:
- All users with their complete details (name, email, phone, gender, age, college, year, skills)
- Creation date for each user
- Total count of users

### **2. Email Log File (New User Registrations)**
All new user email addresses are logged to a file when they register.

**File Location:** `server/data/new-users-emails.txt`

**Format:** 
```
2026-01-11T07:30:45.123Z - user@example.com
2026-01-11T08:15:22.456Z - another@example.com
```

**To view logged emails:**
```bash
cat server/data/new-users-emails.txt
```

Or use the view script which also shows this:
```bash
node server/scripts/view-all-users.js
```

## 🔍 **Code Locations:**

### **Backend - User Storage:**
- **Model:** `server/models/User.js` - Defines user schema
- **Routes:** `server/routes/auth.js` - Handles registration/login
- **Routes:** `server/routes/users.js` - Handles user CRUD operations
- **Logger:** `server/utils/userLogger.js` - Logs new user emails

### **Frontend - User Display:**
- **Profile Screen:** `src/components/ProfileScreen.jsx` - Shows and edits user profile
- **Auth Screen:** `src/components/AuthScreen.jsx` - Handles signup/login

## 📊 **User Data Saved:**

When a user registers or logs in, the following data is saved:
- ✅ Email ID
- ✅ Name
- ✅ Gender
- ✅ Age
- ✅ College
- ✅ Year
- ✅ Skills (interests)
- ✅ Phone (optional)
- ✅ Profile Image URL
- ✅ Premium Status
- ✅ Email Verification Status

All this data is automatically pre-filled in the Edit Profile screen so users don't have to enter it again.

## 🚀 **Quick Commands:**

**View all users from database:**
```bash
node server/scripts/view-all-users.js
```

**View only logged emails:**
```bash
cat server/data/new-users-emails.txt
```

**Clear all users (if needed):**
```bash
node server/scripts/clear-fake-users.js
```
