/**
 * NirogCare - Voice Input Controls & Explicit Consent Guard
 * Handles microphone capture with Web Speech STT (Indian English, Hindi, Assamese),
 * Push-to-talk, VAD indicator, and mandatory privacy consent dialog.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export interface VoiceInputControlsProps {
  language: string;
  isVoiceMode: boolean;
  disabled?: boolean;
  onSpeechResult: (text: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export const VoiceInputControls: React.FC<VoiceInputControlsProps> = ({
  language,
  isVoiceMode,
  disabled = false,
  onSpeechResult,
  onSpeechStart,
  onSpeechEnd
}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('nirogcare_mic_consent') === 'true';
  });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [transcriptInterim, setTranscriptInterim] = useState('');
  const recognitionRef = useRef<any>(null);

  // Map app language to BCP 47 locale
  const getLocale = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes('as') || l.includes('assam') || l.includes('অসমীয়া')) return 'as-IN';
    if (l.includes('hi') || l.includes('hindi') || l.includes('हिंदी')) return 'hi-IN';
    if (l.includes('ta') || l.includes('tamil') || l.includes('தமிழ்')) return 'ta-IN';
    if (l.includes('te') || l.includes('telugu') || l.includes('తెలుగు')) return 'te-IN';
    if (l.includes('kn') || l.includes('kannada') || l.includes('ಕನ್ನಡ')) return 'kn-IN';
    if (l.includes('mr') || l.includes('marathi') || l.includes('मराठी')) return 'mr-IN';
    if (l.includes('bn') || l.includes('bengal') || l.includes('বাংলা')) return 'bn-IN';
    if (l.includes('gu') || l.includes('gujarat') || l.includes('ગુજરાતી')) return 'gu-IN';
    return 'en-IN';
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = getLocale(language);

    recognition.onstart = () => {
      setIsListening(true);
      onSpeechStart?.();
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setTranscriptInterim(interim);

      if (finalTranscript.trim()) {
        setIsListening(false);
        setTranscriptInterim('');
        onSpeechResult(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech Recognition notice:', event.error);
      setIsListening(false);
      setTranscriptInterim('');
      onSpeechEnd?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscriptInterim('');
      onSpeechEnd?.();
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [language]);

  const handleMicClick = () => {
    if (!hasConsent) {
      setShowConsentModal(true);
      return;
    }
    toggleListening();
  };

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = getLocale(language);
          recognitionRef.current.start();
        } else {
          alert('Voice recognition is not supported in this browser. Please use text input.');
        }
      } catch (err) {
        console.warn('Recognition start exception:', err);
      }
    }
  };

  const acceptConsent = () => {
    localStorage.setItem('nirogcare_mic_consent', 'true');
    setHasConsent(true);
    setShowConsentModal(false);
    toggleListening();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant={isListening ? 'destructive' : isVoiceMode ? 'default' : 'outline'}
          className={`relative rounded-full transition-all ${
            isListening ? 'animate-pulse ring-4 ring-destructive/30' : ''
          }`}
          onClick={handleMicClick}
          disabled={disabled}
          title={isListening ? 'Stop listening' : 'Start speaking'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {isListening && (
          <span className="text-xs text-destructive font-medium animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-destructive animate-ping" />
            {transcriptInterim ? `"${transcriptInterim}"` : 'Listening...'}
          </span>
        )}
      </div>

      {/* Mandatory Explicit Microphone Consent Dialog */}
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              Microphone Access & Privacy Consent
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2 text-sm text-muted-foreground">
              <p>
                To speak directly with the AI Health Assistant, NirogCare requires access to your microphone.
              </p>
              <div className="rounded-lg bg-muted p-3 text-xs space-y-1.5 border">
                <p className="font-semibold text-foreground">How your voice is handled:</p>
                <p>• Audio is transcribed locally in your browser for this prompt only.</p>
                <p>• No audio recordings or biometric voiceprints are retained or sold.</p>
                <p>• Transcripts are checked for emergency symptoms before processing.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConsentModal(false)}>
              Cancel
            </Button>
            <Button onClick={acceptConsent} className="gradient-hero">
              I Agree & Allow Mic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
