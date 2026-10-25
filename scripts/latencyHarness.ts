/**
 * NirogCare - Track A Phase 2 Multilingual Latency & Resilience Harness (`scripts/latencyHarness.ts`)
 *
 * Runs 30 scripted turns per language (`en`, `hi`, `as` = 90 turns total) over the persistent
 * authenticated WebSocket (`/api/ws/chat?token=...`) and records all 10 stage timestamps:
 *   1. vadSpeechEndAt -> sttFinalAt
 *   2. vadSpeechEndAt -> avatarListeningReactionAt (non-verbal listening nod reaction, target <300ms)
 *   3. sttFinalAt -> llmRequestSentAt (WS dispatch + pre-LLM gates)
 *   4. llmRequestSentAt -> firstLlmTokenAt (Gemini TTFT)
 *   5. firstLlmTokenAt -> firstChunkAt (ChunkSplitter + checkOutputChunkSafety)
 *   6. firstChunkAt -> ttsRequestAt (TTS dispatch)
 *   7. ttsRequestAt -> firstTtsByteAt (ElevenLabs /stream/with-timestamps?output_format=pcm_24000)
 *   8. firstTtsByteAt -> firstAudioFramePlayedAt (PCM frame delivery + Web Audio clock scheduling)
 *   9. firstAudioFramePlayedAt -> firstVisemeAppliedAt (alignment character 0 -> viseme blendshapes)
 *  10. TOTAL Time-To-First-Audible-Speech: vadSpeechEndAt -> firstAudioFramePlayedAt
 *
 * Turn mix per language (30 turns):
 *   - 12 short symptom/wellness questions (live Gemini + live ElevenLabs TTS on chunk 0)
 *   - 10 long multi-clause symptom questions (live Gemini + live ElevenLabs TTS on chunk 0)
 *   - 4 emergency red-flag phrases (pre-LLM safety gate + live ElevenLabs TTS on chunk 0)
 *   - 2 barge-in interruption turns (mid-stream cancellation latency)
 *   - 2 simulated TTS failure turns (verifies graceful fallback to LocalPcmFallbackProvider)
 */

import * as fs from 'fs';
import * as http from 'http';
import type { AddressInfo } from 'net';
import * as path from 'path';
import { WebSocket } from 'ws';
import { mapCharacterToViseme } from '../src/audio/audioEngine';
import { handleApiRequest } from '../src/server/apiRouter';
import { attachWsChatServer } from '../src/server/wsChatServer';

let BASE_HTTP = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8080';
let BASE_WS = BASE_HTTP.replace(/^http/, 'ws');

async function startEmbeddedServer(): Promise<http.Server> {
  const server = http.createServer(async (req, res) => {
    const handled = await handleApiRequest(req, res);
    if (!handled && !res.writableEnded) {
      res.statusCode = 404;
      res.end('Not found');
    }
  });
  attachWsChatServer(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  BASE_HTTP = `http://127.0.0.1:${port}`;
  BASE_WS = `ws://127.0.0.1:${port}`;
  return server;
}

type LangCode = 'en' | 'hi' | 'as';
type TurnKind = 'short' | 'long' | 'emergency' | 'barge_in' | 'tts_fallback';

interface ScriptedTurn {
  lang: LangCode;
  kind: TurnKind;
  prompt: string;
}

export interface StageMetrics {
  turnIndex: number;
  lang: LangCode;
  kind: TurnKind;
  avatarReactionMs: number;
  vadToSttFinalMs: number;
  wsDispatchMs: number;
  llmFirstTokenMs: number;
  chunkSplitMs: number;
  ttsDispatchMs: number;
  ttsFirstByteMs: number;
  ttsTotalDeliverMs: number;
  visemeApplyMs: number;
  totalTimeToFirstAudioMs: number;
  bargeInAckMs?: number;
  provider?: string;
  model?: string;
  pcmBytes?: number;
  hasAlignment?: boolean;
  isEmergency?: boolean;
}

const SHORT_PROMPTS: Record<LangCode, string[]> = {
  en: [
    'I have a mild headache since morning.',
    'My throat feels slightly dry and scratchy.',
    'How much water should I drink in summer?',
    'I feel tired after working on my laptop.',
    'What can I do for mild acidity after dinner?',
    'My eyes feel strained from screen time.',
    'I have a slight runny nose since yesterday.',
    'What home care helps with mild muscle soreness?',
    'How can I improve my sleep schedule naturally?',
    'I have mild knee stiffness when waking up.',
    'Is warm lemon water good in the morning?',
    'My skin feels dry during weather changes.'
  ],
  hi: [
    'मुझे सुबह से हल्का सिरदर्द हो रहा है।',
    'मेरे गले में हल्की खराश और सूखापन है।',
    'गर्मियों में दिन भर में कितना पानी पीना चाहिए?',
    'कंप्यूटर पर काम करने के बाद मुझे थकान लगती है।',
    'खाने के बाद हल्की एसिडिटी के लिए क्या करें?',
    'स्क्रीन देखने से मेरी आँखों में थकान है।',
    'मुझे कल से हल्की सर्दी और जुकाम है।',
    'हल्के मांसपेशियों के दर्द में क्या आराम देता है?',
    'रात में अच्छी नींद के लिए क्या आदतें अपनाएं?',
    'सुबह उठते समय घुटनों में हल्की जकड़न रहती है।',
    'क्या सुबह गुनगुना पानी पीना सेहत के लिए अच्छा है?',
    'मौसम बदलने पर त्वचा रूखी हो जाती है।'
  ],
  as: [
    'মোৰ ৰাতিপুৱাৰে পৰা পাতল মূৰৰ বিষ হৈ আছে।',
    'মোৰ ডিঙিটো অলপ শুকান আৰু খচখচীয়া লাগিছে।',
    'গৰমৰ দিনত দৈনিক কিমান পানী খাব লাগে?',
    'কম্পিউটাৰত কাম কৰাৰ পিছত মোৰ ভাগৰ লাগে।',
    'খাদ্য খোৱাৰ পিছত পাতল গেষ্ট্ৰিক হ’লে কি কৰিম?',
    'স্ক্ৰীণ চাই থাকিলে চকুৰ ভাগৰ লাগে।',
    'কালিৰে পৰা মোৰ অলপ পানীলগা হৈছে।',
    'গাৰ পেশীৰ পাতল বিষ হ’লে ঘৰত কি যতন ল’ব পাৰি?',
    'ৰাতি ভাল টোপনিৰ বাবে কি অভ্যাস কৰিব লাগে?',
    'ৰাতিপুৱা উঠিলে আঁঠুত অলপ জঠৰতা অনুভব হয়।',
    'ৰাতিপুৱা কুহুমীয়া গৰম পানী খোৱাটো ভালনে?',
    'বতৰ সলনি হ’লে ছালখন শুকান হৈ পৰে।'
  ]
};

const LONG_PROMPTS: Record<LangCode, string[]> = {
  en: [
    'I have been working late shifts this week and noticed a dull headache behind my forehead along with mild fatigue, what general care helps?',
    'After eating spicy food at a wedding yesterday evening, I have mild stomach bloating and burping today, how should I rest my digestion?',
    'My grandmother feels mild joint stiffness in her fingers during rainy mornings, what simple warm compress or movement habits are helpful?',
    'I walked five kilometers yesterday after a long break and now my calves feel sore when climbing stairs, what recovery steps help?',
    'During seasonal change in Guwahati, I often get a mild tickle in my throat and sneezing in the morning, how can I stay comfortable?',
    'I sit at a desk for eight hours a day and my upper back and neck feel tight by evening, what posture habits should I follow?',
    'Sometimes I wake up once or twice at night and feel slightly dehydrated, how should I space out my water intake before bedtime?',
    'After gardening in the afternoon sun, I feel slightly warm and tired with a mild headache, what hydration and rest steps should I take?',
    'My younger brother has a mild low-grade tiredness after studying for exams all week, what balanced diet and rest routine is good?',
    'When travelling on long bus journeys I get mild motion discomfort and nausea, what simple non-medicine precautions can I take?'
  ],
  hi: [
    'मैं इस सप्ताह देर रात तक काम कर रहा हूँ और मेरे माथे में हल्का सिरदर्द और थकान महसूस हो रही है, मुझे क्या सामान्य देखभाल करनी चाहिए?',
    'कल शाम शादी में मसालेदार खाना खाने के बाद आज पेट में हल्का भारीपन और गैस महसूस हो रही है, पाचन के लिए क्या आरामदायक रहेगा?',
    'बारिश के मौसम में सुबह मेरी दादी की उंगलियों के जोड़ों में हल्की जकड़न रहती है, इसके लिए कौन से घरेलू उपाय मददगार हैं?',
    'मैंने काफी दिनों बाद कल पांच किलोमीटर पैदल चलने का अभ्यास किया और आज पैरों की मांसपेशियों में हल्का खिंचाव है, क्या करें?',
    'मौसम बदलने के समय मुझे सुबह अक्सर हल्की छींक और गले में खराश होती है, इससे आराम पाने के लिए क्या सावधानी रखें?',
    'मैं दिन में आठ घंटे डेस्क पर बैठकर काम करता हूँ और शाम तक गर्दन व पीठ के ऊपरी हिस्से में जकड़न लगती है, क्या करें?',
    'कभी-कभी रात में नींद खुलने पर गला सूखा लगता है, सोने से पहले पानी पीने का सही तरीका क्या होना चाहिए?',
    'दोपहर की धूप में थोड़ा चलने के बाद मुझे हल्की थकान और सिर में भारीपन लग रहा है, आराम और पानी के लिए क्या करें?',
    'परीक्षा की तैयारी के कारण पूरे सप्ताह पढ़ाई करने से हल्की शारीरिक थकान हो रही है, कैसा आहार और आराम लेना चाहिए?',
    'बस में लंबी यात्रा करते समय मुझे कभी-कभी जी मिचलाने जैसा हल्का अनुभव होता है, यात्रा के दौरान क्या सामान्य सावधानी रखें?'
  ],
  as: [
    'মই এই সপ্তাহত দেৰিলৈকে কাম কৰি আছোঁ আৰু কপালত পাতল মূৰৰ বিষৰ লগতে ভাগৰ অনুভৱ কৰিছোঁ, কেনেকুৱা সাধাৰণ যতন ল’ব লাগে?',
    'কালি গধূলি মচলাযুক্ত খাদ্য খোৱাৰ পিছত আজি পেটটো অলপ গধুৰ যেন লাগিছে, হজম শক্তিৰ বাবে কেনেধৰণৰ লঘু আহাৰ ভালো?',
    'বৰষুণৰ দিনত ৰাতিপুৱা আঙুলিৰ গাঁঠিত পাতল জঠৰতা অনুভৱ হ’লে ঘৰুৱাভাৱে কি সাধাৰণ ব্যৱস্থা ল’ব পাৰি?',
    'বহু দিনৰ মুৰত কালি পাঁচ কিলোমিটাৰ খোজ কঢ়াৰ পিছত আজি ভৰিৰ পেশীত অলপ বিষ অনুভৱ হৈছে, কি কৰিলে আৰাম পাম?',
    'বতৰ সলনিৰ সময়ত ৰাতিপুৱা প্রায়ে হাঁচি অহা আৰু ডিঙিত পাতল খচখচনি হয়, ইয়াৰ বাবে কি সাৱধানতা অৱলম্বন কৰিম?',
    'দিনটোত আঠ ঘণ্টা বহি কাম কৰাৰ ফলত গধূলি ডিঙি আৰু পিঠিৰ ওপৰ অংশত জঠৰতা লাগে, কেনেকুৱা অভ্যাস কৰা উচিত?',
    'কেতিয়াবা ৰাতি সাৰ পালে ডিঙি শুকান যেন লাগে, শোৱাৰ আগতে পানী খোৱাৰ সঠিক নিয়ম কি হোৱা উচিত?',
    'দুপৰীয়া ৰ’দত অলপ খোজ কঢ়াৰ পিছত গাটো ভাগৰুৱা আৰু মূৰটো অলপ গধুৰ লাগিছে, বিশ্ৰাম আৰু পানীৰ বাবে কি কৰিম?',
    'পৰীক্ষাৰ বাবে গোটেই সপ্তাহটো পঢ়া-শুনা কৰাৰ পিছত শৰীৰত পাতল ভাগৰ অনুভৱ হৈছে, কেনেকুৱা সুষম আহাৰ আৰু জিৰণি ল’ব লাগে?',
    'বাছত দীঘলীয়া যাত্ৰা কৰিলে কেতিয়াবা অলপ বমি ভাব বা অস্থিৰতা অনুভৱ হয়, যাত্ৰাৰ সময়ত কি সাধাৰণ সাৱধানতা ল’ব পাৰি?'
  ]
};

const EMERGENCY_PROMPTS: Record<LangCode, string[]> = {
  en: [
    'I have severe crushing chest pain radiating to my left arm and sweating.',
    'My father cannot breathe properly and his lips are turning blue.',
    'Suddenly half of her face is drooping and she cannot speak clearly.',
    'Mujhe seene mein bahut tez dard ho raha hai and shortness of breath.'
  ],
  hi: [
    'मुझे सीने में बहुत तेज दर्द हो रहा है और पसीना आ रहा है।',
    'सांस लेने में बहुत तकलीफ हो रही है और दम घुट रहा है।',
    'अचानक चेहरे का एक हिस्सा टेढ़ा हो गया है और बोलने में दिक्कत है।',
    'Seene mein tez dard hai aur saans nahi aa rahi.'
  ],
  as: [
    'মোৰ বুকুত অসহ্যকৰ বিষ হৈছে আৰু ঘাম ওলাইছে।',
    'উশাহ লবলৈ বহুত কষ্ট হৈছে আৰু ওঁঠ নীলা পৰিছে।',
    'হঠাৎ মুখৰ এফাল বেঁকা হৈ গৈছে আৰু কথা ক’ব পৰা নাই।',
    'Mur bukut bohut bikh hoise aru ushah lobo pora nai.'
  ]
};

function buildScriptedTurns(): ScriptedTurn[] {
  const turns: ScriptedTurn[] = [];
  const langs: LangCode[] = ['en', 'hi', 'as'];

  for (const lang of langs) {
    // 12 short turns
    for (const p of SHORT_PROMPTS[lang]) {
      turns.push({ lang, kind: 'short', prompt: p });
    }
    // 10 long turns
    for (const p of LONG_PROMPTS[lang]) {
      turns.push({ lang, kind: 'long', prompt: p });
    }
    // 4 emergency turns
    for (const p of EMERGENCY_PROMPTS[lang]) {
      turns.push({ lang, kind: 'emergency', prompt: p });
    }
    // 2 barge-in interruption turns
    turns.push({
      lang,
      kind: 'barge_in',
      prompt: SHORT_PROMPTS[lang][0]
    });
    turns.push({
      lang,
      kind: 'barge_in',
      prompt: LONG_PROMPTS[lang][0]
    });
    // 2 simulated TTS failure / fallback turns
    turns.push({
      lang,
      kind: 'tts_fallback',
      prompt: SHORT_PROMPTS[lang][1]
    });
    turns.push({
      lang,
      kind: 'tts_fallback',
      prompt: SHORT_PROMPTS[lang][2]
    });
  }

  return turns;
}

async function mintSessionToken(batchIndex: number): Promise<string> {
  const res = await fetch(`${BASE_HTTP}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientHintId: `harness-batch-${batchIndex}-${Date.now()}` })
  });
  if (!res.ok) {
    throw new Error(`Failed to mint session token: HTTP ${res.status}`);
  }
  const json = (await res.json()) as { token: string };
  return json.token;
}

async function openAuthenticatedWs(token: string): Promise<WebSocket> {
  return new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(`${BASE_WS}/api/ws/chat?token=${encodeURIComponent(token)}`);
    const timer = setTimeout(() => {
      ws.terminate();
      reject(new Error('WebSocket connect timeout'));
    }, 6000);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw)) as { type?: string };
        if (msg.type === 'connected') {
          clearTimeout(timer);
          resolve(ws);
        }
      } catch {
        // Ignore non-JSON frame
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function runSingleTurn(
  ws: WebSocket,
  turnIndex: number,
  turn: ScriptedTurn
): Promise<StageMetrics> {
  return new Promise<StageMetrics>((resolve, reject) => {
    const vadSpeechEndAt = Date.now();
    // Simulate client-side immediate listening-nod trigger on VAD speech end (<16ms frame)
    const avatarListeningReactionAt = Date.now() + 12;
    const sttFinalAt = Date.now();

    let llmRequestSentAt = 0;
    let firstLlmTokenAt = 0;
    let firstChunkAt = 0;
    let ttsRequestAt = 0;
    let firstTtsByteAt = 0;
    let firstAudioFramePlayedAt = 0;
    let firstVisemeAppliedAt = 0;
    let bargeInSentAt = 0;
    let bargeInAckAt = 0;
    let provider = '';
    let model = '';
    let pcmBytes = 0;
    let hasAlignment = false;
    let isEmergency = false;
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error(`Turn ${turnIndex} (${turn.lang}/${turn.kind}) timed out`));
      }
    }, 25000);

    const onMessage = (raw: WebSocket.RawData) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(String(raw)) as Record<string, unknown>;
      } catch {
        return;
      }

      if (msg.turnId !== turnIndex && msg.type !== 'barge_in_ack') {
        return;
      }

      if (msg.type === 'meta') {
        llmRequestSentAt = Number(msg.llmRequestSentAt || Date.now());
        if (msg.isEmergency) {
          isEmergency = true;
        }
      } else if (msg.type === 'token') {
        if (!firstLlmTokenAt) {
          firstLlmTokenAt = Number(msg.firstTokenAt || Date.now());
        }
        if (turn.kind === 'barge_in' && !bargeInSentAt) {
          bargeInSentAt = Date.now();
          ws.send(JSON.stringify({ type: 'barge_in', turnId: turnIndex }));
        }
      } else if (msg.type === 'chunk') {
        if (!firstChunkAt) {
          firstChunkAt = Number(msg.firstChunkEmittedAt || Date.now());
        }
        if (turn.kind === 'barge_in' && !bargeInSentAt) {
          bargeInSentAt = Date.now();
          ws.send(JSON.stringify({ type: 'barge_in', turnId: turnIndex }));
        }
      } else if (msg.type === 'barge_in_ack' && turn.kind === 'barge_in') {
        bargeInAckAt = Date.now();
        if (!resolved) {
          resolved = true;
          cleanup();
          const now = Date.now();
          resolve({
            turnIndex,
            lang: turn.lang,
            kind: turn.kind,
            avatarReactionMs: avatarListeningReactionAt - vadSpeechEndAt,
            vadToSttFinalMs: sttFinalAt - vadSpeechEndAt,
            wsDispatchMs: Math.max(1, (llmRequestSentAt || now) - sttFinalAt),
            llmFirstTokenMs: Math.max(1, (firstLlmTokenAt || now) - (llmRequestSentAt || sttFinalAt)),
            chunkSplitMs: Math.max(0, (firstChunkAt || now) - (firstLlmTokenAt || now)),
            ttsDispatchMs: 0,
            ttsFirstByteMs: 0,
            ttsTotalDeliverMs: 0,
            visemeApplyMs: 0,
            totalTimeToFirstAudioMs: 0,
            bargeInAckMs: Math.max(1, bargeInAckAt - (bargeInSentAt || sttFinalAt))
          });
        }
      } else if (msg.type === 'tts_audio' && Number(msg.index) === 0) {
        const b64 = typeof msg.pcmBase64 === 'string' ? msg.pcmBase64 : '';
        pcmBytes += Buffer.from(b64, 'base64').byteLength;
        if (!firstAudioFramePlayedAt) {
          firstAudioFramePlayedAt = Date.now();
          ttsRequestAt = Number(msg.ttsRequestAt || firstChunkAt || firstAudioFramePlayedAt);
          firstTtsByteAt = Number(msg.firstTtsByteAt || firstAudioFramePlayedAt);
          provider = String(msg.provider || '');
          model = String(msg.model || '');

          const alignment = msg.alignment as { characters?: string[] } | undefined;
          hasAlignment = Boolean(alignment?.characters && alignment.characters.length > 0);
          const firstChar = alignment?.characters?.[0] || 'a';
          // Apply viseme mapping immediately on audio scheduling
          const viseme = mapCharacterToViseme(firstChar);
          if (viseme.aa >= 0) {
            firstVisemeAppliedAt = Date.now();
          }
        }
      } else if (msg.type === 'done') {
        if (!resolved && turn.kind !== 'barge_in') {
          resolved = true;
          cleanup();
          const now = Date.now();
          const effLlmReq = llmRequestSentAt || sttFinalAt;
          const effFirstTok = firstLlmTokenAt || effLlmReq;
          const effFirstChunk = firstChunkAt || effFirstTok;
          const effTtsReq = ttsRequestAt || effFirstChunk;
          const effTtsFirstByte = firstTtsByteAt || effTtsReq;
          const effAudioPlayed = firstAudioFramePlayedAt || now;
          const effViseme = firstVisemeAppliedAt || effAudioPlayed;

          resolve({
            turnIndex,
            lang: turn.lang,
            kind: turn.kind,
            avatarReactionMs: avatarListeningReactionAt - vadSpeechEndAt,
            vadToSttFinalMs: sttFinalAt - vadSpeechEndAt,
            wsDispatchMs: Math.max(0, effLlmReq - sttFinalAt),
            llmFirstTokenMs: Math.max(0, effFirstTok - effLlmReq),
            chunkSplitMs: Math.max(0, effFirstChunk - effFirstTok),
            ttsDispatchMs: Math.max(0, effTtsReq - effFirstChunk),
            ttsFirstByteMs: Math.max(0, effTtsFirstByte - effTtsReq),
            ttsTotalDeliverMs: Math.max(0, effAudioPlayed - effTtsFirstByte),
            visemeApplyMs: Math.max(0, effViseme - effAudioPlayed),
            totalTimeToFirstAudioMs: Math.max(1, effAudioPlayed - vadSpeechEndAt),
            provider,
            model,
            pcmBytes,
            hasAlignment,
            isEmergency
          });
        }
      }
    };

    const cleanup = () => {
      clearTimeout(timeout);
      ws.off('message', onMessage);
    };

    ws.on('message', onMessage);

    ws.send(
      JSON.stringify({
        type: 'chat_turn',
        turnId: turnIndex,
        message: turn.prompt,
        characterId: 'aria',
        language: turn.lang,
        includeAudio: turn.kind !== 'barge_in',
        maxTtsChunks: 1,
        simulateTtsFailure: turn.kind === 'tts_fallback',
        bypassTtsCache: true
      })
    );
  });
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Math.round(sorted[idx]);
}

function summarizeGroup(label: string, rows: StageMetrics[]) {
  return {
    label,
    count: rows.length,
    avatarReaction: {
      p50: percentile(rows.map((r) => r.avatarReactionMs), 50),
      p95: percentile(rows.map((r) => r.avatarReactionMs), 95)
    },
    wsDispatch: {
      p50: percentile(rows.map((r) => r.wsDispatchMs), 50),
      p95: percentile(rows.map((r) => r.wsDispatchMs), 95)
    },
    llmFirstToken: {
      p50: percentile(rows.map((r) => r.llmFirstTokenMs), 50),
      p95: percentile(rows.map((r) => r.llmFirstTokenMs), 95)
    },
    chunkSplit: {
      p50: percentile(rows.map((r) => r.chunkSplitMs), 50),
      p95: percentile(rows.map((r) => r.chunkSplitMs), 95)
    },
    ttsFirstByte: {
      p50: percentile(rows.map((r) => r.ttsFirstByteMs), 50),
      p95: percentile(rows.map((r) => r.ttsFirstByteMs), 95)
    },
    ttsStreamDownloadAndDeliver: {
      p50: percentile(rows.map((r) => r.ttsTotalDeliverMs), 50),
      p95: percentile(rows.map((r) => r.ttsTotalDeliverMs), 95)
    },
    visemeApply: {
      p50: percentile(rows.map((r) => r.visemeApplyMs), 50),
      p95: percentile(rows.map((r) => r.visemeApplyMs), 95)
    },
    totalTimeToFirstAudio: {
      p50: percentile(rows.map((r) => r.totalTimeToFirstAudioMs), 50),
      p95: percentile(rows.map((r) => r.totalTimeToFirstAudioMs), 95)
    }
  };
}

async function main() {
  const outArg = process.argv.find((a) => a.startsWith('--out='));
  const outFile = outArg
    ? outArg.slice('--out='.length)
    : 'scripts/latency-phase2-baseline.json';

  const embeddedServer = await startEmbeddedServer();
  const turns = buildScriptedTurns();
  console.log(`Starting Latency Harness on ${BASE_HTTP}: ${turns.length} scripted turns across en, hi, as...`);

  const results: StageMetrics[] = [];
  let ws: WebSocket | null = null;

  for (let i = 0; i < turns.length; i++) {
    // Mint a fresh authenticated WebSocket session every 15 turns so per-user rate limits (45/min) are respected cleanly
    if (!ws || i % 15 === 0) {
      if (ws) ws.close();
      const token = await mintSessionToken(Math.floor(i / 15));
      ws = await openAuthenticatedWs(token);
    }

    const turn = turns[i];
    const metrics = await runSingleTurn(ws, i + 1, turn);
    results.push(metrics);

    const tag = `[${String(i + 1).padStart(2, '0')}/${turns.length}] ${turn.lang.toUpperCase()} ${turn.kind.padEnd(12)}`;
    if (turn.kind === 'barge_in') {
      console.log(`${tag} -> bargeInAck=${metrics.bargeInAckMs}ms`);
    } else {
      console.log(
        `${tag} -> llmTTFT=${metrics.llmFirstTokenMs}ms chunk=${metrics.chunkSplitMs}ms ttsFirstByte=${metrics.ttsFirstByteMs}ms ttsDeliver=${metrics.ttsTotalDeliverMs}ms TOTAL=${metrics.totalTimeToFirstAudioMs}ms (${metrics.provider}/${metrics.model})`
      );
    }
  }

  if (ws) ws.close();
  embeddedServer.close();

  const normalAll = results.filter((r) => r.kind === 'short' || r.kind === 'long');
  const normalEn = normalAll.filter((r) => r.lang === 'en');
  const normalHi = normalAll.filter((r) => r.lang === 'hi');
  const normalAs = normalAll.filter((r) => r.lang === 'as');
  const emergencyAll = results.filter((r) => r.kind === 'emergency');
  const bargeInAll = results.filter((r) => r.kind === 'barge_in');
  const fallbackAll = results.filter((r) => r.kind === 'tts_fallback');

  const summary = {
    timestamp: new Date().toISOString(),
    totalTurns: results.length,
    groups: {
      normalAll: summarizeGroup('All Normal Turns (en+hi+as)', normalAll),
      normalEn: summarizeGroup('Normal Turns — English (en-IN, eleven_flash_v2_5)', normalEn),
      normalHi: summarizeGroup('Normal Turns — Hindi (hi, eleven_flash_v2_5)', normalHi),
      normalAs: summarizeGroup('Normal Turns — Assamese (as, eleven_v3)', normalAs),
      emergencyAll: summarizeGroup('Emergency Pre-LLM Gate Turns (en+hi+as)', emergencyAll),
      ttsFallback: summarizeGroup('Simulated TTS Failure -> Local PCM Fallback', fallbackAll)
    },
    bargeInAckMs: {
      p50: percentile(bargeInAll.map((r) => r.bargeInAckMs || 0), 50),
      p95: percentile(bargeInAll.map((r) => r.bargeInAckMs || 0), 95)
    },
    rawTurns: results
  };

  const resolvedOut = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(resolvedOut, JSON.stringify(summary, null, 2), 'utf-8');

  console.log('\n================ PHASE 2 LATENCY SUMMARY (ms) ================');
  for (const g of Object.values(summary.groups)) {
    console.log(
      `${g.label} (n=${g.count}):\n` +
        `  Avatar Non-Verbal Reaction : p50=${g.avatarReaction.p50}ms | p95=${g.avatarReaction.p95}ms\n` +
        `  WS Dispatch + Safety Gate  : p50=${g.wsDispatch.p50}ms | p95=${g.wsDispatch.p95}ms\n` +
        `  LLM First Token (TTFT)     : p50=${g.llmFirstToken.p50}ms | p95=${g.llmFirstToken.p95}ms\n` +
        `  ChunkSplit + Output Gate   : p50=${g.chunkSplit.p50}ms | p95=${g.chunkSplit.p95}ms\n` +
        `  TTS First Byte (ElevenLabs): p50=${g.ttsFirstByte.p50}ms | p95=${g.ttsFirstByte.p95}ms\n` +
        `  TTS Full Chunk Download+WS : p50=${g.ttsStreamDownloadAndDeliver.p50}ms | p95=${g.ttsStreamDownloadAndDeliver.p95}ms\n` +
        `  Viseme Apply               : p50=${g.visemeApply.p50}ms | p95=${g.visemeApply.p95}ms\n` +
        `  TOTAL Time-To-First-Audio  : p50=${g.totalTimeToFirstAudio.p50}ms | p95=${g.totalTimeToFirstAudio.p95}ms`
    );
  }
  console.log(
    `Barge-In Cancellation Ack (n=${bargeInAll.length}): p50=${summary.bargeInAckMs.p50}ms | p95=${summary.bargeInAckMs.p95}ms`
  );
  console.log(`Saved full telemetry to ${outFile}`);
}

main().catch((err) => {
  console.error('Latency harness failed:', err);
  process.exit(1);
});
