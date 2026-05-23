// backend/services/piiClassifier.js

const piiRules = {
  // Highly sensitive - Always PII
  critical: [
    'password', 'hash', 'secret', 'token', 'ssn', 'aadhar', 'pan', 
    'credit_card', 'card_number', 'cvv', 'pin', 'otp', 'mpin',
    'salary', 'income', 'tax_id', 'bank_account', 'routing_number',
    'private_key', 'api_key', 'secret_key'
  ],
  
  // Sensitive - Usually PII
  sensitive: [
    'email', 'phone', 'mobile', 'dob', 'date_of_birth', 'passport',
    'driver_license', 'national_id', 'medical', 'health', 'biometric',
    'fingerprint', 'iris', 'face_id', 'social_security', 'sin',
    'mother_maiden_name', 'blood_type', 'religion'
  ],
  
  // Quasi-identifiers - Could be PII with other data
  quasiIdentifiers: [
    'address', 'street', 'city', 'zipcode', 'postal_code', 'latitude', 'longitude',
    'ip_address', 'mac_address', 'device_id', 'imei', 'location',
    'gps', 'userid', 'account_id', 'customer_id', 'employee_id',
    'uuid', 'serial_number'
  ],
  
  // Not PII - Safe to expose
  nonPii: [
    'id', 'name', 'title', 'department', 'company', 'status',
    'created_at', 'updated_at', 'deleted_at', 'is_active', 'role',
    'username', 'profile_url', 'website', 'public_key', 'filename',
    'file_path', 'file_size', 'file_type', 'description', 'notes',
    'count', 'total', 'amount', 'records', 'columns', 'action',
    'type', 'category', 'group', 'level', 'version', 'priority'
  ]
};

function classifyColumn(columnName) {
  if (!columnName) {
    return { isPii: false, severity: 'NONE', reason: 'Invalid column name' };
  }

  const lower = columnName.toLowerCase();
  
  // Check critical first (most sensitive)
  for (const rule of piiRules.critical) {
    if (lower.includes(rule)) {
      return {
        isPii: true,
        severity: 'CRITICAL',
        label: '🔴 CRITICAL',
        reason: 'Extremely sensitive data - Requires encryption',
        color: '#ef4444',
        bgColor: '#7f1d1d'
      };
    }
  }
  
  // Check sensitive
  for (const rule of piiRules.sensitive) {
    if (lower.includes(rule)) {
      return {
        isPii: true,
        severity: 'HIGH',
        label: '🟠 HIGH',
        reason: 'Personal identifiable information',
        color: '#f59e0b',
        bgColor: '#78350f'
      };
    }
  }
  
  // Check quasi-identifiers
  for (const rule of piiRules.quasiIdentifiers) {
    if (lower.includes(rule)) {
      return {
        isPii: true,
        severity: 'MEDIUM',
        label: '🟡 MEDIUM',
        reason: 'Could identify individual with other data',
        color: '#eab308',
        bgColor: '#45350a'
      };
    }
  }
  
  // Check non-PII
  for (const rule of piiRules.nonPii) {
    if (lower.includes(rule)) {
      return {
        isPii: false,
        severity: 'NONE',
        label: '✅ SAFE',
        reason: 'Safe to expose',
        color: '#10b981',
        bgColor: '#064e3b'
      };
    }
  }
  
  // Default: assume NOT PII if unclear, but flag for review
  return {
    isPii: false,
    severity: 'UNKNOWN',
    label: '❓ REVIEW',
    reason: 'Recommend manual review',
    color: '#94a3b8',
    bgColor: '#1e293b'
  };
}

function classifyTable(tableName, columns) {
  const classifiedColumns = columns.map(col => ({
    name: col,
    ...classifyColumn(col)
  }));

  // Calculate table risk level
  const criticalCount = classifiedColumns.filter(c => c.severity === 'CRITICAL').length;
  const highCount = classifiedColumns.filter(c => c.severity === 'HIGH').length;
  const mediumCount = classifiedColumns.filter(c => c.severity === 'MEDIUM').length;
  const piiCount = classifiedColumns.filter(c => c.isPii).length;

  let tableRisk = 'LOW';
  if (criticalCount > 0) tableRisk = 'CRITICAL';
  else if (highCount > 0) tableRisk = 'HIGH';
  else if (mediumCount > 0) tableRisk = 'MEDIUM';

  return {
    tableName,
    columns: classifiedColumns,
    piiCount,
    criticalCount,
    highCount,
    mediumCount,
    totalColumns: columns.length,
    tableRisk,
    piiPercentage: Math.round((piiCount / columns.length) * 100)
  };
}

module.exports = { classifyColumn, classifyTable, piiRules };
