// /src/hooks/useFileUpload.ts
// Custom hook for handling file uploads
'use client';

import { useState, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';

interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
}

interface UploadResult {
    records: EmployeeRecord[];
    errors: Array<{
        file: string;
        message: string;
    }>;
}

export function useFileUpload() {
    const { setRecords } = useData();
    const [state, setState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
    });

    const upload = useCallback(async (files: File[]): Promise<void> => {
        setState({ isUploading: true, progress: 0, error: null });

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const response = await fetch('/api/process-files', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result: UploadResult = await response.json();

            if (result.errors.length > 0) {
                const errorMessage = result.errors
                    .map(err => `${err.file}: ${err.message}`)
                    .join('\n');
                setState(prev => ({ ...prev, error: errorMessage }));
            }

            setRecords(result.records);
            setState(prev => ({ ...prev, progress: 100 }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Upload failed'
            }));
        } finally {
            setState(prev => ({ ...prev, isUploading: false }));
        }
    }, [setRecords]);

    const reset = useCallback(() => {
        setState({
            isUploading: false,
            progress: 0,
            error: null,
        });
    }, []);

    return {
        ...state,
        upload,
        reset,
    };
}
