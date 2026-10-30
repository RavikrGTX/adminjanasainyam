import { NextResponse } from 'next/server';
import { pingWordPress } from '@/lib/wordpress';

export async function GET() {
  const status = await pingWordPress();
  return NextResponse.json(status);
}

