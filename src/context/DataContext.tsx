// src/context/DataContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import type { ValidationResult } from '@/types/validation/ValidationTypes';
import { logger } from '@/utils/logger';

interface DataStats {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    duplicates: number;
    autocorrected: number;
}

interface DataContextType {
    records: EmployeeRecord[];
    validationResults: Record<string, ValidationResult>;
    stats: DataStats | null;
    setRecords: (records: EmployeeRecord[]) => void;
    updateRecord: (recordId: string, updates: Partial<EmployeeRecord>) => void;
    setValidationResult: (recordId: string, result: ValidationResult) => void;
    clearAll: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [records, setRecordsState] = useState<EmployeeRecord[]>([]);
    const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

    const stats = useMemo(() => {
        if (records.length === 0) return null;

        const validationResultsArray = records
            .filter(record => record.recordId && validationResults[record.recordId])
            .map(record => validationResults[record.recordId!]);

        const result: DataStats = {
            totalRecords: records.length,
            validRecords: validationResultsArray.filter(r => r && r.isValid).length,
            invalidRecords: validationResultsArray.filter(r => r && !r.isValid).length,
            duplicates: validationResultsArray.filter(r =>
                    r && r.warnings.some(w =>
                        w.field === 'duplicate' ||
                        w.matchedFields?.length > 0
                    )
            ).length,
            autocorrected: validationResultsArray.filter(r =>
                r && r.autoCorrections && r.autoCorrections.length > 0
            ).length
        };

        logger.debug('DataContext', 'Calculated stats', result);
        return result;
    }, [records, validationResults]);

    const setRecords = useCallback((newRecords: EmployeeRecord[]) => {
        logger.info('DataContext', 'Setting records', { count: newRecords.length });
        setRecordsState(newRecords);
    }, []);

    const updateRecord = useCallback((recordId: string, updates: Partial<EmployeeRecord>) => {
        logger.debug('DataContext', 'Updating record', { recordId, updates });
        setRecordsState(prev =>
            prev.map(record =>
                record.recordId === recordId ? { ...record, ...updates } : record
            )
        );
    }, []);

    const setValidationResult = useCallback((recordId: string, result: ValidationResult) => {
        logger.debug('DataContext', 'Setting validation result', {
            recordId,
            isValid: result.isValid,
            errorCount: result.errors.length,
            warningCount: result.warnings.length
        });
        setValidationResults(prev => ({ ...prev, [recordId]: result }));
    }, []);

    const clearAll = useCallback(() => {
        setRecordsState([]);
        setValidationResults({});
    }, []);

    return (
        <DataContext.Provider
            value={{
                records,
                validationResults,
                stats,
                setRecords,
                updateRecord,
                setValidationResult,
                clearAll,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
