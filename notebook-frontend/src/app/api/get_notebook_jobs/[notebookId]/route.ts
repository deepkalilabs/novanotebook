import type { NextRequest } from 'next/server'
import { getApiUrl } from  '@/app/lib/config';

export async function GET(
  req: NextRequest
) {
  try {

    //Get the last part of the path
    const notebookId = req.nextUrl.pathname.split('/').pop();
    console.log('notebookId:', notebookId);

    if (!notebookId) {
      return Response.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    const response = await fetch(`${getApiUrl()}/status/notebook/jobs/${notebookId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}