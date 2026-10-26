/**
 * NirogCare Server - Gemini AI Health Assistant Engine
 * Sole reasoning brain for all conversational responses.
 * Enforces pre-LLM red-flag safety, PII stripping, rate limits, and concise speakable formatting.
 */

import type { ServerResponse } from 'http';
import { detectRedFlags } from './redFlags';
import { detectPromptInjection, resolveEffectiveLanguage } from './promptGuard';
import { stripPII } from './piiStripper';
import { checkRateLimit, recordGeminiTokenUsage } from './rateLimiter';
import { getCharacterById, getLanguageByCode } from '../config/characters';
import { prewarmTtsChunk } from './ttsBackend';
import { ChunkSplitter, checkOutputChunkSafety, sanitizeStreamDelta } from './chunkSplitter';
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

export interface ChatRequestPayload {
  message: string;
  history?: Array<{ role: 'user' | 'model' | 'assistant'; text: string }>;
  language?: string; // 'en-IN' | 'hi' | 'as' or full name
  userId?: string;
}

export interface ChatResponsePayload {
  reply: string;
  languageCode: 'en-IN' | 'hi' | 'as';
  isEmergency: boolean;
  emergencyCategory?: string;
  piiStripped: boolean;
  error?: string;
}

const SYSTEM_PROMPT_TEMPLATES = {
  'en-IN': `You are NirogCare's AI Health Assistant — a friendly, compassionate wellness companion designed for Indian users.

IMPORTANT CLINICAL SAFETY BOUNDARIES:
1. You are an AI assistant, NOT a doctor or healthcare provider.
2. NEVER diagnose any disease, illness, or medical condition.
3. NEVER prescribe any medication, dosage, or pharmaceutical treatments.
4. Always provide general, evidence-based wellness guidance, home care tips, and explain common reasons for symptoms.
5. Emphasize when the user should visit a registered medical practitioner (MBBS/MD) or nearby Primary Health Centre (PHC).
6. Mention Jan Aushadhi Kendras for affordable generic medicines and Ayushman Bharat (PM-JAY) when relevant.

VOICE & AVATAR READINESS:
- Keep your answers concise (2-4 short paragraphs or bullet points).
- Your reply will be spoken aloud by a photoreal avatar: avoid complex markdown tables, asterisks, or unpronounceable characters.
- Use natural, polite Indian English phrasing.

End every clinical guidance answer with a brief reminder to consult a qualified clinician.`,

  'hi': `आप निजोगकेयर (NirogCare) के एआई स्वास्थ्य सहायक हैं — भारतीय उपयोगकर्ताओं के लिए एक मित्रवत, संवेदनशील स्वास्थ्य साथी।

महत्वपूर्ण चिकित्सीय सुरक्षा नियम:
1. आप एक एआई सहायक हैं, कोई डॉक्टर या वैद्य नहीं।
2. कभी भी किसी बीमारी का आधिकारिक निदान (Diagnosis) न करें।
3. कभी भी कोई दवा या खुराक (Prescription) न लिखें।
4. सामान्य स्वास्थ्य जानकारी, खान-पान, प्राथमिक उपचार और लक्षणों के सामान्य कारणों की सरल व्याख्या करें।
5. स्पष्ट बताएं कि डॉक्टर या नजदीकी स्वास्थ्य केंद्र (PHC/CHC) से कब संपर्क करना चाहिए।
6. उचित होने पर सस्ती जेनेरिक दवाओं के लिए 'जन औषधि केंद्र' और 'आयुष्मान भारत (PM-JAY)' का उल्लेख करें।

आवाज़ और अवतार के लिए अनुकूलता:
- उत्तर संक्षिप्त रखें (अधिकतम 2-3 छोटे पैराग्राफ या बिंदु)।
- यह उत्तर अवतार द्वारा बोला जाएगा, इसलिए जटिल टेबल, अत्यधिक चिह्न या कठिन प्रारूपण न करें।
- सरल और सहज हिंदी (खड़ी बोली) का प्रयोग करें।

हमेशा अंत में डॉक्टर से सलाह लेने की बात अवश्य कहें।`,

  'as': `আপুনি নিৰোগকেয়াৰ (NirogCare)ৰ এআই স্বাস্থ্য সহায়ক — অসমৰ আৰু ভাৰতৰ ব্যৱহাৰকাৰীসকলৰ বাবে এজন সহানুভূতিশীল স্বাস্থ্য সহযোগী।

গুৰুত্বপূৰ্ণ চিকিৎসা সুৰক্ষা নিৰ্দেশনা:
1. আপুনি এজন এআই সহায়ক, চিকিৎসক (Doctor) নহয়।
2. কোনো ৰোগৰ চূড়ান্ত নিদান (Diagnosis) নিদিব।
3. কোনো ঔষধ বা পালি (Prescription) নিৰ্ধাৰণ নকৰিব।
4. সাধাৰণ স্বাস্থ্যবিধি, ঘৰুৱা যতন আৰু লক্ষণসমূহৰ সাধাৰণ কাৰণসমূহ বুজাই দিয়ক।
5. ব্যৱহাৰকাৰীয়ে কেতিয়া চিকিৎসক বা ওচৰৰ প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰ (PHC)ত দেখুওৱা উচিত সেই বিষয়ে পৰামৰ্শ দিয়ক।
6. সুলভ মূল্যৰ ঔষধৰ বাবে জন ঔষধি কেন্দ্ৰ আৰু আয়ুষ্মান ভাৰতৰ বিষয়ে প্ৰাসংগিক হ'লে উল্লেখ কৰক।

আৱতাৰ আৰু কণ্ঠৰ বাবে উপযোগী:
- উত্তৰ চমু আৰু স্পষ্ট ৰাখক (২-৩ টা চুটি অনুচ্ছেদ বা বুলেট পইণ্ট)।
- এই উত্তৰটো আৱতাৰে মুখেৰে ক'ব, গতিকে জটিল তালিকা বা অপ্ৰয়োজনীয় চিহ্ন এৰাই চলক।
- সহজ, শুৱলা অসমীয়া ভাষা ব্যৱহাৰ কৰক।

উত্তৰৰ শেষত সদায় এজন পঞ্জীভুক্ত চিকিৎসকৰ পৰামৰ্শ লোৱাৰ আহ্বান জনাওক।`
};

export async function processHealthChat(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const userText = payload.message?.trim() || '';
  const userId = payload.userId || 'anonymous-user';
  const reqLang = (payload.language || 'en').toLowerCase();

  // Normalize language with automatic script and code-mixing detection
  let langCode: 'en-IN' | 'hi' | 'as' = 'en-IN';
  const hasDevanagari = /[\u0900-\u097F]/.test(userText);
  const hasBengaliAssamese = /[\u0980-\u09FF]/.test(userText);
  const isRomanizedHindi = /\b(mujhe|mera|meri|dard|bukhar|sirdard|chakkar|goli|dawa|kya karun|saans|chhati)\b/i.test(userText);
  const isRomanizedAssamese = /\b(mur|bikh|jor|bhal|lagise|hoise|pete|bukur|ausodh|ki korim)\b/i.test(userText);

  if (reqLang.includes('as') || reqLang.includes('assam') || reqLang.includes('অসমীয়া') || isRomanizedAssamese) {
    langCode = 'as';
  } else if (reqLang.includes('hi') || reqLang.includes('hindi') || reqLang.includes('हिंदी') || isRomanizedHindi) {
    langCode = 'hi';
  } else if (hasBengaliAssamese && !reqLang.includes('bn') && !reqLang.includes('bengal') && !reqLang.includes('বাংলা')) {
    langCode = 'as';
  } else if (hasDevanagari && !reqLang.includes('mr') && !reqLang.includes('marath') && !reqLang.includes('मराठी')) {
    langCode = 'hi';
  }

  // 1. GATE 1: Pre-LLM Red Flag & Emergency Evaluation (HUMAN-REVIEWED SCRIPT ONLY)
  const redFlagCheck = detectRedFlags(userText, langCode);
  if (redFlagCheck.isEmergency && redFlagCheck.message) {
    return {
      reply: redFlagCheck.message,
      languageCode: redFlagCheck.languageCode,
      isEmergency: true,
      emergencyCategory: redFlagCheck.category,
      piiStripped: false
    };
  }

  // 1b. GATE 1b: Pre-LLM Prompt Injection & Jailbreak Guard
  const injectionCheck = detectPromptInjection(userText, langCode);
  if (injectionCheck.isInjection && injectionCheck.safeReply) {
    const mappedLang: 'en-IN' | 'hi' | 'as' =
      injectionCheck.languageCode === 'hi'
        ? 'hi'
        : injectionCheck.languageCode === 'as'
        ? 'as'
        : 'en-IN';
    return {
      reply: injectionCheck.safeReply,
      languageCode: mappedLang,
      isEmergency: false,
      piiStripped: false
    };
  }

  // 2. GATE 2: Rate Limiting & Guardrails
  const rateLimit = checkRateLimit(userId, userText.length);
  if (!rateLimit.allowed) {
    return {
      reply: rateLimit.reason || 'Rate limit exceeded.',
      languageCode: langCode,
      isEmergency: false,
      piiStripped: false,
      error: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // 3. GATE 3: PII Redaction
  const { cleanText, strippedCount } = stripPII(userText);

  // 4. GATE 4: Call Gemini (Backend Only)
  const geminiKey = process.env.GEMINI_API_KEY || getEnvVar('GEMINI_API_KEY') || '';
  if (!geminiKey) {
    return {
      reply: getLocalFallbackResponse(cleanText, langCode),
      languageCode: langCode,
      isEmergency: false,
      piiStripped: strippedCount > 0,
      error: 'NO_API_KEY_CONFIGURED'
    };
  }

  try {
    let systemInstruction = SYSTEM_PROMPT_TEMPLATES[langCode] || SYSTEM_PROMPT_TEMPLATES['en-IN'];
    if (langCode === 'en-IN' && payload.language && !['en', 'en-in', 'english'].includes(reqLang)) {
      systemInstruction += `\n\nCRITICAL LANGUAGE REQUIREMENT: You MUST write your entire response in ${payload.language} script and language.`;
    }

    // Format chat contents for Gemini 2.5/Flash
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Prior history (max 8 messages)
    if (payload.history && Array.isArray(payload.history)) {
      for (const h of payload.history.slice(-8)) {
        const role = h.role === 'assistant' || h.role === 'model' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: stripPII(h.text).cleanText }]
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: cleanText }]
    });

    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-flash-latest'
    ];

    let answer = '';
    let lastStatus = 200;

    for (const modelName of modelsToTry) {
      let timeoutId: NodeJS.Timeout | undefined;
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout per model

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 500,
              topP: 0.8
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
            ]
          })
        });

        if (!res.ok) {
          lastStatus = res.status;
          console.warn(`Gemini model ${modelName} returned ${res.status}`);
          continue; // Try next model
        }

        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidateText) {
          answer = candidateText;
          break;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Error contacting ${modelName}:`, msg);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }

    if (!answer) {
      return {
        reply: getLocalFallbackResponse(cleanText, langCode),
        languageCode: langCode,
        isEmergency: false,
        piiStripped: strippedCount > 0,
        error: `GEMINI_HTTP_${lastStatus}`
      };
    }

    return {
      reply: answer,
      languageCode: langCode,
      isEmergency: false,
      piiStripped: strippedCount > 0
    };

  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : '';
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini Execution Exception:', errMsg);
    return {
      reply: getLocalFallbackResponse(cleanText, langCode),
      languageCode: langCode,
      isEmergency: false,
      piiStripped: strippedCount > 0,
      error: errName === 'AbortError' ? 'TIMEOUT_EXCEEDED' : 'INTERNAL_ERROR'
    };
  }
}

function getLocalFallbackResponse(query: string, lang: 'en-IN' | 'hi' | 'as'): string {
  if (lang === 'hi') {
    return `नमस्ते! आपके प्रश्न के संबंध में, पर्याप्त आराम करें, पर्याप्त पानी पिएं और अपने लक्षणों पर नज़र रखें। 

यदि लक्षण 24-48 घंटों से अधिक बने रहते हैं या बढ़ते हैं, तो कृपया अपने नजदीकी डॉक्टर या प्राथमिक स्वास्थ्य केंद्र (PHC) से संपर्क करें। आपातकाल के लिए तुरंत 108 पर कॉल करें।`;
  }
  if (lang === 'as') {
    return `নমস্কাৰ! আপোনাৰ প্ৰশ্নৰ সন্দৰ্ভত, বিশ্ৰাম লওক, পৰ্যাপ্ত পৰিমাণে পানী খাওক আৰু লক্ষণসমূহ লক্ষ্য কৰক।

যদি লক্ষণসমূহ ৪৮ ঘণ্টাতকৈ অধিক সময় থাকে বা বাঢ়ি যায়, অনুগ্ৰহ কৰি ওচৰৰ চিকিৎসক বা প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰৰ সৈতে যোগাযোগ কৰক। জৰুৰীকালীন অৱস্থাত ১০৮ নম্বৰত ফোন কৰক।`;
  }
  return `Thank you for reaching out. Please rest well, stay hydrated, and monitor how you feel.

If your symptoms persist beyond 24-48 hours or worsen, please consult a qualified healthcare professional or visit your nearest clinic. For medical emergencies, call 108 immediately.`;
}

export interface AvatarStreamRequestPayload {
  message: string;
  characterId?: string;
  language?: string;
  userId?: string;
  history?: Array<{ role: 'user' | 'model' | 'assistant'; text: string }>;
}

/**
 * Real-time SSE streaming chat endpoint (`POST /api/chat/stream`).
 * Enforces:
 *   1. Deterministic pre-LLM Red-Flag / Emergency detection (never LLM-generated).
 *   2. Per-user rate limiting & daily Gemini token spend caps.
 *   3. PII stripping (`stripPII`) before any upstream call.
 *   4. `ChunkSplitter` + `checkOutputChunkSafety` gating every chunk (especially chunk 0) before TTS.
 *   5. Stage timestamps (`llmRequestSentAt`, `firstTokenAt`, `firstChunkEmittedAt`) for the latency loop.
 */
export async function streamAvatarChat(
  payload: AvatarStreamRequestPayload,
  res: ServerResponse
): Promise<void> {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const writeSse = (eventData: Record<string, unknown>) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  };

  const rawUserMessage = (payload.message || '').trim();
  const userId = payload.userId || 'anon-session';
  const character = getCharacterById(payload.characterId || 'aria');
  const effectiveLangCode = resolveEffectiveLanguage(rawUserMessage, payload.language || 'en');
  const langConfig = getLanguageByCode(effectiveLangCode);

  const redFlagLang: 'en-IN' | 'hi' | 'as' =
    langConfig.code === 'hi' ? 'hi' : langConfig.code === 'as' ? 'as' : 'en-IN';

  if (!rawUserMessage) {
    writeSse({ type: 'error', message: 'Empty message' });
    res.end();
    return;
  }

  // GATE 1: Deterministic Pre-LLM Red-Flag & Emergency Detector (BEFORE generation and BEFORE speech)
  const redFlag = detectRedFlags(rawUserMessage, redFlagLang);
  if (redFlag.isEmergency && redFlag.message) {
    const now = Date.now();
    const spokenEmergency = sanitizeStreamDelta(redFlag.message)
      .replace(/[•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    writeSse({
      type: 'meta',
      isEmergency: true,
      emergencyCategory: redFlag.category,
      llmRequestSentAt: now,
      firstTokenAt: now
    });
    writeSse({
      type: 'token',
      text: redFlag.message,
      firstTokenAt: now
    });

    const splitter = new ChunkSplitter();
    const emergencyChunks = [...splitter.push(spokenEmergency), ...splitter.flush()];
    emergencyChunks.forEach((chunkText, idx) => {
      prewarmTtsChunk({
        text: chunkText,
        characterId: character.id,
        language: langConfig.code
      }).catch(() => {});
      writeSse({
        type: 'chunk',
        index: idx,
        text: chunkText,
        characterId: character.id,
        language: langConfig.code,
        firstChunkEmittedAt: now
      });
    });

    writeSse({
      type: 'done',
      fullText: redFlag.message,
      isEmergency: true,
      emergencyCategory: redFlag.category,
      characterId: character.id,
      language: langConfig.code
    });
    res.end();
    return;
  }

  // GATE 2: Pre-LLM Prompt-Injection & Jailbreak Guard
  const injectionCheck = detectPromptInjection(rawUserMessage, langConfig.code);
  if (injectionCheck.isInjection && injectionCheck.safeReply) {
    const now = Date.now();
    writeSse({ type: 'meta', isEmergency: false, llmRequestSentAt: now, firstTokenAt: now });
    writeSse({ type: 'token', text: injectionCheck.safeReply, firstTokenAt: now });
    writeSse({
      type: 'chunk',
      index: 0,
      text: injectionCheck.safeReply,
      characterId: character.id,
      language: langConfig.code,
      firstChunkEmittedAt: now
    });
    writeSse({
      type: 'done',
      fullText: injectionCheck.safeReply,
      characterId: character.id,
      language: langConfig.code
    });
    res.end();
    return;
  }

  // GATE 2b: Per-User Rate Limit & Daily Spend Cap
  const rateCheck = checkRateLimit(userId, rawUserMessage.length);
  if (!rateCheck.allowed) {
    const now = Date.now();
    const msg = rateCheck.reason || 'Rate limit exceeded. Please wait a moment.';
    writeSse({ type: 'token', text: msg, firstTokenAt: now });
    writeSse({
      type: 'done',
      fullText: msg,
      error: 'RATE_LIMIT_EXCEEDED',
      characterId: character.id,
      language: langConfig.code
    });
    res.end();
    return;
  }

  // GATE 3: PII Redaction
  const { cleanText: userMessage } = stripPII(rawUserMessage);

  const systemInstruction = [
    `You are ${character.name}, a dedicated and empathetic clinical health assistant at NirogCare in India (an AI assistant, not a doctor).`,
    langConfig.scriptInstruction,
    'Your mission is compassionate clinical triage, patient empathy, and practical home care guidance.',
    '',
    'PATIENT INTERACTION RULES:',
    '1. When a patient states they are sick or unwell (e.g., "I am sick", "not feeling well", "I\'m ill"):',
    '   Immediately show medical empathy. Do NOT greet them casually, introduce yourself, or ask "how are you feeling". Acknowledge their illness with care, advise immediate rest and hydration, and ask what specific symptoms they have (e.g., fever, cough, body pain, headache, or nausea).',
    '2. When a patient describes specific symptoms or questions:',
    '   Directly answer their specific concerns. Explain common causes in simple terms, offer evidence-based comforting home-care measures (warm fluids, salt gargles, steam, light nourishing food), and suggest consulting a doctor if symptoms persist or worsen.',
    '3. You are an AI assistant, not a doctor: never give a definitive medical diagnosis, and never prescribe specific prescription drugs or pharmaceutical dosages.',
    '4. Conversational speech format: Keep responses warm, natural, and concise (approx. 45-75 words across 2-4 sentences).',
    '5. NEVER output markdown asterisks (**bold**), bullet points, numbered lists, emojis, or stage directions.'
  ].join('\n');

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  if (payload.history && Array.isArray(payload.history)) {
    for (const h of payload.history.slice(-6)) {
      if (!h.text?.trim()) continue;
      contents.push({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: stripPII(h.text).cleanText }]
      });
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const geminiKey =
    process.env.GEMINI_API_KEY ||
    getEnvVar('GEMINI_API_KEY') ||
    '';

  let fullReply = '';
  let chunkIndex = 0;
  let safetyCutTriggered = false;
  const splitter = new ChunkSplitter();

  const llmRequestSentAt = Date.now();
  let firstTokenAt = 0;
  let firstChunkEmittedAt = 0;

  writeSse({
    type: 'meta',
    isEmergency: false,
    llmRequestSentAt
  });

  const emitValidatedChunk = (rawChunk: string): boolean => {
    const cleaned = sanitizeStreamDelta(rawChunk).replace(/\s+/g, ' ').trim();
    if (!cleaned || safetyCutTriggered) return false;

    // GATE 4: Streaming Output Safety Filter (gates chunk 0 and all subsequent chunks before TTS)
    const safety = checkOutputChunkSafety(cleaned, langConfig.code);
    if (!safety.safe && safety.fallbackText) {
      safetyCutTriggered = true;
      const safeText = safety.fallbackText;
      fullReply = safeText;
      const idx = chunkIndex++;
      if (!firstChunkEmittedAt) firstChunkEmittedAt = Date.now();

      prewarmTtsChunk({
        text: safeText,
        characterId: character.id,
        language: langConfig.code
      }).catch(() => {});

      writeSse({
        type: 'safety_replace',
        reason: safety.reason,
        text: safeText
      });
      writeSse({
        type: 'chunk',
        index: idx,
        text: safeText,
        characterId: character.id,
        language: langConfig.code,
        firstChunkEmittedAt
      });
      return false;
    }

    const idx = chunkIndex++;
    if (!firstChunkEmittedAt) firstChunkEmittedAt = Date.now();

    if (idx === 0) {
      prewarmTtsChunk({
        text: cleaned,
        characterId: character.id,
        language: langConfig.code
      }).catch(() => {});
    }

    writeSse({
      type: 'chunk',
      index: idx,
      text: cleaned,
      characterId: character.id,
      language: langConfig.code,
      firstChunkEmittedAt
    });
    return true;
  };

  const streamingModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemma-4-26b-a4b-it'
  ];

  let streamSucceeded = false;

  if (geminiKey) {
    for (const modelName of streamingModels) {
      let timeoutId: NodeJS.Timeout | undefined;
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${geminiKey}`;
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 12000);
        const genConfig: Record<string, unknown> = {
          temperature: 0.7,
          maxOutputTokens: 350,
          topP: 0.9
        };
        if (modelName.startsWith('gemini-3.') && modelName !== 'gemini-3.5-flash-lite') {
          genConfig.thinkingConfig = { thinkingLevel: 'MINIMAL' };
        }

        const geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: genConfig
          })
        });

        if (!geminiRes.ok || !geminiRes.body) {
          continue;
        }

        const reader = geminiRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let sseRemainder = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done || safetyCutTriggered) break;

          sseRemainder += decoder.decode(value, { stream: true });
          const lines = sseRemainder.split('\n');
          sseRemainder = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const deltaRaw = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (!deltaRaw) continue;

              const delta = sanitizeStreamDelta(deltaRaw);
              if (!delta) continue;

              if (!firstTokenAt) {
                firstTokenAt = Date.now();
              }

              fullReply += delta;
              writeSse({
                type: 'token',
                text: delta,
                firstTokenAt
              });

              const readyChunks = splitter.push(delta);
              for (const c of readyChunks) {
                const keepGoing = emitValidatedChunk(c);
                if (!keepGoing) {
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
          streamSucceeded = true;
          recordGeminiTokenUsage(Math.ceil((userMessage.length + fullReply.length) / 4));
          break;
        }
      } catch {
        // Do not log user health text; continue to fallback model
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }
  }

  if (!streamSucceeded && !safetyCutTriggered) {
    const now = Date.now();
    if (!firstTokenAt) firstTokenAt = now;
    const fallbackText = buildOfflineClinicalReply(userMessage, langConfig.code);
    fullReply = fallbackText;
    writeSse({ type: 'token', text: fallbackText, firstTokenAt });
    const chunks = [...splitter.push(fallbackText), ...splitter.flush()];
    for (const c of chunks) emitValidatedChunk(c);
  } else if (!safetyCutTriggered) {
    const remaining = splitter.flush();
    for (const c of remaining) emitValidatedChunk(c);
  }

  writeSse({
    type: 'done',
    fullText: fullReply.trim(),
    characterId: character.id,
    language: langConfig.code,
    llmRequestSentAt,
    firstTokenAt,
    firstChunkEmittedAt
  });
  res.end();
}

