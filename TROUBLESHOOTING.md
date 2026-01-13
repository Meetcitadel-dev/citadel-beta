# Troubleshooting "Cannot connect to server" Error

## Quick Diagnosis

1. **Open Browser Console (F12)**
2. **Look for these logs:**
   - `🔧 API Configuration:` - Shows your API URL
   - `🔍 Testing backend connection...` - Shows connectivity test
   - `❌ Backend connection test failed:` - Shows the exact error

3. **Click "Test Backend Connection" button** on the signup screen
   - This will show you exactly what's wrong

## Common Issues & Fixes

### Issue 1: Backend URL is Wrong

**Symptoms:**
- Console shows wrong URL in `🔧 API Configuration:`
- Test button shows 404 or connection refused

**Fix:**
1. Check your `VITE_API_URL` in Vercel environment variables
2. Make sure it's the full URL: `https://your-backend.vercel.app` (no trailing slash)
3. Test the URL directly: Visit `https://your-backend.vercel.app/api/health`
4. Should return: `{"status":"ok","timestamp":"..."}`

### Issue 2: Backend Not Deployed

**Symptoms:**
- Connection timeout
- "Failed to fetch" error
- Test button shows network error

**Fix:**
1. Deploy your backend first
2. Make sure backend is running
3. Check backend deployment logs

### Issue 3: CORS Error

**Symptoms:**
- Console shows CORS error
- Test button shows CORS blocked

**Fix:**
1. Go to backend environment variables
2. Set `FRONTEND_URL` = Your frontend Vercel URL (e.g., `https://your-frontend.vercel.app`)
3. **Redeploy backend** after setting the variable
4. Backend code now supports multiple frontend URLs (comma-separated)

### Issue 4: Backend Health Endpoint Missing

**Symptoms:**
- 404 on `/api/health`
- Other endpoints work

**Fix:**
- Backend should have `/api/health` endpoint (already in code)
- If missing, add it to `server/index.js`

## Step-by-Step Debugging

### Step 1: Check Environment Variables

**Frontend (Vercel):**
- `VITE_API_URL` = `https://your-backend.vercel.app`

**Backend (wherever it's hosted):**
- `FRONTEND_URL` = `https://your-frontend.vercel.app`
- `MONGODB_URI` = Your MongoDB connection string
- `JWT_SECRET` = Your JWT secret
- `RESEND_API_KEY` = Your Resend API key

### Step 2: Test Backend Directly

Open in browser or use curl:
```bash
curl https://your-backend.vercel.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Step 3: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - `🔧 API Configuration:` - Shows what URL is being used
   - `🌐 API Request:` - Shows the request being made
   - `❌ API Request Failed:` - Shows detailed error

### Step 4: Use Test Button

1. On signup screen, click **"🔍 Test Backend Connection"**
2. Check the result:
   - ✅ Green = Backend is accessible
   - ❌ Red = Shows the exact error

## What the Test Button Does

The test button:
1. Tries to connect to `/api/health` endpoint
2. Shows the exact URL being used
3. Displays the error if connection fails
4. Helps identify if it's CORS, network, or URL issue

## Still Not Working?

### Check These:

1. **Backend is actually running:**
   - Visit backend URL directly
   - Check backend deployment logs

2. **URLs are correct:**
   - Frontend `VITE_API_URL` = Backend URL
   - Backend `FRONTEND_URL` = Frontend URL
   - No typos, correct protocol (https://)

3. **Both are redeployed:**
   - After setting environment variables, both need to be redeployed

4. **Check Network Tab:**
   - Open DevTools → Network tab
   - Try to sign up
   - Look at the failed request
   - Check the URL, status code, and error message

5. **Backend Logs:**
   - Check your backend deployment logs
   - Look for incoming requests
   - Check for CORS warnings

## Expected Console Output (When Working)

```
🔧 API Configuration: { baseUrl: "https://your-backend.vercel.app", hasEnvVar: true, ... }
🔍 Testing backend connection...
📍 Test URL: https://your-backend.vercel.app/api/health
✅ Backend Health Check Response: { status: 200, statusText: "OK", ... }
✅ Backend is accessible: { status: "ok", timestamp: "..." }
```

## Expected Console Output (When Failing)

```
🔧 API Configuration: { baseUrl: "/api", hasEnvVar: false, ... }
🔍 Testing backend connection...
❌ Backend connection test failed: TypeError: Failed to fetch
Error details: { name: "TypeError", message: "Failed to fetch", ... }
```

This tells you:
- `hasEnvVar: false` = VITE_API_URL not set
- `Failed to fetch` = Can't reach backend

## Quick Checklist

- [ ] Backend is deployed and running
- [ ] `VITE_API_URL` set in frontend (Vercel env vars)
- [ ] `FRONTEND_URL` set in backend env vars
- [ ] Both frontend and backend redeployed after setting env vars
- [ ] Backend health endpoint works: `https://your-backend/api/health`
- [ ] Browser console shows correct API URL
- [ ] Test button shows backend is accessible
- [ ] No CORS errors in console
