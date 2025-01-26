// /src/types/validation/ValidationTypes.ts
import type { EmployeeRecord } from "@/types/employee/EmployeeRecord";


export interface AIValidationResponse {
    results: {
        [key: string]: {
            errors?: Array<{
                field: string;
                message: string;
                severity: 'error' | 'warning';
                explanation?: string;
                impact?: string;
                suggestedAction?: string;
            }>;
            corrections?: Array<{
                field: keyof EmployeeRecord;
                suggestion: string;
                confidence: number;
                explanation: string;
                reasoning: string;
                originalValue?: string;
            }>;
            duplicates?: Array<{
                matchedFields: Array<keyof EmployeeRecord>;
                confidence: number;
                explanation: string;
                differences?: Array<{
                    field: keyof EmployeeRecord;
                    value1: string;
                    value2: string;
                    significance: string;
                }>;
            }>;
        };
    };
    globalIssues?: {
        standardization?: Array<{
            field: string;
            issue: string;
            explanation: string;
            impact?: string;
            recommendation?: string;
        }>;
        duplicates?: Array<{
            records: string[];
            confidence: number;
            explanation: string;
            recommendation?: string;
        }>;
    };
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
    explanation?: string;
    impact?: string;
    suggestedAction?: string;
    matchedFields?: Array<keyof EmployeeRecord>;
    confidence?: number;
    differences?: Array<{
        field: keyof EmployeeRecord;
        value1: string;
        value2: string;
        significance: string;
    }>;
}

export interface ValidationWarning {
    field: string;
    message: string;
    code?: string;
    severity?: 'warning';
    suggestedValue?: string;
    explanation?: string;
    matchedFields?: Array<keyof EmployeeRecord>;
    confidence?: number;
    differences?: Array<{
        field: keyof EmployeeRecord;
        value1: string;
        value2: string;
        significance: string;
    }>;
}

export interface AutoCorrection {
    field: string;
    originalValue: string;
    correctedValue: string;
    confidence: number;
    source: 'AI' | 'RULE';
    explanation?: string;
    reasoning?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    autoCorrections: AutoCorrection[];
}

export interface ValidationOptions {
    autoCorrect: boolean;
    confidenceThreshold: number;
    strictMode: boolean;
    validateDates: boolean;
    validateAddresses: boolean;
    validatePhoneNumbers: boolean;
    validateEmails: boolean;
    checkDuplicates: boolean;
}

export interface DuplicateMatch {
    recordId: string;
    confidence: number;
    matchedFields: string[];
    originalRecord: Record<string, unknown>;
    duplicateRecord: Record<string, unknown>;
}

export type ValidationFieldType =
    | 'text'
    | 'number'
    | 'date'
    | 'email'
    | 'phone'
    | 'address'
    | 'currency'
    | 'enum';
