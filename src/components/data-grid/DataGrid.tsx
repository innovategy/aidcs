// /src/components/data-grid/DataGrid.tsx
// Interactive data grid for displaying and editing employee records

// src/components/data-grid/DataGrid.tsx

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Save, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useConfig } from '@/context/ConfigContext';
import { useAIValidation } from '@/hooks/useAIValidation';
import { formatters } from '@/utils/formatters';
import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type SortField = keyof EmployeeRecord;
type SortDirection = 'asc' | 'desc';

type Column = {
    field: string;
    header: string;
    width?: string;
    editable?: boolean;
    format?: (value: any) => string;
    render?: (record: EmployeeRecord) => React.ReactNode;
};

interface ValidationTooltipProps {
    recordId: string;
    field: keyof EmployeeRecord;
    children: React.ReactNode;
}

function ValidationTooltip({ recordId, field, children }: ValidationTooltipProps) {
    const { validationResults } = useData();
    const result = validationResults[recordId];

    if (!result) return <>{children}</>;

    const errors = result.errors.filter(e => e.field === field);
    const warnings = result.warnings.filter(w => w.field === field);
    const corrections = result.autoCorrections.filter(c => c.field === field);

    if (errors.length === 0 && warnings.length === 0 && corrections.length === 0) {
        return <>{children}</>;
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className="relative inline-flex items-center">
                        {children}
                        <span className="ml-1">
              {errors.length > 0 && <AlertCircle className="w-4 h-4 text-validation-error" />}
                            {warnings.length > 0 && <AlertTriangle className="w-4 h-4 text-duplicate" />}
                            {corrections.length > 0 && <CheckCircle className="w-4 h-4 text-autocorrected" />}
            </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-3 space-y-2">
                    {errors.map((error, index) => (
                        <div key={`error-${index}`} className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-validation-error mt-1 shrink-0" />
                            <div className="text-sm text-validation-error">{error.message}</div>
                        </div>
                    ))}
                    {warnings.map((warning, index) => (
                        <div key={`warning-${index}`} className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-duplicate mt-1 shrink-0" />
                            <div className="text-sm text-duplicate">{warning.message}</div>
                        </div>
                    ))}
                    {corrections.map((correction, index) => (
                        <div key={`correction-${index}`} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-autocorrected mt-1 shrink-0" />
                            <div className="text-sm text-autocorrected">
                                <span className="font-medium">Auto-corrected:</span>
                                <div className="mt-1">
                                    {correction.originalValue} → {correction.correctedValue}
                                    {correction.confidence && (
                                        <span className="text-xs ml-1">
                      ({Math.round(correction.confidence * 100)}% confidence)
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}


export default function DataGrid() {
    const { records, validationResults, updateRecord, clearAll, stats, setValidationResult } = useData();
    const { validateRecords } = useAIValidation();
    const [sortField, setSortField] = useState<keyof EmployeeRecord>('lastName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ recordId: string; field: keyof EmployeeRecord } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    // Main columns for the grid
    const mainColumns = useMemo(() => [
        {
            field: 'validationStatus',
            header: 'Status',
            width: '50px',
            render: (record: EmployeeRecord) => {
                const result = validationResults[record.recordId!];
                if (!result) return null;

                const hasErrors = result.errors.length > 0;
                const hasWarnings = result.warnings.length > 0;
                const hasCorrections = result.autoCorrections.length > 0;

                let icon = null;
                let color = '';
                let tooltip = '';

                if (hasErrors) {
                    icon = <AlertCircle className="w-5 h-5" />;
                    color = 'text-validation-error';
                    tooltip = `${result.errors.length} error(s)`;
                } else if (hasWarnings) {
                    icon = <AlertTriangle className="w-5 h-5" />;
                    color = 'text-duplicate';
                    tooltip = `${result.warnings.length} warning(s)`;
                } else if (hasCorrections) {
                    icon = <CheckCircle className="w-5 h-5" />;
                    color = 'text-autocorrected';
                    tooltip = `${result.autoCorrections.length} correction(s)`;
                } else {
                    icon = <CheckCircle className="w-5 h-5" />;
                    color = 'text-validation-success';
                    tooltip = 'Valid';
                }

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className={color}>{icon}</div>
                            </TooltipTrigger>
                            <TooltipContent>{tooltip}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
        },
        { field: 'lastName', header: 'Last Name', editable: true },
        { field: 'firstName', header: 'First Name', editable: true },
        { field: 'email', header: 'Email', editable: true },
        { field: 'primaryPhone', header: 'Phone', editable: true },
        { field: 'jobTitle', header: 'Job Title', editable: true },
        { field: 'ftPtStatus', header: 'Status', editable: true },
        { field: 'hourlyRate', header: 'Rate', editable: true, format: formatters.currency }
    ], [validationResults]);

    // Detail fields for expanded view
    const detailFields = useMemo(() => [
        { field: 'homeAddress1', header: 'Address', editable: true },
        { field: 'homeAddress2', header: 'Address 2', editable: true },
        { field: 'homeCity', header: 'City', editable: true },
        { field: 'state', header: 'State', editable: true },
        { field: 'zipCode', header: 'ZIP', editable: true },
        { field: 'county', header: 'County', editable: true },
        { field: 'avgHoursPerWeek', header: 'Hours/Week', editable: true },
        { field: 'annualWages', header: 'Annual Wages', editable: true, format: formatters.currency },
        { field: 'payType', header: 'Pay Type', editable: true },
        { field: 'employmentStartDate', header: 'Start Date', editable: true },
        { field: 'employmentEndDate', header: 'End Date', editable: true },
        { field: 'enrollmentPeriodStartDate', header: 'Enrollment Start', editable: true },
        { field: 'enrollmentPeriodEndDate', header: 'Enrollment End', editable: true },
        { field: 'coverageEligibilityStartDate', header: 'Coverage Start', editable: true },
        { field: 'coverageEligibilityEndDate', header: 'Coverage End', editable: true },
        { field: 'class', header: 'Class', editable: true },
        { field: 'stipendAmount', header: 'Stipend', editable: true, format: formatters.currency }
    ] as const, []);

    const sortedRecords = useMemo(() => {
        return [...records].sort((a, b) => {
            const aValue = String(a[sortField]);
            const bValue = String(b[sortField]);
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    }, [records, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleReset = useCallback(() => {
        if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            clearAll();
        }
    }, [clearAll]);

    const handleRevalidate = useCallback(async () => {
        await validateRecords(records);
    }, [validateRecords, records]);

    const handleExport = useCallback(async () => {
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ records }),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'employee_records.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to export records. Please try again.');
        }
    }, [records]);



    const toggleRowExpand = (recordId: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(recordId)) {
                next.delete(recordId);
            } else {
                next.add(recordId);
            }
            return next;
        });
    };

    const startEditing = (recordId: string, field: keyof EmployeeRecord, value: any) => {
        setEditingCell({ recordId, field });
        setEditValue(String(value));
    };

    const saveEdit = (recordId: string, field: keyof EmployeeRecord) => {
        updateRecord(recordId, { [field]: editValue });
        setEditingCell(null);
    };

    const cancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const getCellClassName = (record: EmployeeRecord, field: keyof EmployeeRecord) => {
        const validation = validationResults[record.recordId!];
        if (!validation) return '';

        const hasError = validation.errors.some(e => e.field === field);
        const hasWarning = validation.warnings.some(w => w.field === field);
        const isAutoCorrected = validation.autoCorrections.some(a => a.field === field);

        if (hasError) return 'bg-red-50 text-validation-error';
        if (hasWarning) return 'bg-orange-50 text-duplicate';
        if (isAutoCorrected) return 'bg-teal-50 text-autocorrected';
        return '';
    };

    const handleMarkValid = useCallback((recordId: string, field: keyof EmployeeRecord) => {
        const currentResult = validationResults[recordId];
        if (!currentResult) return;

        // Remove any errors/warnings for this field
        const newResult = {
            ...currentResult,
            errors: currentResult.errors.filter(e => e.field !== field),
            warnings: currentResult.warnings.filter(w => w.field !== field),
            autoCorrections: currentResult.autoCorrections.filter(c => c.field !== field),
            isValid: true
        };

        setValidationResult(recordId, newResult);
    }, [validationResults, setValidationResult]);

    const renderCell = (record: EmployeeRecord, field: string, format?: (value: any) => string, customRender?: (record: EmployeeRecord) => React.ReactNode) => {
        // If there's a custom render function, use it
        if (customRender) {
            return customRender(record);
        }

        const value = record[field as keyof EmployeeRecord];
        const isEditing = editingCell?.recordId === record.recordId && editingCell?.field === field;

        if (isEditing) {
            return (
                <div className="flex items-center space-x-1">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        autoFocus
                    />
                    <button
                        onClick={() => saveEdit(record.recordId!, field as keyof EmployeeRecord)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Save"
                    >
                        <Save size={16} />
                    </button>
                    <button
                        onClick={() => handleMarkValid(record.recordId!, field as keyof EmployeeRecord)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Mark as Valid"
                    >
                        <CheckCircle size={16} />
                    </button>
                    <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Cancel"
                    >
                        <X size={16} />
                    </button>
                </div>
            );
        }

        const displayValue = format ? format(value) : String(value);

        return (
            <ValidationTooltip recordId={record.recordId!} field={field as keyof EmployeeRecord}>
                <div
                    className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => startEditing(record.recordId!, field as keyof EmployeeRecord, value)}
                >
                    {displayValue}
                </div>
            </ValidationTooltip>
        );
    };

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600">Total Records</div>
                            <div className="text-2xl font-semibold">{stats.totalRecords}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600">Valid Records</div>
                            <div className="text-2xl font-semibold text-validation-success">
                                {stats.validRecords}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600">Potential Duplicates</div>
                            <div className="text-2xl font-semibold text-duplicate">
                                {stats.duplicates}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600">Auto-corrected</div>
                            <div className="text-2xl font-semibold text-autocorrected">
                                {stats.autocorrected}
                            </div>
                        </div>
                    </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="w-10 px-2" />
                    {mainColumns.map(({ field, header }) => (
                        <th
                            key={field}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort(field)}
                        >
                            <div className="flex items-center space-x-1">
                                <span>{header}</span>
                                {sortField === field && (
                                    <span className="ml-1">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {sortedRecords.map((record) => (
                    <React.Fragment key={record.recordId}>
                        <tr className="hover:bg-gray-50">
                            <td className="px-2">
                                <button
                                    onClick={() => toggleRowExpand(record.recordId!)}
                                    className="p-1 rounded hover:bg-gray-200"
                                >
                                    {expandedRows.has(record.recordId!) ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                </button>
                            </td>
                            {mainColumns.map(({ field, format, render }) => (
                                <td
                                    key={`${record.recordId}-${field}`}
                                    className={`px-6 py-4 whitespace-nowrap text-sm ${getCellClassName(record, field as keyof EmployeeRecord)}`}
                                >
                                    {renderCell(record, field, format, render)}
                                </td>
                            ))}
                        </tr>
                        {expandedRows.has(record.recordId!) && (
                            <tr>
                                <td colSpan={mainColumns.length + 1}>
                                    <div className="px-8 py-4 bg-gray-50">
                                        <div className="grid grid-cols-3 gap-4">
                                            {detailFields.map(({ field, header, format }) => (
                                                <div key={field} className="space-y-1">
                                                    <div className="text-xs font-medium text-gray-500">
                                                        {header}
                                                    </div>
                                                    <div className={getCellClassName(record, field)}>
                                                        {renderCell(record, field, format)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!records.length}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset Data
                    </button>
                    <button
                        type="button"
                        onClick={handleRevalidate}
                        disabled={!records.length}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Revalidate
                    </button>
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

            {/* Validation Status Glossary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Validation Status Glossary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-validation-error" />
                        <span>Error - Record needs attention</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-duplicate" />
                        <span>Warning - Potential issues</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-autocorrected" />
                        <span>Auto-corrected - Changes applied</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-validation-success" />
                        <span>Valid - No issues found</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
