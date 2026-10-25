/**
 * Character & Language Configuration (`/src/config/characters.ts`)
 * Defines the default female medical-professional AI assistant and additional
 * male/female characters, their photorealistic studio video/poster assets,
 * real 3D human GLB paths (with 66-72 ARKit + Oculus Viseme morph targets),
 * personality prompts, and per-language ElevenLabs v4 voice configurations.
 *
 * Safety rule: Always labeled as an "AI Health Assistant" (never "AI Doctor").
 */

export type LanguageCode = 'en' | 'hi' | 'as' | 'bn';

export type ElevenLabsModelId =
  | 'eleven_v4'
  | 'eleven_v4_turbo'
  | 'eleven_v3'
  | 'eleven_multilingual_v2'
  | 'eleven_flash_v2_5';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  scriptInstruction: string;
  elevenLabsModel: ElevenLabsModelId;
  bcp47Locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'Indian English',
    nativeName: 'English (India)',
    scriptInstruction: 'Reply in natural Indian English using Latin script.',
    elevenLabsModel: 'eleven_v4_turbo',
    bcp47Locale: 'en-IN'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    scriptInstruction: 'Reply entirely in natural spoken Hindi using Devanagari script (हिन्दी).',
    elevenLabsModel: 'eleven_v4_turbo',
    bcp47Locale: 'hi-IN'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    scriptInstruction:
      'Reply entirely in natural spoken Assamese using Assamese script (অসমীয়া). Use authentic Assamese vocabulary and grammar (such as মই, আপুনি, কেনেকুৱা, বিশ্ৰাম).',
    elevenLabsModel: 'eleven_v4_turbo',
    bcp47Locale: 'as-IN'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    scriptInstruction: 'Reply entirely in natural spoken Bengali using Bengali script (বাংলা).',
    elevenLabsModel: 'eleven_v4_turbo',
    bcp47Locale: 'bn-IN'
  }
];

export interface CharacterAppearance {
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  lipColor: string;
  outfitPrimary: string;
  outfitSecondary: string;
  hairStyle: 'bun' | 'waves' | 'short-part' | 'textured-crop';
  headWidthScale: number;
  jawWidthScale: number;
  browThickness: number;
  hasStethoscope?: boolean;
  fallbackPitchCents: number;
  fallbackRate: number;
}

export interface CharacterConfig {
  id: string;
  name: string;
  gender: 'female' | 'male';
  title: string;
  personaPrompt: string;
  /** Path to real 3D human GLB with 66-72 ARKit + Oculus Viseme blendshapes */
  glbUrl: string;
  /** 1080p photorealistic human studio video loop */
  videoUrl: string;
  /** High-resolution photorealistic human studio portrait poster */
  posterUrl: string;
  /** Gemini Neural TTS voice name for realistic human fallback if ElevenLabs quota is reached */
  geminiVoiceName: 'Aoede' | 'Kore' | 'Puck' | 'Charon';
  appearance: CharacterAppearance;
  voiceMap: Record<LanguageCode, string>;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'aria',
    name: 'Aria',
    gender: 'female',
    title: 'AI Health Assistant',
    glbUrl: '/avatars/medical_assistant.glb',
    videoUrl: '/avatars/doctor-loop-1080.mp4',
    posterUrl: '/avatars/doctor-poster-1080.jpg',
    geminiVoiceName: 'Aoede',
    personaPrompt:
      'You are Aria, NirogCare AI Health Assistant (an AI assistant, not a doctor). You speak warmly, calmly, and clearly like a compassionate clinical health assistant in India. Never diagnose conditions or prescribe medicines; offer general evidence-based wellness guidance and advise when to consult a qualified clinician.',
    appearance: {
      skinColor: '#e2a985',
      hairColor: '#1b1411',
      eyeColor: '#3b2416',
      lipColor: '#b85d5c',
      outfitPrimary: '#0f766e',
      outfitSecondary: '#f8fafc',
      hairStyle: 'bun',
      headWidthScale: 0.96,
      jawWidthScale: 0.92,
      browThickness: 0.9,
      hasStethoscope: false,
      fallbackPitchCents: 60,
      fallbackRate: 1.03
    },
    voiceMap: {
      // Sarah - Warm, Reassuring, Natural Human Female voice
      en: 'EXAVITQu4vr4xnSDxMaL',
      hi: 'EXAVITQu4vr4xnSDxMaL',
      as: 'EXAVITQu4vr4xnSDxMaL',
      bn: 'EXAVITQu4vr4xnSDxMaL'
    }
  },
  {
    id: 'priya',
    name: 'Priya',
    gender: 'female',
    title: 'AI Wellness Assistant',
    glbUrl: '/avatars/avaturn.glb',
    videoUrl: '/avatars/advisor-loop-1080.mp4',
    posterUrl: '/avatars/doctor-poster-1080.jpg',
    geminiVoiceName: 'Kore',
    personaPrompt:
      'You are Priya, NirogCare AI Wellness Assistant (an AI assistant, not a doctor). You speak with gentle encouragement and practical clarity.',
    appearance: {
      skinColor: '#d99b72',
      hairColor: '#231712',
      eyeColor: '#2d1e14',
      lipColor: '#c25964',
      outfitPrimary: '#0369a1',
      outfitSecondary: '#f1f5f9',
      hairStyle: 'waves',
      headWidthScale: 0.94,
      jawWidthScale: 0.9,
      browThickness: 0.85,
      hasStethoscope: false,
      fallbackPitchCents: 140,
      fallbackRate: 1.06
    },
    voiceMap: {
      // Jessica - Expressive Natural Female voice
      en: 'cgSgspJ2msm6clMCkdW9',
      hi: 'cgSgspJ2msm6clMCkdW9',
      as: 'cgSgspJ2msm6clMCkdW9',
      bn: 'cgSgspJ2msm6clMCkdW9'
    }
  },
  {
    id: 'aarav',
    name: 'Aarav',
    gender: 'male',
    title: 'AI Health Assistant',
    glbUrl: '/avatars/avatarsdk.glb',
    videoUrl: '/avatars/specialist-loop-1080.mp4',
    posterUrl: '/avatars/ravatar-doctor-poster.webp',
    geminiVoiceName: 'Puck',
    personaPrompt:
      'You are Aarav, NirogCare AI Health Assistant (an AI assistant, not a doctor). You explain health guidance calmly and concisely in natural spoken language.',
    appearance: {
      skinColor: '#d19168',
      hairColor: '#161210',
      eyeColor: '#2c1d12',
      lipColor: '#9c5a52',
      outfitPrimary: '#1e3a8a',
      outfitSecondary: '#cbd5e1',
      hairStyle: 'short-part',
      headWidthScale: 1.04,
      jawWidthScale: 1.08,
      browThickness: 1.25,
      hasStethoscope: false,
      fallbackPitchCents: -280,
      fallbackRate: 0.98
    },
    voiceMap: {
      // Chris - Grounded Natural Male voice
      en: 'iP95p4xoKVk53GoZ742B',
      hi: 'iP95p4xoKVk53GoZ742B',
      as: 'iP95p4xoKVk53GoZ742B',
      bn: 'iP95p4xoKVk53GoZ742B'
    }
  },
  {
    id: 'rohan',
    name: 'Rohan',
    gender: 'male',
    title: 'AI Wellness Assistant',
    glbUrl: '/avatars/avatarsdk.glb',
    videoUrl: '/avatars/specialist-loop-1080.mp4',
    posterUrl: '/avatars/ravatar-doctor-portrait.webp',
    geminiVoiceName: 'Charon',
    personaPrompt:
      'You are Rohan, NirogCare AI Wellness Assistant (an AI assistant, not a doctor). Keep your spoken replies direct, warm, and conversational.',
    appearance: {
      skinColor: '#c6845c',
      hairColor: '#120f0d',
      eyeColor: '#24180e',
      lipColor: '#91524b',
      outfitPrimary: '#065f46',
      outfitSecondary: '#d1fae5',
      hairStyle: 'textured-crop',
      headWidthScale: 1.06,
      jawWidthScale: 1.12,
      browThickness: 1.35,
      hasStethoscope: false,
      fallbackPitchCents: -360,
      fallbackRate: 1.02
    },
    voiceMap: {
      // Brian - Warm Natural Male voice
      en: 'nPczCjzI2devNBz1zQrb',
      hi: 'nPczCjzI2devNBz1zQrb',
      as: 'nPczCjzI2devNBz1zQrb',
      bn: 'nPczCjzI2devNBz1zQrb'
    }
  }
];

export function getCharacterById(id: string): CharacterConfig {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

export function getLanguageByCode(code: string): LanguageConfig {
  const norm = code.toLowerCase().trim();
  if (norm === 'en-in' || norm.startsWith('en')) return SUPPORTED_LANGUAGES[0];
  if (norm === 'hi-in' || norm.startsWith('hi') || norm === 'हिंदी' || norm === 'हिन्दी') {
    return SUPPORTED_LANGUAGES[1];
  }
  if (norm === 'as-in' || norm.startsWith('as') || norm === 'অসমীয়া' || norm.includes('assam')) {
    return SUPPORTED_LANGUAGES[2];
  }
  if (norm === 'bn-in' || norm.startsWith('bn') || norm === 'বাংলা') {
    return SUPPORTED_LANGUAGES[3];
  }
  return (
    SUPPORTED_LANGUAGES.find(
      (l) => l.code === norm || l.name.toLowerCase() === norm || l.nativeName === code
    ) || SUPPORTED_LANGUAGES[0]
  );
}
