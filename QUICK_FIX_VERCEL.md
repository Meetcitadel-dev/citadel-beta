# Quick Fix for Vercel Deployment

## The Problem
"API endpoint not found" error means your frontend can't reach your backend.

## Solution (Choose ONE)

### Option 1: Set Environment Variable (Recommended)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** Your backend URL (e.g., `https://citadel-backend.vercel.app` or `https://api.yourdomain.com`)
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**
5. **Redeploy** your frontend

### Option 2: Update vercel.json

1. Open `vercel.json` in your project
2. Replace `https://citadel-backend.vercel.app` with your actual backend URL
3. Commit and push to GitHub
4. Vercel will auto-redeploy

### Option 3: Backend on Same Vercel Project

If your backend is deployed as serverless functions in the same Vercel project:

1. Make sure your backend code is in `/api` folder
2. Remove or comment out the rewrite in `vercel.json`
3. The `/api` routes will work automatically

## How to Find Your Backend URL

- **If backend is on Vercel:** Check your backend Vercel project → Settings → Domains
- **If backend is elsewhere:** Use the full URL where your backend API is hosted
- **Test it:** Visit `https://your-backend-url.vercel.app/api/health` - should return `{"status":"ok"}`

## After Fixing

1. Clear browser cache
2. Try signing up again
3. Check browser console (F12) for any errors
4. Verify API requests are going to the correct URL

## Still Not Working?

Check:
- ✅ Backend is deployed and running
- ✅ Backend CORS allows your frontend domain
- ✅ Backend has `FRONTEND_URL` environment variable set
- ✅ MongoDB connection is working
- ✅ Resend API key is configured
