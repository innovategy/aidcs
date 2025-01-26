// /src/hooks/useDuplicateDetection.ts
// Custom hook for handling duplicate detection

'use client';

import { useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { DUPLICATE_DETECTION_CONFIG } from '@/constants/duplication';
import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import type { DuplicateMatch } from '@/types/validation/ValidationTypes';

export function useDuplicateDetection() {
    const { records, updateRecord } = useData();

    const calculateSimilarity = useCallback((
        value1: string,
        value2: string,
        fieldType: string
    ): number => {
        if (!value1 || !value2) return 0;

        // Convert to lowercase for comparison
        const v1 = value1.toLowerCase();
        const v2 = value2.toLowerCase();

        // Exact match
        if (v1 === v2) return 1;

        // Field-specific fuzzy matching
        switch (fieldType) {
            case 'name': {
                // Levenshtein distance for names
                const distance = levenshteinDistance(v1, v2);
                const maxLength = Math.max(v1.length, v2.length);
                return 1 - (distance / maxLength);
            }

            case 'email': {
                // Compare local parts and domains separately
                const [local1, domain1] = v1.split('@');
                const [local2, domain2] = v2.split('@');

                if (domain1 === domain2) {
                    const localSimilarity = 1 - (levenshteinDistance(local1, local2) / Math.max(local1.length, local2.length));
                    return localSimilarity * 0.8 + 0.2; // Weight local part more heavily
                }
                return 0;
            }

            case 'phone': {
                // Compare only digits
                const digits1 = v1.replace(/\D/g, '');
                const digits2 = v2.replace(/\D/g, '');
                return digits1 === digits2 ? 1 : 0;
            }

            case 'address': {
                // Tokenize and compare address parts
                const tokens1 = v1.split(/[\s,]+/);
                const tokens2 = v2.split(/[\s,]+/);

                let matches = 0;
                for (const token1 of tokens1) {
                    if (tokens2.includes(token1)) matches++;
                }
                return matches / Math.max(tokens1.length, tokens2.length);
            }

            default:
                return v1 === v2 ? 1 : 0;
        }
    }, []);

    const findDuplicates = useCallback((record: EmployeeRecord): DuplicateMatch[] => {
        const duplicates: DuplicateMatch[] = [];
        const { weights, minConfidence } = DUPLICATE_DETECTION_CONFIG;

        for (const otherRecord of records) {
            if (record.recordId === otherRecord.recordId) continue;

            const matchedFields: string[] = [];
            let totalWeight = 0;
            let weightedSimilarity = 0;

            // Check each weighted field
            for (const [field, weight] of Object.entries(weights)) {
                const similarity = calculateSimilarity(
                    record[field as keyof EmployeeRecord] as string,
                    otherRecord[field as keyof EmployeeRecord] as string,
                    field
                );

                if (similarity > DUPLICATE_DETECTION_CONFIG.fuzzyMatch[field] || 0.8) {
                    matchedFields.push(field);
                    weightedSimilarity += similarity * weight;
                    totalWeight += weight;
                }
            }

            const confidence = totalWeight > 0 ? weightedSimilarity / totalWeight : 0;

            if (confidence >= minConfidence) {
                duplicates.push({
                    recordId: otherRecord.recordId!,
                    confidence,
                    matchedFields,
                    originalRecord: record,
                    duplicateRecord: otherRecord
                });
            }
        }

        return duplicates.sort((a, b) => b.confidence - a.confidence);
    }, [records, calculateSimilarity]);

    const mergeDuplicates = useCallback((
        originalId: string,
        duplicateId: string,
        mergedData: Partial<EmployeeRecord>
    ) => {
        // Update the original record with merged data
        updateRecord(originalId, mergedData);

        // Mark the duplicate as merged
        updateRecord(duplicateId, {
            mergedInto: originalId,
            isActive: false
        });
    }, [updateRecord]);

    return {
        findDuplicates,
        mergeDuplicates
    };
}

// Utility function for Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1,  // substitution
                    dp[i - 1][j] + 1,      // deletion
                    dp[i][j - 1] + 1       // insertion
                );
            }
        }
    }

    return dp[m][n];
}
