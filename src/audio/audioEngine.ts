/**
 * Web Audio Clock Queue, High-Precision Phoneme/Formant Lip-Sync, Browser Speech Fallback,
 * Mic VAD & Telemetry (`/src/audio/audioEngine.ts`)
 *
 * Responsibilities:
 * 1. Schedules 24kHz 16-bit PCM chunks directly on the `AudioContext.currentTime` hardware clock
 *    with a 4ms boundary micro-fade and zero per-chunk `<audio>` elements.
 * 2. Drives 60 FPS lip-sync from the `AudioContext.currentTime` clock using:
 *    - Fast/slow RMS syllable-nucleus envelope tracking (so the jaw opens on every vowel peak
 *      and closes naturally on inter-syllable consonant troughs).
 *    - True 1024-point FFT formant bands (`F1` 400-1000Hz jaw opening, `F2` 1300-2600Hz lip spread,
 *      `F3` 2800-6000Hz sibilant burst).
 *    - Normalized character-level alignment for English, Hindi (Devanagari), and Assamese/Bengali,
 *      including explicit bilabial closure (`pp`), labiodental (`ff`), dental (`dd`), and sibilant (`ss`).
 * 3. Supports zero-token Browser Native Neural SpeechSynthesis (`provider === 'browser-speech'`)
 *    with full 60 FPS phoneme-cadence lip-sync when cloud TTS tokens are exhausted or in Free Voice mode.
 * 4. Implements Microphone Voice Activity Detection (VAD) + instant Barge-In.
 */

export interface VisemeFrame {
  aa: number;
  ee: number;
  ih: number;
  oh: number;
  ou: number;
  pp: number;
  ff: number;
  dd: number;
  ss: number;
  jawOpen: number;
  energy: number;
  pitchAccent: number;
  isSpeaking: boolean;
}

export interface CharacterAlignment {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
}

export interface TurnLatencyMetrics {
  turnId: number;
  language: string;
  endOfSpeechAt: number | null;
  sttFinalAt: number | null;
  llmRequestSentAt: number | null;
  firstTokenAt: number | null;
  firstChunkEmittedAt: number | null;
  ttsRequestAt: number | null;
  firstTtsByteAt: number | null;
  firstAudioSampleAt: number | null;
  firstMouthMovementAt: number | null;
  lastAudioAt: number | null;
  provider: string;
  model: string;
}

export interface EnqueueChunkParams {
  turnId: number;
  index: number;
  text: string;
  characterId: string;
  language: string;
  preferFreeVoice?: boolean;
}

interface ScheduledChunkTimeline {
  turnId: number;
  chunkIndex: number;
  startAudioTime: number;
  endAudioTime: number;
  alignment?: CharacterAlignment;
  source: AudioBufferSourceNode;
}

interface BrowserSpeechTimeline {
  turnId: number;
  chunkIndex: number;
  text: string;
  language: string;
  startedAtPerfSec: number;
  estimatedDurationSec: number;
  currentCharIndex: number;
}

interface QueuedAudioItem {
  turnId: number;
  index: number;
  text: string;
  language: string;
  characterId: string;
  bufferPromise: Promise<{
    audioBuffer: AudioBuffer | null;
    useBrowserSpeech?: boolean;
    provider: string;
    model: string;
    pitchCents: number;
    playbackRate: number;
    alignment?: CharacterAlignment;
    ttsRequestAt: number;
    firstTtsByteAt: number;
  }>;
}

type StateChangeListener = (isSpeaking: boolean) => void;
type PhraseBoundaryListener = (chunkIndex: number, text: string) => void;
type TelemetryListener = (metrics: TurnLatencyMetrics) => void;

class AvatarAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;

  private freqData: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(512));
  private timeData: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(1024));

  private activeTurnId = 0;
  private nextScheduledTime = 0;
  private queue: QueuedAudioItem[] = [];
  private scheduledTimelines: ScheduledChunkTimeline[] = [];
  private activeBrowserSpeech: BrowserSpeechTimeline | null = null;
  private isDraining = false;
  private activeAbortControllers = new Set<AbortController>();
  private speakingActive = false;

  private fastRmsEnv = 0;
  private slowRmsEnv = 0;

  private metrics: TurnLatencyMetrics = this.createEmptyMetrics(0, 'en');

  private smoothedVisemes: VisemeFrame = {
    aa: 0,
    ee: 0,
    ih: 0,
    oh: 0,
    ou: 0,
    pp: 0,
    ff: 0,
    dd: 0,
    ss: 0,
    jawOpen: 0,
    energy: 0,
    pitchAccent: 0,
    isSpeaking: false
  };

  private stateListeners = new Set<StateChangeListener>();
  private phraseListeners = new Set<PhraseBoundaryListener>();
  private telemetryListeners = new Set<TelemetryListener>();

  // Microphone VAD & Barge-in state
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private vadRafId: number | null = null;
  private vadSilenceThresholdMs = 400;

  private createEmptyMetrics(turnId: number, language: string): TurnLatencyMetrics {
    return {
      turnId,
      language,
      endOfSpeechAt: null,
      sttFinalAt: null,
      llmRequestSentAt: null,
      firstTokenAt: null,
      firstChunkEmittedAt: null,
      ttsRequestAt: null,
      firstTtsByteAt: null,
      firstAudioSampleAt: null,
      firstMouthMovementAt: null,
      lastAudioAt: null,
      provider: 'elevenlabs',
      model: 'eleven_v4_turbo'
    };
  }

  public ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.25;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 1.0;
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Will resume on next user gesture
      });
    }
    return this.ctx;
  }

  public beginTurn(
    language = 'en',
    endOfSpeechAt?: number,
    sttFinalAt?: number
  ): number {
    this.stopAll();
    this.activeTurnId += 1;
    this.metrics = this.createEmptyMetrics(this.activeTurnId, language);
    if (endOfSpeechAt) this.metrics.endOfSpeechAt = endOfSpeechAt;
    if (sttFinalAt) this.metrics.sttFinalAt = sttFinalAt;
    this.emitTelemetry();
    return this.activeTurnId;
  }

  public startNewTurn(
    language = 'en',
    endOfSpeechAt?: number,
    sttFinalAt?: number
  ): number {
    return this.beginTurn(language, endOfSpeechAt, sttFinalAt);
  }

  public recordServerStageTimings(
    turnId: number,
    partial: Partial<
      Pick<
        TurnLatencyMetrics,
        'llmRequestSentAt' | 'firstTokenAt' | 'firstChunkEmittedAt' | 'endOfSpeechAt' | 'sttFinalAt'
      >
    >
  ): void {
    this.recordPipelineTimestamps(turnId, partial);
  }

  public recordPipelineTimestamps(
    turnId: number,
    partial: Partial<
      Pick<
        TurnLatencyMetrics,
        'llmRequestSentAt' | 'firstTokenAt' | 'firstChunkEmittedAt' | 'endOfSpeechAt' | 'sttFinalAt'
      >
    >
  ): void {
    if (turnId !== this.activeTurnId) return;
    if (partial.llmRequestSentAt && !this.metrics.llmRequestSentAt) {
      this.metrics.llmRequestSentAt = partial.llmRequestSentAt;
    }
    if (partial.firstTokenAt && !this.metrics.firstTokenAt) {
      this.metrics.firstTokenAt = partial.firstTokenAt;
    }
    if (partial.firstChunkEmittedAt && !this.metrics.firstChunkEmittedAt) {
      this.metrics.firstChunkEmittedAt = partial.firstChunkEmittedAt;
    }
    if (partial.endOfSpeechAt && !this.metrics.endOfSpeechAt) {
      this.metrics.endOfSpeechAt = partial.endOfSpeechAt;
    }
    if (partial.sttFinalAt && !this.metrics.sttFinalAt) {
      this.metrics.sttFinalAt = partial.sttFinalAt;
    }
    this.emitTelemetry();
  }

  public stopAll(): void {
    this.queue = [];
    this.isDraining = false;
    this.activeBrowserSpeech = null;
    this.fastRmsEnv = 0;
    this.slowRmsEnv = 0;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel error
      }
    }

    for (const ctrl of this.activeAbortControllers) {
      ctrl.abort();
    }
    this.activeAbortControllers.clear();

    for (const item of this.scheduledTimelines) {
      try {
        item.source.onended = null;
        item.source.stop();
        item.source.disconnect();
      } catch {
        // Ignore already-stopped source
      }
    }
    this.scheduledTimelines = [];
    this.nextScheduledTime = 0;

    this.smoothedVisemes = {
      aa: 0,
      ee: 0,
      ih: 0,
      oh: 0,
      ou: 0,
      pp: 0,
      ff: 0,
      dd: 0,
      ss: 0,
      jawOpen: 0,
      energy: 0,
      pitchAccent: 0,
      isSpeaking: false
    };

    this.setSpeakingState(false);
  }

  /**
   * Enqueues a pre-synthesized 24kHz 16-bit PCM frame (or browser-speech directive)
   * pushed over the persistent WebSocket.
   */
  public enqueueDirectPcmChunk(params: {
    turnId: number;
    index: number;
    text: string;
    language?: string;
    characterId?: string;
    pcmBase64: string;
    sampleRate: number;
    provider: string;
    model: string;
    pitchCents: number;
    playbackRate: number;
    alignment?: CharacterAlignment;
    ttsRequestAt: number;
    firstTtsByteAt: number;
  }): void {
    if (params.turnId !== this.activeTurnId) return;
    const ctx = this.ensureContext();
    if (!this.metrics.ttsRequestAt) {
      this.metrics.ttsRequestAt = params.ttsRequestAt;
      this.emitTelemetry();
    }

    const bufferPromise = (async () => {
      if (params.provider === 'browser-speech' || !params.pcmBase64) {
        return {
          audioBuffer: null,
          useBrowserSpeech: true,
          provider: 'browser-speech',
          model: params.model || 'web-speech-neural',
          pitchCents: params.pitchCents,
          playbackRate: params.playbackRate,
          alignment: params.alignment,
          ttsRequestAt: params.ttsRequestAt,
          firstTtsByteAt: params.firstTtsByteAt
        };
      }
      try {
        const binStr = atob(params.pcmBase64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        const audioBuffer = this.pcm16ToAudioBuffer(ctx, bytes.buffer, params.sampleRate || 24000);
        return {
          audioBuffer,
          useBrowserSpeech: false,
          provider: params.provider,
          model: params.model,
          pitchCents: params.pitchCents,
          playbackRate: params.playbackRate,
          alignment: params.alignment,
          ttsRequestAt: params.ttsRequestAt,
          firstTtsByteAt: params.firstTtsByteAt
        };
      } catch {
        return {
          audioBuffer: null,
          useBrowserSpeech: true,
          provider: 'browser-speech',
          model: 'web-speech-neural',
          pitchCents: 0,
          playbackRate: 1.0,
          ttsRequestAt: params.ttsRequestAt,
          firstTtsByteAt: params.firstTtsByteAt
        };
      }
    })();

    this.queue.push({
      turnId: params.turnId,
      index: params.index,
      text: params.text,
      language: params.language || this.metrics.language || 'en',
      characterId: params.characterId || 'aria',
      bufferPromise
    });

    if (!this.isDraining) {
      this.drainAndScheduleQueue();
    }
  }

  public enqueueChunk(params: EnqueueChunkParams): void {
    if (params.turnId !== this.activeTurnId) return;
    const ctx = this.ensureContext();

    const controller = new AbortController();
    this.activeAbortControllers.add(controller);

    const clientTtsReqAt = Date.now();
    if (!this.metrics.ttsRequestAt) {
      this.metrics.ttsRequestAt = clientTtsReqAt;
      this.emitTelemetry();
    }

    const bufferPromise = (async () => {
      if (params.preferFreeVoice) {
        return {
          audioBuffer: null,
          useBrowserSpeech: true,
          provider: 'browser-speech',
          model: 'web-speech-neural',
          pitchCents: 0,
          playbackRate: 1.0,
          ttsRequestAt: clientTtsReqAt,
          firstTtsByteAt: Date.now()
        };
      }

      try {
        const res = await fetch('/api/tts/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: params.text,
            characterId: params.characterId,
            language: params.language,
            preferFreeVoice: params.preferFreeVoice
          })
        });

        if (!res.ok || params.turnId !== this.activeTurnId) {
          return {
            audioBuffer: null,
            useBrowserSpeech: true,
            provider: 'browser-speech',
            model: 'web-speech-neural',
            pitchCents: 0,
            playbackRate: 1.0,
            ttsRequestAt: clientTtsReqAt,
            firstTtsByteAt: Date.now()
          };
        }

        const provider = res.headers.get('X-TTS-Provider') || 'elevenlabs';
        const model = res.headers.get('X-TTS-Model') || 'eleven_v4_turbo';
        const pitchCents = Number(res.headers.get('X-Pitch-Cents') || '0') || 0;
        const playbackRate = Number(res.headers.get('X-Playback-Rate') || '1.0') || 1.0;
        const contentType = res.headers.get('Content-Type') || 'audio/pcm;rate=24000';
        const sampleRate = Number(res.headers.get('X-TTS-Sample-Rate') || '24000') || 24000;
        const serverTtsReqAt = Number(res.headers.get('X-TTS-Request-At') || clientTtsReqAt);
        const serverFirstByteAt = Number(res.headers.get('X-TTS-First-Byte-At') || Date.now());
        const alignHeader = res.headers.get('X-TTS-Alignment');

        let alignment: CharacterAlignment | undefined;
        if (alignHeader) {
          try {
            const jsonStr = atob(alignHeader);
            const bytes = Uint8Array.from(jsonStr, (c) => c.charCodeAt(0));
            alignment = JSON.parse(new TextDecoder('utf-8').decode(bytes));
          } catch {
            // Ignore malformed alignment header
          }
        }

        if (provider === 'browser-speech' || contentType.includes('browser-speech')) {
          return {
            audioBuffer: null,
            useBrowserSpeech: true,
            provider: 'browser-speech',
            model: 'web-speech-neural',
            pitchCents,
            playbackRate,
            alignment,
            ttsRequestAt: serverTtsReqAt,
            firstTtsByteAt: Date.now()
          };
        }

        const arrayBuf = await res.arrayBuffer();
        const clientFirstByteAt = Math.min(Date.now(), serverFirstByteAt || Date.now());

        if (params.turnId !== this.activeTurnId || arrayBuf.byteLength < 64) {
          return {
            audioBuffer: null,
            useBrowserSpeech: true,
            provider: 'browser-speech',
            model: 'web-speech-neural',
            pitchCents,
            playbackRate,
            alignment,
            ttsRequestAt: serverTtsReqAt,
            firstTtsByteAt: clientFirstByteAt
          };
        }

        let audioBuffer: AudioBuffer;
        if (contentType.includes('audio/pcm')) {
          audioBuffer = this.pcm16ToAudioBuffer(ctx, arrayBuf, sampleRate);
        } else {
          audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
        }

        return {
          audioBuffer,
          useBrowserSpeech: false,
          provider,
          model,
          pitchCents,
          playbackRate,
          alignment,
          ttsRequestAt: serverTtsReqAt,
          firstTtsByteAt: clientFirstByteAt
        };
      } catch {
        return {
          audioBuffer: null,
          useBrowserSpeech: false,
          provider: 'aborted',
          model: 'none',
          pitchCents: 0,
          playbackRate: 1.0,
          ttsRequestAt: clientTtsReqAt,
          firstTtsByteAt: Date.now()
        };
      } finally {
        this.activeAbortControllers.delete(controller);
      }
    })();

    this.queue.push({
      turnId: params.turnId,
      index: params.index,
      text: params.text,
      language: params.language,
      characterId: params.characterId,
      bufferPromise
    });

    if (!this.isDraining) {
      this.drainAndScheduleQueue();
    }
  }

  private pcm16ToAudioBuffer(
    ctx: AudioContext,
    rawBuffer: ArrayBuffer,
    sampleRate: number
  ): AudioBuffer {
    const int16 = new Int16Array(rawBuffer, 0, Math.floor(rawBuffer.byteLength / 2));
    const audioBuffer = ctx.createBuffer(1, int16.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    const fadeSamples = Math.min(96, Math.floor(int16.length / 8));
    for (let i = 0; i < int16.length; i++) {
      let env = 1;
      if (fadeSamples > 0) {
        if (i < fadeSamples) env = i / fadeSamples;
        else if (i >= int16.length - fadeSamples) env = (int16.length - 1 - i) / fadeSamples;
      }
      channelData[i] = (int16[i] / 32768) * env;
    }
    return audioBuffer;
  }

  /**
   * Speaks a chunk via zero-token Browser Native Neural SpeechSynthesis (`window.speechSynthesis`)
   * while updating `this.activeBrowserSpeech` so `sampleVisemes(dt)` animates 60 FPS lip-sync.
   */
  private speakBrowserChunk(item: QueuedAudioItem): Promise<void> {
    return new Promise<void>((resolve) => {
      if (
        item.turnId !== this.activeTurnId ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        resolve();
        return;
      }

      const cleanText = item.text.trim();
      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        as: 'as-IN',
        bn: 'bn-IN'
      };
      const targetBcp47 = langMap[item.language] || 'en-IN';
      utterance.lang = targetBcp47;
      utterance.rate = 1.02;
      utterance.pitch = item.characterId === 'aarav' || item.characterId === 'rohan' ? 0.92 : 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = targetBcp47.split('-')[0].toLowerCase();
        const match =
          voices.find((v) => v.lang.toLowerCase() === targetBcp47.toLowerCase()) ||
          voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith(langPrefix) ||
              (langPrefix === 'as' && v.lang.toLowerCase().startsWith('bn')) ||
              (langPrefix === 'as' && v.lang.toLowerCase().startsWith('hi'))
          );
        if (match) utterance.voice = match;
      }

      const estimatedDurationSec = Math.max(0.75, cleanText.length * 0.058);
      const browserTimeline: BrowserSpeechTimeline = {
        turnId: item.turnId,
        chunkIndex: item.index,
        text: cleanText,
        language: item.language,
        startedAtPerfSec: performance.now() / 1000,
        estimatedDurationSec,
        currentCharIndex: 0
      };

      utterance.onstart = () => {
        if (item.turnId !== this.activeTurnId) return;
        browserTimeline.startedAtPerfSec = performance.now() / 1000;
        this.activeBrowserSpeech = browserTimeline;
        if (!this.metrics.firstAudioSampleAt) {
          this.metrics.firstAudioSampleAt = Date.now();
          this.metrics.provider = 'browser-speech';
          this.metrics.model = 'web-speech-neural';
          this.emitTelemetry();
        }
        this.setSpeakingState(true);
        for (const cb of this.phraseListeners) {
          cb(item.index, item.text);
        }
      };

      utterance.onboundary = (evt) => {
        if (typeof evt.charIndex === 'number') {
          browserTimeline.currentCharIndex = evt.charIndex;
        }
      };

      const finish = () => {
        if (this.activeBrowserSpeech === browserTimeline) {
          this.activeBrowserSpeech = null;
        }
        if (this.queue.length === 0 && this.scheduledTimelines.length === 0) {
          this.metrics.lastAudioAt = Date.now();
          this.emitTelemetry();
          this.setSpeakingState(false);
        }
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Activate timeline immediately in case `onstart` is delayed on some browsers
      this.activeBrowserSpeech = browserTimeline;
      this.setSpeakingState(true);
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        finish();
      }
    });
  }

  /**
   * Schedules decoded PCM chunks onto the hardware `AudioContext.currentTime` clock
   * or dispatches zero-token Browser Neural SpeechSynthesis chunks sequentially.
   */
  private async drainAndScheduleQueue(): Promise<void> {
    if (this.isDraining) return;
    this.isDraining = true;

    while (this.queue.length > 0) {
      const nextItem = this.queue.shift()!;
      if (nextItem.turnId !== this.activeTurnId) continue;

      const resolved = await nextItem.bufferPromise;
      if (nextItem.turnId !== this.activeTurnId) break;

      if (resolved.useBrowserSpeech) {
        if (!this.metrics.firstTtsByteAt) {
          this.metrics.ttsRequestAt = resolved.ttsRequestAt;
          this.metrics.firstTtsByteAt = resolved.firstTtsByteAt;
          this.emitTelemetry();
        }
        await this.speakBrowserChunk(nextItem);
        continue;
      }

      if (!resolved.audioBuffer || !this.ctx || !this.gainNode) {
        continue;
      }

      if (!this.metrics.firstTtsByteAt) {
        this.metrics.ttsRequestAt = resolved.ttsRequestAt;
        this.metrics.firstTtsByteAt = resolved.firstTtsByteAt;
        this.emitTelemetry();
      }

      const source = this.ctx.createBufferSource();
      source.buffer = resolved.audioBuffer;
      source.playbackRate.value = resolved.playbackRate;
      if (resolved.pitchCents !== 0 && 'detune' in source) {
        source.detune.value = resolved.pitchCents;
      }
      source.connect(this.gainNode);

      const nowAudio = this.ctx.currentTime;
      const startAudioTime = Math.max(nowAudio + 0.012, this.nextScheduledTime);
      const effectiveDuration = resolved.audioBuffer.duration / resolved.playbackRate;
      const endAudioTime = startAudioTime + effectiveDuration;
      this.nextScheduledTime = endAudioTime;

      const timelineItem: ScheduledChunkTimeline = {
        turnId: nextItem.turnId,
        chunkIndex: nextItem.index,
        startAudioTime,
        endAudioTime,
        alignment: resolved.alignment,
        source
      };
      this.scheduledTimelines.push(timelineItem);

      if (!this.metrics.firstAudioSampleAt) {
        const delayMs = Math.max(0, Math.round((startAudioTime - nowAudio) * 1000));
        this.metrics.firstAudioSampleAt = Date.now() + delayMs;
        this.metrics.provider = resolved.provider;
        this.metrics.model = resolved.model;
        this.emitTelemetry();
      }

      this.setSpeakingState(true);
      for (const cb of this.phraseListeners) {
        cb(nextItem.index, nextItem.text);
      }

      source.onended = () => {
        this.scheduledTimelines = this.scheduledTimelines.filter((t) => t !== timelineItem);
        try {
          source.disconnect();
        } catch {
          // Ignore disconnect error
        }
        if (
          this.scheduledTimelines.length === 0 &&
          this.queue.length === 0 &&
          !this.activeBrowserSpeech
        ) {
          this.metrics.lastAudioAt = Date.now();
          this.emitTelemetry();
          this.setSpeakingState(false);
        }
      };

      try {
        source.start(startAudioTime);
      } catch {
        this.scheduledTimelines = this.scheduledTimelines.filter((t) => t !== timelineItem);
      }
    }

    this.isDraining = false;
  }

  /**
   * 60 FPS High-Precision Lip-Sync Sampler driven by the hardware `AudioContext.currentTime` clock
   * (or Browser SpeechSynthesis phoneme cadence when in zero-token mode).
   */
  public sampleVisemes(deltaSeconds: number): VisemeFrame {
    const dt = Math.min(0.1, Math.max(0.001, deltaSeconds));
    let targetAa = 0;
    let targetEe = 0;
    let targetIh = 0;
    let targetOh = 0;
    let targetOu = 0;
    let targetPp = 0;
    let targetFf = 0;
    let targetDd = 0;
    let targetSs = 0;
    let targetJaw = 0;
    let targetEnergy = 0;
    let targetAccent = 0;

    // CASE A: Hardware Web Audio PCM playback (ElevenLabs v4 / Gemini Neural TTS)
    if (this.speakingActive && this.ctx && this.analyser && this.scheduledTimelines.length > 0) {
      const audioNow = this.ctx.currentTime;
      this.analyser.getByteFrequencyData(this.freqData);
      this.analyser.getByteTimeDomainData(this.timeData);

      let sumSq = 0;
      let zeroCrossings = 0;
      let prevSign = this.timeData[0] >= 128 ? 1 : -1;
      for (let i = 0; i < this.timeData.length; i++) {
        const centered = (this.timeData[i] - 128) / 128;
        sumSq += centered * centered;
        const sign = centered >= 0 ? 1 : -1;
        if (sign !== prevSign) {
          zeroCrossings++;
          prevSign = sign;
        }
      }

      const rms = Math.sqrt(sumSq / this.timeData.length);
      const zcr = zeroCrossings / this.timeData.length; // ~0.02..0.28
      targetEnergy = Math.min(1, rms * 4.2);

      // Fast vs Slow RMS envelope tracks syllable peaks (open vowel nuclei) vs troughs (consonant closures)
      const fastRate = targetEnergy > this.fastRmsEnv ? 26 : 18;
      this.fastRmsEnv += (targetEnergy - this.fastRmsEnv) * (1 - Math.exp(-fastRate * dt));
      this.slowRmsEnv += (targetEnergy - this.slowRmsEnv) * (1 - Math.exp(-4.5 * dt));

      const syllablePulse = Math.min(
        1,
        Math.max(0, (this.fastRmsEnv - this.slowRmsEnv * 0.4) * 1.4 + this.fastRmsEnv * 0.55)
      );
      const isConsonantDip =
        this.slowRmsEnv > 0.08 && this.fastRmsEnv < this.slowRmsEnv * 0.62;

      const bandAvg = (startBin: number, endBin: number): number => {
        let sum = 0;
        const count = Math.max(1, endBin - startBin + 1);
        for (let i = startBin; i <= endBin && i < this.freqData.length; i++) {
          sum += this.freqData[i];
        }
        return sum / (count * 255);
      };

      // With fftSize = 1024 at 48kHz (~46.8Hz/bin):
      const lowRoundBand = bandAvg(3, 9); // 140 - 420 Hz (fundamental + rounded back vowels)
      const f1JawBand = bandAvg(10, 22); // 460 - 1030 Hz (F1 open vowel formant -> jaw opening)
      const f2FrontBand = bandAvg(28, 56); // 1300 - 2620 Hz (F2 front vowel formant -> lip spread)
      const sibilantBand = bandAvg(60, 130); // 2800 - 6100 Hz (fricatives / sibilants)

      if (targetEnergy > 0.015) {
        if (isConsonantDip) {
          // Gentle inter-syllable consonant closure so lips touch naturally between syllables
          targetJaw = 0.02;
          targetPp = zcr < 0.08 ? 0.34 : 0.08;
          targetDd = zcr >= 0.08 && zcr < 0.16 ? 0.24 : 0.05;
          targetSs = zcr >= 0.16 ? 0.26 : 0.05;
        } else {
          targetAa = Math.min(1, Math.max(0, f1JawBand * 1.25 * syllablePulse));
          targetOh = Math.min(
            1,
            Math.max(0, (lowRoundBand * 0.75 + f1JawBand * 0.55 - f2FrontBand * 0.35) * 1.1)
          );
          targetOu = Math.min(
            1,
            Math.max(0, (lowRoundBand * 1.1 - f1JawBand * 0.3) * 1.0)
          );
          targetEe = Math.min(
            1,
            Math.max(0, (f2FrontBand * 1.25 - lowRoundBand * 0.2) * 1.05)
          );
          targetIh = Math.min(
            1,
            Math.max(0, (f2FrontBand * 0.9 + sibilantBand * 0.65) * 0.95)
          );
          targetSs = Math.min(1, Math.max(0, (sibilantBand * 1.3 + (zcr > 0.16 ? 0.2 : 0)) * 0.65));
          targetDd = Math.min(1, f2FrontBand * 0.55);
          targetJaw = Math.min(
            0.35,
            Math.max(targetAa * 0.32, targetOh * 0.26, syllablePulse * 0.28)
          );
        }
        targetAccent = Math.min(1, (f1JawBand + f2FrontBand * 1.0) * 0.85);
      }

      // Fuse with normalized character alignment on the AudioContext clock
      const activeTimeline = this.scheduledTimelines.find(
        (tl) => audioNow >= tl.startAudioTime && audioNow <= tl.endAudioTime
      );
      if (activeTimeline?.alignment && activeTimeline.alignment.characters.length > 0) {
        const chunkDuration = Math.max(
          0.1,
          activeTimeline.endAudioTime - activeTimeline.startAudioTime
        );
        const relSec = audioNow - activeTimeline.startAudioTime;
        const { characters, characterStartTimesSeconds, characterEndTimesSeconds } =
          activeTimeline.alignment;

        const lastAlignEnd =
          characterEndTimesSeconds[characterEndTimesSeconds.length - 1] || chunkDuration;
        const scale = lastAlignEnd > 0.05 ? chunkDuration / lastAlignEnd : 1;

        let matchedChar = '';
        for (let i = 0; i < characters.length; i++) {
          const cStart = (characterStartTimesSeconds[i] ?? 0) * scale;
          const cEnd = (characterEndTimesSeconds[i] ?? cStart + 0.06) * scale;
          if (relSec >= cStart && relSec <= cEnd + 0.025) {
            matchedChar = characters[i];
            break;
          }
        }
        if (!matchedChar) {
          const approxIdx = Math.min(
            characters.length - 1,
            Math.max(0, Math.floor((relSec / chunkDuration) * characters.length))
          );
          matchedChar = characters[approxIdx] || '';
        }

        const chV = mapCharacterToViseme(matchedChar);
        if (chV.pp > 0.5) {
          // Bilabial closure ('p', 'b', 'm') overrides open jaw so lips touch cleanly
          targetPp = Math.max(targetPp, chV.pp * 0.42);
          targetJaw = 0.01;
          targetAa = 0;
          targetEe = 0;
          targetIh = 0;
          targetOh = 0;
          targetOu = 0;
        } else if (chV.isPause) {
          targetJaw *= 0.15;
          targetAa *= 0.15;
          targetEe *= 0.15;
          targetOh *= 0.15;
        } else {
          // Blend character phoneme weight with live syllable energy envelope
          const envScale = 0.25 + 0.75 * Math.min(1, syllablePulse * 1.15);
          targetAa = targetAa * 0.35 + chV.aa * 0.65 * envScale;
          targetEe = targetEe * 0.35 + chV.ee * 0.65 * envScale;
          targetIh = targetIh * 0.35 + chV.ih * 0.65 * envScale;
          targetOh = targetOh * 0.35 + chV.oh * 0.65 * envScale;
          targetOu = targetOu * 0.35 + chV.ou * 0.65 * envScale;
          targetFf = Math.max(targetFf * 0.4, chV.ff * 0.55 * envScale);
          targetDd = Math.max(targetDd * 0.4, chV.dd * 0.5 * envScale);
          targetSs = Math.max(targetSs * 0.4, chV.ss * 0.5 * envScale);
          targetJaw = Math.min(0.32, (targetJaw * 0.4 + chV.jaw * 0.6) * envScale);
        }
      }
    } else if (this.speakingActive && this.activeBrowserSpeech) {
      // CASE B: Zero-Token Browser Native SpeechSynthesis Phoneme-Cadence Lip-Sync
      const bs = this.activeBrowserSpeech;
      const nowSec = performance.now() / 1000;
      const elapsed = Math.max(0, nowSec - bs.startedAtPerfSec);
      const chars = Array.from(bs.text);
      const progressIdx = Math.min(
        chars.length - 1,
        Math.max(
          bs.currentCharIndex,
          Math.floor((elapsed / bs.estimatedDurationSec) * chars.length)
        )
      );
      const currentChar = chars[progressIdx] || 'a';
      const chV = mapCharacterToViseme(currentChar);

      // 5.2 Hz natural syllable articulation wave
      const syllableWave = 0.45 + 0.35 * Math.sin(elapsed * Math.PI * 2 * 5.2);
      targetEnergy = chV.isPause ? 0.05 : 0.35 + 0.25 * syllableWave;
      targetAccent = chV.isPause ? 0.04 : 0.25 + 0.2 * Math.max(0, Math.sin(elapsed * 8.0));

      targetAa = chV.aa * syllableWave;
      targetEe = chV.ee * syllableWave;
      targetIh = chV.ih * syllableWave;
      targetOh = chV.oh * syllableWave;
      targetOu = chV.ou * syllableWave;
      targetPp = chV.pp * 0.45;
      targetFf = chV.ff * 0.45;
      targetDd = chV.dd * 0.4;
      targetSs = chV.ss * 0.4;
      targetJaw = chV.pp > 0.5 || chV.isPause ? 0.01 : chV.jaw * syllableWave * 0.35;
    }

    // Winner-Take-Most Viseme Normalization:
    // glTF morph targets are additive, so activating multiple vowel/consonant targets at once
    // causes unnatural mouth stretching. Keep only the dominant shape + 25% of the runner-up,
    // and cap total mouth morph influence to natural human speech amplitude (<= 0.36).
    const shapes = [
      { key: 'aa', val: targetAa },
      { key: 'ee', val: targetEe },
      { key: 'ih', val: targetIh },
      { key: 'oh', val: targetOh },
      { key: 'ou', val: targetOu },
      { key: 'pp', val: targetPp },
      { key: 'ff', val: targetFf },
      { key: 'dd', val: targetDd },
      { key: 'ss', val: targetSs }
    ];
    shapes.sort((a, b) => b.val - a.val);
    const normMap: Record<string, number> = {
      aa: 0,
      ee: 0,
      ih: 0,
      oh: 0,
      ou: 0,
      pp: 0,
      ff: 0,
      dd: 0,
      ss: 0
    };
    if (shapes[0].val > 0.01) {
      normMap[shapes[0].key] = Math.min(0.32, shapes[0].val * 0.34);
      if (shapes[1].val > 0.02 && shapes[0].key !== 'pp') {
        normMap[shapes[1].key] = Math.min(0.1, shapes[1].val * 0.12);
      }
    }
    targetAa = normMap.aa;
    targetEe = normMap.ee;
    targetIh = normMap.ih;
    targetOh = normMap.oh;
    targetOu = normMap.ou;
    targetPp = normMap.pp;
    targetFf = normMap.ff;
    targetDd = normMap.dd;
    targetSs = normMap.ss;
    targetJaw = Math.min(0.14, targetJaw * 0.42);

    const attackRate = 16;
    const releaseRate = 12;
    const smooth = (current: number, target: number): number => {
      const rate = target > current ? attackRate : releaseRate;
      const next = current + (target - current) * (1 - Math.exp(-rate * dt));
      return next < 0.004 ? 0 : next;
    };

    this.smoothedVisemes.aa = smooth(this.smoothedVisemes.aa, targetAa);
    this.smoothedVisemes.ee = smooth(this.smoothedVisemes.ee, targetEe);
    this.smoothedVisemes.ih = smooth(this.smoothedVisemes.ih, targetIh);
    this.smoothedVisemes.oh = smooth(this.smoothedVisemes.oh, targetOh);
    this.smoothedVisemes.ou = smooth(this.smoothedVisemes.ou, targetOu);
    this.smoothedVisemes.pp = smooth(this.smoothedVisemes.pp, targetPp);
    this.smoothedVisemes.ff = smooth(this.smoothedVisemes.ff, targetFf);
    this.smoothedVisemes.dd = smooth(this.smoothedVisemes.dd, targetDd);
    this.smoothedVisemes.ss = smooth(this.smoothedVisemes.ss, targetSs);
    this.smoothedVisemes.jawOpen = smooth(this.smoothedVisemes.jawOpen, targetJaw);
    this.smoothedVisemes.energy = smooth(this.smoothedVisemes.energy, targetEnergy);
    this.smoothedVisemes.pitchAccent = smooth(this.smoothedVisemes.pitchAccent, targetAccent);
    this.smoothedVisemes.isSpeaking = this.speakingActive;

    if (
      this.speakingActive &&
      !this.metrics.firstMouthMovementAt &&
      (this.smoothedVisemes.jawOpen > 0.03 ||
        this.smoothedVisemes.aa > 0.03 ||
        this.smoothedVisemes.oh > 0.03 ||
        this.smoothedVisemes.ee > 0.03)
    ) {
      this.metrics.firstMouthMovementAt = Date.now();
      this.emitTelemetry();
    }

    return this.smoothedVisemes;
  }

  /**
   * Starts real-time Microphone VAD for end-of-speech detection (~400ms silence) and Barge-In.
   */
  public async startMicVad(callbacks: {
    silenceThresholdMs?: number;
    onSpeechStart?: () => void;
    onBargeIn?: () => void;
    onEndOfSpeech?: (endOfSpeechTimestamp: number) => void;
  }): Promise<void> {
    this.stopMicVad();
    this.vadSilenceThresholdMs = callbacks.silenceThresholdMs ?? 400;

    const ctx = this.ensureContext();
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    this.micSource = ctx.createMediaStreamSource(this.micStream);
    this.micAnalyser = ctx.createAnalyser();
    this.micAnalyser.fftSize = 512;
    this.micSource.connect(this.micAnalyser);

    const buf = new Uint8Array(this.micAnalyser.fftSize);
    let userSpeaking = false;
    let speechStartedAt = 0;
    let lastVoiceActivityAt = 0;

    const tick = () => {
      if (!this.micAnalyser) return;
      this.micAnalyser.getByteTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      const now = Date.now();

      if (rms > 0.045) {
        lastVoiceActivityAt = now;
        if (!userSpeaking) {
          userSpeaking = true;
          speechStartedAt = now;
          callbacks.onSpeechStart?.();
        } else if (this.speakingActive && now - speechStartedAt > 110) {
          this.stopAll();
          callbacks.onBargeIn?.();
        }
      } else if (userSpeaking && now - lastVoiceActivityAt >= this.vadSilenceThresholdMs) {
        userSpeaking = false;
        callbacks.onEndOfSpeech?.(now);
      }

      this.vadRafId = requestAnimationFrame(tick);
    };

    this.vadRafId = requestAnimationFrame(tick);
  }

  public stopMicVad(): void {
    if (this.vadRafId !== null) {
      cancelAnimationFrame(this.vadRafId);
      this.vadRafId = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {
        // Ignore disconnect error
      }
      this.micSource = null;
    }
    if (this.micStream) {
      for (const track of this.micStream.getTracks()) {
        track.stop();
      }
      this.micStream = null;
    }
    this.micAnalyser = null;
  }

  public onSpeakingStateChange(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onPhraseBoundary(listener: PhraseBoundaryListener): () => void {
    this.phraseListeners.add(listener);
    return () => this.phraseListeners.delete(listener);
  }

  public onTelemetryUpdate(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => this.telemetryListeners.delete(listener);
  }

  private emitTelemetry(): void {
    const snap = { ...this.metrics };
    for (const cb of this.telemetryListeners) {
      cb(snap);
    }
  }

  private setSpeakingState(next: boolean): void {
    if (this.speakingActive === next) return;
    this.speakingActive = next;
    for (const cb of this.stateListeners) {
      cb(next);
    }
  }
}

export function mapCharacterToViseme(ch: string): {
  aa: number;
  ee: number;
  ih: number;
  oh: number;
  ou: number;
  pp: number;
  ff: number;
  dd: number;
  ss: number;
  jaw: number;
  isPause: boolean;
} {
  const c = ch.toLowerCase();
  if (!c || ' ,.!?;:।-—\n\t'.includes(c)) {
    return {
      aa: 0,
      ee: 0,
      ih: 0,
      oh: 0,
      ou: 0,
      pp: 0.12,
      ff: 0,
      dd: 0,
      ss: 0,
      jaw: 0,
      isPause: true
    };
  }
  // Bilabial closure: p, b, m (lips press closed)
  if ('pbmपफबभमপফবভম'.includes(c)) {
    return {
      aa: 0,
      ee: 0,
      ih: 0,
      oh: 0,
      ou: 0,
      pp: 0.92,
      ff: 0,
      dd: 0,
      ss: 0,
      jaw: 0.02,
      isPause: false
    };
  }
  // Labiodental: f, v
  if ('fvवৱ'.includes(c)) {
    return {
      aa: 0.05,
      ee: 0.1,
      ih: 0.15,
      oh: 0,
      ou: 0,
      pp: 0,
      ff: 0.85,
      dd: 0,
      ss: 0,
      jaw: 0.1,
      isPause: false
    };
  }
  // Open vowels: Latin a, Devanagari अ आ ा, Assamese/Bengali অ আ া
  if ('aअआाঅআা'.includes(c)) {
    return {
      aa: 0.95,
      ee: 0.05,
      ih: 0.1,
      oh: 0.15,
      ou: 0,
      pp: 0,
      ff: 0,
      dd: 0,
      ss: 0,
      jaw: 0.86,
      isPause: false
    };
  }
  // Spread front vowels: Latin e, Devanagari इ ई ए ऐ ि ी े ै, Assamese ই ঈ এ ঐ ি ী ে ৈ
  if ('eइईएऐिीेैইঈএঐিীেৈ'.includes(c)) {
    return {
      aa: 0.2,
      ee: 0.88,
      ih: 0.5,
      oh: 0,
      ou: 0,
      pp: 0,
      ff: 0,
      dd: 0.15,
      ss: 0,
      jaw: 0.44,
      isPause: false
    };
  }
  // Sibilants & affricates: s, z, c, x, sh, ch, j
  if ('szcxसशषचछजझসশষচছজঝ'.includes(c)) {
    return {
      aa: 0.08,
      ee: 0.35,
      ih: 0.55,
      oh: 0,
      ou: 0,
      pp: 0,
      ff: 0,
      dd: 0.25,
      ss: 0.85,
      jaw: 0.18,
      isPause: false
    };
  }
  // Dental / alveolar / retroflex consonants + i/y
  if ('iytdnrlतथदधनलרטठडढणতথদধনলৰটঠডঢণ'.includes(c)) {
    return {
      aa: 0.18,
      ee: 0.35,
      ih: 0.75,
      oh: 0,
      ou: 0,
      pp: 0,
      ff: 0,
      dd: 0.78,
      ss: 0.15,
      jaw: 0.32,
      isPause: false
    };
  }
  // Rounded mid vowels: Latin o, Devanagari ओ औ ो ौ, Assamese ও ঔ ো ৌ
  if ('oओऔोौওঔোৌ'.includes(c)) {
    return {
      aa: 0.38,
      ee: 0,
      ih: 0,
      oh: 0.92,
      ou: 0.35,
      pp: 0,
      ff: 0,
      dd: 0,
      ss: 0,
      jaw: 0.68,
      isPause: false
    };
  }
  // Pursed close vowels: Latin u w, Devanagari उ ऊ ु ू, Assamese উ ঊ ু ূ
  if ('uwउऊुूউঊুূ'.includes(c)) {
    return {
      aa: 0.1,
      ee: 0,
      ih: 0,
      oh: 0.35,
      ou: 0.92,
      pp: 0,
      ff: 0,
      dd: 0,
      ss: 0,
      jaw: 0.26,
      isPause: false
    };
  }
  // Velar/glottal consonants with inherent Hindi/Assamese schwa ('k, g, h, क, ख, ग, घ, ह, ক, খ, গ, ঘ, হ')
  return {
    aa: 0.52,
    ee: 0.15,
    ih: 0.25,
    oh: 0.15,
    ou: 0,
    pp: 0,
    ff: 0,
    dd: 0.25,
    ss: 0,
    jaw: 0.48,
    isPause: false
  };
}

export const avatarAudioEngine = new AvatarAudioEngine();
