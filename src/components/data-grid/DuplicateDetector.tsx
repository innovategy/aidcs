// /src/components/data-grid/DuplicateDetector.tsx
// Component for handling duplicate record detection and merging
// src/components/data-grid/DuplicateDetector.tsx
'use client';

import { useMemo } from 'react';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import type { DuplicateMatch } from '@/types/validation/ValidationTypes';

interface DuplicateDetectorProps {
    record: EmployeeRecord;
    onMerge: (original: EmployeeRecord, duplicate: EmployeeRecord) => void;
}

export default function DuplicateDetector({
                                              record,
                                              onMerge
                                          }: DuplicateDetectorProps) {
    const { findDuplicates, mergeDuplicates } = useDuplicateDetection();

    const duplicates = useMemo(() =>
        findDuplicates(record), [record, findDuplicates]
    );

    if (!duplicates.length) return null;

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4 my-2">
            <h3 className="text-sm font-medium text-orange-800 mb-2">
                Potential Duplicates Found
            </h3>
            <div className="space-y-4">
                {duplicates.map((match: DuplicateMatch) => (
                    <div
                        key={match.recordId}
                        className="bg-white rounded-md shadow-sm p-3 text-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-gray-900">
                                    Match Confidence: {(match.confidence * 100).toFixed(1)}%
                                </p>
                                <p className="text-gray-600 mt-1">
                                    Matching Fields: {match.matchedFields.join(', ')}
                                </p>
                            </div>
                            <button
                                onClick={() => onMerge(record, match.duplicateRecord as EmployeeRecord)}
                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                Review & Merge
                            </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Original Record</h4>
                                <DuplicateComparisonView record={record} matchedFields={match.matchedFields} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Potential Duplicate</h4>
                                <DuplicateComparisonView
                                    record={match.duplicateRecord as EmployeeRecord}
                                    matchedFields={match.matchedFields}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DuplicateComparisonView({
                                     record,
                                     matchedFields
                                 }: {
    record: EmployeeRecord;
    matchedFields: string[];
}) {
    const fields = useMemo(() => [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'primaryPhone', label: 'Phone' },
        { key: 'homeAddress1', label: 'Address' },
        { key: 'jobTitle', label: 'Job Title' }
    ], []);

    return (
        <div className="text-sm">
            {fields.map(({ key, label }) => (
                <div key={key} className="mb-1">
                    <span className="text-gray-500">{label}: </span>
                    <span className={
                        matchedFields.includes(key)
                            ? 'text-orange-600 font-medium'
                            : 'text-gray-900'
                    }>
            {record[key as keyof EmployeeRecord]}
          </span>
                </div>
            ))}
        </div>
    );
}
