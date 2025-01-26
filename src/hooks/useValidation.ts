// /src/hooks/useValidation.ts
// Custom hook for data validation

'use client';

import { useCallback, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useConfig } from '@/context/ConfigContext';
import { validators } from '@/utils/validators';
import { formatters } from '@/utils/formatters';
import type {
    EmployeeRecord,
    ValidationStatus
} from '@/types/employee/EmployeeRecord';
import type {
    ValidationResult,
    ValidationError,
    ValidationWarning,
    AutoCorrection
} from '@/types/validation/ValidationTypes';

export function useValidation() {
    const { records, setValidationResult, updateRecord } = useData();
    const { validationOptions } = useConfig();

    const validateRecord = useCallback((record: EmployeeRecord): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const autoCorrections: AutoCorrection[] = [];

        // Required field validation
        if (!record.firstName) {
            errors.push({ field: 'firstName', message: 'First name is required', code: 'REQUIRED' });
        }
        if (!record.lastName) {
            errors.push({ field: 'lastName', message: 'Last name is required', code: 'REQUIRED' });
        }

        // Email validation
        const emailError = validators.email(record.email);
        if (emailError) {
            errors.push({ field: 'email', message: emailError, code: 'FORMAT' });
        }

        // Phone validation
        const phoneError = validators.phone(record.primaryPhone);
        if (phoneError) {
            errors.push({ field: 'primaryPhone', message: phoneError, code: 'FORMAT' });

            // Auto-correct phone format if possible
            const formattedPhone = formatters.phone(record.primaryPhone);
            if (formattedPhone !== record.primaryPhone && !validators.phone(formattedPhone)) {
                autoCorrections.push({
                    field: 'primaryPhone',
                    originalValue: record.primaryPhone,
                    correctedValue: formattedPhone,
                    confidence: 1,
                    source: 'RULE'
                });
            }
        }

        // Date validations
        const startDateError = validators.date(record.employmentStartDate);
        if (startDateError) {
            errors.push({ field: 'employmentStartDate', message: startDateError, code: 'FORMAT' });
        }

        // Business logic validations
        if (record.ftPtStatus === 'FT' && record.avgHoursPerWeek < 30) {
            warnings.push({
                field: 'avgHoursPerWeek',
                message: 'Full-time employees should work at least 30 hours per week'
            });
        }

        // Salary calculations
        const calculatedAnnualWages = record.hourlyRate * record.avgHoursPerWeek * 52;
        if (Math.abs(calculatedAnnualWages - record.annualWages) > 1000) {
            warnings.push({
                field: 'annualWages',
                message: 'Annual wages may be incorrect based on hourly rate and hours',
                suggestedValue: calculatedAnnualWages.toString()
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            autoCorrections
        };
    }, []);

    const validateAll = useCallback(() => {
        records.forEach(record => {
            const result = validateRecord(record);
            setValidationResult(record.recordId!, result);

            // Apply auto-corrections if enabled
            if (validationOptions.autoCorrect && result.autoCorrections.length > 0) {
                const updates = result.autoCorrections.reduce((acc, correction) => ({
                    ...acc,
                    [correction.field]: correction.correctedValue
                }), {});

                updateRecord(record.recordId!, updates);
            }
        });
    }, [records, validationOptions.autoCorrect, setValidationResult, updateRecord, validateRecord]);

    // Run validation when records or validation options change
    useEffect(() => {
        validateAll();
    }, [validateAll, records, validationOptions]);

    return {
        validateRecord,
        validateAll
    };
}
