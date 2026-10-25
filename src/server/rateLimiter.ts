/**
 * NirogCare Server - Rate Limiter, Spend Caps & Session Auth (`src/server/rateLimiter.ts`)
 * Protects against abuse, caps message lengths, enforces per-user rate limits,
 * and enforces daily spend caps for Gemini tokens and ElevenLabs character credits.
 */

import { getElevenLabsKeyCount } from './elevenLabsPool';

interface UserUsage {
  minuteCount: number;
  minuteResetAt: number;
  dailyCount: number;
  dailyResetAt: number;
}

const userStore = new Map<string, UserUsage>();

const MAX_MESSAGE_LENGTH = 1000;
const MAX_REQUESTS_PER_MINUTE = 45;
const MAX_REQUESTS_PER_DAY = 300;

// Daily global spend caps (configurable via server env)
const MAX_DAILY_GEMINI_TOKENS = Number(process.env.DAILY_GEMINI_TOKEN_CAP || 250_000);

export function getMaxDailyElevenLabsChars(): number {
  if (process.env.DAILY_ELEVENLABS_CHAR_CAP) {
    const val = Number(process.env.DAILY_ELEVENLABS_CHAR_CAP);
    if (!isNaN(val) && val > 0) return val;
  }
  const keyCount = getElevenLabsKeyCount();
  return Math.max(30_000, keyCount * 10_000);
}

let dailySpendResetAt = Date.now() + 24 * 60 * 60 * 1000;
let dailyGeminiTokensUsed = 0;
let dailyElevenLabsCharsUsed = 0;

function resetDailySpendIfNeeded(now: number): void {
  if (now > dailySpendResetAt) {
    dailyGeminiTokensUsed = 0;
    dailyElevenLabsCharsUsed = 0;
    dailySpendResetAt = now + 24 * 60 * 60 * 1000;
  }
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  remainingDaily?: number;
}

export function checkRateLimit(userId: string, messageLength: number): RateLimitCheckResult {
  if (messageLength > MAX_MESSAGE_LENGTH) {
    return {
      allowed: false,
      reason: `Message length exceeds maximum limit of ${MAX_MESSAGE_LENGTH} characters.`
    };
  }

  const now = Date.now();
  resetDailySpendIfNeeded(now);

  if (dailyGeminiTokensUsed >= MAX_DAILY_GEMINI_TOKENS) {
    return {
      allowed: false,
      reason: 'Daily AI token cap reached. Please try again tomorrow.'
    };
  }

  let usage = userStore.get(userId);

  if (!usage) {
    usage = {
      minuteCount: 0,
      minuteResetAt: now + 60 * 1000,
      dailyCount: 0,
      dailyResetAt: now + 24 * 60 * 60 * 1000
    };
    userStore.set(userId, usage);
  }

  if (now > usage.minuteResetAt) {
    usage.minuteCount = 0;
    usage.minuteResetAt = now + 60 * 1000;
  }

  if (now > usage.dailyResetAt) {
    usage.dailyCount = 0;
    usage.dailyResetAt = now + 24 * 60 * 60 * 1000;
  }

  if (usage.minuteCount >= MAX_REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      reason: 'Rate limit exceeded: Too many messages in a short time. Please wait a minute.'
    };
  }

  if (usage.dailyCount >= MAX_REQUESTS_PER_DAY) {
    return {
      allowed: false,
      reason: 'Daily usage limit reached. Please return tomorrow.'
    };
  }

  usage.minuteCount++;
  usage.dailyCount++;

  return {
    allowed: true,
    remainingDaily: MAX_REQUESTS_PER_DAY - usage.dailyCount
  };
}

export function recordGeminiTokenUsage(estimatedTokens: number): void {
  resetDailySpendIfNeeded(Date.now());
  dailyGeminiTokensUsed += Math.max(1, estimatedTokens);
}

export function checkAndRecordElevenLabsCredits(charCount: number): boolean {
  resetDailySpendIfNeeded(Date.now());
  const maxCap = getMaxDailyElevenLabsChars();
  if (dailyElevenLabsCharsUsed + charCount > maxCap) {
    return false;
  }
  dailyElevenLabsCharsUsed += charCount;
  return true;
}

export function getSpendCapSnapshot() {
  resetDailySpendIfNeeded(Date.now());
  return {
    dailyGeminiTokensUsed,
    maxDailyGeminiTokens: MAX_DAILY_GEMINI_TOKENS,
    dailyElevenLabsCharsUsed,
    maxDailyElevenLabsChars: getMaxDailyElevenLabsChars()
  };
}
