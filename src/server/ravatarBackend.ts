/**
 * NirogCare Server - RAVATAR Backend Session & Token Gateway
 * Securely mints RAVATAR JWT tokens and manages Live Mode sessions without exposing secrets to client.
 */

import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function getEnvVar(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
      if (match) return match[1].trim();
    }
  } catch {
    // Ignore missing .env
  }
  return '';
}

export interface RavatarAuthRequest {
  pseudonymousId?: string;
}

export interface RavatarAuthResponse {
  token: string;
  projectId: string;
  userId: string;
  expiresIn?: number;
  error?: string;
}

export interface RavatarLiveSessionResponse {
  licenseId?: string;
  streamingUrl?: string;
  error?: string;
}

export interface HeyGenTokenResponse {
  token: string;
  configured: boolean;
  provider: 'heygen' | 'ravatar-local-hd';
  fallbackVideoUrl: string;
  error?: string;
}

// In-memory rate limiting for JWT minting (max 10 per minute per IP/pseudonym)
const mintRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function mintHeyGenToken(_req: RavatarAuthRequest): Promise<HeyGenTokenResponse> {
  const heygenKey = process.env.HEYGEN_API_KEY || getEnvVar('HEYGEN_API_KEY');
  const fallbackVideoUrl = '/avatars/doctor-loop-1080.mp4';

  if (!heygenKey) {
    return {
      token: '',
      configured: false,
      provider: 'ravatar-local-hd',
      fallbackVideoUrl,
      error: 'NO_HEYGEN_API_KEY'
    };
  }

  let timeoutId: NodeJS.Timeout | undefined;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': heygenKey
      },
      signal: controller.signal
    });

    if (!res.ok) {
      return {
        token: '',
        configured: true,
        provider: 'ravatar-local-hd',
        fallbackVideoUrl,
        error: `HEYGEN_HTTP_${res.status}`
      };
    }

    const json = (await res.json()) as { data?: { token?: string }; token?: string };
    const streamingToken = json?.data?.token || json?.token || '';
    return {
      token: streamingToken,
      configured: true,
      provider: streamingToken ? 'heygen' : 'ravatar-local-hd',
      fallbackVideoUrl
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'HEYGEN_STREAM_FALLBACK';
    return {
      token: '',
      configured: true,
      provider: 'ravatar-local-hd',
      fallbackVideoUrl,
      error: errMsg
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function mintRavatarToken(req: RavatarAuthRequest): Promise<RavatarAuthResponse> {
  const projectId = process.env.RAVATAR_PROJECT_ID || getEnvVar('RAVATAR_PROJECT_ID') || 'demo-project-id';
  
  // Enforce pseudonymous ID (never use real user email, phone, or name)
  const pseudonym = req.pseudonymousId && req.pseudonymousId.length > 5
    ? req.pseudonymousId
    : `nirog-anon-${crypto.randomUUID()}`;

  // Rate limit check
  const now = Date.now();
  const rl = mintRateLimitMap.get(pseudonym) || { count: 0, resetAt: now + 60000 };
  if (now > rl.resetAt) {
    rl.count = 0;
    rl.resetAt = now + 60000;
  }
  if (rl.count >= 10) {
    return {
      token: '',
      projectId,
      userId: pseudonym,
      error: 'RATE_LIMIT_EXCEEDED'
    };
  }
  rl.count++;
  mintRateLimitMap.set(pseudonym, rl);

  let timeoutId: NodeJS.Timeout | undefined;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://chat.rvtr.ai/jwt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        user_id: pseudonym,
        project_id: projectId
      })
    });

    if (!res.ok) {
      return {
        token: '',
        projectId,
        userId: pseudonym,
        error: `RAVATAR_JWT_FAILED_${res.status}`
      };
    }

    const data = (await res.json()) as { jwt?: string; token?: string };
    const token = data.jwt || data.token;

    if (!token) {
      throw new Error('No token field returned by RAVATAR API');
    }

    return {
      token,
      projectId,
      userId: pseudonym
    };
  } catch {
    return {
      token: '',
      projectId,
      userId: pseudonym,
      error: 'CONNECTION_ERROR'
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function proxyStartLiveSession(token: string, avatarId: string): Promise<RavatarLiveSessionResponse> {
  try {
    const res = await fetch('https://chat.rvtr.ai/startLiveSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        width: '1280',
        height: '720'
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return { error: `START_LIVE_FAILED_${res.status}: ${err}` };
    }

    const data = (await res.json()) as {
      LicenseId?: string;
      license_id?: string;
      streamingUrl?: string;
      streaming_url?: string;
    };
    return {
      licenseId: data.LicenseId || data.license_id,
      streamingUrl: data.streamingUrl || data.streaming_url
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'FAILED_TO_START_LIVE';
    return { error: errMsg };
  }
}
