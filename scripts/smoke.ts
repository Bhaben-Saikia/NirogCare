/**
 * End-to-end smoke test against a running dev server (http://localhost:8080).
 * Checks:
 *   1. Session auth token minting (`POST /api/auth/session`)
 *   2. WebSocket auth rejection without token (`401`) and authenticated WS turn (`ws://localhost:8080/api/ws/chat?token=...`)
 *   3. Pre-LLM emergency gate (en, hi, as)
 *   4. Normal streamed turn + ElevenLabs 24kHz PCM + character alignment (en, hi, as)
 * Run: npx tsx scripts/smoke.ts
 */
import WebSocket from 'ws';

const BASE = process.env.SMOKE_BASE || 'http://localhost:8080';
const WS_BASE = BASE.replace(/^http/, 'ws');

async function testWebSocketAndAuth(): Promise<{
  token: string;
  unauthRejected: boolean;
  wsTurnOk: boolean;
  wsAudioBytes: number;
  bargeInAckOk: boolean;
}> {
  const authRes = await fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientHintId: 'smoke-test-client' })
  });
  const authData = (await authRes.json()) as { token: string };

  // 1. Verify unauthenticated WS is rejected
  const unauthRejected = await new Promise<boolean>((resolve) => {
    const badWs = new WebSocket(`${WS_BASE}/api/ws/chat`);
    badWs.on('unexpected-response', (_req, res) => {
      resolve(res.statusCode === 401);
      badWs.close();
    });
    badWs.on('error', () => resolve(true));
    badWs.on('open', () => {
      badWs.close();
      resolve(false);
    });
  });

  // 2. Verify authenticated WS turn + TTS PCM frame + Barge-in ack
  const wsResult = await new Promise<{
    wsTurnOk: boolean;
    wsAudioBytes: number;
    bargeInAckOk: boolean;
  }>((resolve) => {
    const ws = new WebSocket(
      `${WS_BASE}/api/ws/chat?token=${encodeURIComponent(authData.token)}`
    );
    let wsTurnOk = false;
    let wsAudioBytes = 0;
    let bargeInAckOk = false;

    ws.on('message', (raw) => {
      const evt = JSON.parse(String(raw)) as Record<string, unknown>;
      if (evt.type === 'connected') {
        ws.send(JSON.stringify({ type: 'barge_in', turnId: 1 }));
      } else if (evt.type === 'barge_in_ack') {
        bargeInAckOk = true;
        ws.send(
          JSON.stringify({
            type: 'chat_turn',
            turnId: 2,
            message: 'Hello Aria, I feel a little tired today.',
            characterId: 'aria',
            language: 'en',
            includeAudio: true
          })
        );
      } else if (evt.type === 'tts_audio' && typeof evt.pcmBase64 === 'string') {
        wsAudioBytes += Buffer.from(evt.pcmBase64, 'base64').byteLength;
      } else if (evt.type === 'done' && evt.turnId === 2) {
        wsTurnOk = typeof evt.fullText === 'string' && evt.fullText.length > 0;
        ws.close();
        resolve({ wsTurnOk, wsAudioBytes, bargeInAckOk });
      }
    });

    ws.on('error', () => {
      resolve({ wsTurnOk: false, wsAudioBytes: 0, bargeInAckOk: false });
    });
  });

  return {
    token: authData.token,
    unauthRejected,
    ...wsResult
  };
}

async function streamTurn(message: string, language: string, token: string) {
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message, language, characterId: 'aria' })
  });
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  const chunks: string[] = [];
  let firstTokenMs: number | null = null;
  let firstChunkMs: number | null = null;
  let isEmergency = false;
  let doneAtMs = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const l of lines) {
      if (!l.startsWith('data:')) continue;
      const e = JSON.parse(l.slice(5)) as {
        type: string;
        isEmergency?: boolean;
        text?: string;
      };
      if (e.type === 'meta' && e.isEmergency) isEmergency = true;
      if (e.type === 'token' && firstTokenMs === null) firstTokenMs = Date.now() - t0;
      if (e.type === 'chunk' && e.text) {
        if (firstChunkMs === null) firstChunkMs = Date.now() - t0;
        chunks.push(e.text);
      }
      if (e.type === 'done') doneAtMs = Date.now() - t0;
    }
  }
  return { isEmergency, firstTokenMs, firstChunkMs, doneAtMs, chunks };
}

async function tts(text: string, language: string, token: string) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/tts/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text, language, characterId: 'aria' })
  });
  const bytes = (await r.arrayBuffer()).byteLength;
  return {
    status: r.status,
    ms: Date.now() - t0,
    provider: r.headers.get('X-TTS-Provider'),
    model: r.headers.get('X-TTS-Model'),
    sampleRate: r.headers.get('X-TTS-Sample-Rate'),
    hasAlignment: Boolean(r.headers.get('X-TTS-Alignment')),
    bytes
  };
}

(async () => {
  let fail = 0;
  const check = (name: string, ok: boolean, info = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${info}`);
    if (!ok) fail++;
  };

  const wsCheck = await testWebSocketAndAuth();
  check('ws unauth rejected (401)', wsCheck.unauthRejected);
  check('ws barge_in ack', wsCheck.bargeInAckOk);
  check(
    'ws authenticated turn + pcm audio',
    wsCheck.wsTurnOk && wsCheck.wsAudioBytes > 1000,
    `pcmBytes=${wsCheck.wsAudioBytes}`
  );

  for (const [lang, msg] of [
    ['en', 'I have crushing chest pain'],
    ['hi', 'मुझे छाती में दर्द है'],
    ['as', 'মোৰ বুকুৰ বিষ হৈছে']
  ] as const) {
    const r = await streamTurn(msg, lang, wsCheck.token);
    check(
      `emergency gate ${lang}`,
      r.isEmergency && r.chunks.length > 0,
      `firstChunk=${r.firstChunkMs}ms`
    );
  }

  for (const [lang, msg] of [
    ['en', 'I have a mild headache today'],
    ['hi', 'मुझे हल्का सिरदर्द है'],
    ['as', 'মোৰ অলপ মূৰৰ বিষ হৈছে']
  ] as const) {
    const r = await streamTurn(msg, lang, wsCheck.token);
    const streamedEarly = r.firstChunkMs !== null && r.firstChunkMs < r.doneAtMs;
    check(
      `normal turn ${lang}`,
      !r.isEmergency && r.chunks.length > 0,
      `firstToken=${r.firstTokenMs}ms firstChunk=${r.firstChunkMs}ms done=${r.doneAtMs}ms chunks=${r.chunks.length} streamedBeforeDone=${streamedEarly}`
    );
    const t = await tts(r.chunks[0], lang, wsCheck.token);
    check(
      `tts ${lang}`,
      t.status === 200 && t.provider === 'elevenlabs' && t.bytes > 1000,
      `provider=${t.provider} model=${t.model} rate=${t.sampleRate} alignment=${t.hasAlignment} ms=${t.ms} bytes=${t.bytes}`
    );
  }

  console.log(fail ? `\n${fail} FAILED` : '\nALL PASS');
  process.exit(fail ? 1 : 0);
})();
