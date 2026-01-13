# Vercel Deployment Guide

## Frontend Deployment Issues Fixed

### 1. Demo OTP Component Removed
- The demo OTP display component has been removed from the AuthScreen
- Users will only see the OTP input field and must check their email

### 2. API Endpoint Configuration

The app uses environment variables to configure the API URL. For Vercel deployment:

#### Option 1: Set Environment Variable (Recommended)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your backend URL (e.g., `https://your-backend.vercel.app` or `https://api.yourdomain.com`)
4. Redeploy your frontend

#### Option 2: Update vercel.json

If your backend is on a different Vercel project, update `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.vercel.app/api/:path*"
    }
  ]
}
```

Replace `your-backend-url.vercel.app` with your actual backend URL.

#### Option 3: Update API_BASE_URL in code

If you prefer to hardcode (not recommended), edit `src/utils/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://your-actual-backend-url.vercel.app' : '/api');
```

## Backend Deployment

Your backend needs to be deployed separately. Options:

1. **Vercel** - Deploy backend as a separate Vercel project
2. **Railway** - Good for MongoDB + Node.js
3. **Render** - Free tier available
4. **Heroku** - Paid option

### Backend Environment Variables Needed

Make sure your backend has these environment variables set:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
```

## Testing After Deployment

1. **Check API Connection:**
   - Open browser console
   - Try to sign up/login
   - Check for API errors

2. **Verify Environment Variables:**
   - Make sure `VITE_API_URL` is set in Vercel
   - Check that backend URL is correct

3. **CORS Issues:**
   - Backend must allow your frontend domain in CORS
   - Update `FRONTEND_URL` in backend environment variables

## Common Issues

### "API endpoint not found" Error

**Cause:** Frontend can't reach backend API

**Solutions:**
1. Set `VITE_API_URL` environment variable in Vercel
2. Update `vercel.json` with correct backend URL
3. Verify backend is deployed and accessible
4. Check CORS settings on backend

### CORS Errors

**Cause:** Backend not allowing frontend domain

**Solution:** Update backend `FRONTEND_URL` environment variable to include your Vercel frontend URL

### OTP Not Received

**Cause:** Email service (Resend) not configured

**Solution:** 
1. Verify `RESEND_API_KEY` is set in backend
2. Check Resend dashboard for email logs
3. Verify sender email domain is verified in Resend

## Quick Checklist

- [ ] Backend deployed and accessible
- [ ] `VITE_API_URL` set in Vercel frontend environment variables
- [ ] Backend `FRONTEND_URL` includes frontend Vercel URL
- [ ] MongoDB connection string configured
- [ ] Resend API key configured
- [ ] JWT secret configured
- [ ] Test signup/login flow
