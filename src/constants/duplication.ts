// /src/constants/duplication.ts
// Duplicate detection configuration

export const DUPLICATE_DETECTION_CONFIG = {
    // Field weights for duplicate matching
    weights: {
        firstName: 0.3,
        lastName: 0.3,
        dob: 0.2,
        email: 0.2,
        primaryPhone: 0.15,
        address: 0.15
    },

    // Minimum confidence threshold for duplicate detection
    minConfidence: 0.85,

    // Fuzzy matching thresholds
    fuzzyMatch: {
        name: 0.8,      // Levenshtein distance ratio
        address: 0.75,
        email: 0.9
    },

    // Maximum allowed difference in days for date fields
    maxDateDifference: 30,

    // Fields to ignore in duplicate detection
    ignoredFields: [
        'recordId',
        'lastModified',
        'validationStatus'
    ]
} as const;

export const MATCH_TYPES = {
    EXACT: 'exact',
    FUZZY: 'fuzzy',
    PARTIAL: 'partial',
    NONE: 'none'
} as const;
