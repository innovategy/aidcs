// /src/types/employee/EmployeeRecord.ts
// Type definitions for employee records

export type PayType = 'Hourly' | 'Salary' | 'Commission';
export type EmploymentStatus = 'FT' | 'PT';

export interface EmployeeRecord {
    // Personal Information
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;

    // Contact Information
    homeAddress1: string;
    homeAddress2?: string;
    homeCity: string;
    state: string;
    zipCode: string;
    county: string;
    primaryPhone: string;
    email: string;

    // Employment Details
    ftPtStatus: EmploymentStatus;
    avgHoursPerWeek: number;
    hourlyRate: number;
    annualWages: number;
    payType: PayType;
    jobTitle: string;

    // Dates
    employmentStartDate: string;
    employmentEndDate: string;
    enrollmentPeriodStartDate: string;
    enrollmentPeriodEndDate: string;
    coverageEligibilityStartDate: string;
    coverageEligibilityEndDate: string;

    // Additional Fields
    class?: string;
    stipendAmount: number;

    // Metadata
    recordId?: string;  // Unique identifier for the record
    lastModified?: Date;
    validationStatus?: ValidationStatus;
}

export interface ValidationStatus {
    isValid: boolean;
    severity: 'error' | 'warning' | 'info';
    messages: ValidationMessage[];
}

export interface ValidationMessage {
    field: keyof EmployeeRecord;
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestedValue?: string;
    confidence?: number;
}
