# Domain Verification Checklist

## ❌ Current Status: Domain Not Verified

The test shows: `The meetcitadel.com domain is not verified`

## ✅ Steps to Complete Verification

### 1. Check Resend Dashboard
- Go to: https://resend.com/domains
- Find `meetcitadel.com` in your domains list
- Check the status:
  - ⚠️ **Pending** = DNS records not added or not propagated yet
  - ❌ **Failed** = DNS records incorrect
  - ✅ **Verified** = Ready to use!

### 2. Verify DNS Records in GoDaddy

Go to: https://dcc.godaddy.com/ → Your Domain → DNS

**Check these records exist:**

#### SPF Record (TXT)
- Name: `@` (or blank)
- Value: `v=spf1 include:resend.com ~all`

#### DKIM Records (TXT) - 3 records needed
Resend provides these in the dashboard. They look like:
- Name: `resend._domainkey.meetcitadel.com` (or just `resend._domainkey`)
- Value: Long string starting with `v=DKIM1;...`

#### DMARC Record (TXT)
- Name: `_dmarc`
- Value: `v=DMARC1; p=none; rua=mailto:hello@meetcitadel.com`

### 3. DNS Propagation Check

DNS changes can take 5 minutes to 48 hours. Check if records are live:

**Use these tools:**
- https://mxtoolbox.com/spf.aspx (for SPF)
- https://mxtoolbox.com/dkim.aspx (for DKIM)
- Enter: `meetcitadel.com`

### 4. Verify in Resend

Once DNS records are live:
1. Go back to Resend dashboard
2. Click "Verify" or "Refresh" on your domain
3. Wait for green checkmark ✅

---

## 🔄 Temporary Solution (While Waiting for Verification)

If you need to test immediately, temporarily switch back to Resend's testing email:

**Update `.env`:**
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Then restart server:
```bash
npm run server:dev
```

**Once domain is verified, change back to:**
```env
RESEND_FROM_EMAIL=hello@meetcitadel.com
```

---

## 🧪 Test After Verification

Run this command to test:
```bash
node server/test-email.js hello@meetcitadel.com
```

You should see: `✅ SUCCESS! Email sent successfully!`

