/**
 * NirogCare - Dedicated Full-Stage AI Avatar Section (RAVATAR / HeyGen 3D Photorealistic Studio)
 * Shown exclusively when the user selects the "AI Avatar" section in /chat.
 * Combines:
 *   1. Full-stage 1080p Photorealistic 3D Doctor Avatar (with HeyGen API V2 token handshake & instant HD stream)
 *   2. Live Voice Interaction (Push-to-talk STT + Multilingual TTS + Live Audio Equalizer + Captions)
 *   3. Simple Integrated Text Bar at the bottom of the Avatar stage
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  Mic,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Send,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { VoiceInputControls } from './VoiceInputControls';
import { Button } from '@/components/ui/button';

export interface RavatarAvatarProps {
  isVoiceMode: boolean;
  avatarEnabled: boolean;
  onToggleAvatar: (enabled: boolean) => void;
  onModeChange?: (mode: 'text' | 'voice') => void;
  language: string;
  isSpeaking?: boolean;
  isLoading?: boolean;
  currentCaption?: string;
  latestBotReply?: string;
  latestUserMessage?: string;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  onSendMessage?: (text?: string) => void;
  onRepeatSpeech?: () => void;
  onStopSpeech?: () => void;
  onAvatarError?: (err: string) => void;
  onMuteChange?: (muted: boolean) => void;
}

interface AvatarPersona {
  id: 'doctor' | 'specialist' | 'advisor';
  name: string;
  role: string;
  videoUrl: string;
  mobileVideoUrl: string;
  posterUrl: string;
}

const AVATAR_PERSONAS: AvatarPersona[] = [
  {
    id: 'doctor',
    name: 'Dr. Aria (AI)',
    role: 'Clinical Health Companion',
    videoUrl: '/avatars/doctor-loop-1080.mp4',
    mobileVideoUrl: '/avatars/doctor-loop-portrait.mp4',
    posterUrl: '/avatars/doctor-poster-1080.jpg'
  },
  {
    id: 'specialist',
    name: 'Dr. Marcus (AI)',
    role: 'Senior Wellness Advisor',
    videoUrl: '/avatars/specialist-loop-1080.mp4',
    mobileVideoUrl: '/avatars/specialist-loop-1080.mp4',
    posterUrl: '/avatars/ravatar-doctor-poster.webp'
  },
  {
    id: 'advisor',
    name: 'Dr. Maya (AI)',
    role: 'Preventive Care Guide',
    videoUrl: '/avatars/advisor-loop-1080.mp4',
    mobileVideoUrl: '/avatars/advisor-loop-1080.mp4',
    posterUrl: '/avatars/doctor-poster-1080.jpg'
  }
];

export const RavatarAvatar: React.FC<RavatarAvatarProps> = ({
  onModeChange,
  language,
  isSpeaking = false,
  isLoading = false,
  currentCaption = '',
  latestBotReply = '',
  latestUserMessage = '',
  inputValue = '',
  onInputChange,
  onSendMessage,
  onRepeatSpeech,
  onStopSpeech,
  onAvatarError,
  onMuteChange
}) => {
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [heygenReady, setHeygenReady] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<AvatarPersona>(AVATAR_PERSONAS[0]);
  const [waveTick, setWaveTick] = useState(0);
  const [localInput, setLocalInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const effectiveInput = onInputChange ? inputValue : localInput;
  const setEffectiveInput = (val: string) => {
    if (onInputChange) {
      onInputChange(val);
    } else {
      setLocalInput(val);
    }
  };

  // Animate voice spectrum bars while speaking
  useEffect(() => {
    if (!isSpeaking) return;
    const interval = setInterval(() => {
      setWaveTick((t) => t + 1);
    }, 85);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Adjust video playback speed subtly when speaking for natural liveliness
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      vid.playbackRate = isSpeaking ? 1.18 : 1.0;
      if (vid.paused) {
        vid.play().catch(() => {});
      }
    } catch {}
  }, [isSpeaking, selectedPersona]);

  // Handshake with backend HeyGen API V2 & RAVATAR streaming proxy
  useEffect(() => {
    let isCancelled = false;

    async function initAvatarStream() {
      try {
        // 1. Verify HeyGen API V2 token via server-side proxy
        const heygenRes = await fetch('/api/heygen/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pseudonymousId: localStorage.getItem('nirogcare_anon_id') || undefined
          })
        });
        if (heygenRes.ok) {
          const hgData = await heygenRes.json();
          if (!isCancelled && hgData.configured) {
            setHeygenReady(true);
          }
        }

        // 2. Also probe RAVATAR live stream if configured
        const tokenRes = await fetch('/api/ravatar/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pseudonymousId: localStorage.getItem('nirogcare_anon_id') || undefined
          })
        });

        if (!tokenRes.ok) return;
        const tokenData = await tokenRes.json();
        if (isCancelled || !tokenData.token) return;

        const liveRes = await fetch('/api/ravatar/start-live', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenData.token}`
          },
          body: JSON.stringify({
            avatarId: selectedPersona.id,
            token: tokenData.token
          })
        });

        if (!liveRes.ok) return;
        const liveData = await liveRes.json();
        if (!isCancelled && liveData.streamingUrl) {
          setStreamingUrl(liveData.streamingUrl);
        }
      } catch (err: any) {
        onAvatarError?.(err?.message || 'Using 1080p photoreal 3D stream');
      }
    }

    initAvatarStream();
    return () => {
      isCancelled = true;
    };
  }, [selectedPersona.id]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    onMuteChange?.(next);
    if (next && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      onStopSpeech?.();
    }
  };

  const handleTriggerSend = (overrideText?: string) => {
    const msg = (overrideText ?? effectiveInput).trim();
    if (!msg || isLoading) return;
    onSendMessage?.(msg);
    if (!overrideText) {
      setEffectiveInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#08111d] text-white overflow-hidden relative select-none">
      {/* Top Studio Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 bg-[#060d17]/90 backdrop-blur-md border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-widest text-white uppercase text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f5c518] shadow-[0_0_10px_#f5c518] animate-pulse" />
            <span>AI AVATAR STUDIO</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-medium text-[#f5c518] tracking-normal">
              {heygenReady ? 'HeyGen + RAVATAR 3D HD' : '3D Photoreal HD'}
            </span>
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>AI assistant, not a doctor</span>
          </div>
        </div>

        {/* Right Controls: Persona Switcher, Audio Controls, Switch to Text Section */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
            {AVATAR_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedPersona(persona)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedPersona.id === persona.id
                    ? 'bg-[#f5c518] text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={persona.role}
              >
                {persona.name}
              </button>
            ))}
          </div>

          {latestBotReply && (
            <button
              type="button"
              onClick={onRepeatSpeech}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 flex items-center gap-1 text-[11px] transition-colors"
              title="Replay Avatar Voice"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Replay Voice</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
            title={isMuted ? 'Unmute Avatar Voice' : 'Mute Avatar Voice'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onModeChange?.('text')}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 font-semibold flex items-center gap-1.5 text-[11px] transition-colors"
            title="Switch to Simple Text Section"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#f5c518]" />
            <span>Text Section Only</span>
          </button>
        </div>
      </div>

      {/* Center Full-Bleed 3D Photorealistic Stage (Matches https://ravatar.com Hero) */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center">
        {streamingUrl ? (
          <iframe
            ref={iframeRef}
            src={streamingUrl}
            title="Live 3D AI Avatar Stream"
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        ) : (
          <>
            {/* Full-screen 1080p Photorealistic 3D Doctor Video */}
            <video
              ref={videoRef}
              key={selectedPersona.videoUrl}
              src={selectedPersona.videoUrl}
              poster={selectedPersona.posterUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ${
                isSpeaking ? 'scale-[1.02] brightness-105' : 'scale-100'
              }`}
            />

            {/* Cinematic Left-to-Right Gradient Overlay so text & controls on left are super crisp while the 3D Doctor on the right is crystal clear */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(8,17,29,0.92) 0%, rgba(8,17,29,0.72) 38%, rgba(8,17,29,0.12) 68%, rgba(8,17,29,0.25) 100%)'
              }}
            />
          </>
        )}

        {/* Left Interactive Stage HUD (RAVATAR Hero Layout + Live Spoken Response Card) */}
        <div className="relative z-10 w-full max-w-xl px-5 sm:px-10 py-6 flex flex-col justify-center gap-4">
          {/* Role & Live Waveform Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold uppercase tracking-wider text-sky-300">
              <UserCheck className="w-3.5 h-3.5 text-[#f5c518]" />
              <span>{selectedPersona.role}</span>
            </div>

            {/* Live Voice Equalizer Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#f5c518]/30">
              <div className="flex items-center gap-0.5 h-3.5">
                {[0.5, 0.9, 1.0, 0.7, 0.95, 0.6, 0.85].map((factor, i) => {
                  const dynamicHeight = isSpeaking
                    ? Math.max(25, Math.min(100, Math.round(factor * 100 * (0.5 + 0.5 * Math.sin(waveTick * 0.8 + i * 1.2)))))
                    : 28;
                  return (
                    <span
                      key={i}
                      className={`w-0.5 rounded-full transition-all duration-100 ${
                        isSpeaking ? 'bg-[#f5c518]' : 'bg-emerald-400'
                      }`}
                      style={{ height: `${dynamicHeight}%` }}
                    />
                  );
                })}
              </div>
              <span className="text-[11px] font-semibold text-white">
                {isLoading
                  ? 'Thinking...'
                  : isSpeaking
                  ? 'Avatar Speaking...'
                  : 'Listening / Ready'}
              </span>
            </div>
          </div>

          {/* Hero Title (Matches RAVATAR Screenshot) */}
          <div>
            <h2 className="font-display font-bold text-white text-2xl sm:text-4xl leading-tight tracking-tight drop-shadow-md">
              Real-time Interactive
              <span className="block text-[#f5c518]">AI Health Avatar</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-md leading-relaxed">
              Speak with your voice or type below. Powered by Gemini in{' '}
              <span className="text-white font-semibold">{language}</span>.
            </p>
          </div>

          {/* Live Conversation / Spoken Response Box on the Avatar Stage */}
          <div className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl max-h-[220px] sm:max-h-[250px] overflow-y-auto space-y-2.5">
            {latestUserMessage && (
              <div className="text-xs text-sky-300/90 border-b border-white/10 pb-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-0.5">
                  You Asked:
                </span>
                <p className="font-medium text-white">&ldquo;{latestUserMessage}&rdquo;</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center gap-2.5 py-3 text-sm text-[#f5c518] font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{selectedPersona.name} is preparing your health guidance...</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#f5c518]">
                    <Sparkles className="w-3 h-3" />
                    {isSpeaking ? 'Live Spoken Response' : `${selectedPersona.name} Response`}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {(currentCaption || latestBotReply || 'Namaste! Tap the microphone button or type your health question below to talk with me directly.')
                    .split('**')
                    .map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-[#f5c518]">{part}</strong> : part))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Integrated Voice + Simple Text Input Section */}
      <div className="relative z-20 bg-[#060d17]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5 sm:gap-3">
          {/* Push-to-Talk Voice Button */}
          <div className="shrink-0">
            <VoiceInputControls
              language={language}
              isVoiceMode={true}
              disabled={isLoading}
              onSpeechResult={(transcript) => handleTriggerSend(transcript)}
              onSpeechStart={() => {
                if (window.speechSynthesis?.speaking) {
                  window.speechSynthesis.cancel();
                  onStopSpeech?.();
                }
              }}
            />
          </div>

          {/* Simple Clean Text Input for the Avatar Section */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={effectiveInput}
              onChange={(e) => setEffectiveInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTriggerSend();
                }
              }}
              placeholder="Talk with voice (Mic) or type to the AI Avatar..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f5c518]/60 text-sm transition-all"
            />
          </div>

          {/* Send Button */}
          <Button
            type="button"
            onClick={() => handleTriggerSend()}
            disabled={!effectiveInput.trim() || isLoading}
            className="rounded-xl h-11 px-4 bg-[#f5c518] hover:bg-[#ffcf2e] text-slate-950 font-bold shadow-lg shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Ask Avatar</span>
              </div>
            )}
          </Button>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-300/90">
            <AlertTriangle className="w-3 h-3 shrink-0 text-[#f5c518]" />
            <span>AI Assistant (not a doctor). General wellness info only — call 108 for emergencies.</span>
          </span>
          <span className="hidden sm:inline text-[10px]">Gemini Brain • HeyGen / RAVATAR 3D</span>
        </div>
      </div>
    </div>
  );
};
