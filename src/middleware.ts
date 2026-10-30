import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'janasainyam_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'super_secret_jwt_or_cookie_key_32_characters_long';

async function getKey() {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET.padEnd(32, '#').slice(0, 32)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

async function isTokenValid(token: string): Promise<boolean> {
  try {
    const [payloadB64, signatureHex] = token.split('.');
    if (!payloadB64 || !signatureHex) return false;

    const key = await getKey();
    const enc = new TextEncoder();
    return await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBuffer(signatureHex),
      enc.encode(payloadB64)
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, public assets, and public read APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    pathname === '/pdf.worker.min.mjs' ||
    pathname === '/api/auth/login' ||
    pathname === '/api/pdf-proxy' ||
    (pathname === '/api/editions' && request.method === 'GET') ||
    (pathname === '/api/sync' && request.method === 'GET')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = token ? await isTokenValid(token) : false;

  // If going to login page
  if (pathname === '/login') {
    if (authenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If going to any other protected route (including root `/` and dashboard APIs)
  if (!authenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
