import { NextResponse } from 'next/server';
import { getAllEditions } from '@/lib/editions';

export async function GET() {
  try {
    const editions = await getAllEditions();
    return NextResponse.json({ editions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch editions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

