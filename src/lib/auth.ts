import { cookies } from 'next/headers';
import { UserSession } from './types';

export const SESSION_COOKIE_NAME = 'janasainyam_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'super_secret_jwt_or_cookie_key_32_characters_long';

// Helper to get crypto key using Web Crypto API compatible with Edge and Node.js
async function getKey() {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET.padEnd(32, '#').slice(0, 32)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

export async function createSessionToken(session: UserSession): Promise<string> {
  const payloadStr = JSON.stringify(session);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  
  const key = await getKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const signatureHex = bufferToHex(signatureBuffer);

  return `${payloadB64}.${signatureHex}`;
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const [payloadB64, signatureHex] = token.split('.');
    if (!payloadB64 || !signatureHex) return null;

    const key = await getKey();
    const enc = new TextEncoder();
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBuffer(signatureHex),
      enc.encode(payloadB64)
    );

    if (!valid) return null;

    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    return JSON.parse(payloadStr) as UserSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}
