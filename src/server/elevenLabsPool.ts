/**
 * NirogCare Server - Multi-Key ElevenLabs Quota Pool & Auto-Failover (`src/server/elevenLabsPool.ts`)
 *
 * Enables pooling multiple free-tier ElevenLabs accounts (10,000 characters each).
 * When an active API key reaches its monthly or concurrency quota (HTTP 401/400 quota_exceeded, 429),
 * the pool automatically marks that key as exhausted and fails over immediately to the next
 * available key in the pool without dropping voice synthesis or returning an error to the user.
 *
 * Supports comma, semicolon, or newline-separated keys in either:
 *   - ELEVENLABS_API_KEYS="key1,key2,key3"
 *   - ELEVENLABS_API_KEY="key1,key2,key3"
 *
 * Safe Logging:
 *   API keys are always masked in logs (e.g., `sk_3a1b...9f8e`) so secrets are never leaked.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface KeySlot {
  key: string;
  masked: string;
  exhausted: boolean;
  exhaustedAt: number;
  exhaustReason?: string;
  rateLimitedUntil: number;
  lastUsedAt: number;
  charsSynthesized: number;
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return '****';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function getRawEnv(key: string): string {
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

export function parseKeyString(raw: string): string[] {
  if (!raw) return [];
  // Strip outer quotes if any
  let clean = raw.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  // Split by comma, semicolon, newline, or pipe
  const rawParts = clean.split(/[,;\n|]+/);
  const seen = new Set<string>();
  const keys: string[] = [];

  for (const part of rawParts) {
    const k = part.trim();
    // Valid ElevenLabs keys are at least 10 characters and don't contain placeholders
    if (k.length >= 10 && !k.startsWith('your_') && !seen.has(k)) {
      seen.add(k);
      keys.push(k);
    }
  }

  return keys;
}

class ElevenLabsKeyPool {
  private slots: KeySlot[] = [];
  private lastParsedRaw = '';
  private activeSlotIndex = 0;
  // Key quota exhaustion lasts for 24 hours (or process lifetime) before being re-probed
  private readonly EXHAUSTION_COOLDOWN_MS = 24 * 60 * 60 * 1000;
  // Rate limit backoff (HTTP 429) is 6 seconds
  private readonly RATE_LIMIT_COOLDOWN_MS = 6 * 1000;

  constructor() {
    this.refreshSlots();
  }

  public refreshSlots(): void {
    const raw =
      getRawEnv('ELEVENLABS_API_KEYS') ||
      getRawEnv('ELEVENLABS_API_KEY') ||
      process.env.ELEVENLABS_API_KEYS ||
      process.env.ELEVENLABS_API_KEY ||
      '';

    if (raw === this.lastParsedRaw && this.slots.length > 0) {
      return;
    }

    this.lastParsedRaw = raw;
    const parsedKeys = parseKeyString(raw);
    const existingMap = new Map<string, KeySlot>();
    for (const slot of this.slots) {
      existingMap.set(slot.key, slot);
    }

    this.slots = parsedKeys.map((key) => {
      const existing = existingMap.get(key);
      if (existing) {
        return existing;
      }
      return {
        key,
        masked: maskKey(key),
        exhausted: false,
        exhaustedAt: 0,
        rateLimitedUntil: 0,
        lastUsedAt: 0,
        charsSynthesized: 0
      };
    });

    if (this.activeSlotIndex >= this.slots.length) {
      this.activeSlotIndex = 0;
    }
  }

  public getKeyCount(): number {
    this.refreshSlots();
    return this.slots.length;
  }

  public getAllKeys(): string[] {
    this.refreshSlots();
    return this.slots.map((s) => s.key);
  }

  public getAvailableKeys(): KeySlot[] {
    this.refreshSlots();
    const now = Date.now();
    return this.slots.filter((slot) => {
      // If exhaustion cooldown expired, allow retry
      if (slot.exhausted && now - slot.exhaustedAt > this.EXHAUSTION_COOLDOWN_MS) {
        slot.exhausted = false;
        slot.exhaustReason = undefined;
      }
      if (slot.exhausted) return false;
      if (slot.rateLimitedUntil > now) return false;
      return true;
    });
  }

  /**
   * Returns the next available key slot in the pool.
   * If a slot is rate-limited or exhausted, it automatically advances to the next slot.
   */
  public getNextKey(): KeySlot | null {
    this.refreshSlots();
    if (this.slots.length === 0) return null;

    const available = this.getAvailableKeys();
    if (available.length === 0) {
      // Check if any slot is only temporarily rate-limited
      const nonExhausted = this.slots.filter((s) => !s.exhausted);
      if (nonExhausted.length > 0) {
        // Find the slot whose rate limit expires soonest
        nonExhausted.sort((a, b) => a.rateLimitedUntil - b.rateLimitedUntil);
        return nonExhausted[0];
      }
      return null;
    }

    // Round-robin selection among available slots
    for (let i = 0; i < this.slots.length; i++) {
      const idx = (this.activeSlotIndex + i) % this.slots.length;
      const candidate = this.slots[idx];
      if (available.includes(candidate)) {
        this.activeSlotIndex = (idx + 1) % this.slots.length;
        candidate.lastUsedAt = Date.now();
        return candidate;
      }
    }

    return available[0];
  }

  /**
   * Marks a key as exhausted (e.g. 10k quota exceeded, invalid key)
   * Logs rotation and returns number of remaining available keys.
   */
  public markExhausted(key: string, reason = 'quota_exceeded'): number {
    this.refreshSlots();
    const slot = this.slots.find((s) => s.key === key);
    if (slot) {
      slot.exhausted = true;
      slot.exhaustedAt = Date.now();
      slot.exhaustReason = reason;
      const remaining = this.getAvailableKeys().length;
      console.warn(
        `[ElevenLabs Pool] Key ${slot.masked} marked exhausted (${reason}). ` +
          `${remaining} of ${this.slots.length} keys remaining in pool.`
      );
      return remaining;
    }
    return this.getAvailableKeys().length;
  }

  /**
   * Marks a key as temporarily rate-limited (HTTP 429 concurrency)
   */
  public markRateLimited(key: string, cooldownMs = this.RATE_LIMIT_COOLDOWN_MS): void {
    this.refreshSlots();
    const slot = this.slots.find((s) => s.key === key);
    if (slot) {
      slot.rateLimitedUntil = Date.now() + cooldownMs;
      console.info(
        `[ElevenLabs Pool] Key ${slot.masked} concurrency/rate-limited for ${Math.round(
          cooldownMs / 1000
        )}s. Rotating to next key.`
      );
    }
  }

  /**
   * Records successful character synthesis for usage tracking
   */
  public recordUsage(key: string, charCount: number): void {
    const slot = this.slots.find((s) => s.key === key);
    if (slot) {
      slot.charsSynthesized += charCount;
    }
  }

  /**
   * Resets exhaustion state for all keys (e.g. for testing or monthly billing cycle reset)
   */
  public resetPool(): void {
    for (const slot of this.slots) {
      slot.exhausted = false;
      slot.exhaustedAt = 0;
      slot.exhaustReason = undefined;
      slot.rateLimitedUntil = 0;
      slot.charsSynthesized = 0;
    }
    this.activeSlotIndex = 0;
  }

  /**
   * Returns a diagnostic snapshot of all keys in the pool
   */
  public getSnapshot(): {
    totalKeys: number;
    availableKeys: number;
    slots: Array<{
      masked: string;
      exhausted: boolean;
      exhaustReason?: string;
      rateLimited: boolean;
      charsSynthesized: number;
    }>;
  } {
    this.refreshSlots();
    const now = Date.now();
    return {
      totalKeys: this.slots.length,
      availableKeys: this.getAvailableKeys().length,
      slots: this.slots.map((s) => ({
        masked: s.masked,
        exhausted: s.exhausted,
        exhaustReason: s.exhaustReason,
        rateLimited: s.rateLimitedUntil > now,
        charsSynthesized: s.charsSynthesized
      }))
    };
  }
}

export const elevenLabsPool = new ElevenLabsKeyPool();
export function getElevenLabsKeyCount(): number {
  return elevenLabsPool.getKeyCount();
}
