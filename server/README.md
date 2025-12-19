# Backend Server Documentation

## Overview

This is a Node.js/Express backend server with MongoDB database for the Citadel app. It provides RESTful API endpoints for user management, notifications, matches, messages, and message requests.

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `PORT`: Server port (default: 3001)

### Running the Server

Development mode (with auto-reload):
```bash
npm run server:dev
```

Production mode:
```bash
npm run server
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with phone/email
- `GET /api/auth/me` - Get current user info (requires auth)

### Users

- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `PUT /api/users/:id` - Update user profile (requires auth, own profile only)
- `PATCH /api/users/:id/premium` - Update premium status (requires auth)

### Notifications (Vibes/Adjectives)

- `GET /api/notifications` - Get notifications for current user (requires auth)
- `GET /api/notifications/sent` - Get notifications sent by current user (requires auth)
- `POST /api/notifications` - Send a vibe/adjective (requires auth)
- `GET /api/notifications/count/today` - Get count of vibes sent today (requires auth)

### Matches

- `GET /api/matches` - Get all matches for current user (requires auth)
- `GET /api/matches/count/:userId` - Get match count for a user (requires auth)

### Messages

- `GET /api/messages/conversation/:otherUserId` - Get conversation messages (requires auth)
- `POST /api/messages` - Send a message (requires auth)
- `PATCH /api/messages/read/:otherUserId` - Mark messages as read (requires auth)

### Message Requests

- `GET /api/message-requests` - Get message requests for current user (requires auth)
- `GET /api/message-requests?status=pending` - Get requests by status (requires auth)
- `GET /api/message-requests/sent` - Get requests sent by current user (requires auth)
- `GET /api/message-requests/conversations` - Get accepted conversations (requires auth)
- `POST /api/message-requests` - Create a message request (requires auth)
- `PATCH /api/message-requests/:id` - Update request status (accept/decline) (requires auth)

## Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require authentication via JWT token.

Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Database Models

### User
- name, gender, college, year, age, skills, imageUrl
- phone, email (optional, for login)
- isPremium, premiumExpiresAt

### Notification
- fromUserId, toUserId, adjective
- createdAt (auto)

### Match
- user1Id, user2Id, adjective
- createdAt (auto)

### Message
- fromUserId, toUserId, text
- read, readAt
- createdAt (auto)

### MessageRequest
- fromUserId, toUserId, adjective
- status (pending/accepted/declined)
- createdAt (auto)

## Environment Variables

- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

## Error Handling

All errors return JSON in the format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

