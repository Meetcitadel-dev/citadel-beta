# Backend CORS Fix - "Cannot connect to server" Error

## The Problem

When you see "Cannot connect to server" error after setting `VITE_API_URL`, it's usually a **CORS (Cross-Origin Resource Sharing)** issue. Your backend is blocking requests from your frontend domain.

## Solution: Update Backend Environment Variables

### Step 1: Find Your Frontend URL

Your frontend is deployed at: `https://your-frontend.vercel.app` (check your Vercel dashboard)

### Step 2: Update Backend Environment Variables

Go to your **backend** deployment (wherever it's hosted - Vercel, Railway, Render, etc.):

1. Open backend project settings
2. Go to **Environment Variables**
3. Add or update:
   - **Key:** `FRONTEND_URL`
   - **Value:** Your frontend Vercel URL (e.g., `https://your-frontend.vercel.app`)
   - **Important:** Include `https://` and no trailing slash

### Step 3: Redeploy Backend

After updating environment variables, **redeploy your backend** so the changes take effect.

## Multiple Frontend URLs

If you have multiple frontend deployments (production, preview, etc.), you can set multiple URLs separated by commas:

```
FRONTEND_URL=https://your-frontend.vercel.app,https://your-preview.vercel.app
```

## Verify It's Working

1. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for: `🔧 API Configuration:` - shows your API URL
   - Look for: `🌐 API Request:` - shows the request being made
   - Look for: `❌ API Request Failed:` - shows detailed error if it fails

2. **Test Backend Directly:**
   - Visit: `https://your-backend-url.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Check CORS:**
   - In browser console, if you see CORS errors, the backend isn't allowing your frontend domain
   - Make sure `FRONTEND_URL` in backend matches your frontend URL exactly

## Common Issues

### Issue 1: Backend Not Deployed
- **Symptom:** Can't reach backend URL at all
- **Fix:** Deploy your backend first

### Issue 2: Wrong Backend URL
- **Symptom:** 404 errors
- **Fix:** Verify `VITE_API_URL` in frontend matches your actual backend URL

### Issue 3: CORS Blocking
- **Symptom:** "Cannot connect" or CORS errors in console
- **Fix:** Set `FRONTEND_URL` in backend environment variables

### Issue 4: Backend Not Running
- **Symptom:** Connection timeout
- **Fix:** Check backend logs, ensure it's running

## Quick Checklist

- [ ] Backend is deployed and accessible
- [ ] `VITE_API_URL` is set in frontend (Vercel environment variables)
- [ ] `FRONTEND_URL` is set in backend (matches your frontend Vercel URL)
- [ ] Both frontend and backend are redeployed after setting env vars
- [ ] Test backend health endpoint: `https://your-backend/api/health`
- [ ] Check browser console for detailed error messages

## Still Not Working?

1. **Check Browser Console:**
   - Look for the detailed error messages I added
   - They will show the exact URL being called and what went wrong

2. **Test Backend Manually:**
   ```bash
   curl https://your-backend-url.vercel.app/api/health
   ```

3. **Check Backend Logs:**
   - Look at your backend deployment logs
   - Check for CORS warnings or errors

4. **Verify URLs Match:**
   - Frontend `VITE_API_URL` = Backend URL
   - Backend `FRONTEND_URL` = Frontend URL
