# Resend Setup Steps - New Account

## Step 1: Get Your API Key ✅

1. Go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Give it a name (e.g., "Citadel App")
4. Copy the API key (starts with `re_`)
5. **⚠️ Save it now - you won't see it again!**

## Step 2: Add Domain to Resend

1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `meetcitadel.com`
4. Click **"Add"**
5. Resend will show you DNS records to add

## Step 3: Add DNS Records in GoDaddy

1. Go to: https://dcc.godaddy.com/
2. Select `meetcitadel.com` → Click **"DNS"** (or "Manage DNS")
3. Add these records:

### SPF Record (TXT)
- **Type:** `TXT`
- **Name:** `@` (or leave blank)
- **Value:** `v=spf1 include:resend.com ~all`
- **TTL:** 3600 (or default)

### DKIM Records (TXT) - Resend will provide 3
Resend shows these in the dashboard. They look like:
- **Type:** `TXT`
- **Name:** `resend._domainkey` (or similar - Resend will show exact name)
- **Value:** Long string starting with `v=DKIM1;...` (copy from Resend)

Add all 3 DKIM records that Resend provides.

### DMARC Record (TXT)
- **Type:** `TXT`
- **Name:** `_dmarc`
- **Value:** `v=DMARC1; p=none; rua=mailto:hello@meetcitadel.com`
- **TTL:** 3600 (or default)

## Step 4: Verify Domain in Resend

1. Wait 5-10 minutes for DNS propagation
2. Go back to: https://resend.com/domains
3. Find `meetcitadel.com` in your list
4. Click **"Verify"** or **"Refresh"**
5. Wait for green checkmark ✅

## Step 5: Update Your .env File

Update these values:
```env
RESEND_API_KEY=re_your_new_api_key_here
RESEND_FROM_EMAIL=hello@meetcitadel.com
```

## Step 6: Test

Run the test script:
```bash
node server/test-email.js hello@meetcitadel.com
```

You should see: `✅ SUCCESS! Email sent successfully!`

---

## Troubleshooting

### DNS Not Verifying?
- Wait longer (can take up to 48 hours)
- Check DNS propagation: https://mxtoolbox.com/spf.aspx
- Make sure all records are added correctly
- Check for typos in DNS values

### Conflicting DNS Records?
If `meetcitadel.com` was verified in another Resend account:
- You may need to update the SPF record to include both: `v=spf1 include:resend.com include:_spf.resend.com ~all`
- Or use the same API key for both projects (recommended)

