// /src/components/forms/FileUpload.tsx
// Drag and drop file upload component

'use client';

import { useCallback, useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAIValidation } from '@/hooks/useAIValidation';
import { logger } from '@/utils/logger';

export default function FileUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setRecords } = useData();
    const { validateRecords, isProcessing: isValidating, progress: validationProgress } = useAIValidation();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const files = Array.from(e.dataTransfer.files);
        console.log("ssss");
        logger.info('FileUpload', `Received ${files.length} files`, {
            fileNames: files.map(f => f.name),
            fileSizes: files.map(f => f.size)
        });
        const excelFiles = files.filter(file =>
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel'
        );

        if (excelFiles.length === 0) {
            setError('Please upload Excel files only (.xlsx or .xls)');
            return;
        }

        try {
            setIsProcessing(true);
            logger.info('FileUpload', 'Starting file processing', {
                validFiles: excelFiles.map(f => f.name)
            });
            const formData = new FormData();
            excelFiles.forEach(file => formData.append('files', file));

            const response = await fetch('/api/process-files', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to process files');
            }

            const data = await response.json();
            logger.info('FileUpload', 'Files processed successfully', {
                recordCount: data.records.length
            });
            setRecords(data.records);

            // Start AI validation after files are processed
            logger.info('FileUpload', 'Starting AI validation');
            await validateRecords(data.records);
            logger.info('FileUpload', 'AI validation completed');

        } catch (err) {
            logger.error('FileUpload', 'Error processing files', { error: err });
            setError(err instanceof Error ? err.message : 'Failed to process files');
        } finally {
            setIsProcessing(false);
        }
    }, [setRecords, validateRecords]);

    const getProgressMessage = () => {
        if (isProcessing) return 'Processing files...';
        if (isValidating) return `AI Validation in progress: ${validationProgress}%`;
        return null;
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                    isDragging
                        ? 'border-primary bg-primary-light'
                        : 'border-gray-300 hover:border-primary'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    {(isProcessing || isValidating) ? (
                        <div className="space-y-3">
                            <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                            <p className="text-gray-600">{getProgressMessage()}</p>
                            {isValidating && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${validationProgress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14m-20 3v-4a4 4 0 014-4h8a4 4 0 014 4v4m-12 5l4 4 4-4"
                                />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">
                                Drag and drop your Excel files here
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Supports .xlsx and .xls files
                            </p>
                        </>
                    )}
                </div>
                {error && (
                    <div className="mt-3 text-sm text-validation-error text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
