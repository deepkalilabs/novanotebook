import type { NextRequest } from 'next/server'
import { getApiUrl } from  '@/app/lib/config';

export async function GET(
  req: NextRequest
) {
  try {

    const userId = req.nextUrl.pathname.match(/\/api\/connectors\/([^\/]+)/)?.[1];
    const notebookId = req.nextUrl.pathname.match(/\/[^\/]+\/([^\/]+)$/)?.[1];
    console.log('userId:', userId);
    console.log('notebookId:', notebookId);
    if (!userId || !notebookId) {
      return Response.json({ error: 'User ID and Notebook ID are required', data: null, status: 400 });
    }

    const response = await fetch(`${getApiUrl()}/connectors/${userId}/${notebookId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    return Response.json({ error: null, data: data, status: 200 });
  } catch (error) {
    console.error('Error fetching connectors:', error);
    return Response.json({ error: 'Failed to fetch connectors', data: null, status: 500 });
  }
}