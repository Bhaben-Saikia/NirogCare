/**
 * NirogCare Server - Streaming ChunkSplitter & Output Safety Gate (`src/server/chunkSplitter.ts`)
 *
 * Responsibilities:
 * 1. Buffers streaming LLM tokens and flushes the FIRST chunk early (~5-8 words or first clause
 *    at a natural comma/colon/dash break) so TTS begins immediately.
 * 2. Flushes subsequent chunks at sentence boundaries (`.`, `?`, `!`, Devanagari/Assamese danda `।`, `\n`).
 * 3. Never splits mid-word, mid-number (e.g. `98.6`, `0.5`), inside abbreviations (`Dr.`, `Mr.`, `Mrs.`,
 *    `Ms.`, `Prof.`, `mg.`, `ml.`, `etc.`, `e.g.`, `i.e.`), or inside dosages like `0.5 mg` / `500 mg`.
 * 4. Runs a deterministic streaming output safety filter (`checkOutputChunkSafety`) on every chunk
 *    BEFORE it is sent to TTS or the UI, gating the first chunk especially carefully.
 */

const ABBREVIATIONS = new Set([
  'dr',
  'mr',
  'mrs',
  'ms',
  'prof',
  'sr',
  'jr',
  'st',
  'vs',
  'etc',
  'approx',
  'mg',
  'ml',
  'mcg',
  'kg',
  'gm',
  'no',
  'fig',
  'govt',
  'dept'
]);

const DOSAGE_UNITS = /^(mg|ml|mcg|g|kg|iu|tablet|tablets|tab|cap|capsule|capsules|drops|tsp|tbsp|बार|गोली|मिलीग्राम|মিঃগ্ৰাঃ|টেবলেট)\b/i;

export class ChunkSplitter {
  private buffer = '';
  private chunkCount = 0;

  /**
   * Appends a token delta and returns any complete speakable chunks ready for TTS.
   */
  public push(delta: string): string[] {
    this.buffer += sanitizeStreamDelta(delta);
    return this.extractChunks(false);
  }

  /**
   * Flushes any remaining text at the end of the LLM stream.
   */
  public flush(): string[] {
    return this.extractChunks(true);
  }

  public reset(): void {
    this.buffer = '';
    this.chunkCount = 0;
  }

  private extractChunks(isEnd: boolean): string[] {
    const out: string[] = [];

    while (this.buffer.length > 0) {
      const splitIdx = this.findNextSplitIndex(this.buffer, this.chunkCount === 0);
      if (splitIdx === -1) {
        break;
      }

      const candidate = this.buffer.slice(0, splitIdx).trim();
      const rest = this.buffer.slice(splitIdx).replace(/^\s+/, '');

      // Guard against splitting right before a dosage unit (e.g. "Take 0.5" | "mg")
      if (/\d$/.test(candidate) && DOSAGE_UNITS.test(rest)) {
        break;
      }

      if (candidate.length > 0) {
        out.push(candidate);
        this.chunkCount += 1;
      }
      this.buffer = rest;
    }

    if (isEnd && this.buffer.trim().length > 0) {
      out.push(this.buffer.trim());
      this.buffer = '';
      this.chunkCount += 1;
    }

    return out;
  }

  private findNextSplitIndex(text: string, isFirstChunk: boolean): number {
    let wordCount = 0;
    let inWord = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const nextCh = i + 1 < text.length ? text[i + 1] : '';
      const prevCh = i > 0 ? text[i - 1] : '';

      const isWhitespace = /\s/.test(ch);
      if (!isWhitespace && !inWord) {
        inWord = true;
        wordCount += 1;
      } else if (isWhitespace) {
        inWord = false;
      }

      // 1. Check sentence terminators: . ? ! । (danda) \n
      if (ch === '.' || ch === '?' || ch === '!' || ch === '।' || ch === '\n') {
        // Must be followed by whitespace or end-of-buffer (Wait for next token if '.' is at very end of buffer, as it might be `0.5`)
        if (ch === '.' && nextCh === '') {
          return -1;
        }
        const followedBySpaceOrEnd = nextCh === '' || /\s/.test(nextCh);
        if (!followedBySpaceOrEnd) {
          // e.g. decimal point `0.5` or `98.6`
          continue;
        }

        // Never split decimal numbers even if spaced weirdly
        if (ch === '.' && /\d/.test(prevCh) && /\d/.test(text.slice(i + 1).trimStart()[0] || '')) {
          continue;
        }

        // Never split inside common abbreviations like "Dr." or "mg."
        if (ch === '.' && this.endsWithAbbreviation(text.slice(0, i))) {
          continue;
        }

        // Ensure minimum speakable length (at least 2 words or 8 chars)
        if (wordCount >= 2 || i >= 8) {
          return i + 1;
        }
      }

      // 2. Early first-chunk flush: split on clause delimiter (, ; : — –) once we have >= 2 words (or >= 8 chars)
      if (isFirstChunk && (ch === ',' || ch === ';' || ch === ':' || ch === '—' || ch === '–')) {
        if (nextCh === '' || !/\s/.test(nextCh)) {
          // Wait until whitespace after comma (prevents splitting `1,000`)
          continue;
        }
        if (/\d/.test(prevCh) && /\d/.test(text.slice(i + 1).trimStart()[0] || '')) {
          continue;
        }
        if (wordCount >= 2 || i >= 8) {
          return i + 1;
        }
      }

      // 3. Early first-chunk flush on natural word boundary at 5+ words if no punctuation appeared yet
      if (isFirstChunk && isWhitespace && wordCount >= 5 && i >= 20) {
        const upToHere = text.slice(0, i).trim();
        // Do not split between a number and its unit or after "Dr."
        const lastToken = upToHere.split(/\s+/).pop() || '';
        const cleanLast = lastToken.replace(/[.]/g, '').toLowerCase();
        if (
          !/\d$/.test(lastToken) &&
          !ABBREVIATIONS.has(cleanLast) &&
          !this.isCommonMedicinePrefix(cleanLast)
        ) {
          return i;
        }
      }
    }

    return -1;
  }

  private endsWithAbbreviation(prefix: string): boolean {
    const match = prefix.match(/([A-Za-z]+)$/);
    if (!match) return false;
    const word = match[1].toLowerCase();
    if (ABBREVIATIONS.has(word)) return true;
    // Single-letter initials like "A." or "B."
    if (word.length === 1) return true;
    return false;
  }

  private isCommonMedicinePrefix(word: string): boolean {
    return (
      word === 'paracetamol' ||
      word === 'amoxicillin' ||
      word === 'azithromycin' ||
      word === 'ibuprofen' ||
      word === 'cetirizine' ||
      word === 'pantoprazole' ||
      word === 'metformin' ||
      word === 'vitamin' ||
      word === 'tab' ||
      word === 'cap' ||
      word === 'syrup'
    );
  }
}

export function sanitizeStreamDelta(input: string): string {
  return input
    .replace(/[*#_`~[\]()<>]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
}

export interface OutputSafetyCheckResult {
  safe: boolean;
  reason?: 'PRESCRIPTION_DETECTED' | 'DIAGNOSIS_DETECTED';
  fallbackText?: string;
}

const UNSAFE_DIAGNOSIS_PATTERNS = [
  /\b(i diagnose you with|you definitely have|my official diagnosis is|you are suffering from)\b/i,
  /(मेरा निदान है कि आपको|आपको निश्चित रूप से .* बीमारी है)/,
  /(মোৰ নিদান অনুসৰি আপোনাৰ|আপোনাৰ নিশ্চিতভাৱে .* ৰোগ হৈছে)/
];

const UNSAFE_PRESCRIPTION_PATTERNS = [
  /\b(i hereby prescribe|take \d+\s*(mg|ml|tablets|capsules) of [a-z]+ every \d+ hours|start taking [a-z]+ \d+\s*mg)\b/i,
  /(मैं आपको .* दवा लिख रहा हूँ|रोज़ाना \d+\s*मिलीग्राम .* लें)/,
  /(মই আপোনাক .* ঔষধ লিখি দিছোঁ|প্ৰতিদিনে \d+\s*মিঃগ্ৰাঃ .* খাব)/
];

const SAFE_FALLBACK_BY_LANG: Record<'en' | 'hi' | 'as', string> = {
  en: 'As an AI assistant and not a doctor, I cannot diagnose conditions or prescribe medication. Please consult a qualified clinician or visit your nearest Primary Health Centre for a proper evaluation.',
  hi: 'मैं एक एआई सहायक हूँ, डॉक्टर नहीं, इसलिए मैं किसी बीमारी का निदान या दवा नहीं लिख सकती। कृपया सही जांच के लिए किसी योग्य डॉक्टर या नजदीकी स्वास्थ्य केंद्र से सलाह लें।',
  as: 'মই এজন এআই সহায়ক, চিকিৎসক নহয়, সেয়েহে মই কোনো ৰোগ নিৰ্ণয় বা ঔষধ নিৰ্ধাৰণ কৰিব নোৱাৰোঁ। অনুগ্ৰহ কৰি সঠিক পৰীক্ষাৰ বাবে এজন চিকিৎসক বা ওচৰৰ স্বাস্থ্য কেন্দ্ৰৰ পৰামৰ্শ লওক।'
};

/**
 * Lightweight streaming filter that checks each chunk before TTS and can cut
 * the stream and switch to a safe fallback sentence.
 */
export function checkOutputChunkSafety(
  chunkText: string,
  language: 'en' | 'hi' | 'as' | 'bn'
): OutputSafetyCheckResult {
  const langKey: 'en' | 'hi' | 'as' = language === 'hi' ? 'hi' : language === 'as' ? 'as' : 'en';

  for (const pat of UNSAFE_DIAGNOSIS_PATTERNS) {
    if (pat.test(chunkText)) {
      return {
        safe: false,
        reason: 'DIAGNOSIS_DETECTED',
        fallbackText: SAFE_FALLBACK_BY_LANG[langKey]
      };
    }
  }

  for (const pat of UNSAFE_PRESCRIPTION_PATTERNS) {
    if (pat.test(chunkText)) {
      return {
        safe: false,
        reason: 'PRESCRIPTION_DETECTED',
        fallbackText: SAFE_FALLBACK_BY_LANG[langKey]
      };
    }
  }

  return { safe: true };
}
