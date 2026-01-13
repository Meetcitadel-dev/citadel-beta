# URGENT: CORS Fix Required

## The Problem

Your console shows:
```
Access to fetch at 'https://citadel-backend.vercel.app/auth/request-otp' 
from origin 'https://citadel-beta-rosy.vercel.app' 
has been blocked by CORS policy
```

**Frontend:** `https://citadel-beta-rosy.vercel.app`  
**Backend:** `https://citadel-backend.vercel.app`

## The Fix (Do This Now!)

### Step 1: Go to Your Backend Vercel Project

1. Open Vercel Dashboard
2. Go to your **backend** project (`citadel-backend`)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add/Update FRONTEND_URL

Add or update this environment variable:

- **Key:** `FRONTEND_URL`
- **Value:** `https://citadel-beta-rosy.vercel.app`
- **Environment:** Production, Preview, Development (select all)

### Step 3: Redeploy Backend

**IMPORTANT:** After adding the environment variable, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Test

1. Refresh your frontend
2. Try signing up again
3. Check browser console - CORS error should be gone

## Why This Happens

The backend needs to know which frontend domains are allowed to make requests. Without `FRONTEND_URL` set, the backend blocks all requests from your frontend.

## Verify It's Working

After redeploying, check backend logs. You should see:
```
🔧 CORS Configuration:
   Allowed Origins: [ 'https://citadel-beta-rosy.vercel.app' ]
✅ CORS allowed for origin: https://citadel-beta-rosy.vercel.app
```

## Still Not Working?

1. **Double-check the URL:**
   - Make sure `FRONTEND_URL` is exactly: `https://citadel-beta-rosy.vercel.app`
   - No trailing slash
   - Correct protocol (https://)

2. **Check Backend Logs:**
   - Look for CORS warnings
   - Should show "✅ CORS allowed" not "⚠️ CORS blocked"

3. **Clear Browser Cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Test Backend Directly:**
   - Visit: `https://citadel-backend.vercel.app/api/health`
   - Should return: `{"status":"ok"}`

## Quick Checklist

- [ ] `FRONTEND_URL` set in backend environment variables
- [ ] Value is exactly: `https://citadel-beta-rosy.vercel.app`
- [ ] Backend redeployed after setting variable
- [ ] Frontend refreshed
- [ ] Check browser console - no CORS errors
