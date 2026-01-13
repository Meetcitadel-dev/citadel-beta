# Analytics API Documentation

This document explains how to access your backend data for analytics dashboard integration.

## Database Information

**Database Type:** MongoDB  
**Database Name:** `citadel-app` (default)  
**Connection String:** `mongodb://localhost:27017/citadel-app` (or set `MONGODB_URI` env variable)

## Collections (Tables)

1. **users** - User profiles and authentication data
2. **matches** - Matches between users (when both select same adjective)
3. **notifications** - Vibes/adjectives sent between users
4. **messages** - Chat messages between users
5. **messagerequests** - Message requests (pending/accepted/declined)

## Option 1: Use Analytics API Endpoints (Recommended)

I've created dedicated analytics endpoints that aggregate data for you. These are easier to use than connecting directly to MongoDB.

### Base URL
```
http://localhost:3001/api/analytics
```

### Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints

#### 1. Overview Statistics
```
GET /api/analytics/overview?period=all|today|week|month|year
```
Returns:
- Total users, new users, premium users, active users
- Profile completion rate
- Total/new matches, vibes, messages, message requests

**Example Response:**
```json
{
  "users": {
    "total": 150,
    "new": 25,
    "premium": 30,
    "active": 45,
    "withImages": 120,
    "profileCompletionRate": "80.00"
  },
  "matches": { "total": 50, "new": 10 },
  "vibes": { "total": 500, "new": 100 },
  "messages": { "total": 1000, "new": 200 },
  "messageRequests": { "total": 75, "new": 15 },
  "period": "month"
}
```

#### 2. User Metrics
```
GET /api/analytics/users?period=all&limit=100
```
Returns:
- List of users with details
- User statistics
- College, year, gender distributions

#### 3. Engagement Metrics
```
GET /api/analytics/engagement?period=month
```
Returns:
- Vibes sent/received
- Vibes by premium vs free users
- Match rate
- Most popular adjectives
- Adjectives that result in matches

#### 4. Messaging Metrics
```
GET /api/analytics/messaging?period=month
```
Returns:
- Total messages, unread messages
- Messages by premium vs free
- Active conversations count
- Average messages per conversation

#### 5. Message Request Metrics
```
GET /api/analytics/message-requests?period=month
```
Returns:
- Total, pending, accepted, declined requests
- Acceptance rate, decline rate

#### 6. Activity Metrics (DAU, WAU, MAU)
```
GET /api/analytics/activity
```
Returns:
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Hourly activity breakdown

#### 7. Premium Metrics
```
GET /api/analytics/premium
```
Returns:
- Total users, premium users, free users
- Premium conversion rate
- Premium users by signup date

## Option 2: Direct MongoDB Connection

If you prefer to connect directly to MongoDB:

### Connection String
```
mongodb://localhost:27017/citadel-app
```

### Using MongoDB Compass (GUI)
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using: `mongodb://localhost:27017`
3. Select database: `citadel-app`
4. Browse collections: `users`, `matches`, `notifications`, `messages`, `messagerequests`

### Using MongoDB Shell
```bash
mongosh mongodb://localhost:27017/citadel-app
```

### Example Queries

**Get all users:**
```javascript
db.users.find().pretty()
```

**Get users with profile images:**
```javascript
db.users.find({ imageUrl: { $exists: true, $ne: '' } })
```

**Get all matches:**
```javascript
db.matches.find().pretty()
```

**Get vibes sent today:**
```javascript
db.notifications.find({
  createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
})
```

**Get premium users:**
```javascript
db.users.find({ isPremium: true })
```

## Option 3: Connect Dashboard via API

### Example: Fetching Overview Data (JavaScript)

```javascript
// Get your JWT token from localStorage or login
const token = localStorage.getItem('auth_token');

// Fetch overview statistics
fetch('http://localhost:3001/api/analytics/overview?period=month', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Overview:', data);
  // Use data.users.total, data.matches.total, etc.
});
```

### Example: Fetching User Metrics (Python)

```python
import requests

token = "YOUR_JWT_TOKEN"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.get(
    "http://localhost:3001/api/analytics/users?period=month&limit=100",
    headers=headers
)

data = response.json()
print(f"Total users: {data['stats']['total']}")
print(f"Premium users: {data['stats']['premium']}")
```

## Data Models Reference

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  gender: String, // 'male', 'female', 'other'
  college: String,
  year: String, // '1st Year', '2nd Year', etc.
  age: Number,
  skills: [String],
  imageUrl: String,
  note: String, // max 40 chars
  isPremium: Boolean,
  premiumExpiresAt: Date,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Match Model
```javascript
{
  _id: ObjectId,
  user1Id: ObjectId (ref: User),
  user2Id: ObjectId (ref: User),
  adjective: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model (Vibes)
```javascript
{
  _id: ObjectId,
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  adjective: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  text: String,
  read: Boolean,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### MessageRequest Model
```javascript
{
  _id: ObjectId,
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  adjective: String,
  status: String, // 'pending', 'accepted', 'declined'
  createdAt: Date,
  updatedAt: Date
}
```

## Quick Start for Dashboard

1. **Get JWT Token**: Login to your app and get the token from localStorage or API response
2. **Test Endpoint**: Try `/api/analytics/overview` to get started
3. **Build Dashboard**: Use the aggregated data from analytics endpoints
4. **Real-time Updates**: Poll endpoints every few minutes or use WebSockets (if implemented)

## Environment Variables

Make sure your `.env` file has:
```
MONGODB_URI=mongodb://localhost:27017/citadel-app
PORT=3001
```

## Troubleshooting

**Can't connect to MongoDB?**
- Make sure MongoDB is running: `mongod` or check MongoDB Atlas connection string

**401 Unauthorized?**
- Make sure you're sending a valid JWT token in Authorization header
- Token might be expired - login again to get a new token

**No data returned?**
- Check if MongoDB has data: `db.users.countDocuments()`
- Verify you're querying the correct database name
