// src/services/ai/anthropicService.ts

import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import type {
    ValidationResult,
    AutoCorrection,
    ValidationError,
    ValidationWarning,
    AIValidationResponse
} from '@/types/validation/ValidationTypes';
import { logger } from '@/utils/logger';

interface AnthropicRequestMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface AnthropicRequest {
    model: string;
    messages: AnthropicRequestMessage[];
    max_tokens: number;
    temperature: number;
}

export class AnthropicService {
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://api.anthropic.com/v1';
    private readonly BATCH_SIZE = 5;

    constructor() {
        this.apiKey = process.env.ANTHROPIC_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('Anthropic API key is not configured');
        }
    }

    private async makeRequest(batch: EmployeeRecord[]): Promise<AIValidationResponse> {
        const prompt = this.buildPrompt(batch);

        const requestBody: AnthropicRequest = {
            model: 'claude-3-5-sonnet-20241022',
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: 4000,
            temperature: 0.2
        };

        logger.debug('AnthropicService', 'Making API request', {
            batchSize: batch.length,
            promptLength: prompt.length
        });

        try {
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const responseData = await response.json();
            const textContent = responseData.content?.[0]?.text;

            if (!textContent) {
                throw new Error('No text content in API response');
            }

            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            return JSON.parse(jsonMatch[0]) as AIValidationResponse;

        } catch (error) {
            logger.error('AnthropicService', 'Request error', { error });
            throw error;
        }
    }

    async batchValidateRecords(records: EmployeeRecord[]): Promise<Record<string, ValidationResult>> {
        const results: Record<string, ValidationResult> = {};

        logger.info('AnthropicService', 'Starting batch validation', {
            totalRecords: records.length,
            batchSize: this.BATCH_SIZE
        });

        // Process records in smaller batches
        for (let i = 0; i < records.length; i += this.BATCH_SIZE) {
            const batch = records.slice(i, i + this.BATCH_SIZE);
            const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
            const batchResults = await this.processBatch(batch, batchNumber);

            // Merge results
            Object.assign(results, batchResults);
        }

        return results;
    }

    private async processBatch(batch: EmployeeRecord[], batchNumber: number): Promise<Record<string, ValidationResult>> {
        const batchResults: Record<string, ValidationResult> = {};

        try {
            const response = await this.makeRequest(batch);

            // Process each record in batch
            for (const record of batch) {
                const recordId = record.recordId!;
                try {
                    const recordResult = response.results[recordId];
                    if (!recordResult) {
                        logger.warn('AnthropicService', `No result for record ${recordId} in batch ${batchNumber}`);
                        batchResults[recordId] = this.createDefaultValidationResult();
                        continue;
                    }

                    batchResults[recordId] = this.convertToValidationResult(recordResult, response.globalIssues);
                } catch (error) {
                    logger.error('AnthropicService', `Error processing record ${recordId}`, { error });
                    batchResults[recordId] = this.createDefaultValidationResult();
                }
            }

            logger.info('AnthropicService', `Completed batch ${batchNumber}`, {
                batchSize: batch.length,
                processedResults: Object.keys(batchResults).length,
                recordIds: Object.keys(batchResults)
            });

        } catch (error) {
            logger.error('AnthropicService', `Batch ${batchNumber} failed`, { error });
            batch.forEach(record => {
                batchResults[record.recordId!] = this.createDefaultValidationResult();
            });
        }

        return batchResults;
    }

    private convertToValidationResult(recordResult: AIValidationResponse['results'][string], globalIssues?: AIValidationResponse['globalIssues']): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const autoCorrections: AutoCorrection[] = [];

        // Process record-specific validations
        if (recordResult.errors) {
            recordResult.errors.forEach(error => {
                const item: ValidationError = {
                    field: error.field,
                    message: error.message,
                    code: 'AI_VALIDATION',
                    severity: error.severity,
                    explanation: error.explanation,
                    impact: error.impact,
                    suggestedAction: error.suggestedAction
                };

                if (error.severity === 'error') {
                    errors.push(item);
                } else {
                    warnings.push(item as ValidationWarning);
                }
            });
        }

        // Process corrections
        if (recordResult.corrections) {
            recordResult.corrections
                .filter(c => c.confidence >= 0.9 && c.suggestion)
                .forEach(correction => {
                    autoCorrections.push({
                        field: correction.field,
                        originalValue: correction.originalValue || '',
                        correctedValue: correction.suggestion,
                        confidence: correction.confidence,
                        source: 'AI',
                        explanation: correction.explanation,
                        reasoning: correction.reasoning
                    });
                });
        }

        // Process duplicates
        if (recordResult.duplicates) {
            recordResult.duplicates.forEach(duplicate => {
                warnings.push({
                    field: 'duplicate',
                    message: 'Potential duplicate record detected',
                    code: 'DUPLICATE',
                    severity: 'warning',
                    explanation: duplicate.explanation,
                    matchedFields: duplicate.matchedFields,
                    confidence: duplicate.confidence,
                    differences: duplicate.differences
                });
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            autoCorrections
        };
    }

    private createDefaultValidationResult(): ValidationResult {
        return {
            isValid: false,
            errors: [{
                field: 'system',
                message: 'Validation service unavailable',
                code: 'SYSTEM_ERROR',
                severity: 'error'
            }],
            warnings: [],
            autoCorrections: []
        };
    }

    private buildPrompt(records: EmployeeRecord[]): string {
        return `Analyze and validate the following employee records. Provide detailed explanations for any issues found and suggested corrections:

${JSON.stringify(records, null, 2)}

Provide response in JSON format with recordId as keys:
{
    "results": {
        "record_id_1": {
            "corrections": [
                {
                    "field": "fieldName",
                    "suggestion": "correctedValue",
                    "confidence": 0.95,
                    "explanation": "Brief explanation of what was corrected",
                    "reasoning": "Detailed reasoning behind the correction",
                    "originalValue": "original value"
                }
            ],
            "errors": [
                {
                    "field": "fieldName",
                    "message": "Brief error description",
                    "severity": "error|warning",
                    "explanation": "Detailed explanation of the issue",
                    "impact": "Business impact of this issue",
                    "suggestedAction": "Recommended action to resolve"
                }
            ],
            "duplicates": [
                {
                    "matchedFields": ["field1", "field2"],
                    "confidence": 0.92,
                    "explanation": "Why these records are likely duplicates",
                    "differences": [
                        {
                            "field": "fieldName",
                            "value1": "value in record 1",
                            "value2": "value in record 2",
                            "significance": "Importance of this difference"
                        }
                    ]
                }
            ]
        }
    }
}`;
    }
}

export const anthropicService = new AnthropicService();
