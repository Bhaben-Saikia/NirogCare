/**
 * NirogCare Server - Persistent Authenticated WebSocket Streaming Pipeline (`src/server/wsChatServer.ts`)
 *
 * Responsibilities:
 * 1. Authenticates every WebSocket connection (`/api/ws/chat?token=...`) via `verifySessionToken`.
 * 2. Pre-warms upstream Gemini and ElevenLabs connections when a client connects.
 * 3. Runs pre-LLM `detectRedFlags`, `checkRateLimit`, `stripPII`, `ChunkSplitter`, and
 *    `checkOutputChunkSafety` for every turn.
 * 4. Streams both text tokens/chunks AND 24kHz PCM audio + character alignment frames over the
 *    persistent WebSocket, and supports instant server-side cancellation on `{ type: 'barge_in' }`.
 */

import type { IncomingMessage, Server as HttpServer } from 'http';
import type { Duplex } from 'stream';
import { WebSocketServer, WebSocket } from 'ws';
import { verifySessionToken, prewarmUpstreamConnections } from './authSession';
import { detectRedFlags } from './redFlags';
import { detectPromptInjection, resolveEffectiveLanguage } from './promptGuard';
import { checkRateLimit, recordGeminiTokenUsage } from './rateLimiter';
import { stripPII } from './piiStripper';
import { getCharacterById, getLanguageByCode } from '../config/characters';
import { ChunkSplitter, checkOutputChunkSafety, sanitizeStreamDelta } from './chunkSplitter';
import { synthesizeSpeechBuffer } from './ttsBackend';
import { buildOfflineClinicalReply } from './offlineClinicalFallback';
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
    // Ignore .env read error
  }
  return '';
}

interface WsClientMessage {
  type: 'chat_turn' | 'barge_in' | 'ping';
  turnId?: number;
  message?: string;
  characterId?: string;
  language?: string;
  includeAudio?: boolean;
  preferFreeVoice?: boolean;
  maxTtsChunks?: number;
  simulateTtsFailure?: boolean;
  bypassTtsCache?: boolean;
  history?: Array<{ role: 'user' | 'model' | 'assistant'; text: string }>;
}

const attachedServers = new WeakSet<HttpServer>();

const FAST_FLASH_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemma-4-26b-a4b-it'
] as const;

const modelCooldownUntil = new Map<string, number>();

function getPrioritizedFlashModels(): string[] {
  const now = Date.now();
  const available: string[] = [];
  const fallback: string[] = [];

  for (const model of FAST_FLASH_MODELS) {
    const cooldown = modelCooldownUntil.get(model) || 0;
    if (now >= cooldown) {
      available.push(model);
    } else {
      fallback.push(model);
    }
  }
  return [...available, ...fallback];
}

function markModelCooldown(model: string, durationMs = 12_000): void {
  modelCooldownUntil.set(model, Date.now() + durationMs);
}

export function attachWsChatServer(httpServer: HttpServer): void {
  if (attachedServers.has(httpServer)) return;
  attachedServers.add(httpServer);

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const reqUrl = req.url || '';
    if (!reqUrl.startsWith('/api/ws/chat')) {
      return;
    }

    const parsedUrl = new URL(reqUrl, 'http://localhost');
    const queryToken = parsedUrl.searchParams.get('token');
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const authResult = verifySessionToken(queryToken || bearerToken);

    if (!authResult.valid) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, authResult.userId);
    });
  });

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage, userId: string) => {
    // Pre-warm upstream connections immediately on WebSocket connect
    prewarmUpstreamConnections().catch(() => {
      // Ignore prewarm network errors
    });

    let activeAbortController: AbortController | null = null;
    let activeTurnId = 0;

    const sendJson = (payload: Record<string, unknown>) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    };

    sendJson({ type: 'connected', userId });

    ws.on('message', async (rawData) => {
      let msg: WsClientMessage;
      try {
        msg = JSON.parse(String(rawData)) as WsClientMessage;
      } catch {
        sendJson({ type: 'error', error: 'INVALID_JSON' });
        return;
      }

      if (msg.type === 'ping') {
        sendJson({ type: 'pong', time: Date.now() });
        return;
      }

      if (msg.type === 'barge_in') {
        activeTurnId += 1;
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        sendJson({ type: 'barge_in_ack', turnId: msg.turnId ?? activeTurnId });
        return;
      }

      if (msg.type === 'chat_turn') {
        if (activeAbortController) {
          activeAbortController.abort();
        }
        const turnController = new AbortController();
        activeAbortController = turnController;
        const turnId = typeof msg.turnId === 'number' ? msg.turnId : ++activeTurnId;
        activeTurnId = turnId;

        await handleWsChatTurn({
          ws,
          sendJson,
          userId,
          turnId,
          msg,
          signal: turnController.signal,
          isCurrentTurn: () => activeTurnId === turnId && !turnController.signal.aborted
        });
      }
    });

    ws.on('close', () => {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }
    });
  });
}

async function handleWsChatTurn(params: {
  ws: WebSocket;
  sendJson: (payload: Record<string, unknown>) => void;
  userId: string;
  turnId: number;
  msg: WsClientMessage;
  signal: AbortSignal;
  isCurrentTurn: () => boolean;
}): Promise<void> {
  const { sendJson, userId, turnId, msg, signal, isCurrentTurn } = params;
  const rawUserMessage = (msg.message || '').trim();
  const character = getCharacterById(msg.characterId || 'aria');
  const effectiveLangCode = resolveEffectiveLanguage(rawUserMessage, msg.language || 'en');
  const langConfig = getLanguageByCode(effectiveLangCode);
  const includeAudio = msg.includeAudio !== false;

  if (!rawUserMessage) {
    sendJson({ type: 'error', turnId, message: 'Empty message' });
    return;
  }

  const redFlagLang: 'en-IN' | 'hi' | 'as' =
    langConfig.code === 'hi' ? 'hi' : langConfig.code === 'as' ? 'as' : 'en-IN';

  const ttsTasks: Promise<void>[] = [];
  let ttsChain: Promise<void> = Promise.resolve();

  const dispatchChunkAndAudio = (chunkText: string, idx: number, firstChunkEmittedAt: number) => {
    if (!isCurrentTurn()) return;
    sendJson({
      type: 'chunk',
      turnId,
      index: idx,
      text: chunkText,
      characterId: character.id,
      language: langConfig.code,
      firstChunkEmittedAt
    });

    if (includeAudio && (typeof msg.maxTtsChunks !== 'number' || idx < msg.maxTtsChunks)) {
      const task = ttsChain.then(async () => {
        if (!isCurrentTurn()) return;
        try {
          const ttsRes = await synthesizeSpeechBuffer({
            text: chunkText,
            characterId: character.id,
            language: langConfig.code,
            preferFreeVoice: msg.preferFreeVoice,
            simulateFailure: msg.simulateTtsFailure,
            bypassCache: msg.bypassTtsCache
          });
          if (!isCurrentTurn()) return;
          sendJson({
            type: 'tts_audio',
            turnId,
            index: idx,
            subIndex: 0,
            text: chunkText,
            pcmBase64: ttsRes.audioBuffer.toString('base64'),
            sampleRate: ttsRes.sampleRate,
            provider: ttsRes.provider,
            model: ttsRes.model,
            pitchCents: ttsRes.pitchCents,
            playbackRate: ttsRes.playbackRate,
            alignment: ttsRes.alignment,
            ttsRequestAt: ttsRes.ttsRequestAt,
            firstTtsByteAt: ttsRes.firstTtsByteAt
          });
        } catch {
          // Ignore aborted TTS task
        }
      });
      ttsChain = task.catch(() => {});
      ttsTasks.push(task);
    }
  };

  // GATE 1: Deterministic Pre-LLM Red-Flag Check
  const redFlag = detectRedFlags(rawUserMessage, redFlagLang);
  if (redFlag.isEmergency && redFlag.message) {
    const now = Date.now();
    const spokenEmergency = sanitizeStreamDelta(redFlag.message)
      .replace(/[•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    sendJson({
      type: 'meta',
      turnId,
      isEmergency: true,
      emergencyCategory: redFlag.category,
      llmRequestSentAt: now,
      firstTokenAt: now
    });
    sendJson({
      type: 'token',
      turnId,
      text: redFlag.message,
      firstTokenAt: now
    });

    const splitter = new ChunkSplitter();
    const chunks = [...splitter.push(spokenEmergency), ...splitter.flush()];
    chunks.forEach((c, idx) => dispatchChunkAndAudio(c, idx, now));
    await Promise.allSettled(ttsTasks);

    sendJson({
      type: 'done',
      turnId,
      fullText: redFlag.message,
      isEmergency: true,
      emergencyCategory: redFlag.category,
      characterId: character.id,
      language: langConfig.code
    });
    return;
  }

  // GATE 2: Deterministic Pre-LLM Prompt-Injection & Jailbreak Guard
  const injectionCheck = detectPromptInjection(rawUserMessage, langConfig.code);
  if (injectionCheck.isInjection && injectionCheck.safeReply) {
    const now = Date.now();
    sendJson({ type: 'meta', turnId, isEmergency: false, llmRequestSentAt: now, firstTokenAt: now });
    sendJson({ type: 'token', turnId, text: injectionCheck.safeReply, firstTokenAt: now });
    const splitter = new ChunkSplitter();
    const chunks = [...splitter.push(injectionCheck.safeReply), ...splitter.flush()];
    chunks.forEach((c, idx) => dispatchChunkAndAudio(c, idx, now));
    await Promise.allSettled(ttsTasks);
    sendJson({
      type: 'done',
      turnId,
      fullText: injectionCheck.safeReply,
      characterId: character.id,
      language: langConfig.code
    });
    return;
  }

  // GATE 2b: Per-User Rate Limit & Spend Cap
  const rateCheck = checkRateLimit(userId, rawUserMessage.length);
  if (!rateCheck.allowed) {
    const now = Date.now();
    const reply = rateCheck.reason || 'Rate limit exceeded.';
    sendJson({ type: 'token', turnId, text: reply, firstTokenAt: now });
    sendJson({ type: 'done', turnId, fullText: reply, error: 'RATE_LIMIT_EXCEEDED' });
    return;
  }

  // GATE 3: PII Stripping
  const { cleanText: userMessage } = stripPII(rawUserMessage);

  const systemInstruction = [
    `You are ${character.name}, an AI health assistant (NOT a doctor).`,
    langConfig.scriptInstruction,
    'Start with a 2 to 3 word warm acknowledgment followed by a comma, then give 1 to 2 brief spoken sentences (max 35 words). Never diagnose, prescribe dosages, or use markdown/lists.'
  ].join(' ');

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  if (msg.history && Array.isArray(msg.history)) {
    for (const h of msg.history.slice(-6)) {
      if (!h.text?.trim()) continue;
      contents.push({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: stripPII(h.text).cleanText }]
      });
    }
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const geminiKey =
    process.env.GEMINI_API_KEY ||
    getEnvVar('GEMINI_API_KEY') ||
    '';

  const llmRequestSentAt = Date.now();
  let firstTokenAt = 0;
  let firstChunkEmittedAt = 0;
  let fullReply = '';
  let chunkIndex = 0;
  let safetyCutTriggered = false;
  const splitter = new ChunkSplitter();

  sendJson({ type: 'meta', turnId, isEmergency: false, llmRequestSentAt });

  const validateAndEmit = (rawChunk: string): boolean => {
    if (!isCurrentTurn() || safetyCutTriggered) return false;
    const cleaned = sanitizeStreamDelta(rawChunk).replace(/\s+/g, ' ').trim();
    if (!cleaned) return true;

    const safety = checkOutputChunkSafety(cleaned, langConfig.code);
    if (!safety.safe && safety.fallbackText) {
      safetyCutTriggered = true;
      fullReply = safety.fallbackText;
      if (!firstChunkEmittedAt) firstChunkEmittedAt = Date.now();
      sendJson({ type: 'safety_replace', turnId, reason: safety.reason, text: safety.fallbackText });
      dispatchChunkAndAudio(safety.fallbackText, chunkIndex++, firstChunkEmittedAt);
      return false;
    }

    if (!firstChunkEmittedAt) firstChunkEmittedAt = Date.now();
    dispatchChunkAndAudio(cleaned, chunkIndex++, firstChunkEmittedAt);
    return true;
  };

  const streamingModels = getPrioritizedFlashModels();

  let streamSucceeded = false;

  if (geminiKey) {
    for (const modelName of streamingModels) {
      if (!isCurrentTurn() || safetyCutTriggered) break;
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${geminiKey}`;
        const genConfig: Record<string, unknown> = {
          temperature: 0.35,
          maxOutputTokens: 110,
          topP: 0.85
        };
        if (modelName.startsWith('gemini-3.') && modelName !== 'gemini-3.5-flash-lite') {
          genConfig.thinkingConfig = { thinkingLevel: 'MINIMAL' };
        }
        const geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: genConfig
          })
        });

        if (!geminiRes.ok || !geminiRes.body) {
          if (geminiRes.status === 429 || geminiRes.status === 503) {
            markModelCooldown(modelName, 12_000);
          }
          continue;
        }

        const reader = geminiRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let sseRemainder = '';

        while (isCurrentTurn() && !safetyCutTriggered) {
          const { done, value } = await reader.read();
          if (done) break;
          sseRemainder += decoder.decode(value, { stream: true });
          const lines = sseRemainder.split('\n');
          sseRemainder = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr) as {
                candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
              };
              const deltaRaw = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (!deltaRaw) continue;
              const delta = sanitizeStreamDelta(deltaRaw);
              if (!delta) continue;

              if (!firstTokenAt) {
                firstTokenAt = Date.now();
              }
              fullReply += delta;
              sendJson({ type: 'token', turnId, text: delta, firstTokenAt });

              const ready = splitter.push(delta);
              for (const c of ready) {
                if (!validateAndEmit(c)) {
                  await reader.cancel().catch(() => {});
                  break;
                }
              }
            } catch {
              // Ignore partial JSON line
            }
          }
        }

        if (fullReply.trim().length > 0) {
          if (!safetyCutTriggered && isCurrentTurn()) {
            for (const c of splitter.flush()) {
              validateAndEmit(c);
            }
          }
          streamSucceeded = true;
          recordGeminiTokenUsage(Math.ceil((userMessage.length + fullReply.length) / 4));
          break;
        }
      } catch {
        // Aborted or network error; try next model if turn is still active
      }
    }
  }

  if (!streamSucceeded && !safetyCutTriggered && isCurrentTurn()) {
    const now = Date.now();
    if (!firstTokenAt) firstTokenAt = now;
    const fallbackText = buildOfflineClinicalReply(userMessage, langConfig.code);
    fullReply = fallbackText;
    sendJson({ type: 'token', turnId, text: fallbackText, firstTokenAt });
    const chunks = [...splitter.push(fallbackText), ...splitter.flush()];
    for (const c of chunks) {
      validateAndEmit(c);
    }
  }

  await Promise.allSettled(ttsTasks);

  if (isCurrentTurn()) {
    sendJson({
      type: 'done',
      turnId,
      fullText: fullReply.trim(),
      characterId: character.id,
      language: langConfig.code,
      llmRequestSentAt,
      firstTokenAt,
      firstChunkEmittedAt
    });
  }
}
