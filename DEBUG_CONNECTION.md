# Debugging Backend Connection Issues

## Current Setup

**Frontend:** `https://citadel-beta-rosy.vercel.app`  
**Backend:** `https://citadel-backend.vercel.app`

## Environment Variables

**Frontend (Vercel):**
- `VITE_API_URL` = `https://citadel-backend.vercel.app/api` ✅ (should include /api)

**Backend (Vercel):**
- `FRONTEND_URL` = `https://citadel-beta-rosy.vercel.app` ✅

## Testing Steps

### Step 1: Test Backend Health Endpoint Directly

Open in browser or use curl:
```
https://citadel-backend.vercel.app/api/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2024-..."}
```

**If this fails:**
- Backend might not be deployed correctly
- Backend routes might not be set up
- Check backend deployment logs

### Step 2: Check Browser Console

1. Open your frontend app
2. Open DevTools (F12)
3. Go to Console tab
4. Look for:
   - `🔧 API Configuration:` - Shows what URL is being used
   - `🔍 Testing backend connection...` - Shows test attempt
   - `📍 Test URL:` - Shows the exact URL being tested

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Click "Test Backend Connection" button
3. Look for the request to `/api/health`
4. Check:
   - **Status:** Should be 200 (not 404, not CORS error)
   - **Request URL:** Should be `https://citadel-backend.vercel.app/api/health`
   - **Response Headers:** Should include `Access-Control-Allow-Origin`

### Step 4: Verify CORS

If you see CORS errors in console:

1. **Check Backend Logs:**
   - Go to Vercel → Backend project → Deployments → Latest → Functions Logs
   - Look for CORS warnings or errors
   - Should see: `✅ CORS allowed for origin: https://citadel-beta-rosy.vercel.app`

2. **Verify FRONTEND_URL:**
   - Make sure `FRONTEND_URL` in backend is exactly: `https://citadel-beta-rosy.vercel.app`
   - No trailing slash
   - Correct protocol (https://)

3. **Redeploy Backend:**
   - After setting/updating `FRONTEND_URL`, you MUST redeploy
   - Environment variables only take effect after redeployment

## Common Issues

### Issue 1: Backend Returns 404

**Symptom:** Network tab shows 404 for `/api/health`

**Possible Causes:**
- Backend routes not mounted correctly
- Backend not deployed properly
- Wrong URL path

**Fix:**
- Check backend `server/index.js` has health route
- Verify backend is deployed and running
- Test backend URL directly in browser

### Issue 2: CORS Error

**Symptom:** Console shows "CORS policy" error

**Fix:**
- Set `FRONTEND_URL` in backend environment variables
- Value should be: `https://citadel-beta-rosy.vercel.app`
- Redeploy backend after setting

### Issue 3: "Failed to fetch"

**Symptom:** Network error, can't reach backend

**Possible Causes:**
- Backend is down
- Wrong backend URL
- Network issue

**Fix:**
- Test backend URL directly: `https://citadel-backend.vercel.app/api/health`
- Verify backend is deployed
- Check backend deployment status in Vercel

### Issue 4: Wrong URL Being Used

**Symptom:** Console shows URL without `/api`

**Fix:**
- Update `VITE_API_URL` to include `/api`: `https://citadel-backend.vercel.app/api`
- Code will auto-fix, but better to set correctly
- Redeploy frontend after updating

## Quick Checklist

- [ ] Backend health endpoint works: `https://citadel-backend.vercel.app/api/health`
- [ ] `VITE_API_URL` = `https://citadel-backend.vercel.app/api` (with /api)
- [ ] `FRONTEND_URL` = `https://citadel-beta-rosy.vercel.app` (in backend)
- [ ] Both frontend and backend redeployed after setting env vars
- [ ] Browser console shows correct API URL
- [ ] Network tab shows request to correct URL
- [ ] No CORS errors in console
- [ ] Backend logs show CORS allowed

## Still Not Working?

1. **Check Backend Deployment:**
   - Is backend actually deployed?
   - Are there any errors in backend logs?
   - Is MongoDB connected?

2. **Test Backend Manually:**
   ```bash
   curl https://citadel-backend.vercel.app/api/health
   ```

3. **Check Environment Variables:**
   - Frontend: `VITE_API_URL` should include `/api`
   - Backend: `FRONTEND_URL` should match frontend domain exactly

4. **Clear Browser Cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
