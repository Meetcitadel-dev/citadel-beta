# Fix: Using Same Email for Multiple Websites

## ✅ Yes, one email can send OTPs for multiple websites!

**Important:** Domain verification in Resend is tied to your **Resend account/API key**, not just the domain itself.

## The Issue

You're using a **different Resend API key** in this project than your other website. Even though `meetcitadel.com` is verified in your other Resend account, this project's API key doesn't have access to it.

## Solution: Use the Same Resend API Key

### Option 1: Use Your Existing Verified API Key (Recommended)

1. **Get the API key from your other website** that's already working with `hello@meetcitadel.com`

2. **Update your `.env` file** in this project:
   ```env
   RESEND_API_KEY=re_your_existing_verified_api_key_here
   RESEND_FROM_EMAIL=hello@meetcitadel.com
   ```

3. **Restart the server:**
   ```bash
   npm run server:dev
   ```

4. **Test it:**
   ```bash
   node server/test-email.js hello@meetcitadel.com
   ```

### Option 2: Verify Domain in This Resend Account

If you want to use a separate Resend account for this project:

1. Go to https://resend.com/domains
2. Add `meetcitadel.com` to this Resend account
3. Add the same DNS records in GoDaddy (they can coexist)
4. Verify the domain

**Note:** You can have the same domain verified in multiple Resend accounts, but you'll need separate DNS records or they'll conflict.

## Best Practice: Use Same API Key

For simplicity and to avoid DNS conflicts, **use the same Resend API key** for both websites. Resend allows multiple projects/applications to use the same API key - just make sure you're within your sending limits.

## Testing

After updating the API key, run:
```bash
node server/test-email.js hello@meetcitadel.com
```

You should see: `✅ SUCCESS! Email sent successfully!`

