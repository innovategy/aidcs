// src/hooks/useAIValidation.ts

import { useCallback, useState } from 'react';
import { useData } from '@/context/DataContext';
import { useConfig } from '@/context/ConfigContext';
import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import type { ValidationResult } from '@/types/validation/ValidationTypes';

interface AIValidationState {
    isProcessing: boolean;
    progress: number;
    error: string | null;
}

export function useAIValidation() {
    const { records, setValidationResult, updateRecord } = useData();
    const { validationOptions } = useConfig();
    const [state, setState] = useState<AIValidationState>({
        isProcessing: false,
        progress: 0,
        error: null,
    });

    const validateRecords = useCallback(async (recordsToValidate: EmployeeRecord[] = records) => {
        if (recordsToValidate.length === 0) return;

        setState({
            isProcessing: true,
            progress: 0,
            error: null,
        });

        try {
            const batchSize = 20;
            const totalBatches = Math.ceil(recordsToValidate.length / batchSize);

            for (let i = 0; i < recordsToValidate.length; i += batchSize) {
                const batch = recordsToValidate.slice(i, i + batchSize);

                const response = await fetch('/api/ai/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ records: batch }),
                });

                if (!response.ok) {
                    throw new Error(`Validation request failed: ${response.statusText}`);
                }

                const { results } = await response.json();

                // Process validation results
                Object.entries(results).forEach(([recordId, result]) => {
                    const validationResult = result as ValidationResult;
                    setValidationResult(recordId, validationResult);

                    // Apply auto-corrections if enabled
                    if (validationOptions.autoCorrect && validationResult.autoCorrections.length > 0) {
                        const updates = validationResult.autoCorrections.reduce((acc, correction) => ({
                            ...acc,
                            [correction.field]: correction.correctedValue
                        }), {});

                        updateRecord(recordId, updates);
                    }
                });

                // Update progress
                setState(prev => ({
                    ...prev,
                    progress: Math.round(((i + batch.length) / recordsToValidate.length) * 100)
                }));
            }

            setState(prev => ({
                ...prev,
                isProcessing: false,
                progress: 100
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isProcessing: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }));
        }
    }, [records, setValidationResult, updateRecord, validationOptions.autoCorrect]);

    const reset = useCallback(() => {
        setState({
            isProcessing: false,
            progress: 0,
            error: null,
        });
    }, []);

    return {
        ...state,
        validateRecords,
        reset,
    };
}
