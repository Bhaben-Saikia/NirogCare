/**
 * NirogCare Server - Session Token Authentication & Upstream Pre-Warming (`src/server/authSession.ts`)
 *
 * Responsibilities:
 * 1. Mints and verifies short-lived HMAC-SHA256 signed pseudonymous session tokens
 *    so every WebSocket (`/api/ws/chat`) and API request is authenticated and rate-limited
 *    per pseudonymous user ID without storing or transmitting personal identifiers.
 * 2. Pre-warms upstream TLS connections to Gemini and ElevenLabs so the first turn
 *    does not pay a cold TCP+TLS handshake penalty (~150-300ms saved).
 */

import * as crypto from 'crypto';

const SESSION_SECRET =
  process.env.SESSION_HMAC_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface SessionTokenPayload {
  uid: string;
  exp: number;
}

export function mintSessionToken(clientHintId?: string): {
  token: string;
  userId: string;
  expiresAt: number;
} {
  // Always hash any client hint so only a pseudonymous ID is used
  const rawId = clientHintId && clientHintId.trim().length > 0
    ? clientHintId.trim()
    : crypto.randomUUID();
  const userId =
    'usr_' + crypto.createHash('sha256').update(rawId).digest('hex').slice(0, 16);
  const expiresAt = Date.now() + TOKEN_TTL_MS;

  const payload: SessionTokenPayload = { uid: userId, exp: expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return {
    token: `${payloadB64}.${sig}`,
    userId,
    expiresAt
  };
}

export function verifySessionToken(token?: string | null): {
  valid: boolean;
  userId: string;
} {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, userId: 'anon-unverified' };
  }

  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) {
    return { valid: false, userId: 'anon-unverified' };
  }

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (sig.length !== expectedSig.length) {
    return { valid: false, userId: 'anon-unverified' };
  }

  if (
    !crypto.timingSafeEqual(Buffer.from(sig, 'utf-8'), Buffer.from(expectedSig, 'utf-8'))
  ) {
    return { valid: false, userId: 'anon-unverified' };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    ) as SessionTokenPayload;
    if (!parsed.uid || typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
      return { valid: false, userId: 'anon-expired' };
    }
    return { valid: true, userId: parsed.uid };
  } catch {
    return { valid: false, userId: 'anon-unverified' };
  }
}

let lastPrewarmAt = 0;

/**
 * Pre-warms HTTPS keep-alive sockets to Gemini and ElevenLabs APIs.
 */
export async function prewarmUpstreamConnections(): Promise<void> {
  const now = Date.now();
  if (now - lastPrewarmAt < 45_000) return;
  lastPrewarmAt = now;

  await Promise.allSettled([
    fetch('https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta', {
      method: 'HEAD'
    }),
    fetch('https://api.elevenlabs.io/v1/models', {
      method: 'HEAD'
    })
  ]);
}
