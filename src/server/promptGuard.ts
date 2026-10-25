/**
 * NirogCare Server - Pre-LLM Prompt-Injection Guard & Language Switcher (`src/server/promptGuard.ts`)
 *
 * Built via strict TDD (Red -> Green -> Refactor):
 * 1. `detectPromptInjection`: Deterministically blocks prompt-injection, system-prompt extraction,
 *    and role-hijack ("act as a licensed doctor / DAN mode / ignore previous instructions")
 *    across English (`en`), Hindi (`hi`), and Assamese (`as`) BEFORE calling the LLM.
 * 2. `resolveEffectiveLanguage`: Detects when a user switches scripts or languages mid-conversation
 *    so the reply is always delivered in the language the user actually spoke or typed.
 */

import type { LanguageCode } from '../config/characters';

export interface PromptGuardResult {
  isInjection: boolean;
  safeReply?: string;
  languageCode: LanguageCode;
}

const SAFE_INJECTION_REFUSALS: Record<LanguageCode, string> = {
  en: 'I am a NirogCare AI health assistant, not a doctor. I cannot override my safety rules, reveal system configurations, diagnose conditions, or prescribe medicines. Please ask a general wellness question.',
  hi: 'मैं निरोगकेयर एआई स्वास्थ्य सहायक हूँ, डॉक्टर नहीं। मैं अपने सुरक्षा नियमों को नहीं बदल सकती और न ही किसी बीमारी का निदान या दवा लिख सकती हूँ। कृपया सामान्य स्वास्थ्य प्रश्न पूछें।',
  as: 'মই নিৰোগকেয়াৰ এআই স্বাস্থ্য সহায়ক, চিকিৎসক নহয়। মই মোৰ সুৰক্ষা নিয়ম সলনি কৰিব নোৱাৰোঁ বা কোনো ৰোগ নিৰ্ণয় আৰু ঔষধ লিখিব নোৱাৰোঁ। অনুগ্ৰহ কৰি সাধাৰণ স্বাস্থ্য সম্পৰ্কীয় প্ৰশ্ন সোধক।',
  bn: 'আমি নিরোগকেয়ার এআই স্বাস্থ্য সহায়ক, ডাক্তার নই। আমি আমার নিরাপত্তা নিয়ম পরিবর্তন করতে বা কোনো রোগ নির্ণয় ও ওষুধ লিখতে পারি না। অনুগ্রহ করে সাধারণ স্বাস্থ্য বিষয়ক প্রশ্ন করুন।'
};

const INJECTION_PATTERNS: RegExp[] = [
  // English prompt injection, role hijack, DAN jailbreak, secret/system prompt extraction
  /\b(ignore (all )?(previous|prior|above|system) (instructions|prompts|rules)|disregard (all )?(previous|prior|system) (instructions|rules)|forget (all )?(previous|prior) instructions)\b/i,
  /\b(reveal|print|show|output|repeat) (your |the )?(full )?(system prompt|hidden prompt|developer instructions|api[ _-]?key|gemini_api_key|elevenlabs_api_key|secret key)\b/i,
  /\b(you are now in dan mode|dan mode enabled|jailbreak|bypass safety (rules|filters)|without safety (rules|restrictions)|act as a licensed (medical )?doctor and prescribe)\b/i,
  // Hindi prompt injection / role hijack
  /(पिछले सभी निर्देश(ों को)? (भूल जाओ|अनदेखा करो|अनदेखा करें)|पुराने नियम भूल जाओ|असली डॉक्टर बनकर .* दवा लिखो|सिस्टम प्रॉम्प्ट दिखाओ)/i,
  // Assamese prompt injection / role hijack
  /(পূৰ্বৰ (সকলো )?নিৰ্দেশনা পাহৰি যাওক|পুৰণি নিয়মবোৰ বাদ দিয়ক|এজন চিকিৎসক হিচাপে মোক ঔষধ লিখি দিয়ক|চিকিৎসক হিচাপে .* ঔষধ লিখক|চিষ্টেম প্ৰম্পট দেখুৱাওক)/i
];

export function resolveEffectiveLanguage(
  userText: string,
  selectedLang: string = 'en'
): LanguageCode {
  const trimmed = (userText || '').trim();
  const baseLang: LanguageCode =
    selectedLang.startsWith('hi')
      ? 'hi'
      : selectedLang.startsWith('as')
      ? 'as'
      : selectedLang.startsWith('bn')
      ? 'bn'
      : 'en';

  if (!trimmed) return baseLang;

  // 1. Check Assamese/Bengali Unicode block (\u0980-\u09FF) or Romanized Assamese markers
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    if (/[ৰৱ]/.test(trimmed) || baseLang !== 'bn') {
      return 'as';
    }
    return 'bn';
  }
  if (/\b(mur|mor|mora|bikh|jor|hoise|kene|logai|ushah|bukur)\b/i.test(trimmed)) {
    return 'as';
  }

  // 2. Check Devanagari Unicode block (\u0900-\u097F) or Romanized Hindi markers
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return 'hi';
  }
  if (/\b(mujhe|mera|meri|bukhar|dard|sir|khansi|kya|karu|pet)\b/i.test(trimmed)) {
    return 'hi';
  }

  // 3. If the message is purely Latin ASCII with common English words, switch to 'en'
  if (
    /^[A-Za-z0-9\s.,?!'"-;:()]+$/.test(trimmed) &&
    /\b(what|how|should|have|fever|headache|cough|pain|help|remedies|doctor|sleep|throat|cold|water)\b/i.test(
      trimmed
    )
  ) {
    return 'en';
  }

  return baseLang;
}

export function detectPromptInjection(
  userText: string,
  requestedLang: string = 'en'
): PromptGuardResult {
  const effectiveLang = resolveEffectiveLanguage(userText, requestedLang);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(userText)) {
      return {
        isInjection: true,
        safeReply: SAFE_INJECTION_REFUSALS[effectiveLang],
        languageCode: effectiveLang
      };
    }
  }

  return {
    isInjection: false,
    languageCode: effectiveLang
  };
}
