// /src/components/layout/Header.tsx
// Application header with navigation and controls

'use client';

import { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { useData } from '@/context/DataContext';
import SettingsModal from '@/components/ui/SettingsModal';

export default function Header() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { toggleAutoCorrect, validationOptions } = useConfig();
    const { stats } = useData();

    return (
        <>
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 h-header">
                    <div className="flex items-center justify-between h-full">
                        {/* Logo/Title */}
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Data Cleansing System
                            </h1>
                            {stats && (
                                <span className="text-sm text-gray-500">
                  {stats.totalRecords} records | {stats.validRecords} valid
                </span>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="autoCorrect" className="text-sm text-gray-600">
                                    Auto-correct
                                </label>
                                <input
                                    id="autoCorrect"
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary rounded"
                                    checked={validationOptions.autoCorrect}
                                    onChange={() => toggleAutoCorrect()}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsSettingsOpen(true)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                <svg
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}
