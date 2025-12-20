# How to Find Your Resend API Key

## Option 1: Check Your Other Website's Code/Config

### Check Environment Files
Look for `.env` files in your other website's project:
```bash
# Navigate to your other website's directory
cd /path/to/your/other/website

# Check for .env file
cat .env | grep RESEND

# Or check .env.local, .env.production, etc.
cat .env.local | grep RESEND
cat .env.production | grep RESEND
```

### Check Config Files
- `config.js`, `config.json`, `settings.js`
- Look for `RESEND_API_KEY` or `resend` in the codebase
- Check deployment platforms (Vercel, Netlify, Heroku) - they store env vars

### Check Server/Backend Code
Search for where Resend is initialized:
```javascript
// Look for code like this:
const resend = new Resend('re_...');
// or
RESEND_API_KEY
```

## Option 2: Get It from Resend Dashboard

1. **Go to Resend Dashboard:** https://resend.com/api-keys
2. **Check all API keys** in your account
3. **Look for the one** that has `meetcitadel.com` domain verified
4. **Copy that API key**

If you see multiple keys, you can:
- Check which domains are verified for each key
- Test each key to see which one works

## Option 3: Verify Domain in Current Resend Account

If you can't find the old API key, you can verify `meetcitadel.com` in your current Resend account:

1. **Go to:** https://resend.com/domains
2. **Click "Add Domain"**
3. **Enter:** `meetcitadel.com`
4. **Add DNS records** in GoDaddy (same as before)
5. **Verify** once DNS propagates

**Note:** If the domain is already verified in another Resend account, you might need to:
- Remove DNS records temporarily
- Verify in new account
- Or use subdomain approach

## Option 4: Check Deployment Platform

If your other website is deployed:

### Vercel
```bash
vercel env ls
# or check Vercel dashboard → Project → Settings → Environment Variables
```

### Netlify
- Netlify Dashboard → Site → Site Settings → Environment Variables

### Heroku
```bash
heroku config --app your-app-name
```

### Railway/Render/etc.
- Check their dashboard for environment variables

## Quick Test Script

Once you find a potential API key, test it:

1. **Temporarily update `.env`:**
   ```env
   RESEND_API_KEY=re_your_found_key_here
   ```

2. **Test:**
   ```bash
   node server/test-email.js hello@meetcitadel.com
   ```

3. **If it works:** ✅ Keep that key
4. **If it fails:** ❌ Try another key or verify domain

