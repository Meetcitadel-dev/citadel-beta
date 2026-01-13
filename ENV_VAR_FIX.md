# Environment Variable Fix

## The Problem

Your `VITE_API_URL` is missing `/api` at the end!

## Current (WRONG):
```
VITE_API_URL = https://citadel-backend.vercel.app
```

This creates URLs like:
- `https://citadel-backend.vercel.app/auth/request-otp` ❌ (404 - route doesn't exist)

## Should Be (CORRECT):
```
VITE_API_URL = https://citadel-backend.vercel.app/api
```

This creates URLs like:
- `https://citadel-backend.vercel.app/api/auth/request-otp` ✅ (correct route)

## Quick Fix

### Option 1: Update VITE_API_URL (Recommended)

1. Go to **Vercel Dashboard** → Your Frontend Project → **Settings** → **Environment Variables**
2. Find `VITE_API_URL`
3. Change it from: `https://citadel-backend.vercel.app`
4. To: `https://citadel-backend.vercel.app/api`
5. **Redeploy** your frontend

### Option 2: Keep Current (Code Will Auto-Fix)

I've updated the code to automatically add `/api` if it's missing. But it's better to set it correctly.

## Both Environment Variables Should Be:

**Frontend (Vercel):**
- `VITE_API_URL` = `https://citadel-backend.vercel.app/api` ✅

**Backend (Vercel):**
- `FRONTEND_URL` = `https://citadel-beta-rosy.vercel.app` ✅ (this is correct!)

## After Fixing

1. Update `VITE_API_URL` to include `/api`
2. Redeploy frontend
3. Test backend connection button
4. Try signing up

The code now auto-fixes URLs that don't have `/api`, but it's better to set it correctly in environment variables.
