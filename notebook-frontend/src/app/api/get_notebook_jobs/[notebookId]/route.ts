import type { NextRequest } from 'next/server'
import { getApiUrl } from  '@/app/lib/config';

export async function GET(
  req: NextRequest
) {
  try {

    //Get the last part of the path
    const notebookId = req.nextUrl.pathname.split('/').pop();
    const endpoint = `${getApiUrl()}/status/notebook/jobs/${notebookId}`;
    console.log('in jobs api notebookId:', notebookId);
    console.log('endpoint:\n\n', endpoint);
    if (!notebookId) {
      return Response.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    const response = await fetch(endpoint);
    const data = await response.json();

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}