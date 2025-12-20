# Setting Up Custom Email Domain (meetcitadel.com)

## Option 1: Resend with Domain Verification (Recommended) ⭐

Resend provides better deliverability, higher sending limits, and better analytics. Follow these steps:

### Step 1: Add Domain in Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter `meetcitadel.com`
4. Resend will provide you with DNS records to add

### Step 2: Add DNS Records in GoDaddy

1. Log in to your [GoDaddy Domain Manager](https://dcc.godaddy.com/)
2. Go to your domain `meetcitadel.com`
3. Click "DNS" or "Manage DNS"
4. Add the following records that Resend provides:

**Required Records:**
- **SPF Record** (TXT): `v=spf1 include:resend.com ~all`
- **DKIM Records** (TXT): Resend will provide 3 DKIM records (usually named `resend._domainkey`, etc.)
- **DMARC Record** (TXT): `v=DMARC1; p=none; rua=mailto:[email protected]`

**Example DNS Records:**
```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [Resend will provide this]

Type: TXT
Name: resend2._domainkey
Value: [Resend will provide this]

Type: TXT
Name: resend3._domainkey
Value: [Resend will provide this]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:[email protected]
```

### Step 3: Verify Domain in Resend

1. After adding DNS records, wait 5-10 minutes for DNS propagation
2. Go back to Resend dashboard
3. Click "Verify" on your domain
4. Once verified (green checkmark), you can use `hello@meetcitadel.com`

### Step 4: Update Environment Variables

Update your `.env` file:
```env
RESEND_FROM_EMAIL=hello@meetcitadel.com
```

### Step 5: Restart Server

```bash
npm run server:dev
```

---

## Option 2: GoDaddy SMTP Direct (Alternative)

If you prefer to use GoDaddy's SMTP directly, you can switch to Nodemailer. **Note:** GoDaddy has strict limits (typically 5 emails per 24 hours).

### Step 1: Install Nodemailer

```bash
npm install nodemailer
```

### Step 2: Update Email Service

The code will automatically use GoDaddy SMTP if `GODADDY_SMTP_ENABLED=true` is set in `.env`.

### Step 3: Update Environment Variables

Add to your `.env` file:
```env
# Enable GoDaddy SMTP instead of Resend
GODADDY_SMTP_ENABLED=true
GODADDY_SMTP_USER=hello@meetcitadel.com
GODADDY_SMTP_PASSWORD=your_godaddy_email_password
GODADDY_SMTP_HOST=smtpout.secureserver.net
GODADDY_SMTP_PORT=465
RESEND_FROM_EMAIL=hello@meetcitadel.com
```

### Step 4: Enable SMTP in GoDaddy

1. Log in to GoDaddy Email Manager
2. Ensure SMTP authentication is enabled for your email account
3. If not enabled, contact GoDaddy support to activate it

---

## Testing

After setup, test the email sending:

1. Request an OTP from your app
2. Check your email inbox (and spam folder)
3. Check server logs for any errors

## Troubleshooting

### DNS Not Verifying
- Wait 24-48 hours for DNS propagation
- Use [MXToolbox](https://mxtoolbox.com/) to check if DNS records are live
- Ensure no conflicting SPF records exist

### Emails Going to Spam
- Ensure SPF, DKIM, and DMARC records are correctly set
- Use Resend's domain verification (Option 1) for better deliverability
- Check Resend dashboard for email analytics and delivery status

### GoDaddy SMTP Errors
- Verify SMTP authentication is enabled
- Check email password is correct
- Be aware of sending limits (5 emails/24 hours)
- Consider upgrading to Resend for production use

