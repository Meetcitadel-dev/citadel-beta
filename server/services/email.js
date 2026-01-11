const { Resend } = require('resend');
require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Only create Resend instance if API key exists and is not a placeholder
const isValidApiKey = RESEND_API_KEY && 
                      RESEND_API_KEY !== 'your_resend_api_key_here' && 
                      RESEND_API_KEY.startsWith('re_');
const resend = isValidApiKey ? new Resend(RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Send OTP email to user
 */
async function sendOTPEmail(email, otp) {
  try {
    if (!resend || !isValidApiKey) {
      console.warn('⚠️  Resend API key not configured or invalid. Email sending disabled.');
      console.log(`📧 Would send OTP ${otp} to ${email}`);
      console.log('💡 To enable email sending, add a valid RESEND_API_KEY to your .env file');
      // In development, don't throw error - just return success so the flow continues
      // The OTP will be returned in the API response for testing
      return { id: 'dev-mode', message: 'Email sending disabled (no valid API key)', otp };
    }
    
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    console.log(`📧 From email: ${FROM_EMAIL}`);
    console.log(`🔑 API Key: ${RESEND_API_KEY.substring(0, 10)}...`);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Citadel OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #ffffff;">
          <h1 style="color: #00ff88; margin-bottom: 20px;">Citadel</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your OTP code is:
          </p>
          <div style="background: #1a1a1a; border: 2px solid #00ff88; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="color: #00ff88; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h2>
          </div>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      // Don't throw error in development - allow flow to continue
      if (process.env.NODE_ENV === 'production') {
        throw new Error(error.message || 'Failed to send email via Resend');
      }
      console.warn('⚠️  Email sending failed, but continuing in development mode');
      return { id: 'error', message: error.message, otp };
    }

    console.log('✅ OTP email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    // In development, don't throw - just log and continue
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn('⚠️  Email error caught, but continuing in development mode');
    return { id: 'error', message: error.message, otp };
  }
}

/**
 * Send email verification link to user
 */
async function sendVerificationEmail(email, verificationToken) {
  try {
    if (!resend || !isValidApiKey) {
      console.warn('⚠️  Resend API key not configured or invalid. Email sending disabled.');
      console.log(`📧 Would send verification link to ${email}`);
      console.log(`🔗 Verification URL: ${FRONTEND_URL}/verify-email?token=${verificationToken}`);
      // In development, don't throw error
      return { id: 'dev-mode', message: 'Email sending disabled (no valid API key)' };
    }
    
    console.log(`📧 Attempting to send verification email to: ${email}`);
    console.log(`📧 From email: ${FROM_EMAIL}`);
    
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your Citadel account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #ffffff;">
          <h1 style="color: #00ff88; margin-bottom: 20px;">Citadel</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thanks for signing up! Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: #00ff88; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #666; word-break: break-all; background: #1a1a1a; padding: 10px; border-radius: 4px;">
            ${verificationUrl}
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      // Don't throw error in development
      if (process.env.NODE_ENV === 'production') {
        throw new Error(error.message || 'Failed to send verification email via Resend');
      }
      console.warn('⚠️  Verification email sending failed, but continuing in development mode');
      return { id: 'error', message: error.message };
    }

    console.log('✅ Verification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    // In development, don't throw - just log and continue
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn('⚠️  Email error caught, but continuing in development mode');
    return { id: 'error', message: error.message };
  }
}

module.exports = {
  sendOTPEmail,
  sendVerificationEmail,
};
