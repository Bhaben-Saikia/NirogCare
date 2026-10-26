/**
 * NirogCare - Real-Time Streaming Voice + Avatar Chat UI (`/src/chat/TalkingAvatarApp.tsx`)
 *
 * Unified with the NirogCare Home Page design system (`gradient-hero`, Emerald/Teal medical palette,
 * `font-display`, glassmorphism cards, navigation bar, and Light/Dark theme support).
 *
 * Features:
 * - Persistent authenticated WebSocket (`/api/ws/chat?token=...`) with exponential backoff reconnect
 *   and automatic SSE fallback (`/api/chat/stream`).
 * - Modes: Voice + Avatar Mode (default; 3D Human GLB with 72 ARKit + Oculus Viseme blendshapes),
 *   Text Mode, and Avatar Off (persisted per user in `localStorage`).
 * - Multi-Tier Token/Quota Resilience:
 *   1. ElevenLabs v4 (`eleven_v4_turbo` / `eleven_v4`) -> 2. Google Gemini Neural TTS
 *   -> 3. Unlimited Zero-Token Browser Neural SpeechSynthesis (`window.speechSynthesis`) with full
 *   60 FPS phoneme lip-sync, plus a 1-click "Free Voice (Save Credits)" toggle in the header.
 * - Safety: Persistent "AI assistant, not a doctor" badge + medical disclaimer + Mic Consent modal.
 * - Instant Barge-In & Dev Latency Telemetry Overlay.
 */

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Mic,
  MicOff,
  Send,
  Square,
  Volume2
} from 'lucide-react';
import {
  CHARACTERS,
  SUPPORTED_LANGUAGES,
  getCharacterById,
  getLanguageByCode,
  type CharacterConfig,
  type LanguageCode
} from '../config/characters';
import type { AvatarBehaviorState } from '../avatar/ProceduralAvatar';
import {
  avatarAudioEngine,
  type CharacterAlignment,
  type TurnLatencyMetrics
} from '../audio/audioEngine';
import { buildOfflineClinicalReply } from '../server/offlineClinicalFallback';

const LazyAvatarCanvas = React.lazy(() =>
  import('../avatar/AvatarCanvas').then((m) => ({ default: m.AvatarCanvas }))
);

export type InteractionMode = 'text' | 'voice' | 'off';

const MODE_STORAGE_KEY = 'nirogcare_interaction_mode';
const FREE_VOICE_STORAGE_KEY = 'nirogcare_prefer_free_voice';
const MIC_CONSENT_STORAGE_KEY = 'nirogcare_mic_consent_v1';
const CLIENT_HINT_STORAGE_KEY = 'nirogcare_anon_hint_v1';

export interface TranscriptItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isEmergency?: boolean;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const QUICK_PROMPTS: Record<LanguageCode, string[]> = {
  en: [
    'What should I do for mild fever and body ache?',
    'How can I relieve a sore throat and dry cough at home?',
    'Tips for better sleep and reducing daily stress'
  ],
  hi: [
    'हल्के बुखार और बदन दर्द में घर पर क्या देखभाल करें?',
    'गले की खराश और सूखी खांसी के लिए आसान घरेलू उपाय क्या हैं?',
    'अच्छी नींद और तनाव कम करने के लिए क्या करें?'
  ],
  as: [
    'পাতল জ্বৰ আৰু গাৰ বিষ হ’লে ঘৰত কি যতন ল’ব লাগে?',
    'ডিঙিৰ বিষ আৰু শুকান কাঁহ হ’লে কি কৰিব লাগে?',
    'ভাল টোপনি আৰু মানসিক চাপ কমাবলৈ কি কৰিব পাৰি?'
  ],
  bn: [
    'হালকা জ্বর ও শরীর ব্যথায় ঘরোয়া যত্ন কী নেওয়া উচিত?',
    'গলা ব্যথা ও শুকনো কাশির জন্য কী করণীয়?',
    'ভালো ঘুম ও মানসিক চাপ কমানোর উপায় কী?'
  ]
};

export const TalkingAvatarApp: React.FC = () => {
  const [mode, setMode] = useState<InteractionMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      if (saved === 'text' || saved === 'voice' || saved === 'off') return saved;
    }
    return 'voice';
  });

  const [preferFreeVoice, setPreferFreeVoice] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FREE_VOICE_STORAGE_KEY) === 'true';
    }
    return false;
  });

  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(CHARACTERS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [inputText, setInputText] = useState<string>('');
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [messages, setMessages] = useState<TranscriptItem[]>([]);
  const [isWaitingFirstToken, setIsWaitingFirstToken] = useState<boolean>(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [showMicConsent, setShowMicConsent] = useState<boolean>(false);
  const [degradedNotice, setDegradedNotice] = useState<string | null>(null);
  const [showDebugOverlay] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TurnLatencyMetrics | null>(null);

  const sessionTokenRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const activeAssistantMsgIdRef = useRef<string>('');
  const activeTurnChunkTextsRef = useRef<Map<number, string>>(new Map());
  const streamAbortRef = useRef<AbortController | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const lastEndOfSpeechRef = useRef<number | undefined>(undefined);
  const interimTranscriptRef = useRef<string>('');

  const currentCharacter: CharacterConfig = getCharacterById(selectedCharacterId);
  const currentLangConfig = getLanguageByCode(selectedLanguage);

  const togglePreferFreeVoice = () => {
    const next = !preferFreeVoice;
    setPreferFreeVoice(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FREE_VOICE_STORAGE_KEY, String(next));
    }
  };

  // Subscribe to Web Audio speaking state & telemetry
  useEffect(() => {
    const unsubSpeak = avatarAudioEngine.onSpeakingStateChange((speaking) => {
      setIsAvatarSpeaking(speaking);
    });
    const unsubTelemetry = avatarAudioEngine.onTelemetryUpdate((m) => {
      setTelemetry(m);
    });
    return () => {
      unsubSpeak();
      unsubTelemetry();
      avatarAudioEngine.stopAll();
      avatarAudioEngine.stopMicVad();
    };
  }, []);

  // Mint session token & maintain persistent authenticated WebSocket with exponential backoff
  useEffect(() => {
    let unmounted = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const connectWs = async () => {
      if (unmounted) return;
      try {
        if (!sessionTokenRef.current) {
          let hint = localStorage.getItem(CLIENT_HINT_STORAGE_KEY);
          if (!hint) {
            hint = `hint_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
            localStorage.setItem(CLIENT_HINT_STORAGE_KEY, hint);
          }
          const authRes = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientHintId: hint })
          });
          if (authRes.ok) {
            const authData = (await authRes.json()) as { token?: string };
            if (authData.token) {
              sessionTokenRef.current = authData.token;
            }
          }
        }

        if (!sessionTokenRef.current || unmounted) return;

        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${proto}//${window.location.host}/api/ws/chat?token=${encodeURIComponent(
          sessionTokenRef.current
        )}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          attempt = 0;
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(String(evt.data)) as Record<string, unknown>;
            const turnId = typeof data.turnId === 'number' ? data.turnId : 0;
            const targetMsgId = activeAssistantMsgIdRef.current;

            if (data.type === 'meta') {
              avatarAudioEngine.recordServerStageTimings(turnId, {
                llmRequestSentAt:
                  typeof data.llmRequestSentAt === 'number' ? data.llmRequestSentAt : undefined,
                firstTokenAt:
                  typeof data.firstTokenAt === 'number' ? data.firstTokenAt : undefined
              });
              if (data.isEmergency && targetMsgId) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === targetMsgId ? { ...m, isEmergency: true } : m))
                );
              }
            } else if (data.type === 'token' && typeof data.text === 'string' && targetMsgId) {
              setIsWaitingFirstToken(false);
              avatarAudioEngine.recordServerStageTimings(turnId, {
                firstTokenAt:
                  typeof data.firstTokenAt === 'number' ? data.firstTokenAt : undefined
              });
              const delta = data.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === targetMsgId ? { ...m, text: m.text + delta } : m))
              );
            } else if (
              data.type === 'safety_replace' &&
              typeof data.text === 'string' &&
              targetMsgId
            ) {
              setIsWaitingFirstToken(false);
              const safeText = data.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === targetMsgId ? { ...m, text: safeText } : m))
              );
            } else if (data.type === 'chunk' && typeof data.text === 'string') {
              setIsWaitingFirstToken(false);
              const idx = typeof data.index === 'number' ? data.index : 0;
              activeTurnChunkTextsRef.current.set(idx, data.text);
              avatarAudioEngine.recordServerStageTimings(turnId, {
                firstChunkEmittedAt:
                  typeof data.firstChunkEmittedAt === 'number'
                    ? data.firstChunkEmittedAt
                    : undefined
              });
            } else if (data.type === 'tts_audio' && typeof data.pcmBase64 === 'string') {
              const idx = typeof data.index === 'number' ? data.index : 0;
              const chunkText =
                (typeof data.text === 'string' ? data.text : '') ||
                activeTurnChunkTextsRef.current.get(idx) ||
                '';
              avatarAudioEngine.enqueueDirectPcmChunk({
                turnId,
                index: idx,
                text: chunkText,
                pcmBase64: data.pcmBase64,
                sampleRate: typeof data.sampleRate === 'number' ? data.sampleRate : 24000,
                provider: typeof data.provider === 'string' ? data.provider : 'elevenlabs',
                model: typeof data.model === 'string' ? data.model : 'eleven_v4_turbo',
                pitchCents: typeof data.pitchCents === 'number' ? data.pitchCents : 0,
                playbackRate: typeof data.playbackRate === 'number' ? data.playbackRate : 1.0,
                alignment: data.alignment as CharacterAlignment | undefined,
                ttsRequestAt:
                  typeof data.ttsRequestAt === 'number' ? data.ttsRequestAt : Date.now(),
                firstTtsByteAt:
                  typeof data.firstTtsByteAt === 'number' ? data.firstTtsByteAt : Date.now()
              });
            } else if (data.type === 'done' && targetMsgId) {
              setIsWaitingFirstToken(false);
              if (typeof data.fullText === 'string' && data.fullText.trim()) {
                const finalReply = data.fullText;
                const isEmg = Boolean(data.isEmergency);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === targetMsgId ? { ...m, text: finalReply, isEmergency: isEmg } : m
                  )
                );
              }
            }
          } catch {
            // Ignore malformed WS message
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (!unmounted) {
            const backoffMs = Math.min(8000, 500 * Math.pow(2, attempt++));
            reconnectTimer = setTimeout(connectWs, backoffMs);
          }
        };
      } catch {
        if (!unmounted) {
          const backoffMs = Math.min(8000, 500 * Math.pow(2, attempt++));
          reconnectTimer = setTimeout(connectWs, backoffMs);
        }
      }
    };

    connectWs();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialTranscript]);

  const handleModeChange = (nextMode: InteractionMode) => {
    setMode(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODE_STORAGE_KEY, nextMode);
    }
    if (nextMode !== 'voice') {
      avatarAudioEngine.stopAll();
    } else {
      avatarAudioEngine.ensureContext();
    }
  };

  const behaviorState: AvatarBehaviorState = isAvatarSpeaking
    ? 'speaking'
    : isWaitingFirstToken
    ? 'thinking'
    : inputText.trim().length > 0 || isListeningMic || partialTranscript.length > 0
    ? 'listening'
    : 'idle';

  const triggerBargeIn = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'barge_in' }));
    }
    avatarAudioEngine.stopAll();
    setIsWaitingFirstToken(false);
  }, []);

  const handleSendMessage = async (overrideText?: string, endOfSpeechAt?: number) => {
    const textToSend = (overrideText ?? inputText).trim();
    if (!textToSend) return;

    const sttFinalAt = Date.now();
    triggerBargeIn();
    setDegradedNotice(null);

    const turnId = avatarAudioEngine.startNewTurn(
      currentLangConfig.code,
      endOfSpeechAt ?? sttFinalAt,
      sttFinalAt
    );

    const userMsgId = `u-${Date.now()}`;
    const assistantMsgId = `a-${Date.now() + 1}`;
    activeAssistantMsgIdRef.current = assistantMsgId;
    activeTurnChunkTextsRef.current.clear();

    const priorHistory = messages
      .filter((m) => m.text.trim().length > 0)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        text: m.text
      }));

    setInputText('');
    setPartialTranscript('');
    setIsWaitingFirstToken(true);
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text: textToSend },
      { id: assistantMsgId, role: 'assistant', text: '' }
    ]);

    // Primary Path: Persistent Authenticated WebSocket (`/api/ws/chat`)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat_turn',
          turnId,
          message: textToSend,
          characterId: currentCharacter.id,
          language: currentLangConfig.code,
          includeAudio: mode === 'voice',
          preferFreeVoice,
          history: priorHistory
        })
      );
      return;
    }

    // Fallback Path: Authenticated HTTP SSE (`/api/chat/stream`)
    const controller = new AbortController();
    streamAbortRef.current = controller;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionTokenRef.current) {
        headers.Authorization = `Bearer ${sessionTokenRef.current}`;
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          characterId: currentCharacter.id,
          language: currentLangConfig.code,
          history: priorHistory
        })
      });

      if (!response.ok || !response.body) {
        setIsWaitingFirstToken(false);
        setDegradedNotice('Cloud connection paused; providing offline guidance.');
        const fallbackText = buildOfflineClinicalReply(textToSend, currentLangConfig.code);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, text: fallbackText } : m))
        );
        if (mode === 'voice') {
          avatarAudioEngine.enqueueChunk({
            turnId,
            index: 0,
            text: fallbackText,
            characterId: currentCharacter.id,
            language: currentLangConfig.code,
            preferFreeVoice: true
          });
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() || '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const payloadStr = line.slice(5).trim();
          if (!payloadStr) continue;

          try {
            const event = JSON.parse(payloadStr) as Record<string, unknown>;

            if (event.type === 'meta') {
              avatarAudioEngine.recordServerStageTimings(turnId, {
                llmRequestSentAt:
                  typeof event.llmRequestSentAt === 'number' ? event.llmRequestSentAt : undefined,
                firstTokenAt:
                  typeof event.firstTokenAt === 'number' ? event.firstTokenAt : undefined
              });
              if (event.isEmergency) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, isEmergency: true } : m))
                );
              }
            } else if (event.type === 'token' && typeof event.text === 'string') {
              setIsWaitingFirstToken(false);
              const delta = event.text;
              avatarAudioEngine.recordServerStageTimings(turnId, {
                firstTokenAt:
                  typeof event.firstTokenAt === 'number' ? event.firstTokenAt : undefined
              });
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, text: m.text + delta } : m))
              );
            } else if (event.type === 'safety_replace' && typeof event.text === 'string') {
              setIsWaitingFirstToken(false);
              const safeText = event.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, text: safeText } : m))
              );
            } else if (event.type === 'chunk' && typeof event.text === 'string') {
              setIsWaitingFirstToken(false);
              avatarAudioEngine.recordServerStageTimings(turnId, {
                firstChunkEmittedAt:
                  typeof event.firstChunkEmittedAt === 'number'
                    ? event.firstChunkEmittedAt
                    : undefined
              });
              if (mode === 'voice') {
                avatarAudioEngine.enqueueChunk({
                  turnId,
                  index: typeof event.index === 'number' ? event.index : 0,
                  text: event.text,
                  characterId:
                    typeof event.characterId === 'string'
                      ? event.characterId
                      : currentCharacter.id,
                  language:
                    typeof event.language === 'string' ? event.language : currentLangConfig.code,
                  preferFreeVoice
                });
              }
            } else if (event.type === 'done') {
              setIsWaitingFirstToken(false);
              if (typeof event.fullText === 'string' && event.fullText.trim()) {
                const fullText = event.fullText;
                const isEmg = Boolean(event.isEmergency);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, text: fullText, isEmergency: isEmg } : m
                  )
                );
              }
            }
          } catch {
            // Ignore malformed SSE line
          }
        }
      }
    } catch (err: unknown) {
      const errName = err instanceof Error ? err.name : '';
      if (errName !== 'AbortError') {
        setDegradedNotice('Connection interrupted; providing offline guidance.');
        const fallbackText = buildOfflineClinicalReply(textToSend, currentLangConfig.code);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId && !m.text ? { ...m, text: fallbackText } : m))
        );
        if (mode === 'voice') {
          avatarAudioEngine.enqueueChunk({
            turnId,
            index: 0,
            text: fallbackText,
            characterId: currentCharacter.id,
            language: currentLangConfig.code,
            preferFreeVoice: true
          });
        }
      }
    } finally {
      setIsWaitingFirstToken(false);
    }
  };

  const requestMicrophoneStart = () => {
    const hasConsent =
      typeof window !== 'undefined' &&
      localStorage.getItem(MIC_CONSENT_STORAGE_KEY) === 'granted';
    if (!hasConsent) {
      setShowMicConsent(true);
      return;
    }
    startMicrophoneSession();
  };

  const acceptMicConsent = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MIC_CONSENT_STORAGE_KEY, 'granted');
    }
    setShowMicConsent(false);
    startMicrophoneSession();
  };

  const startMicrophoneSession = async () => {
    if (isListeningMic) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop error
      }
      avatarAudioEngine.stopMicVad();
      setIsListeningMic(false);
      return;
    }

    avatarAudioEngine.ensureContext();

    try {
      await avatarAudioEngine.startMicVad({
        silenceThresholdMs: 400,
        onSpeechStart: () => {
          if (isAvatarSpeaking) {
            triggerBargeIn();
          }
        },
        onBargeIn: () => {
          triggerBargeIn();
        },
        onEndOfSpeech: (eosTimestamp) => {
          lastEndOfSpeechRef.current = eosTimestamp;
          setIsWaitingFirstToken(true);
        }
      });
    } catch {
      setDegradedNotice('Microphone permission denied; please use text input.');
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsListeningMic(false);
      avatarAudioEngine.stopMicVad();
      setDegradedNotice('Browser streaming STT unavailable; please type your message.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = currentLangConfig.bcp47Locale;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListeningMic(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let finalStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += piece;
        } else {
          interim += piece;
        }
      }
      if (interim) {
        if (isAvatarSpeaking) triggerBargeIn();
        interimTranscriptRef.current = interim;
        setPartialTranscript(interim);
      }
      if (finalStr.trim()) {
        interimTranscriptRef.current = '';
        setIsListeningMic(false);
        avatarAudioEngine.stopMicVad();
        handleSendMessage(finalStr.trim(), lastEndOfSpeechRef.current ?? Date.now());
      }
    };

    recognition.onerror = () => {
      interimTranscriptRef.current = '';
      setIsListeningMic(false);
      avatarAudioEngine.stopMicVad();
    };

    recognition.onend = () => {
      setIsListeningMic(false);
      avatarAudioEngine.stopMicVad();
      if (interimTranscriptRef.current.trim()) {
        const flushedSpeech = interimTranscriptRef.current.trim();
        interimTranscriptRef.current = '';
        setPartialTranscript('');
        handleSendMessage(flushedSpeech, lastEndOfSpeechRef.current ?? Date.now());
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListeningMic(false);
      avatarAudioEngine.stopMicVad();
    }
  };

  const visibleMessages = messages.filter((m) => m.text.trim().length > 0);
  const showAvatarStage = mode === 'voice';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* Clean Minimal NirogCare Header Bar */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-background/95 border-b border-border shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* NirogCare Brand Logo linking back to Home */}
          <Link to="/" className="flex items-center gap-2.5 group pr-1">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </div>
            <div className="leading-tight">
              <span className="font-display font-bold text-base text-foreground flex items-center gap-1">
                NirogCare
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </span>
              <span className="block text-[10px] text-muted-foreground font-medium">
                AI Health Companion
              </span>
            </div>
          </Link>

          {/* Mandatory Persistent Safety Badge */}
          <span
            data-testid="ai-safety-badge"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>AI assistant, not a doctor</span>
          </span>
        </div>

        {/* Right Controls: Character, Language & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Interaction Mode">
          <select
            id="character-picker"
            aria-label="Character Picker"
            value={selectedCharacterId}
            onChange={(e) => {
              triggerBargeIn();
              setSelectedCharacterId(e.target.value);
            }}
            className="h-9 rounded-xl bg-card border border-border px-3 text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {CHARACTERS.map((char) => (
              <option key={char.id} value={char.id}>
                {char.name} ({char.title})
              </option>
            ))}
          </select>

          <select
            id="language-picker"
            aria-label="Language Picker"
            value={selectedLanguage}
            onChange={(e) => {
              triggerBargeIn();
              setSelectedLanguage(e.target.value as LanguageCode);
            }}
            className="h-9 rounded-xl bg-card border border-border px-3 text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>

          {mode === 'voice' && (
            <button
              type="button"
              onClick={togglePreferFreeVoice}
              title={preferFreeVoice ? 'Using Free Browser Voice (0 Tokens)' : 'Using Cloud Voice (ElevenLabs)'}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                preferFreeVoice
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{preferFreeVoice ? 'Free Voice (Active)' : 'Cloud Voice'}</span>
            </button>
          )}

          <div className="inline-flex items-center rounded-xl bg-muted p-0.5 border border-border">
            <button
              type="button"
              onClick={() => handleModeChange('voice')}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'voice'
                  ? 'gradient-hero text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Voice + Avatar
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('text')}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'text'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Text Mode
            </button>
          </div>
        </div>
      </header>

      {/* Dev-Only Latency Telemetry Overlay (10 Pipeline Stages) */}
      {showDebugOverlay && telemetry && (
        <div
          data-testid="latency-debug-overlay"
          className="absolute top-16 right-4 z-30 w-80 rounded-2xl bg-slate-950/90 border border-emerald-500/30 p-3.5 text-[11px] font-mono text-slate-200 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 text-emerald-400 font-semibold">
            <span>
              Turn #{telemetry.turnId} ({telemetry.language})
            </span>
            <span>
              {telemetry.provider} / {telemetry.model}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <span>1. EOS → STT Final:</span>
            <span className="text-right">
              {telemetry.sttFinalAt && telemetry.endOfSpeechAt
                ? `${telemetry.sttFinalAt - telemetry.endOfSpeechAt} ms`
                : '—'}
            </span>
            <span>2. LLM First Token:</span>
            <span className="text-right">
              {telemetry.firstTokenAt && telemetry.llmRequestSentAt
                ? `${telemetry.firstTokenAt - telemetry.llmRequestSentAt} ms`
                : '—'}
            </span>
            <span>3. First Chunk Split:</span>
            <span className="text-right">
              {telemetry.firstChunkEmittedAt && telemetry.llmRequestSentAt
                ? `${telemetry.firstChunkEmittedAt - telemetry.llmRequestSentAt} ms`
                : '—'}
            </span>
            <span>4. TTS First Byte:</span>
            <span className="text-right">
              {telemetry.firstTtsByteAt && telemetry.ttsRequestAt
                ? `${telemetry.firstTtsByteAt - telemetry.ttsRequestAt} ms`
                : '—'}
            </span>
            <span>5. First Audio Sample:</span>
            <span className="text-right text-emerald-400 font-semibold">
              {telemetry.firstAudioSampleAt && telemetry.llmRequestSentAt
                ? `${telemetry.firstAudioSampleAt - telemetry.llmRequestSentAt} ms`
                : '—'}
            </span>
            <span>6. First Mouth Move:</span>
            <span className="text-right text-emerald-300">
              {telemetry.firstMouthMovementAt && telemetry.llmRequestSentAt
                ? `${telemetry.firstMouthMovementAt - telemetry.llmRequestSentAt} ms`
                : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
        {showAvatarStage ? (
          <div className="relative flex-1 w-full h-full">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-sm font-medium text-muted-foreground">
                  Loading 3D medical assistant avatar...
                </div>
              }
            >
              <LazyAvatarCanvas character={currentCharacter} behaviorState={behaviorState} />
            </Suspense>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-3xl mx-auto px-4 pt-6 pb-52 overflow-y-auto space-y-3">
            {visibleMessages.length === 0 && (
              <div className="rounded-3xl bg-card border border-border p-6 shadow-md text-center my-6">
                <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Heart className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">
                  Namaste! I am {currentCharacter.name}, your NirogCare {currentCharacter.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                  Ask me any general wellness or symptom care question in Indian English, हिन्दी, or
                  অসমীয়া.
                </p>
              </div>
            )}
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.isEmergency
                      ? 'bg-destructive text-destructive-foreground font-medium'
                      : msg.role === 'user'
                      ? 'gradient-hero text-white font-medium'
                      : 'bg-card text-card-foreground border border-border'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}

        {/* Bottom Captions + Quick Prompts + Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center px-4 pb-4 pt-3 pointer-events-none bg-gradient-to-t from-background via-background/90 to-transparent">
          {showAvatarStage && visibleMessages.length > 0 && (
            <div
              data-testid="chat-transcript"
              className="w-full max-w-2xl max-h-40 overflow-y-auto mb-2.5 space-y-2 px-1 pointer-events-auto"
            >
              {visibleMessages.slice(-4).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-md backdrop-blur-md ${
                      msg.isEmergency
                        ? 'bg-destructive text-destructive-foreground font-semibold'
                        : msg.role === 'user'
                        ? 'gradient-hero text-white font-medium'
                        : 'bg-card/95 text-card-foreground border border-border'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          )}

          {/* Quick-Start Wellness Prompts when conversation is empty */}
          {visibleMessages.length === 0 && (
            <div className="w-full max-w-2xl flex flex-col items-center gap-1.5 mb-2.5 pointer-events-auto">
              <span className="text-[11px] font-medium text-muted-foreground/80">Suggested topics:</span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {(QUICK_PROMPTS[selectedLanguage] || QUICK_PROMPTS.en).map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(promptText)}
                    className="px-3 py-1.5 rounded-full bg-card/90 hover:bg-primary hover:text-primary-foreground border border-border text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-all"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {partialTranscript && (
            <div className="w-full max-w-2xl mb-2 px-3.5 py-1.5 rounded-xl bg-primary/15 border border-primary/40 text-xs font-medium text-primary pointer-events-auto backdrop-blur-md">
              Listening: {partialTranscript}
            </div>
          )}

          {degradedNotice && (
            <div className="w-full max-w-2xl mb-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs font-medium text-amber-600 dark:text-amber-300 pointer-events-auto backdrop-blur-md">
              {degradedNotice}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="w-full max-w-2xl flex items-center gap-2 pointer-events-auto"
          >
            <input
              type="text"
              aria-label="Message input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a health question in English, हिन्दी, or অসমীয়া..."
              className="flex-1 h-12 rounded-2xl bg-card/95 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-md"
            />

            {isAvatarSpeaking && (
              <button
                type="button"
                onClick={triggerBargeIn}
                className="h-12 px-4 rounded-2xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 shadow-md inline-flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Interrupt</span>
              </button>
            )}

            <button
              type="button"
              onClick={requestMicrophoneStart}
              aria-label="Microphone"
              className={`h-12 px-4 rounded-2xl border text-xs font-semibold shadow-md inline-flex items-center gap-1.5 transition-all ${
                isListeningMic
                  ? 'bg-destructive border-destructive text-destructive-foreground animate-pulse'
                  : 'bg-card/95 border-border text-foreground hover:border-primary/50'
              }`}
            >
              {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-primary" />}
              <span>{isListeningMic ? 'Stop Mic' : 'Mic'}</span>
            </button>

            <button
              type="submit"
              disabled={!inputText.trim()}
              aria-label="Send message"
              className="h-12 px-5 rounded-2xl gradient-hero text-white text-sm font-semibold shadow-md hover:opacity-95 disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1.5 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>

          <p className="mt-2 text-[11px] text-muted-foreground text-center max-w-2xl pointer-events-auto">
            NirogCare AI Assistant provides general wellness information only — never medical
            diagnosis or prescriptions. In an emergency, call 108 or 112 immediately.
          </p>
        </div>
      </div>

      {showMicConsent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mic-consent-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 text-card-foreground shadow-2xl">
            <h2 id="mic-consent-title" className="font-display text-lg font-bold mb-2">
              Microphone Voice Input Consent
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
              When you enable the microphone, your speech is transcribed to text to answer your
              health question. Personal identifiers (phone, email, IDs) are stripped before reaching
              the AI assistant. Do not share sensitive personal identifiers.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowMicConsent(false)}
                className="h-10 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={acceptMicConsent}
                className="h-10 px-5 rounded-xl gradient-hero text-white text-xs font-semibold shadow-md hover:opacity-95"
              >
                I Understand & Enable Mic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
