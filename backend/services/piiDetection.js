const fs = require('fs');
const path = require('path');

// Simple PII detection patterns
const piiPatterns = {
  aadhaar: {
    pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    label: 'Aadhaar Number',
    description: '12-digit Aadhaar ID'
  },
  pan: {
    pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    label: 'PAN',
    description: 'Permanent Account Number'
  },
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    label: 'Email Address',
    description: 'Email contact'
  },
  phone: {
    pattern: /\b(?:\+91|0)?[6-9]\d{9}\b/g,
    label: 'Phone Number',
    description: 'Mobile/Phone number'
  },
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    label: 'SSN',
    description: 'Social Security Number'
  },
  creditcard: {
    pattern: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    label: 'Credit Card',
    description: 'Credit card number'
  },
  passport: {
    pattern: /\b[A-Z]{1}\d{7}\b/g,
    label: 'Passport',
    description: 'Passport number'
  },
  dob: {
    pattern: /\b(0?[1-9]|[12][0-9]|3[01])[\/-](0?[1-9]|1[012])[\/-](19|20)?\d{2}\b/g,
    label: 'Date of Birth',
    description: 'Birth date'
  }
};

// Extract text from different file types
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf-8');
    } else if (ext === '.pdf') {
      // For PDF, we'd need a library - for now, skip
      return '';
    } else if (ext === '.csv') {
      return fs.readFileSync(filePath, 'utf-8');
    } else {
      // For other formats, try reading as text
      return fs.readFileSync(filePath, 'utf-8').substring(0, 100000); // First 100KB
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

// Detect PII in text
function detectPII(text) {
  const detections = {};
  let totalDetected = 0;

  for (const [key, config] of Object.entries(piiPatterns)) {
    const matches = text.match(config.pattern) || [];
    
    if (matches.length > 0) {
      detections[key] = {
        label: config.label,
        description: config.description,
        count: matches.length,
        samples: [...new Set(matches)].slice(0, 3) // Get unique samples
      };
      totalDetected += matches.length;
    }
  }

  return {
    hasPII: totalDetected > 0,
    totalDetected,
    detections
  };
}

// Main function to scan file
async function scanFileForPII(filePath) {
  try {
    const text = await extractTextFromFile(filePath);
    const result = detectPII(text);
    
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('Error scanning file:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  scanFileForPII,
  detectPII
};