/**
 * Step 1: Comprehensive Unit Tests for Core Logic (`scripts/pipeline.test.ts`)
 * Covers:
 *   1. Emergency / Red-Flag Detection in Assamese, Hindi, and English (all 7 clinical categories + benign controls)
 *   2. Streaming ChunkSplitter (abbreviations, decimal dosages, numbers+units, early clause flush, danda `।`, thousands)
 *   3. Output Safety Filter (`checkOutputChunkSafety` blocking diagnoses & prescriptions in en, hi, as)
 *   4. Per-User Rate Limiter & Spend Caps (`checkRateLimit` message length cap, 45/min limit, user isolation, spend cap)
 *   5. Phoneme-to-Viseme Mapper & Zero-Token Clinical Fallback
 *
 * Run: npm run test:unit
 */
import assert from 'node:assert/strict';
import { ChunkSplitter, checkOutputChunkSafety } from '../src/server/chunkSplitter';
import { detectRedFlags } from '../src/server/redFlags';
import { checkRateLimit, checkAndRecordElevenLabsCredits, getSpendCapSnapshot } from '../src/server/rateLimiter';
import { parseKeyString, elevenLabsPool } from '../src/server/elevenLabsPool';
import { mapCharacterToViseme } from '../src/audio/audioEngine';
import { buildOfflineClinicalReply } from '../src/server/offlineClinicalFallback';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`PASS  ${name}`);
  } catch (e) {
    failed++;
    const msg = `${name}: ${(e as Error).message}`;
    failures.push(msg);
    console.log(`FAIL  ${name}\n      ${(e as Error).message}`);
  }
}

function run(deltas: string[]): string[] {
  const s = new ChunkSplitter();
  const out: string[] = [];
  for (const d of deltas) out.push(...s.push(d));
  out.push(...s.flush());
  return out;
}

// ============================================================================
// 1. EMERGENCY / RED-FLAG DETECTION (English, Hindi, Assamese)
// ============================================================================

test('red flag [EN]: cardiac, stroke, respiratory, hemorrhage, poisoning, unconscious, mental_health', () => {
  const cases: Array<[string, string]> = [
    ['I have crushing chest pain radiating to left arm', 'cardiac'],
    ['My father has facial droop and slurred speech', 'stroke'],
    ['She cannot breathe and her lips are turning blue', 'respiratory'],
    ['He is vomiting blood continuously', 'hemorrhage'],
    ['The child swallowed poison / pesticide', 'poisoning'],
    ['My neighbor fainted and not waking up, having convulsions', 'unconscious'],
    ['I feel suicidal and want to end my life', 'mental_health']
  ];
  for (const [input, expectedCat] of cases) {
    const res = detectRedFlags(input, 'en-IN');
    assert.equal(res.isEmergency, true, `Expected emergency for EN "${input}"`);
    assert.equal(res.category, expectedCat, `Expected category ${expectedCat} for EN "${input}"`);
    assert.equal(res.languageCode, 'en-IN');
    assert.ok(res.message && (res.message.includes('108') || res.message.includes('14416')));
  }
});

test('red flag [HI]: cardiac, stroke, respiratory (including चंद्रबिंदु साँस), hemorrhage, poisoning, unconscious, mental_health', () => {
  const cases: Array<[string, string]> = [
    ['मुझे छाती में दर्द और पसीना हो रहा है', 'cardiac'],
    ['उन्हें लकवा मार गया है और चेहरे का एक हिस्सा टेढ़ा हो गया है', 'stroke'],
    ['मुझे साँस नहीं आ रही है और दम घुट रहा है', 'respiratory'],
    ['मरीज को खून की उल्टी हो रही है', 'hemorrhage'],
    ['उसने गलती से कीटनाशक पी लिया है', 'poisoning'],
    ['वह अचानक बेहोश हो गया और दौरा पड़ रहा है', 'unconscious'],
    ['मेरे मन में आत्महत्या का विचार आ रहा है', 'mental_health']
  ];
  for (const [input, expectedCat] of cases) {
    const res = detectRedFlags(input, 'hi');
    assert.equal(res.isEmergency, true, `Expected emergency for HI "${input}"`);
    assert.equal(res.category, expectedCat, `Expected category ${expectedCat} for HI "${input}"`);
    assert.equal(res.languageCode, 'hi');
    assert.ok(res.message && (res.message.includes('108') || res.message.includes('14416')));
  }
});

test('red flag [AS]: cardiac, stroke (মুখ বেঁকা), respiratory, hemorrhage, poisoning, unconscious, mental_health', () => {
  const cases: Array<[string, string]> = [
    ['মোৰ বুকুৰ বিষ হৈছে আৰু বুকু হেঁচি ধৰা যেন লাগিছে', 'cardiac'],
    ['তেওঁৰ মুখ বেঁকা হৈ গৈছে আৰু কথা ক’ব পৰা নাই', 'stroke'],
    ['মোৰ উশাহ ল’বলৈ বহুত কষ্ট হৈছে আৰু ওঁঠ নীলা পৰিছে', 'respiratory'],
    ['ৰোগীজনৰ তেজ বমি হৈ আছে', 'hemorrhage'],
    ['মানুহজনে বিষপান কৰিছে আৰু সাপে কামুৰিছে', 'poisoning'],
    ['তেওঁ হঠাতে অচেতন হৈ ঢলি পৰিল', 'unconscious'],
    ['মোৰ আত্মহত্যা কৰিব মন গৈছে, জীৱন শেষ কৰিম', 'mental_health']
  ];
  for (const [input, expectedCat] of cases) {
    const res = detectRedFlags(input, 'as');
    assert.equal(res.isEmergency, true, `Expected emergency for AS "${input}"`);
    assert.equal(res.category, expectedCat, `Expected category ${expectedCat} for AS "${input}"`);
    assert.equal(res.languageCode, 'as');
    assert.ok(res.message && (res.message.includes('১০৮') || res.message.includes('14416')));
  }
});

test('red flag [Benign Controls]: ordinary symptoms in EN, HI, AS do NOT false-trigger emergency', () => {
  assert.equal(detectRedFlags('I have a mild headache and runny nose', 'en-IN').isEmergency, false);
  assert.equal(detectRedFlags('मुझे हल्का बुखार और सर्दी-खांसी है', 'hi').isEmergency, false);
  assert.equal(detectRedFlags('মোৰ পাতল জ্বৰ আৰু পানীলগা হৈছে', 'as').isEmergency, false);
});

// ============================================================================
// 2. CHUNK SPLITTER
// ============================================================================

test('chunkSplitter: never splits after "Dr."', () => {
  const c = run(['Please see Dr. ', 'Sharma soon. ', 'Rest well.']);
  assert.ok(!c.some((x) => x.endsWith('Dr.')), JSON.stringify(c));
});

test('chunkSplitter: never splits a decimal dosage "0.5 mg"', () => {
  const c = run(['Some people take 0.', '5 mg ', 'only on advice. Drink water.']);
  assert.ok(c.join(' ').includes('0.5 mg'), JSON.stringify(c));
  assert.ok(!c.some((x) => x.endsWith('0.') || x.endsWith('0.5')), JSON.stringify(c));
});

test('chunkSplitter: never splits number from unit "500 mg"', () => {
  const c = run(['Usually labels say 500 ', 'mg tablets. Ask a pharmacist.']);
  assert.ok(!c.some((x) => /\d$/.test(x)), JSON.stringify(c));
});

test('chunkSplitter: first chunk flushes early on a clause comma', () => {
  const s = new ChunkSplitter();
  const first = s.push('I am sorry you feel unwell, ');
  assert.equal(first.length, 1);
  assert.equal(first[0], 'I am sorry you feel unwell,');
});

test('chunkSplitter: later chunks wait for sentence end (no comma split)', () => {
  const s = new ChunkSplitter();
  s.push('I am sorry you feel unwell, ');
  const second = s.push('please rest, drink fluids, ');
  assert.equal(second.length, 0);
});

test('chunkSplitter: splits on Hindi/Assamese danda (।)', () => {
  const c = run(['আপুনি বিশ্ৰাম লওক। ', 'পানী খাওক।']);
  assert.equal(c.length, 2, JSON.stringify(c));
  assert.ok(c[0].endsWith('।'));
});

test('chunkSplitter: does not split thousands separator "1,000"', () => {
  const c = run(['Walking about 1,000 steps after meals helps. Rest too.']);
  assert.ok(!c.some((x) => x.endsWith('1,')), JSON.stringify(c));
});

// ============================================================================
// 3. OUTPUT SAFETY FILTER (`checkOutputChunkSafety`)
// ============================================================================

test('safetyFilter: blocks English, Hindi, and Assamese prescription phrasing', () => {
  const en = checkOutputChunkSafety('I hereby prescribe amoxicillin.', 'en');
  assert.equal(en.safe, false);
  assert.equal(en.reason, 'PRESCRIPTION_DETECTED');
  assert.ok(en.fallbackText?.includes('not a doctor'));

  const hi = checkOutputChunkSafety('मैं आपको यह दवा लिख रहा हूँ, रोज़ाना 500 मिलीग्राम लें।', 'hi');
  assert.equal(hi.safe, false);
  assert.equal(hi.reason, 'PRESCRIPTION_DETECTED');
  assert.ok(hi.fallbackText?.includes('डॉक्टर नहीं'));

  const as = checkOutputChunkSafety('মই আপোনাক এই ঔষধ লিখি দিছোঁ।', 'as');
  assert.equal(as.safe, false);
  assert.equal(as.reason, 'PRESCRIPTION_DETECTED');
  assert.ok(as.fallbackText?.includes('চিকিৎসক নহয়'));
});

test('safetyFilter: blocks definitive medical diagnosis in EN, HI, AS', () => {
  assert.equal(checkOutputChunkSafety('I diagnose you with bacterial pneumonia.', 'en').safe, false);
  assert.equal(checkOutputChunkSafety('मेरा निदान है कि आपको टाइफाइड है।', 'hi').safe, false);
  assert.equal(checkOutputChunkSafety('মোৰ নিদান অনুসৰি আপোনাৰ মেলেৰিয়া হৈছে।', 'as').safe, false);
});

test('safetyFilter: passes safe home-care and triage guidance in EN, HI, AS', () => {
  assert.equal(checkOutputChunkSafety('Please rest and drink warm fluids.', 'en').safe, true);
  assert.equal(checkOutputChunkSafety('कृपया आराम करें और गुनगुना पानी पिएं।', 'hi').safe, true);
  assert.equal(checkOutputChunkSafety('অনুগ্ৰহ কৰি বিশ্ৰাম লওক আৰু কুহুমীয়া পানী খাওক।', 'as').safe, true);
});

// ============================================================================
// 4. RATE LIMITER & SPEND CAPS (`checkRateLimit`)
// ============================================================================

test('rateLimiter: blocks messages exceeding 1,000 characters', () => {
  const longMsg = 'a'.repeat(1001);
  const res = checkRateLimit('unit_test_user_long', longMsg.length);
  assert.equal(res.allowed, false);
  assert.ok(res.reason?.includes('1000'));
});

test('rateLimiter: allows up to 45 requests/minute per user and blocks the 46th without affecting other users', () => {
  const userA = `unit_test_user_A_${Date.now()}`;
  const userB = `unit_test_user_B_${Date.now()}`;

  for (let i = 1; i <= 45; i++) {
    const r = checkRateLimit(userA, 40);
    assert.equal(r.allowed, true, `Request #${i} for userA should be allowed`);
  }

  const r46 = checkRateLimit(userA, 40);
  assert.equal(r46.allowed, false, '46th request in same minute for userA must be blocked');
  assert.ok(r46.reason?.includes('Rate limit exceeded'));

  // User B must remain unaffected (isolated per-user bucket)
  const rUserB = checkRateLimit(userB, 40);
  assert.equal(rUserB.allowed, true, 'User B should not be affected by User A rate limit');
});

test('rateLimiter: tracks ElevenLabs character spend cap accurately', () => {
  const before = getSpendCapSnapshot();
  const ok = checkAndRecordElevenLabsCredits(50);
  const after = getSpendCapSnapshot();
  assert.equal(ok, true);
  assert.equal(after.dailyElevenLabsCharsUsed, before.dailyElevenLabsCharsUsed + 50);
});

test('elevenLabsPool: parseKeyString handles commas, semicolons, quotes, and ignores invalid keys', () => {
  const parsed = parseKeyString('"key_1234567890, key_abcdefghij; key_9876543210\nshort"');
  assert.deepEqual(parsed, ['key_1234567890', 'key_abcdefghij', 'key_9876543210']);
});

test('elevenLabsPool: rotates across multiple keys and auto-fails over when a key is exhausted', () => {
  const oldEnv = process.env.ELEVENLABS_API_KEY;
  process.env.ELEVENLABS_API_KEY = 'test_eleven_key_11111, test_eleven_key_22222, test_eleven_key_33333';
  elevenLabsPool.refreshSlots();

  assert.equal(elevenLabsPool.getKeyCount(), 3);

  // Rotate between keys
  const k1 = elevenLabsPool.getNextKey();
  const k2 = elevenLabsPool.getNextKey();
  assert.ok(k1 && k2 && k1.key !== k2.key);

  // Mark k1 exhausted (quota exceeded)
  elevenLabsPool.markExhausted(k1.key, 'quota_exceeded');

  // Next calls must never return k1
  for (let i = 0; i < 5; i++) {
    const candidate = elevenLabsPool.getNextKey();
    assert.ok(candidate);
    assert.notEqual(candidate.key, k1.key, 'Exhausted key k1 must not be selected');
  }

  // Restore env
  process.env.ELEVENLABS_API_KEY = oldEnv;
  elevenLabsPool.resetPool();
  elevenLabsPool.refreshSlots();
});

// ============================================================================
// 5. LIP-SYNC PHONEME MAPPER & OFFLINE FALLBACK
// ============================================================================

test('lip-sync phoneme mapper: bilabials close lips (pp > 0.8, jaw < 0.05) across en, hi, as', () => {
  for (const ch of ['m', 'p', 'b', 'म', 'प', 'ম', 'ব']) {
    const v = mapCharacterToViseme(ch);
    assert.ok(v.pp > 0.8 && v.jaw < 0.05, `Failed bilabial closure for ${ch}: ${JSON.stringify(v)}`);
  }
});

test('lip-sync phoneme mapper: open vowels open jaw (aa > 0.9, jaw > 0.8) and spaces pause', () => {
  for (const ch of ['a', 'आ', 'ा', 'আ', 'া']) {
    const v = mapCharacterToViseme(ch);
    assert.ok(v.aa > 0.9 && v.jaw > 0.8, `Failed open vowel for ${ch}: ${JSON.stringify(v)}`);
  }
  const pauseV = mapCharacterToViseme(' ');
  assert.equal(pauseV.isPause, true);
  assert.equal(pauseV.jaw, 0);
});

test('zero-token offline clinical fallback returns safe symptom-specific replies in en, hi, as', () => {
  const enFever = buildOfflineClinicalReply('I have mild fever and chills', 'en');
  const hiHeadache = buildOfflineClinicalReply('मुझे सिरदर्द और थकान है', 'hi');
  const asCough = buildOfflineClinicalReply('মোৰ কাঁহ আৰু ডিঙিৰ বিষ হৈছে', 'as');
  assert.ok(enFever.includes('Fahrenheit') || enFever.includes('hydration'));
  assert.ok(hiHeadache.includes('आराम') && hiHeadache.includes('डॉक्टर'));
  assert.ok(asCough.includes('পানী') && asCough.includes('চিকিৎসক'));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('Failures:', failures);
  process.exit(1);
}
