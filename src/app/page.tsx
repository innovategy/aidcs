// /src/app/page.tsx
// Main page component with file upload and data grid
// /src/app/page.tsx
'use client';

import { useCallback } from 'react';
import FileUpload from '@/components/forms/FileUpload';
import DataGrid from '@/components/data-grid/DataGrid';
import { useData } from '@/context/DataContext';
import { useConfig } from '@/context/ConfigContext';
import { logger } from '@/utils/logger';

export default function HomePage() {
    const { records, stats } = useData();
    const { validationOptions } = useConfig();

    const handleExport = useCallback(async () => {
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ records }),
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            // Create a blob from the response
            const blob = await response.blob();

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'employee_records.xlsx';

            // Append to body, click, and cleanup
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            logger.info('Export', 'Successfully exported records', {
                recordCount: records.length
            });
        } catch (error) {
            logger.error('Export', 'Failed to export records', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            alert('Failed to export records. Please try again.');
        }
    }, [records]);

    const renderContent = useCallback(() => {
        if (!records.length) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Start by uploading your employee data
                        </h2>
                        <p className="text-gray-600">
                            Upload Excel files containing employee records for validation and cleansing
                        </p>
                    </div>
                    <FileUpload />
                </div>
            );
        }

        return (
            <div className="space-y-4">

                {/* Main Grid */}
                <DataGrid />

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={!records.length}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Export to Excel
                    </button>
                </div>
            </div>
        );
    }, [records, stats, handleExport]);

    return (
        <div className="space-y-6">
            {renderContent()}
        </div>
    );
}
