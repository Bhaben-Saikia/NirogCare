/**
 * NirogCare Server - Swappable Streaming TTS Provider Engine (`src/server/ttsBackend.ts`)
 *
 * Implements the `TtsProvider` interface so providers (ElevenLabs v4, Gemini Neural TTS,
 * or offline PCM fallback) can be swapped seamlessly.
 *
 * Primary Provider (`ElevenLabsTtsProvider`):
 *   - Uses `eleven_v4_turbo` (ElevenLabs v4 architecture, 94 languages including Indian English,
 *     Hindi, Assamese, and Bengali) by default, configurable via `ELEVENLABS_MODEL=eleven_v4`.
 *   - Serializes requests through a concurrency gate and retries once on HTTP 429 so free-tier
 *     concurrent-request limits never drop chunks into a robotic fallback.
 *   - Requests `pcm_24000` (24kHz 16-bit signed little-endian mono PCM) with character-level
 *     alignment timestamps (`/stream/with-timestamps?output_format=pcm_24000`).
 *
 * Secondary Neural Provider (`GeminiNeuralTtsProvider`):
 *   - Uses Google's official `gemini-3.8-flash-lite-tts` / `gemini-2.5-flash-preview-tts`
 *     prebuilt human neural voices (`Aoede`, `Kore`, `Puck`, `Charon`) outputting 24kHz 16-bit PCM.
 *   - Ensures that even if ElevenLabs free-tier monthly credits are exhausted, the user still
 *     hears a realistic human neural voice rather than a synthetic oscillator.
 *
 * Privacy & Spend Caps:
 *   - Enforces daily ElevenLabs character credit caps via `checkAndRecordElevenLabsCredits`.
 *   - Never logs user health text; logs only timings, provider/model IDs, and byte counts.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  getCharacterById,
  getLanguageByCode,
  type ElevenLabsModelId,
  type LanguageCode
} from '../config/characters';
import { checkAndRecordElevenLabsCredits } from './rateLimiter';
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

export interface CharacterAlignment {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
}

export interface TtsStreamRequest {
  text: string;
  characterId?: string;
  language?: string;
  voiceId?: string;
  /** Optional flag when user selects Free Browser Voice mode to save cloud TTS credits */
  preferFreeVoice?: boolean;
  /** Optional test flag for Phase 2 resilience harness to simulate TTS provider failure */
  simulateFailure?: boolean;
  /** Optional flag for latency harness to bypass in-memory TTS cache */
  bypassCache?: boolean;
  /** Optional callback fired immediately when the first NDJSON PCM sub-frame arrives (~250ms) */
  onFirstSubFrame?: (subFrame: TtsStreamResult) => void;
}

export interface TtsStreamResult {
  audioBuffer: Buffer;
  contentType: string;
  sampleRate: number;
  provider: 'elevenlabs' | 'gemini-tts' | 'browser-speech' | 'pcm-fallback';
  model: string;
  voiceId: string;
  languageCode: LanguageCode;
  pitchCents: number;
  playbackRate: number;
  alignment?: CharacterAlignment;
  ttsRequestAt: number;
  firstTtsByteAt: number;
}

export interface TtsProvider {
  readonly name: 'elevenlabs' | 'gemini-tts' | 'pcm-fallback';
  synthesize(
    text: string,
    langCode: LanguageCode,
    voiceId: string,
    modelId: ElevenLabsModelId,
    fallbackPitchCents: number,
    fallbackRate: number,
    onFirstSubFrame?: (subFrame: TtsStreamResult) => void,
    geminiVoiceName?: 'Aoede' | 'Kore' | 'Puck' | 'Charon'
  ): Promise<TtsStreamResult>;
}

const ttsCache = new Map<string, Promise<TtsStreamResult>>();
const MAX_CACHE_ENTRIES = 60;

// Serialize ElevenLabs requests (max 1 in-flight at a time) so Free Tier never hits HTTP 429 concurrency errors
let elevenLabsQueue: Promise<unknown> = Promise.resolve();
function runSerializedElevenLabs<T>(fn: () => Promise<T>): Promise<T> {
  const next = elevenLabsQueue.then(fn, fn);
  elevenLabsQueue = next.catch(() => {});
  return next;
}

export function prewarmTtsChunk(req: TtsStreamRequest): Promise<TtsStreamResult> {
  return synthesizeSpeechBuffer(req);
}

export async function synthesizeSpeechBuffer(req: TtsStreamRequest): Promise<TtsStreamResult> {
  const rawText = (req.text || '').replace(/[*#_`~[\]()<>]/g, '').trim();
  const character = getCharacterById(req.characterId || 'aria');
  const langConfig = getLanguageByCode(req.language || 'en');
  const voiceId = req.voiceId || character.voiceMap[langConfig.code];

  const envGlobalModel = (
    process.env.ELEVENLABS_MODEL || getEnvVar('ELEVENLABS_MODEL')
  ).trim() as ElevenLabsModelId;
  const envAsModel = (
    process.env.ELEVENLABS_ASSAMESE_MODEL || getEnvVar('ELEVENLABS_ASSAMESE_MODEL')
  ).trim() as ElevenLabsModelId;

  let modelId: ElevenLabsModelId = langConfig.elevenLabsModel;
  if (
    envGlobalModel === 'eleven_v4' ||
    envGlobalModel === 'eleven_v4_turbo' ||
    envGlobalModel === 'eleven_v3' ||
    envGlobalModel === 'eleven_multilingual_v2' ||
    envGlobalModel === 'eleven_flash_v2_5'
  ) {
    modelId = envGlobalModel;
  } else if (
    langConfig.code === 'as' &&
    (envAsModel === 'eleven_v4' ||
      envAsModel === 'eleven_v4_turbo' ||
      envAsModel === 'eleven_v3' ||
      envAsModel === 'eleven_flash_v2_5')
  ) {
    modelId = envAsModel;
  }

  const now = Date.now();

  if (!rawText) {
    return {
      audioBuffer: generateSilentPcm24k(80),
      contentType: 'audio/pcm;rate=24000',
      sampleRate: 24000,
      provider: 'pcm-fallback',
      model: 'silent',
      voiceId,
      languageCode: langConfig.code,
      pitchCents: 0,
      playbackRate: 1.0,
      ttsRequestAt: now,
      firstTtsByteAt: now
    };
  }

  if (req.preferFreeVoice) {
    const durationSec = Math.max(0.8, rawText.length * 0.055);
    return {
      audioBuffer: Buffer.alloc(0),
      contentType: 'application/x-browser-speech',
      sampleRate: 24000,
      provider: 'browser-speech',
      model: 'web-speech-neural',
      voiceId,
      languageCode: langConfig.code,
      pitchCents: 0,
      playbackRate: 1.0,
      alignment: buildSyntheticAlignment(rawText, durationSec),
      ttsRequestAt: now,
      firstTtsByteAt: now
    };
  }

  if (req.simulateFailure) {
    const fbRes = await localPcmFallbackProvider.synthesize(
      rawText,
      langConfig.code,
      voiceId,
      modelId,
      character.appearance.fallbackPitchCents,
      character.appearance.fallbackRate
    );
    if (req.onFirstSubFrame) req.onFirstSubFrame(fbRes);
    return fbRes;
  }

  const cacheKey = `${character.id}:${langConfig.code}:${voiceId}:${modelId}:${rawText}`;
  if (!req.bypassCache) {
    const existing = ttsCache.get(cacheKey);
    if (existing) {
      const cached = await existing;
      if (req.onFirstSubFrame) req.onFirstSubFrame(cached);
      return cached;
    }
  }

  const task = executeWithProviders(
    rawText,
    langConfig.code,
    voiceId,
    modelId,
    character.appearance.fallbackPitchCents,
    character.appearance.fallbackRate,
    req.onFirstSubFrame,
    character.geminiVoiceName
  );

  if (!req.bypassCache) {
    if (ttsCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = ttsCache.keys().next().value;
      if (oldestKey) ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, task);
  }

  try {
    return await task;
  } catch (err) {
    ttsCache.delete(cacheKey);
    throw err;
  }
}

class ElevenLabsTtsProvider implements TtsProvider {
  public readonly name = 'elevenlabs' as const;

  public async synthesize(
    text: string,
    langCode: LanguageCode,
    voiceId: string,
    modelId: ElevenLabsModelId,
    _fallbackPitchCents?: number,
    _fallbackRate?: number,
    onFirstSubFrame?: (subFrame: TtsStreamResult) => void
  ): Promise<TtsStreamResult> {
    if (elevenLabsPool.getKeyCount() === 0) {
      throw new Error('ELEVENLABS_API_KEY_NOT_CONFIGURED');
    }

    if (!checkAndRecordElevenLabsCredits(text.length)) {
      throw new Error('DAILY_ELEVENLABS_CREDIT_CAP_REACHED');
    }

    return runSerializedElevenLabs(async () => {
      const maxAttempts = Math.max(2, elevenLabsPool.getKeyCount() * 2);
      const attemptedKeys = new Set<string>();

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const slot = elevenLabsPool.getNextKey();
        if (!slot) {
          throw new Error('ELEVENLABS_ALL_KEYS_EXHAUSTED');
        }

        if (attemptedKeys.has(slot.key) && attemptedKeys.size >= elevenLabsPool.getKeyCount()) {
          throw new Error('ELEVENLABS_ALL_KEYS_EXHAUSTED');
        }
        attemptedKeys.add(slot.key);

        try {
          const result = await this.performRequest(
            slot.key,
            text,
            langCode,
            voiceId,
            modelId,
            onFirstSubFrame
          );
          elevenLabsPool.recordUsage(slot.key, text.length);
          return result;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '';

          if (
            msg.startsWith('ELEVENLABS_QUOTA_EXCEEDED') ||
            msg.includes('401') ||
            msg.includes('quota') ||
            msg.includes('credit')
          ) {
            const remaining = elevenLabsPool.markExhausted(slot.key, 'quota_exceeded');
            if (remaining > 0) {
              continue; // Automatically fail over to the next key in the pool
            }
            throw new Error('ELEVENLABS_ALL_KEYS_EXHAUSTED');
          }

          if (msg.startsWith('ELEVENLABS_HTTP_429')) {
            elevenLabsPool.markRateLimited(slot.key, 6000);
            if (elevenLabsPool.getAvailableKeys().length > 0) {
              continue; // Concurrency limit hit on this key; rotate to next key from another account
            }
            await new Promise((r) => setTimeout(r, 450));
            continue;
          }

          if (attemptedKeys.size < elevenLabsPool.getKeyCount()) {
            console.warn(`[ElevenLabs Pool] Error with key ${slot.masked}: ${msg}. Rotating to next key...`);
            continue;
          }

          throw err;
        }
      }
      throw new Error('ELEVENLABS_RETRY_EXHAUSTED');
    });
  }

  private async performRequest(
    elevenLabsKey: string,
    text: string,
    langCode: LanguageCode,
    voiceId: string,
    modelId: ElevenLabsModelId,
    onFirstSubFrame?: (subFrame: TtsStreamResult) => void
  ): Promise<TtsStreamResult> {
    const ttsRequestAt = Date.now();
    let firstTtsByteAt = 0;
    let emittedFirstSubFrame = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500);

    try {
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}/stream/with-timestamps?output_format=pcm_24000`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.78,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!res.ok || !res.body) {
        let errDetail = '';
        try {
          errDetail = await res.text();
        } catch {
          // Ignore read error
        }
        if (
          res.status === 401 ||
          res.status === 400 ||
          errDetail.includes('quota_exceeded') ||
          errDetail.includes('quota limit') ||
          errDetail.includes('credit')
        ) {
          throw new Error(`ELEVENLABS_QUOTA_EXCEEDED:${res.status}`);
        }
        if (res.status === 429) {
          throw new Error(`ELEVENLABS_HTTP_429`);
        }
        throw new Error(`ELEVENLABS_HTTP_${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let jsonBuffer = '';
      const pcmBuffers: Buffer[] = [];
      const characters: string[] = [];
      const characterStartTimesSeconds: number[] = [];
      const characterEndTimesSeconds: number[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!firstTtsByteAt && value && value.byteLength > 0) {
          firstTtsByteAt = Date.now();
        }
        jsonBuffer += decoder.decode(value, { stream: true });
        const lines = jsonBuffer.split('\n');
        jsonBuffer = lines.pop() || '';

        for (const rawLine of lines) {
          const trimmed = rawLine.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            let linePcm: Buffer | null = null;
            if (parsed.audio_base64) {
              linePcm = Buffer.from(parsed.audio_base64, 'base64');
              pcmBuffers.push(linePcm);
            }
            const align = parsed.alignment || parsed.normalized_alignment;
            if (align && Array.isArray(align.characters)) {
              for (let i = 0; i < align.characters.length; i++) {
                characters.push(String(align.characters[i]));
                characterStartTimesSeconds.push(
                  Number(align.character_start_times_seconds?.[i] ?? 0)
                );
                characterEndTimesSeconds.push(Number(align.character_end_times_seconds?.[i] ?? 0));
              }
            }
            if (!emittedFirstSubFrame && onFirstSubFrame && linePcm && linePcm.byteLength >= 64) {
              emittedFirstSubFrame = true;
              onFirstSubFrame({
                audioBuffer: linePcm,
                contentType: 'audio/pcm;rate=24000',
                sampleRate: 24000,
                provider: 'elevenlabs',
                model: modelId,
                voiceId,
                languageCode: langCode,
                pitchCents: 0,
                playbackRate: 1.0,
                alignment:
                  characters.length > 0
                    ? {
                        characters: [...characters],
                        characterStartTimesSeconds: [...characterStartTimesSeconds],
                        characterEndTimesSeconds: [...characterEndTimesSeconds]
                      }
                    : undefined,
                ttsRequestAt,
                firstTtsByteAt: firstTtsByteAt || Date.now()
              });
            }
          } catch {
            // Ignore partial line
          }
        }
      }

      if (jsonBuffer.trim()) {
        try {
          const parsed = JSON.parse(jsonBuffer.trim());
          if (parsed.audio_base64) {
            pcmBuffers.push(Buffer.from(parsed.audio_base64, 'base64'));
          }
        } catch {
          // Ignore trailing partial line
        }
      }

      const combinedPcm = Buffer.concat(pcmBuffers);
      if (combinedPcm.byteLength < 64) {
        throw new Error('ELEVENLABS_EMPTY_AUDIO');
      }

      return {
        audioBuffer: combinedPcm,
        contentType: 'audio/pcm;rate=24000',
        sampleRate: 24000,
        provider: 'elevenlabs',
        model: modelId,
        voiceId,
        languageCode: langCode,
        pitchCents: 0,
        playbackRate: 1.0,
        alignment:
          characters.length > 0
            ? {
                characters,
                characterStartTimesSeconds,
                characterEndTimesSeconds
              }
            : undefined,
        ttsRequestAt,
        firstTtsByteAt: firstTtsByteAt || Date.now()
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

class GeminiNeuralTtsProvider implements TtsProvider {
  public readonly name = 'gemini-tts' as const;

  public async synthesize(
    text: string,
    langCode: LanguageCode,
    voiceId: string,
    _modelId: ElevenLabsModelId,
    _fallbackPitchCents: number,
    _fallbackRate: number,
    onFirstSubFrame?: (subFrame: TtsStreamResult) => void,
    geminiVoiceName: 'Aoede' | 'Kore' | 'Puck' | 'Charon' = 'Aoede'
  ): Promise<TtsStreamResult> {
    const geminiKey = getEnvVar('GEMINI_API_KEY');
    if (!geminiKey || geminiKey.length < 10) {
      throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
    }

    const ttsRequestAt = Date.now();
    const ttsModels = ['gemini-3.8-flash-lite-tts', 'gemini-2.5-flash-preview-tts'];

    for (const modelName of ttsModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          geminiKey
        )}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: geminiVoiceName
                  }
                }
              }
            }
          })
        });

        if (!res.ok) {
          continue;
        }

        const firstTtsByteAt = Date.now();
        const data = (await res.json()) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{
                inlineData?: { mimeType?: string; data?: string };
              }>;
            };
          }>;
        };

        const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (!inlineData?.data) {
          continue;
        }

        const rawBuffer = Buffer.from(inlineData.data, 'base64');
        const isWav =
          rawBuffer.byteLength > 44 && rawBuffer.subarray(0, 4).toString('ascii') === 'RIFF';
        const pcmBuffer = isWav ? rawBuffer.subarray(44) : rawBuffer;

        if (pcmBuffer.byteLength < 64) {
          continue;
        }

        const durationSec = pcmBuffer.byteLength / (24000 * 2);
        const alignment = buildSyntheticAlignment(text, durationSec);

        const result: TtsStreamResult = {
          audioBuffer: pcmBuffer,
          contentType: 'audio/pcm;rate=24000',
          sampleRate: 24000,
          provider: 'gemini-tts',
          model: modelName,
          voiceId,
          languageCode: langCode,
          pitchCents: 0,
          playbackRate: 1.0,
          alignment,
          ttsRequestAt,
          firstTtsByteAt
        };

        if (onFirstSubFrame) {
          onFirstSubFrame(result);
        }

        return result;
      } catch {
        // Try next Gemini TTS model bucket
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new Error('GEMINI_TTS_ALL_MODELS_EXHAUSTED');
  }
}

class LocalPcmFallbackProvider implements TtsProvider {
  public readonly name = 'pcm-fallback' as const;

  public async synthesize(
    text: string,
    langCode: LanguageCode,
    voiceId: string,
    _modelId: ElevenLabsModelId,
    fallbackPitchCents: number
  ): Promise<TtsStreamResult> {
    const ttsRequestAt = Date.now();
    const baseFreqHz = fallbackPitchCents < 0 ? 128 : 205;
    const pcmBuffer = generateFormantPcm24k(text, baseFreqHz);
    const alignment = buildSyntheticAlignment(text, pcmBuffer.byteLength / (24000 * 2));
    return {
      audioBuffer: pcmBuffer,
      contentType: 'audio/pcm;rate=24000',
      sampleRate: 24000,
      provider: 'pcm-fallback',
      model: 'local-formant-pcm24k',
      voiceId,
      languageCode: langCode,
      pitchCents: 0,
      playbackRate: 1.0,
      alignment,
      ttsRequestAt,
      firstTtsByteAt: Date.now()
    };
  }
}

const elevenLabsProvider: TtsProvider = new ElevenLabsTtsProvider();
const geminiNeuralProvider: TtsProvider = new GeminiNeuralTtsProvider();
const localPcmFallbackProvider: TtsProvider = new LocalPcmFallbackProvider();

async function executeWithProviders(
  text: string,
  langCode: LanguageCode,
  voiceId: string,
  modelId: ElevenLabsModelId,
  fallbackPitchCents: number,
  fallbackRate: number,
  onFirstSubFrame?: (subFrame: TtsStreamResult) => void,
  geminiVoiceName: 'Aoede' | 'Kore' | 'Puck' | 'Charon' = 'Aoede'
): Promise<TtsStreamResult> {
  try {
    return await elevenLabsProvider.synthesize(
      text,
      langCode,
      voiceId,
      modelId,
      fallbackPitchCents,
      fallbackRate,
      onFirstSubFrame,
      geminiVoiceName
    );
  } catch (err: unknown) {
    const errCode = err instanceof Error ? err.message : 'UNKNOWN';
    console.warn(`[TTS] ElevenLabs fallback to Gemini Neural TTS: code=${errCode}`);
    try {
      return await geminiNeuralProvider.synthesize(
        text,
        langCode,
        voiceId,
        modelId,
        fallbackPitchCents,
        fallbackRate,
        onFirstSubFrame,
        geminiVoiceName
      );
    } catch (geminiErr: unknown) {
      const gCode = geminiErr instanceof Error ? geminiErr.message : 'UNKNOWN';
      console.warn(`[TTS] Cloud TTS exhausted (${gCode}); switching to Browser Neural SpeechSynthesis`);
      const now = Date.now();
      const durationSec = Math.max(0.8, text.length * 0.055);
      const browserRes: TtsStreamResult = {
        audioBuffer: Buffer.alloc(0),
        contentType: 'application/x-browser-speech',
        sampleRate: 24000,
        provider: 'browser-speech',
        model: 'web-speech-neural',
        voiceId,
        languageCode: langCode,
        pitchCents: 0,
        playbackRate: 1.0,
        alignment: buildSyntheticAlignment(text, durationSec),
        ttsRequestAt: now,
        firstTtsByteAt: now
      };
      if (onFirstSubFrame) onFirstSubFrame(browserRes);
      return browserRes;
    }
  }
}

function generateSilentPcm24k(durationMs: number): Buffer {
  const sampleRate = 24000;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  return Buffer.alloc(numSamples * 2);
}

function generateFormantPcm24k(text: string, baseFreqHz: number): Buffer {
  const sampleRate = 24000;
  const durationSec = Math.min(3.6, Math.max(0.45, text.length * 0.048));
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const syllableEnv = Math.max(0, Math.sin(t * Math.PI * 5.4) * 0.85 + 0.15);
    const f1 = Math.sin(2 * Math.PI * baseFreqHz * t);
    const f2 = 0.5 * Math.sin(2 * Math.PI * (baseFreqHz * 2.4) * t);
    const f3 = 0.25 * Math.sin(2 * Math.PI * (baseFreqHz * 4.1) * t);
    const sample = Math.max(-1, Math.min(1, (f1 + f2 + f3) * 0.25 * syllableEnv));
    buffer.writeInt16LE(Math.floor(sample * 32767), i * 2);
  }
  return buffer;
}

function buildSyntheticAlignment(text: string, durationSec: number): CharacterAlignment {
  const chars = Array.from(text);
  const step = durationSec / Math.max(1, chars.length);
  return {
    characters: chars,
    characterStartTimesSeconds: chars.map((_, idx) => Number((idx * step).toFixed(4))),
    characterEndTimesSeconds: chars.map((_, idx) => Number(((idx + 1) * step).toFixed(4)))
  };
}
