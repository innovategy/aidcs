// /src/app/api/download/route.ts
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { logger } from '@/utils/logger';

export async function POST(request: Request) {
    try {
        const { records } = await request.json();

        if (!Array.isArray(records)) {
            return NextResponse.json(
                { error: 'Invalid records data' },
                { status: 400 }
            );
        }

        // Log the incoming data
        logger.debug('Excel Export', 'Processing records for export', {
            recordCount: records.length,
            sampleRecord: records[0]
        });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Employee Records');

        // Transform the records for Excel
        const data = records.map((record, index) => {
            const row = {
                'First Name': record.firstName,
                'Last Name': record.lastName,
                'DOB': record.dob,
                'Gender': record.gender,
                'Home Address 1': record.homeAddress1,
                'Home Address 2': record.homeAddress2,
                'Home City': record.homeCity,
                'State': record.state,
                'Zip Code': record.zipCode,
                'County': record.county,
                'Primary Phone': record.primaryPhone,
                'Email': record.email,
                'FT/PT': record.ftPtStatus,
                'Avg Hours per Week': record.avgHoursPerWeek,
                'Hourly Rate': record.hourlyRate,
                'Annual Wages': record.annualWages,
                'Pay Type': record.payType,
                'Job Title': record.jobTitle,
                'Employment Start Date': record.employmentStartDate,
                'Employment End Date': record.employmentEndDate,
                'Enrollment Period Start Date': record.enrollmentPeriodStartDate,
                'Enrollment Period End Date': record.enrollmentPeriodEndDate,
                'Coverage Eligibility Start Date': record.coverageEligibilityStartDate,
                'Coverage Eligibility End Date': record.coverageEligibilityEndDate,
                'Class (Optional)': record.class,
                'Stipend Amount': record.stipendAmount
            };

            // Log the transformed row for debugging
            if (index === 0) {
                logger.debug('Excel Export', 'First row transformation', { row });
            }

            return row;
        });

        // Add header row
        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key, width: 20 }));
        // Add data rows
        data.forEach(row => worksheet.addRow(row));

        // Generate Excel file as buffer
        const excelBuffer = await workbook.xlsx.writeBuffer();

        // Return the Excel file
        return new NextResponse(Buffer.from(excelBuffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="employee_records.xlsx"'
            }
        });
    } catch (error) {
        logger.error('Excel Export', 'Export failed', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: 'Failed to generate export' },
            { status: 500 }
        );
    }
}
