// src/app/api/jobs/schedule/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getApiUrl } from  '@/app/lib/config';

export async function GET(request: NextRequest) {
    const notebookId = request.nextUrl.pathname.split('/').pop();
    const endpoint = `${getApiUrl()}/notebook_details/${notebookId}`;
    console.log("endpoint:\n\n", endpoint);
    const response = await fetch(endpoint);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}
