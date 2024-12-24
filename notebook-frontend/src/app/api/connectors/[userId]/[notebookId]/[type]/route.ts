import { getApiUrl } from '@/app/lib/config';
import type { NextRequest } from 'next/server';

/*
 * This endpoint verifies if a connector type is already connected to a notebook.
 * @param req - The request object.
 * @returns A JSON response with the connectors.
 */
export async function GET(
    req: NextRequest
) {
  const userId = req.nextUrl.pathname.match(/\/api\/connectors\/([^\/]+)/)?.[1];
  const notebookId = req.nextUrl.pathname.match(/\/[^\/]+\/([^\/]+)$/)?.[1];
  const type = req.nextUrl.pathname.match(/\/[^\/]+\/([^\/]+)$/)?.[1];

  if (!userId || !notebookId || !type) {
    return Response.json({ error: 'User ID, Notebook ID, and Type are required', data: null, status: 400 });
  }

  try {
    const response = await fetch(`${getApiUrl()}/connectors/${userId}/${notebookId}/${type}`, {
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