# Vercel Backend Setup Guide

## The Problem

Your backend is a standard Express server, but Vercel requires serverless functions. The backend needs to be structured differently for Vercel.

## Solution

I've created a Vercel-compatible serverless function wrapper in `server/api/index.js`.

## Backend Deployment Steps

### Option 1: Deploy Backend as Separate Vercel Project (Recommended)

1. **Create New Vercel Project for Backend:**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Connect your GitHub repo
   - **Root Directory:** Set to `server` (important!)
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

2. **Set Environment Variables:**
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Your JWT secret
   - `RESEND_API_KEY` = Your Resend API key
   - `FRONTEND_URL` = `https://citadel-beta-rosy.vercel.app`
   - `NODE_ENV` = `production`

3. **Deploy:**
   - Vercel will automatically detect `server/vercel.json`
   - It will use `server/api/index.js` as the serverless function

4. **Get Backend URL:**
   - After deployment, Vercel will give you a URL like: `https://citadel-backend.vercel.app`
   - Use this in frontend `VITE_API_URL`

### Option 2: Use Railway/Render/Heroku (Alternative)

If Vercel serverless is causing issues, deploy backend to:
- **Railway** (recommended for Node.js + MongoDB)
- **Render** (free tier available)
- **Heroku** (paid)

Then set `VITE_API_URL` to that backend URL.

## File Structure for Vercel

```
server/
  ├── api/
  │   └── index.js          ← Vercel serverless function (NEW)
  ├── vercel.json           ← Vercel config (NEW)
  ├── index.js              ← Original Express server (for local dev)
  ├── index-serverless.js   ← Serverless version (NEW)
  ├── routes/
  ├── models/
  └── ...
```

## Testing Backend

After deploying, test:
```
https://your-backend.vercel.app/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Troubleshooting

### Backend Returns 404

- Check `server/vercel.json` exists
- Verify Root Directory is set to `server` in Vercel
- Check deployment logs for errors

### CORS Still Blocking

- Set `FRONTEND_URL` in backend environment variables
- Redeploy backend after setting

### Routes Not Working

- Make sure routes are mounted at `/api/*` in `server/api/index.js`
- Check Vercel function logs for errors

## Quick Checklist

- [ ] Backend deployed to Vercel with Root Directory = `server`
- [ ] `server/vercel.json` exists
- [ ] `server/api/index.js` exists
- [ ] Environment variables set in backend Vercel project
- [ ] Backend health endpoint works: `https://backend.vercel.app/api/health`
- [ ] Frontend `VITE_API_URL` = `https://backend.vercel.app/api`
- [ ] Backend `FRONTEND_URL` = `https://frontend.vercel.app`
