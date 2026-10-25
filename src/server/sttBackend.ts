/**
 * NirogCare Server - Multilingual STT Backend (`src/server/sttBackend.ts`)
 *
 * Uses ElevenLabs Scribe (`scribe_v1`) to transcribe voice audio in
 * Assamese (`as`), Hindi (`hi`), and Indian English (`en`).
 * Never logs transcript text or audio content; logs only timing and status codes.
 */

import * as fs from 'fs';
import * as path from 'path';
import { stripPII } from './piiStripper';
import { elevenLabsPool } from './elevenLabsPool';

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
    // Ignore .env read error
  }
  return '';
}

export interface SttTranscribeRequest {
  audioBase64: string;
  mimeType?: string;
  language?: string;
}

export interface SttTranscribeResponse {
  text: string;
  languageCode: string;
  sttDurationMs: number;
  provider: 'elevenlabs-scribe' | 'empty';
  error?: string;
}

const ISO_TO_SCRIBE_LANG: Record<string, string> = {
  en: 'eng',
  'en-in': 'eng',
  hi: 'hin',
  'hi-in': 'hin',
  as: 'asm',
  'as-in': 'asm',
  bn: 'ben',
  'bn-in': 'ben'
};

export async function transcribeAudioChunk(
  req: SttTranscribeRequest
): Promise<SttTranscribeResponse> {
  const t0 = Date.now();
  const langNorm = (req.language || 'en').toLowerCase().trim();
  const scribeLang = ISO_TO_SCRIBE_LANG[langNorm] || 'eng';

  if (!req.audioBase64 || req.audioBase64.length < 32) {
    return {
      text: '',
      languageCode: langNorm,
      sttDurationMs: 0,
      provider: 'empty',
      error: 'EMPTY_AUDIO'
    };
  }

  if (elevenLabsPool.getKeyCount() === 0) {
    return {
      text: '',
      languageCode: langNorm,
      sttDurationMs: Date.now() - t0,
      provider: 'empty',
      error: 'STT_KEY_NOT_CONFIGURED'
    };
  }

  const rawBase64 = req.audioBase64.includes(';base64,')
    ? req.audioBase64.split(';base64,')[1]
    : req.audioBase64;
  const audioBytes = Buffer.from(rawBase64, 'base64');
  const mimeType = req.mimeType || 'audio/webm';
  const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('mp4') ? 'mp4' : 'webm';

  const maxAttempts = Math.max(2, elevenLabsPool.getKeyCount());
  const attemptedKeys = new Set<string>();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const slot = elevenLabsPool.getNextKey();
    if (!slot || (attemptedKeys.has(slot.key) && attemptedKeys.size >= elevenLabsPool.getKeyCount())) {
      break;
    }
    attemptedKeys.add(slot.key);

    try {
      const form = new FormData();
      form.append('model_id', 'scribe_v1');
      form.append('language_code', scribeLang);
      form.append(
        'file',
        new Blob([audioBytes], { type: mimeType }),
        `utterance.${ext}`
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': slot.key
        },
        signal: controller.signal,
        body: form
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          elevenLabsPool.markExhausted(slot.key, 'quota_exceeded');
          continue;
        }
        if (res.status === 429) {
          elevenLabsPool.markRateLimited(slot.key, 6000);
          continue;
        }
        return {
          text: '',
          languageCode: langNorm,
          sttDurationMs: Date.now() - t0,
          provider: 'empty',
          error: `STT_HTTP_${res.status}`
        };
      }

      const data = (await res.json()) as { text?: string };
      const cleanText = stripPII((data.text || '').trim()).cleanText;

      return {
        text: cleanText,
        languageCode: langNorm,
        sttDurationMs: Date.now() - t0,
        provider: 'elevenlabs-scribe'
      };
    } catch {
      if (attemptedKeys.size < elevenLabsPool.getKeyCount()) {
        continue;
      }
      return {
        text: '',
        languageCode: langNorm,
        sttDurationMs: Date.now() - t0,
        provider: 'empty',
        error: 'STT_EXCEPTION'
      };
    }
  }

  return {
    text: '',
    languageCode: langNorm,
    sttDurationMs: Date.now() - t0,
    provider: 'empty',
    error: 'STT_ALL_KEYS_EXHAUSTED'
  };
}
