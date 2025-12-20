# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
# Option 1: MongoDB Atlas (Cloud - Recommended)
# Get your connection string from https://cloud.mongodb.com
# Format: mongodb+srv://username:password@cluster.mongodb.net/citadel-app
MONGODB_URI=mongodb://localhost:27017/citadel-app

# Option 2: Local MongoDB
# If you have MongoDB installed locally, use:
# MONGODB_URI=mongodb://localhost:27017/citadel-app

# JWT Secret (generate a strong random string in production)
# You can generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Resend Email Service
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=re_your_resend_api_key_here
# For testing: onboarding@resend.dev
# For production: hello@meetcitadel.com (after domain verification)
RESEND_FROM_EMAIL=hello@meetcitadel.com

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173

# API URL (for frontend - optional, defaults to http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api
```

## Getting Started with Resend

1. Sign up at [https://resend.com](https://resend.com)
2. Create an API key in the dashboard
3. **For Testing (Default)**: Use `onboarding@resend.dev` - this works immediately without any setup
4. **For Production**: 
   - Add and verify your own domain in Resend dashboard
   - Use an email from your verified domain (e.g., `noreply@yourdomain.com`)
   - Update `RESEND_FROM_EMAIL` to your verified domain email
5. Copy your API key to `RESEND_API_KEY` in your `.env` file

**Important**: You cannot use Gmail addresses (like `meetcitadel@gmail.com`) directly with Resend. You must either:
- Use Resend's default `onboarding@resend.dev` for testing
- Verify your own domain and use an email from that domain (e.g., `hello@meetcitadel.com`)

**For Custom Domain Setup (meetcitadel.com):**
See `DOMAIN_SETUP.md` for detailed instructions on setting up domain verification in Resend and adding DNS records in GoDaddy.

## JWT Secret Generation

For production, generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `JWT_SECRET` in your `.env` file.

## MongoDB Setup

You have two options for the database:

### Option 1: MongoDB Atlas (Cloud - Recommended) ⭐

1. Sign up for free at [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a new cluster (free tier is available)
3. Create a database user (Database Access → Add New User)
4. Whitelist your IP address (Network Access → Add IP Address → Add Current IP Address)
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `citadel-app` (or your preferred database name)
6. Update `MONGODB_URI` in your `.env` file with the connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/citadel-app`

### Option 2: Local MongoDB

**Install MongoDB on macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Or download from:** [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

Then use: `MONGODB_URI=mongodb://localhost:27017/citadel-app`

