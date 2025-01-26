// /src/context/ConfigContext.tsx
// Context for managing validation and processing configurations
// src/context/ConfigContext.tsx
'use client';


import React, { createContext, useContext, useState, useCallback } from 'react';
import { ValidationOptions } from '@/types/validation/ValidationTypes';
import { VALIDATION_THRESHOLDS } from '@/constants/validation';
import { DUPLICATE_DETECTION_CONFIG } from '@/constants/duplication';

interface ConfigContextType {
    validationOptions: ValidationOptions;
    updateValidationOptions: (options: Partial<ValidationOptions>) => void;
    toggleAutoCorrect: () => void;
    confidenceThresholds: typeof VALIDATION_THRESHOLDS;
    duplicateConfig: typeof DUPLICATE_DETECTION_CONFIG;
    updateConfidenceThresholds: (thresholds: Partial<typeof VALIDATION_THRESHOLDS>) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [validationOptions, setValidationOptions] = useState<ValidationOptions>({
        autoCorrect: true,
        confidenceThreshold: 0.85,
        strictMode: false,
        validateDates: true,
        validateAddresses: true,
        validatePhoneNumbers: true,
        validateEmails: true,
        checkDuplicates: true,
    });

    const [confidenceThresholds, setConfidenceThresholds] = useState(VALIDATION_THRESHOLDS);
    const [duplicateConfig] = useState(DUPLICATE_DETECTION_CONFIG);

    const updateValidationOptions = useCallback((options: Partial<ValidationOptions>) => {
        setValidationOptions(prev => ({ ...prev, ...options }));
    }, []);

    const toggleAutoCorrect = useCallback(() => {
        setValidationOptions(prev => ({ ...prev, autoCorrect: !prev.autoCorrect }));
    }, []);

    const updateConfidenceThresholds = useCallback((thresholds: Partial<typeof VALIDATION_THRESHOLDS>) => {
        setConfidenceThresholds(prev => ({ ...prev, ...thresholds }));
    }, []);

    return (
        <ConfigContext.Provider
            value={{
                validationOptions,
                updateValidationOptions,
                toggleAutoCorrect,
                confidenceThresholds,
                duplicateConfig,
                updateConfidenceThresholds,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
