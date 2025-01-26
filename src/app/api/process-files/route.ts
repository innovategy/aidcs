// /src/app/api/process-files/route.ts
// API route for handling file processing

import { NextResponse } from 'next/server';
import { processExcelFile } from '@/services/file/excelProcessor';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            files.map(async (file) => {
                if (!(file instanceof File)) {
                    throw new Error('Invalid file object');
                }

                const buffer = await file.arrayBuffer();
                return processExcelFile(buffer);
            })
        );

        // Combine results from all files
        const combinedResults = {
            records: results.flatMap(result => result.records),
            errors: results.flatMap(result => result.errors)
        };

        return NextResponse.json(combinedResults);
    } catch (error) {
        console.error('File processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process files' },
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
