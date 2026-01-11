const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.join(__dirname, '../data/new-users-emails.txt');
const DATA_DIR = path.dirname(LOG_FILE_PATH);

/**
 * Log a new user's email to the file
 * @param {string} email - The email address to log
 */
async function logNewUserEmail(email) {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Create log entry with timestamp
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${email}\n`;

    // Append to file (create if doesn't exist)
    fs.appendFileSync(LOG_FILE_PATH, logEntry, 'utf8');
    
    console.log(`✅ Logged new user email: ${email}`);
  } catch (error) {
    console.error('❌ Error logging new user email:', error);
    // Don't throw - logging failure shouldn't break registration
  }
}

/**
 * Get all logged user emails
 * @returns {string[]} Array of email addresses
 */
function getAllLoggedEmails() {
  try {
    if (!fs.existsSync(LOG_FILE_PATH)) {
      return [];
    }
    
    const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Extract emails from log entries (format: "timestamp - email")
    const emails = lines.map(line => {
      const match = line.match(/ - (.+)$/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    return emails;
  } catch (error) {
    console.error('❌ Error reading logged emails:', error);
    return [];
  }
}

module.exports = {
  logNewUserEmail,
  getAllLoggedEmails
};
