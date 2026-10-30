import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = (username || '').trim();
    const pass = (password || '').trim();

    const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim();
    const expectedPass = (process.env.ADMIN_PASSWORD || 'admin@janasainyam2026').trim();

    if (user !== expectedUser || pass !== expectedPass) {
      return NextResponse.json(
        { error: 'చెల్లని యూజర్‌నేమ్ లేదా పాస్‌వర్డ్ (Invalid credentials)' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      username,
      role: 'ప్రధాన సంపాదకుడు (Chief Editor)',
      authenticatedAt: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      message: 'లాగిన్ విజయవంతమైంది (Login successful)',
      user: { username, role: 'Chief Editor' },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

