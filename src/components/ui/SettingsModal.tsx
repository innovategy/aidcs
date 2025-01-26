// src/components/ui/SettingsModal.tsx
'use client';

import { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { validationOptions, updateValidationOptions, confidenceThresholds, updateConfidenceThresholds } = useConfig();
    const [localOptions, setLocalOptions] = useState(validationOptions);
    const [localThresholds, setLocalThresholds] = useState(confidenceThresholds);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium mb-2">Validation Options</h3>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={localOptions.autoCorrect}
                                    onChange={(e) => setLocalOptions(prev => ({
                                        ...prev,
                                        autoCorrect: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span>Auto-correct enabled</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={localOptions.validateDates}
                                    onChange={(e) => setLocalOptions(prev => ({
                                        ...prev,
                                        validateDates: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span>Validate dates</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={localOptions.validateAddresses}
                                    onChange={(e) => setLocalOptions(prev => ({
                                        ...prev,
                                        validateAddresses: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span>Validate addresses</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={localOptions.checkDuplicates}
                                    onChange={(e) => setLocalOptions(prev => ({
                                        ...prev,
                                        checkDuplicates: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span>Check for duplicates</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">API Configuration</h3>
                        <input
                            type="password"
                            placeholder="Anthropic API Key"
                            className="w-full px-3 py-2 border rounded-md"
                            value={process.env.ANTHROPIC_API_KEY || ''}
                            onChange={() => {}} // This will be read-only as we're using env variables
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            API key is configured via environment variables
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            updateValidationOptions(localOptions);
                            updateConfidenceThresholds(localThresholds);
                            onClose();
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
