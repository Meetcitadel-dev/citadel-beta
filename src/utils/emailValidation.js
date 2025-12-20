// Common university email domain patterns
const UNIVERSITY_EMAIL_DOMAINS = [
  // US Universities
  'edu',
  'ac.uk',
  'ac.in',
  'ac.ca',
  'ac.au',
  // Common patterns
  '.edu',
  '.ac.',
  // Specific universities (can be expanded)
  'stanford.edu',
  'berkeley.edu',
  'ucla.edu',
  'mit.edu',
  'harvard.edu',
  'yale.edu',
  'princeton.edu',
  'columbia.edu',
  'cornell.edu',
  'upenn.edu',
  'nyu.edu',
  'umich.edu',
  'utexas.edu',
  'gatech.edu',
  'cmu.edu',
  'usc.edu',
  'bu.edu',
];

/**
 * Validates if an email is valid (accepts all email domains)
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidUniversityEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailLower = email.toLowerCase().trim();
  
  // Basic email format validation - accept any valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailLower);
};

/**
 * Extracts the university name from email domain (for auto-filling college field)
 * @param {string} email - Email address
 * @returns {string|null} - University name or null
 */
export const extractUniversityFromEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const domain = email.toLowerCase().split('@')[1];
  if (!domain) {
    return null;
  }

  // Remove common TLDs and extract the main part
  let universityName = domain
    .replace(/\.edu$/, '')
    .replace(/\.org$/, '')
    .replace(/\.ac\.(uk|in|ca|au)$/, '')
    .replace(/\.ac$/, '');

  // Capitalize and format
  if (universityName) {
    // Handle common abbreviations
    const abbreviations = {
      'mit': 'MIT',
      'nyu': 'NYU',
      'ucla': 'UCLA',
      'usc': 'USC',
      'cmu': 'Carnegie Mellon University',
      'gatech': 'Georgia Tech',
      'utexas': 'University of Texas at Austin',
      'umich': 'University of Michigan',
      'bu': 'Boston University',
    };

    if (abbreviations[universityName]) {
      return abbreviations[universityName];
    }

    // Format as title case
    return universityName
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return null;
};

