import type { NextRequest } from 'next/server'
import { getApiUrl } from  '@/app/lib/config';

export async function GET(
  req: NextRequest
) {
  try {

    //Get the last part of the path
    const userId = req.nextUrl.pathname.split('/').pop();
    console.log('userId:', userId);

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const response = await fetch(`${getApiUrl()}/status/jobs/${userId}`, {
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