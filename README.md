## Vibe Tags – College Adjectives Web App

Vibe Tags is a small Vite + React web app that lets college students send short, adjective-based “vibes” to each other. It’s a dark, dating-style UI (black + parrot green) with a big profile card and a simple inbox of received vibes.

### Features

- **Discover / Explore screen**:  
  - Shows a large profile card (photo, name, year, college, skills-as-role).  
  - Lets you tap an adjective button to send a “vibe” to the visible profile.  
  - Automatically moves to the next profile after sending a vibe.  
  - Lightweight “skip profile” link if you want to move on without sending.
- **Inbox screen**:  
  - Lists adjectives that the currently logged-in user has received.  
  - Shows who sent the vibe and when.
- **Accounts screen**:  
  - Switches between mock college users so you can see the app from different perspectives.

### Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Build tool**: Vite
- **Styling**: Hand-written CSS in `src/styles.css`
- **Authentication**: JWT tokens

### Getting Started

#### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)

#### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Create a `.env` file in the root directory:

```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/citadel-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
VITE_API_URL=http://localhost:3001/api
```

For MongoDB Atlas, use your connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/citadel-app
```

3. **Seed the database** (optional - populates with initial user data)

```bash
node server/seed.js
```

4. **Start the backend server**

In one terminal:
```bash
npm run server:dev
```

5. **Start the frontend dev server**

In another terminal:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001/api`.

#### Production Build

1. **Build the frontend**

```bash
npm run build
```

2. **Start the backend server**

```bash
npm run server
```

3. **Preview the production build** (optional)

```bash
npm run preview
```

### Project Structure (high level)

- `src/main.jsx` – React entry point, mounts the app and imports global styles.  
- `src/App.jsx` – Top-level layout, navigation tabs, and screen switching.  
- `src/components/DiscoverScreen.jsx` – Main profile / adjective sending view.  
- `src/components/InboxScreen.jsx` – Displays received vibes for the active user.  
- `src/components/AccountSwitcherScreen.jsx` – Switches between mock accounts.  
- `src/styles.css` – All global UI styling (dark theme, parrot green accents).  
- `src/data/users.js` – Mock college user profiles.  
- `src/data/adjectives.js` – Gender-aware adjective generator.

### Backend API

The backend provides RESTful API endpoints for:
- **Authentication**: Register, login, get current user
- **Users**: Get all users, get user by ID, update profile, update premium status
- **Notifications**: Send/receive vibes/adjectives, get today's count
- **Matches**: Get matches, get match count
- **Messages**: Send messages, get conversations, mark as read
- **Message Requests**: Create/accept/decline message requests

See `server/README.md` for detailed API documentation.

### Project Structure

**Frontend:**
- `src/main.jsx` – React entry point
- `src/App.jsx` – Top-level layout and navigation
- `src/components/` – React components (DiscoverScreen, InboxScreen, etc.)
- `src/utils/api.js` – API client for backend communication
- `src/styles.css` – Global UI styling
- `src/data/` – Local data utilities (can be migrated to use API)

**Backend:**
- `server/index.js` – Express server entry point
- `server/models/` – MongoDB models (User, Notification, Match, Message, MessageRequest)
- `server/routes/` – API route handlers
- `server/middleware/` – Authentication middleware
- `server/seed.js` – Database seeding script

### Notes

- The app now uses MongoDB for persistent data storage
- Authentication is handled via JWT tokens
- All API endpoints require authentication (except register/login)
- See `server/README.md` for detailed backend documentation


