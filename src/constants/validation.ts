// /src/constants/validation.ts
// Validation rules and thresholds

export const VALIDATION_THRESHOLDS = {
    name: 90,        // 90% confidence for name corrections
    address: 85,     // 85% for address standardization
    dates: 95,       // 95% for date format corrections
    email: 90,       // 90% for email corrections
    phone: 95,       // 95% for phone format corrections
} as const;

export const VALIDATION_RULES = {
    name: {
        pattern: /^[a-zA-Z\s'-]{2,50}$/,
        message: 'Names should only contain letters, hyphens, and apostrophes'
    },
    phone: {
        pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
        message: 'Phone should be in (XXX) XXX-XXXX format'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    zipCode: {
        pattern: /^\d{5}(-\d{4})?$/,
        message: 'ZIP code should be 5 digits or ZIP+4 format'
    },
    date: {
        pattern: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
        message: 'Date should be in MM/DD/YYYY format'
    }
} as const;

export const FIELD_TYPES = {
    firstName: 'name',
    lastName: 'name',
    dob: 'date',
    email: 'email',
    primaryPhone: 'phone',
    zipCode: 'zipCode',
} as const;
