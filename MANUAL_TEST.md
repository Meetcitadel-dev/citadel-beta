# Manual Backend Test

## Test Backend Directly

Open these URLs in your browser to test:

### 1. Backend Root
```
https://citadel-backend.vercel.app
```
**Expected:** Should show backend is running (you saw "Serveur citadel en cours d'exécution")

### 2. Health Endpoint
```
https://citadel-backend.vercel.app/api/health
```
**Expected:** Should return JSON: `{"status":"ok","timestamp":"..."}`

**If this fails:**
- Backend routes might not be mounted correctly
- Check backend `server/index.js` - health route should be at `/api/health`

### 3. Auth Endpoint (Test CORS)
Open browser console and run:
```javascript
fetch('https://citadel-backend.vercel.app/api/auth/request-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', phone: null })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected:** Should return JSON response (even if error, should not be CORS error)

**If CORS error:**
- Backend `FRONTEND_URL` not set correctly
- Backend not redeployed after setting `FRONTEND_URL`

## Check Environment Variables

### Frontend (Vercel)
1. Go to: Vercel → citadel-beta-rosy → Settings → Environment Variables
2. Check `VITE_API_URL`:
   - ✅ Should be: `https://citadel-backend.vercel.app/api`
   - ❌ Wrong: `https://citadel-backend.vercel.app` (missing /api)

### Backend (Vercel)
1. Go to: Vercel → citadel-backend → Settings → Environment Variables
2. Check `FRONTEND_URL`:
   - ✅ Should be: `https://citadel-beta-rosy.vercel.app`
   - Make sure no trailing slash

## Check Deployment Status

### Frontend
- Vercel → citadel-beta-rosy → Deployments
- Latest deployment should be successful
- Check build logs for any errors

### Backend
- Vercel → citadel-backend → Deployments
- Latest deployment should be successful
- Check function logs for CORS messages

## Debug Steps

1. **Test backend health:**
   - Visit: `https://citadel-backend.vercel.app/api/health`
   - If 404: Backend routes not working
   - If works: Backend is fine, issue is CORS or frontend config

2. **Check browser console:**
   - Look for: `🔧 API Configuration:`
   - Should show: `baseUrl: "https://citadel-backend.vercel.app/api"`
   - If shows without `/api`: Environment variable not set correctly

3. **Check Network tab:**
   - Open DevTools → Network
   - Try to sign up
   - Look at the failed request
   - Check Request URL - should include `/api`
   - Check Response - look for CORS headers

4. **Check backend logs:**
   - Vercel → citadel-backend → Deployments → Latest → Functions Logs
   - Look for CORS messages
   - Should see: `✅ CORS allowed for origin: https://citadel-beta-rosy.vercel.app`

## Common Issues

### Backend Health Returns 404
- Backend routes not mounted at `/api`
- Check `server/index.js` - routes should be mounted with `/api` prefix

### CORS Still Blocking
- `FRONTEND_URL` not set in backend
- Backend not redeployed after setting `FRONTEND_URL`
- Value doesn't match frontend URL exactly

### Frontend Using Wrong URL
- `VITE_API_URL` doesn't include `/api`
- Frontend not redeployed after updating env var
- Browser cache - try hard refresh
