// /src/services/file/excelProcessor.ts
// Service for processing Excel files using SheetJS
// /src/services/file/excelProcessor.ts
import ExcelJS from 'exceljs';
import type { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import { logger } from '@/utils/logger';

interface ProcessingResult {
    records: EmployeeRecord[];
    errors: ProcessingError[];
}

interface ProcessingError {
    sheet: string;
    row: number;
    message: string;
}

export async function processExcelFile(buffer: ArrayBuffer): Promise<ProcessingResult> {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(Buffer.from(buffer));

        const result: ProcessingResult = {
            records: [],
            errors: []
        };

        // Process each sheet in the workbook
        workbook.worksheets.forEach(worksheet => {
            const sheetName = worksheet.name;
            const jsonData: any[] = [];
            let headers: string[] = [];

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber === 1) {
                    headers = row.values.slice(1) as string[]; // skip first empty value
                    logger.debug('Excel Import', 'Processing headers', { headers });
                } else {
                    const rowData: any = {};
                    row.values.slice(1).forEach((cell, i) => {
                        rowData[headers[i]] = cell;
                    });
                    jsonData.push(rowData);
                }
            });

            jsonData.forEach((row: any, index: number) => {
                try {
                    logger.debug('Excel Import', `Processing row ${index + 1}`, {
                        rawData: row
                    });

                    const record = normalizeRecord(row);

                    logger.debug('Excel Import', `Normalized row ${index + 1}`, {
                        normalizedData: record
                    });

                    result.records.push(record);
                } catch (err) {
                    logger.error('Excel Import', `Error processing row ${index + 1}`, {
                        error: err instanceof Error ? err.message : 'Unknown error',
                        rowData: row
                    });

                    result.errors.push({
                        sheet: sheetName,
                        row: index + 2,
                        message: err instanceof Error ? err.message : 'Unknown error'
                    });
                }
            });
        });

        return result;
    } catch (err) {
        logger.error('Excel Import', 'File processing error', {
            error: err instanceof Error ? err.message : 'Unknown error'
        });
        throw new Error(`Failed to process Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

function normalizeRecord(row: any): EmployeeRecord {
    logger.debug('Excel Import', 'Normalizing row', { originalRow: row });

    const record: EmployeeRecord = {
        firstName: normalizeString(row['First Name']),
        lastName: normalizeString(row['Last Name']),
        dob: normalizeDate(row['DOB']),
        gender: normalizeString(row['Gender']),
        homeAddress1: normalizeString(row['Home Address 1']),
        homeAddress2: normalizeString(row['Home Address 2'] || ''),
        homeCity: normalizeString(row['Home City']),
        state: normalizeString(row['State']),
        zipCode: normalizeString(row['Zip Code']),
        county: normalizeString(row['County']),
        primaryPhone: normalizePhone(row['Primary Phone']),
        email: normalizeString(row['Email']).toLowerCase(),
        ftPtStatus: normalizeFtPtStatus(row['FT/PT']),
        avgHoursPerWeek: normalizeNumber(row['Avg Hours per Week']),
        hourlyRate: normalizeNumber(row['Hourly Rate']),
        annualWages: normalizeNumber(row['Annual Wages']),
        payType: normalizeString(row['Pay Type']),
        jobTitle: normalizeString(row['Job Title']),
        employmentStartDate: normalizeDate(row['Employment Start Date']),
        employmentEndDate: normalizeDate(row['Employment End Date']),
        enrollmentPeriodStartDate: normalizeDate(row['Enrollment Period Start Date']),
        enrollmentPeriodEndDate: normalizeDate(row['Enrollment Period End Date']),
        coverageEligibilityStartDate: normalizeDate(row['Coverage Eligibility Start Date']),
        coverageEligibilityEndDate: normalizeDate(row['Coverage Eligibility End Date']),
        class: normalizeString(row['Class (Optional)']),
        stipendAmount: normalizeNumber(row['Stipend Amount']),
        recordId: generateRecordId()
    };

    logger.debug('Excel Import', 'Normalized record', { record });
    return record;
}

// Utility functions for data normalization
function normalizeString(value: any): string {
    if (value === undefined || value === null) return '';
    return String(value).trim();
}

function normalizeDate(value: any): string {
    if (!value) return '';

    try {
        // If it's already a date object
        if (value instanceof Date) {
            return value.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        }

        // If it's a string, try to parse it
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        }

        // If it's already in the correct format, return it
        if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return value;
        }

        logger.warn('Excel Import', 'Failed to parse date', { value });
        return value.toString();
    } catch (e) {
        logger.error('Excel Import', 'Date normalization error', {
            value,
            error: e instanceof Error ? e.message : 'Unknown error'
        });
        return '';
    }
}

function normalizePhone(value: any): string {
    if (!value) return '';
    const digits = String(value).replace(/\D/g, '');
    return digits.length === 10
        ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
        : String(value);
}

function normalizeNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;

    // If it's already a number, return it
    if (typeof value === 'number') return value;

    // Remove any currency symbols and commas
    const cleanValue = String(value).replace(/[$,]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
}

function generateRecordId(): string {
    return `rec_${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeFtPtStatus(value: any): 'FT' | 'PT' {
    if (!value) return 'PT'; // Default value if empty

    const normalized = String(value).toUpperCase().trim();

    // Common Full-Time indicators
    const fullTimeIndicators = [
        'FT',
        'FULL',
        'FULL TIME',
        'FULLTIME',
        'FULL-TIME',
        'F/T',
        '1.0',
        '40'
    ];

    // Common Part-Time indicators
    const partTimeIndicators = [
        'PT',
        'PART',
        'PART TIME',
        'PARTTIME',
        'PART-TIME',
        'P/T',
        '0.5',
        '20'
    ];

    // Log the value being processed to help with debugging
    console.log('Processing employment status:', {
        original: value,
        normalized: normalized
    });

    // Check for full-time indicators first
    if (fullTimeIndicators.some(indicator => normalized.includes(indicator))) {
        return 'FT';
    }

    // Then check for part-time indicators
    if (partTimeIndicators.some(indicator => normalized.includes(indicator))) {
        return 'PT';
    }

    // If hours per week is included in the status field
    const hours = parseInt(normalized.replace(/\D/g, ''));
    if (!isNaN(hours)) {
        return hours >= 30 ? 'FT' : 'PT';
    }

    // Default to PT if no match is found
    return 'PT';
}
