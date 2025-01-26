// src/app/api/ai/validate/route.ts

import { NextResponse } from 'next/server';
import { anthropicService } from '@/services/ai/anthropicService';
import { EmployeeRecord } from '@/types/employee/EmployeeRecord';
import { logger } from '@/utils/logger';

export async function POST(request: Request) {

    logger.info('AIValidate', 'Received validation request');

    try {
        const contentType = request.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            logger.warn('AIValidate', 'Invalid content type', { receivedType: contentType });

            return NextResponse.json(
                { error: 'Content-Type must be application/json' },
                { status: 415 }
            );
        }

        const body = await request.json();
        logger.debug('AIValidate', 'Request body received', { bodySize: JSON.stringify(body).length });

        const { records } = body as { records: EmployeeRecord[] };

        if (!Array.isArray(records)) {
            logger.warn('AIValidate', 'Invalid request format', {
                receivedType: typeof records
            });
            return NextResponse.json(
                { error: 'Invalid request format. Expected array of records.' },
                { status: 400 }
            );
        }

        logger.info('AIValidate', `Processing ${records.length} records`);


        if (records.length > 100) {
            logger.warn('AIValidate', 'Batch size exceeded', {
                receivedSize: records.length
            });
            return NextResponse.json(
                { error: 'Maximum batch size exceeded. Limit is 100 records.' },
                { status: 400 }
            );
        }

        const results = await anthropicService.batchValidateRecords(records);
        logger.info('AIValidate', 'Validation completed', {
            processedRecords: records.length,
            resultsCount: Object.keys(results).length
        });

        return NextResponse.json({
            success: true,
            results
        });
    } catch (error) {
        logger.error('AIValidate', 'Validation error', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        return NextResponse.json(
            {
                error: 'Failed to process validation request',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
