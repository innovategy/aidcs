// /src/components/ui/ValidationIndicator.tsx
// Visual indicators for data validation status
'use client';

import { useCallback, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import type { ValidationResult } from '@/types/validation/ValidationTypes';

interface ValidationIndicatorProps {
    recordId: string;
    field?: string;
    showDetails?: boolean;
}

export default function ValidationIndicator({
                                                recordId,
                                                field,
                                                showDetails = false,
                                            }: ValidationIndicatorProps) {
    const { validationResults } = useData();
    const result = validationResults[recordId];

    const getValidationInfo = useCallback((result: ValidationResult) => {
        if (!result) return null;

        const fieldErrors = field
            ? result.errors.filter(e => e.field === field)
            : result.errors;
        const fieldWarnings = field
            ? result.warnings.filter(w => w.field === field)
            : result.warnings;
        const fieldCorrections = field
            ? result.autoCorrections.filter(c => c.field === field)
            : result.autoCorrections;

        return {
            hasErrors: fieldErrors.length > 0,
            hasWarnings: fieldWarnings.length > 0,
            hasCorrections: fieldCorrections.length > 0,
            errors: fieldErrors,
            warnings: fieldWarnings,
            corrections: fieldCorrections,
        };
    }, [field]);

    const validationInfo = useMemo(() =>
            result ? getValidationInfo(result) : null
        , [result, getValidationInfo]);

    if (!validationInfo) return null;

    const getIconColor = () => {
        if (validationInfo.hasErrors) return 'text-validation-error';
        if (validationInfo.hasWarnings) return 'text-duplicate';
        if (validationInfo.hasCorrections) return 'text-autocorrected';
        return 'text-validation-success';
    };

    const getIcon = () => {
        if (validationInfo.hasErrors) {
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }
        if (validationInfo.hasWarnings) {
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        }
        if (validationInfo.hasCorrections) {
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        );
    };

    return (
        <div className="relative inline-flex items-center">
            <div className={`${getIconColor()} cursor-help`}>
                {getIcon()}
            </div>

            {showDetails && (validationInfo.errors.length > 0 || validationInfo.warnings.length > 0) && (
                <div className="absolute z-10 w-64 mt-2 bg-white rounded-md shadow-lg p-3 text-sm">
                    {validationInfo.errors.map((error, index) => (
                        <div key={`error-${index}`} className="text-validation-error mb-1">
                            {error.message}
                        </div>
                    ))}
                    {validationInfo.warnings.map((warning, index) => (
                        <div key={`warning-${index}`} className="text-duplicate mb-1">
                            {warning.message}
                        </div>
                    ))}
                    {validationInfo.corrections.map((correction, index) => (
                        <div key={`correction-${index}`} className="text-autocorrected mb-1">
                            Corrected: {correction.originalValue} → {correction.correctedValue}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
