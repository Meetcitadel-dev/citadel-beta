// Quick test script to verify email configuration
require('dotenv').config();
const { sendOTPEmail } = require('./services/email');

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  console.log('📧 From Email:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
  console.log('🔑 API Key:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('');

  // Test email - replace with your email
  const testEmail = process.argv[2] || 'hello@meetcitadel.com';
  const testOTP = '123456';

  console.log(`📤 Sending test OTP email to: ${testEmail}`);
  console.log('');

  try {
    const result = await sendOTPEmail(testEmail, testOTP);
    console.log('✅ SUCCESS! Email sent successfully!');
    console.log('📬 Result:', JSON.stringify(result, null, 2));
    console.log('\n💡 Check your inbox (and spam folder) for the test email.');
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILED! Error sending email:');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message && error.message.includes('domain')) {
      console.error('\n⚠️  Domain verification issue detected.');
      console.error('Make sure you have:');
      console.error('1. Added meetcitadel.com to Resend dashboard');
      console.error('2. Added all DNS records in GoDaddy');
      console.error('3. Verified the domain in Resend (green checkmark)');
    }
    
    process.exit(1);
  }
}

testEmail();

