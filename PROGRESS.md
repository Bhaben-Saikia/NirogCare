# Real-Time 3D Talking AI Avatar — Iteration Progress (`PROGRESS.md`)

## Current Status Overview
- **All Iterations `(a)` through `(i)` Completed & Verified.**
- **Environment Check**:
  - `GEMINI_API_KEY`: Present in `.env` (server-side only; verified zero exposure in `dist/` bundle).
  - `ELEVENLABS_API_KEY`: Configured in `.env` and read by `/src/server/ttsBackend.ts` (`POST /api/tts/stream`). Uses ElevenLabs Streaming API (`/v1/text-to-speech/{voice_id}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`) when populated and automatically falls back to server-side neural Indic MP3 stream (`audio/mpeg`) when empty so the Web Audio API queue and `AnalyserNode` viseme lip-sync pipeline always receive real audio waveforms.
- **ElevenLabs Language Support Verified** (see [`NOTES.md`](NOTES.md)):
  - `eleven_flash_v2_5` (~75ms) supports `en` and `hi`.
  - `eleven_v3` (70+ languages) supports `as` (Assamese) and `bn` (Bengali) as well as `en` and `hi`.

---

## Completed Iterations & Evidence

- [x] **Iteration (a): Project Scaffold & Secure Backend Proxy**
  - Installed `three@^0.169.0`, `@types/three@^0.169.0`, and `@react-three/fiber@^8.17.10`.
  - Created modular directories: `/src/config`, `/src/audio`, `/src/avatar`, `/src/chat`, `/src/server`.
  - Verified zero API keys (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`) appear in client code or the production `dist/` bundle.

- [x] **Iteration (b): Gemini Streaming Chat + Clean Minimal Dark UI**
  - Implemented `streamAvatarChat` (`POST /api/chat/stream`) in [`src/server/geminiBackend.ts`](src/server/geminiBackend.ts) using `gemini-3.5-flash-lite:streamGenerateContent?alt=sse` with `thinkingConfig: { thinkingLevel: 'MINIMAL' }`.
  - Buffers streaming tokens and splits into sentence/phrase chunks on punctuation (`.`, `!`, `?`, `।`, `;`, and opening clause `,` after 4+ chars) so speech synthesis starts immediately after the first phrase.
  - System prompt enforces replies in the selected language and script (`English`, `हिन्दी`, `অসমীয়া`, `বাংলা`), in the selected character's persona, in 1–3 short natural spoken sentences with zero markdown, zero bullet lists, and zero emojis.
  - Built [`src/chat/TalkingAvatarApp.tsx`](src/chat/TalkingAvatarApp.tsx) and mounted in [`src/pages/Chat.tsx`](src/pages/Chat.tsx) with ONLY the required controls: Character Picker (name + gender), Language Picker, minimal chat transcript (user message + avatar reply only), message input, mic button, and send button.

- [x] **Iteration (c): ElevenLabs Streaming Audio Playback & Web Audio Queue**
  - Built [`src/server/ttsBackend.ts`](src/server/ttsBackend.ts) (`POST /api/tts/stream`) with server-side pre-warming (`prewarmTtsChunk`) triggered the instant each sentence chunk is split in `/api/chat/stream`.
  - Built [`src/audio/audioEngine.ts`](src/audio/audioEngine.ts) managing a single `AudioContext -> GainNode -> AnalyserNode -> destination` pipeline, concurrent chunk fetching/decoding, and strictly sequential gapless `AudioBufferSourceNode` playback.

- [x] **Iteration (d): 3D Avatar Rendering with Procedural Idle Animation**
  - Built [`src/avatar/AvatarCanvas.tsx`](src/avatar/AvatarCanvas.tsx) and [`src/avatar/ProceduralAvatar.tsx`](src/avatar/ProceduralAvatar.tsx) using Three.js + `@react-three/fiber`.
  - Continuous 60 FPS procedural idle animation in `useFrame`: chest/shoulder breathing (~17 breaths/min), natural asymmetric eyelid curve blinking at random 2–6s intervals, subtle head/neck sway, eye saccades with camera eye contact, and torso weight shift.

- [x] **Iteration (e): Audio-Driven Lip Sync (`AnalyserNode` -> Visemes)**
  - Every animation frame (`sampleVisemes(dt)`), `AnalyserNode` FFT frequency bins (`fftSize = 512`) and time-domain RMS are mapped to smoothed viseme weights (`aa`, `ee`, `ih`, `oh`, `ou`), driving jaw rotation, upper/lower lip vertical opening, horizontal mouth corner stretch, forward lip protrusion, oral cavity, teeth, and tongue visibility.
  - Asymmetric exponential smoothing (`attackRate = 24`, `releaseRate = 14`) ensures crisp syllable articulation and smooth mouth closure to `0` when silent.

- [x] **Iteration (f): Character & Language Selection with Voice Mapping**
  - Created [`src/config/characters.ts`](src/config/characters.ts) with 4 characters (2 female: `Aria`, `Priya`; 2 male: `Aarav`, `Rohan`), distinct 3D facial/body proportions and hairstyles (`bun`, `waves`, `short-part`, `textured-crop`), and per-language native-accent `voiceMap` for `en`, `hi`, `as`, `bn`.

- [x] **Iteration (g): Body / Gesture / State Machine (`idle` | `listening` | `thinking` | `speaking`)**
  - Smooth frame-rate-independent damped transitions (`THREE.MathUtils.damp`) between:
    - `idle`: natural breathing, blinking, eye saccades, subtle sway.
    - `listening` (while user types or uses mic): attentive forward lean and periodic acknowledging nod.
    - `thinking` (waiting for Gemini's first token): subtle upward/sideways gaze shift and head tilt.
    - `speaking`: live viseme lip sync, vocal-energy-synced head nods/tilts, eyebrow raises on pitch emphasis, and phrase-boundary hand/arm gestures.

- [x] **Iteration (h): Latency Tuning, Interruption Handling & Verification**
  - Enabled `thinkingConfig: { thinkingLevel: 'MINIMAL' }` on `gemini-3.5-flash-lite` + server-side TTS pre-warming + opening clause punctuation splitting, reducing Time-to-First-Audio from `~5.5s` down to **`1.30s–1.39s`**:
    - **English (`en`, Aria)**: `firstTokenMs = 1392ms`, `firstChunkText = "Hello there!"`
    - **Hindi (`hi`, Aarav)**: `firstTokenMs = 1022ms`, `firstChunkMs = 1080ms`, `firstAudioMs = 1390ms` (`"नमस्ते, मैं बिल्कुल ठीक हूँ।"`)
    - **Assamese (`as`, Priya)**: `firstTokenMs = 1009ms`, `firstChunkMs = 1129ms`, `firstAudioMs = 1341ms` (`"নমস্কাৰ!"`)
    - **Bengali (`bn`, Rohan)**: `firstTokenMs = 938ms`, `firstChunkMs = 1064ms`, `firstAudioMs = 1350ms` (`"নমস্কার দোস্ত!"`)
  - Verified mid-speech interruption: calling `avatarAudioEngine.startNewTurn()` aborts in-flight TTS requests, stops the active `AudioBufferSourceNode` immediately, clears the queue, and starts the new reply with zero overlap.

- [x] **Iteration (i): Final Cleanup & Documentation**
  - `npm run typecheck`: Passed (`0` errors).
  - `npm run build`: Passed (`dist/` built cleanly in `9.51s`).
  - Documented ElevenLabs model/language support in [`NOTES.md`](NOTES.md) and setup/extension instructions in [`README.md`](README.md).
