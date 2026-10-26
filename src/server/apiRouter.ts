/**
 * NirogCare Server - Unified API Router Middleware (`src/server/apiRouter.ts`)
 * Handles `/api/*` endpoints for Vite dev server and production Cloud Run runner.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import * as crypto from 'crypto';
import {
  processHealthChat,
  streamAvatarChat,
  type ChatRequestPayload,
  type AvatarStreamRequestPayload
} from './geminiBackend';
import { mintRavatarToken, proxyStartLiveSession, mintHeyGenToken } from './ravatarBackend';
import { processPrescriptionOcr, type OcrRequestPayload } from './ocrBackend';
import { synthesizeSpeechBuffer, type TtsStreamRequest } from './ttsBackend';
import {
  mintSessionToken,
  verifySessionToken,
  prewarmUpstreamConnections
} from './authSession';
import { transcribeAudioChunk, type SttTranscribeRequest } from './sttBackend';
import { checkRateLimit } from './rateLimiter';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = (req.url || '').split('?')[0];

  if (!url.startsWith('/api/') || url.startsWith('/api/ws/')) {
    return false;
  }

  const origin = req.headers.origin || '';
  const isVercelOrigin = /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(origin);
  if (origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || isVercelOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Access-Control-Expose-Headers',
    'X-TTS-Provider, X-TTS-Model, X-Voice-Id, X-Pitch-Cents, X-Playback-Rate, X-TTS-Sample-Rate, X-TTS-Request-At, X-TTS-First-Byte-At, X-TTS-Alignment'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    if (url === '/api/location' && (req.method === 'GET' || req.method === 'POST')) {
      const rawLat = (req.headers['x-vercel-ip-latitude'] as string) || '';
      const rawLng = (req.headers['x-vercel-ip-longitude'] as string) || '';
      const city = req.headers['x-vercel-ip-city']
        ? decodeURIComponent(req.headers['x-vercel-ip-city'] as string)
        : null;
      const region = (req.headers['x-vercel-ip-country-region'] as string) || null;
      const country = (req.headers['x-vercel-ip-country'] as string) || 'IN';

      const lat = rawLat ? parseFloat(rawLat) : null;
      const lng = rawLng ? parseFloat(rawLng) : null;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ lat, lng, city, region, country }));
      return true;
    }

    if (url === '/api/health' && req.method === 'GET') {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
      return true;
    }

    const bodyStr = await readBody(req);
    let bodyJson: Record<string, unknown> = {};
    if (bodyStr) {
      try {
        bodyJson = JSON.parse(bodyStr) as Record<string, unknown>;
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'INVALID_JSON_BODY' }));
        return true;
      }
    }

    // 1b. Session Token Minting + Upstream Connection Pre-Warming
    if (url === '/api/auth/session' && req.method === 'POST') {
      prewarmUpstreamConnections().catch(() => {
        // Ignore prewarm errors
      });
      const hint = typeof bodyJson.clientHintId === 'string' ? bodyJson.clientHintId : undefined;
      const session = mintSessionToken(hint);
      res.statusCode = 200;
      res.end(JSON.stringify(session));
      return true;
    }

    // Verify Bearer token if provided; NEVER trust client-supplied bodyJson.userId for rate limiting
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const verified = verifySessionToken(bearer);
    const remoteIp = req.socket?.remoteAddress || '127.0.0.1';
    const ipFallbackId =
      'ip_' + crypto.createHash('sha256').update(remoteIp).digest('hex').slice(0, 12);
    const resolvedUserId = verified.valid ? verified.userId : ipFallbackId;

    // 2. Chat with Gemini (Single Brain + Pre-LLM Red Flags + PII Stripping)
    if (url === '/api/chat' && req.method === 'POST') {
      const chatReq: ChatRequestPayload = {
        message: typeof bodyJson.message === 'string' ? bodyJson.message : '',
        language: typeof bodyJson.language === 'string' ? bodyJson.language : undefined,
        userId: resolvedUserId,
        history: Array.isArray(bodyJson.history)
          ? (bodyJson.history as ChatRequestPayload['history'])
          : undefined
      };
      const response = await processHealthChat(chatReq);
      res.statusCode = 200;
      res.end(JSON.stringify(response));
      return true;
    }

    // 2a-stream. Real-Time Talking Avatar Streaming Chat (SSE tokens + punctuation sentence chunks)
    if (url === '/api/chat/stream' && req.method === 'POST') {
      const streamReq: AvatarStreamRequestPayload = {
        message: typeof bodyJson.message === 'string' ? bodyJson.message : '',
        characterId: typeof bodyJson.characterId === 'string' ? bodyJson.characterId : undefined,
        language: typeof bodyJson.language === 'string' ? bodyJson.language : undefined,
        userId: resolvedUserId,
        history: Array.isArray(bodyJson.history)
          ? (bodyJson.history as AvatarStreamRequestPayload['history'])
          : undefined
      };
      await streamAvatarChat(streamReq, res);
      return true;
    }

    // 2a-tts. Real-Time Streaming TTS (Swappable TtsProvider: ElevenLabs PCM24k + Local PCM Fallback)
    if (url === '/api/tts/stream' && req.method === 'POST') {
      const ttsText = typeof bodyJson.text === 'string' ? bodyJson.text : '';
      const rl = checkRateLimit(resolvedUserId, ttsText.length);
      if (!rl.allowed) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED', message: rl.reason }));
        return true;
      }
      const ttsReq: TtsStreamRequest = {
        text: ttsText,
        characterId: typeof bodyJson.characterId === 'string' ? bodyJson.characterId : undefined,
        language: typeof bodyJson.language === 'string' ? bodyJson.language : undefined,
        voiceId: typeof bodyJson.voiceId === 'string' ? bodyJson.voiceId : undefined,
        simulateFailure: Boolean(bodyJson.simulateFailure)
      };
      const ttsResult = await synthesizeSpeechBuffer(ttsReq);
      res.statusCode = 200;
      res.setHeader('Content-Type', ttsResult.contentType);
      res.setHeader('Content-Length', String(ttsResult.audioBuffer.byteLength));
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-TTS-Provider', ttsResult.provider);
      res.setHeader('X-TTS-Model', ttsResult.model);
      res.setHeader('X-Voice-Id', ttsResult.voiceId);
      res.setHeader('X-Pitch-Cents', String(ttsResult.pitchCents));
      res.setHeader('X-Playback-Rate', String(ttsResult.playbackRate));
      res.setHeader('X-TTS-Sample-Rate', String(ttsResult.sampleRate));
      res.setHeader('X-TTS-Request-At', String(ttsResult.ttsRequestAt));
      res.setHeader('X-TTS-First-Byte-At', String(ttsResult.firstTtsByteAt));
      if (ttsResult.alignment) {
        res.setHeader(
          'X-TTS-Alignment',
          Buffer.from(JSON.stringify(ttsResult.alignment), 'utf-8').toString('base64')
        );
      }
      res.end(ttsResult.audioBuffer);
      return true;
    }

    // 2a-stt. Server-Side Multilingual Speech-to-Text (Assamese, Hindi, Indian English via Scribe)
    if (url === '/api/stt/transcribe' && req.method === 'POST') {
      const rl = checkRateLimit(resolvedUserId, 100);
      if (!rl.allowed) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED', message: rl.reason }));
        return true;
      }
      const sttReq: SttTranscribeRequest = {
        audioBase64: typeof bodyJson.audioBase64 === 'string' ? bodyJson.audioBase64 : '',
        mimeType: typeof bodyJson.mimeType === 'string' ? bodyJson.mimeType : undefined,
        language: typeof bodyJson.language === 'string' ? bodyJson.language : undefined
      };
      const sttRes = await transcribeAudioChunk(sttReq);
      res.statusCode = 200;
      res.end(JSON.stringify(sttRes));
      return true;
    }

    // 2b. HeyGen Interactive Avatar Token Minting (Server-side API key)
    if (url === '/api/heygen/token' && req.method === 'POST') {
      const response = await mintHeyGenToken({ pseudonymousId: resolvedUserId });
      res.statusCode = 200;
      res.end(JSON.stringify(response));
      return true;
    }

    // 3. RAVATAR JWT Token Minting
    if (url === '/api/ravatar/token' && req.method === 'POST') {
      const response = await mintRavatarToken({ pseudonymousId: resolvedUserId });
      res.statusCode = response.error ? 400 : 200;
      res.end(JSON.stringify(response));
      return true;
    }

    // 4. RAVATAR Live Mode Session Starter
    if (url === '/api/ravatar/start-live' && req.method === 'POST') {
      const token =
        authHeader.replace(/^Bearer\s+/i, '') ||
        (typeof bodyJson.token === 'string' ? bodyJson.token : '');
      const avatarId = typeof bodyJson.avatarId === 'string' ? bodyJson.avatarId : '';

      if (!token || !avatarId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'TOKEN_AND_AVATAR_ID_REQUIRED' }));
        return true;
      }

      const response = await proxyStartLiveSession(token, avatarId);
      res.statusCode = response.error ? 400 : 200;
      res.end(JSON.stringify(response));
      return true;
    }

    // 5. Google Cloud Vision Prescription OCR
    if (url === '/api/ocr/prescription' && req.method === 'POST') {
      const rl = checkRateLimit(resolvedUserId, 100);
      if (!rl.allowed) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED', message: rl.reason }));
        return true;
      }
      const ocrReq: OcrRequestPayload = {
        imageBase64: typeof bodyJson.imageBase64 === 'string' ? bodyJson.imageBase64 : '',
        language: typeof bodyJson.language === 'string' ? bodyJson.language : undefined,
        userId: resolvedUserId
      };
      const response = await processPrescriptionOcr(ocrReq);
      res.statusCode = response.error ? 400 : 200;
      res.end(JSON.stringify(response));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'NOT_FOUND', path: url }));
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message }));
    return true;
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  const vercelBody = (req as any).body;
  if (vercelBody !== undefined && vercelBody !== null) {
    if (typeof vercelBody === 'string') return Promise.resolve(vercelBody);
    return Promise.resolve(JSON.stringify(vercelBody));
  }

  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer | string) => {
      data += String(chunk);
      if (data.length > 15 * 1024 * 1024) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', (err) => reject(err));
  });
}
