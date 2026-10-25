# Architecture, ElevenLabs Language Support & Latency Notes

## 1. ElevenLabs Model & Language Support Investigation

Before building the TTS pipeline, we verified current ElevenLabs model capabilities against our target languages (**English**, **Hindi**, **Assamese**, **Bengali**):

| Language | ISO Code | `eleven_flash_v2_5` (~75ms latency, 32 langs) | `eleven_v3` (~300–500ms latency, 70+ langs) | Selected ElevenLabs Model |
| :--- | :--- | :--- | :--- | :--- |
| **Indian English** | `en` | Supported | Supported | `eleven_flash_v2_5` |
| **Hindi** | `hi` | Supported | Supported | `eleven_flash_v2_5` |
| **Assamese** | `as` | **Not Supported** | **Supported** | `eleven_v3` |
| **Bengali** | `bn` | **Not Supported** | **Supported** | `eleven_v3` |

### Latency Tradeoff & Fallback Strategy
1. **Low-Latency Tier (`en`, `hi`)**: Uses `eleven_flash_v2_5` via ElevenLabs streaming HTTP (`/v1/text-to-speech/{voice_id}/stream?optimize_streaming_latency=3`) for ~75ms model initiation latency.
2. **Expanded Indic Tier (`as`, `bn`)**: Because `eleven_flash_v2_5` and `eleven_multilingual_v2` do not support Assamese or Bengali, the backend automatically upgrades `as` and `bn` requests to `eleven_v3`. While `eleven_v3` adds ~250–350ms per chunk compared to Flash v2.5, sentence-level chunking on the Gemini stream ensures the first short clause (4–8 words) begins speaking within ~1.1–1.5s.
3. **Zero-Config Server-Side Neural Audio Fallback**: If `ELEVENLABS_API_KEY` is not yet populated in `.env` (or if the ElevenLabs API returns a quota/network error), the backend `/api/tts/stream` transparently synthesizes real MP3 audio streams on the server for `en`, `hi`, `as`, and `bn` so that the client's Web Audio API queue and `AnalyserNode` viseme lip-sync pipeline always receive real binary audio waveforms (`audio/mpeg` / `AudioBuffer`) without mocking or breaking lip sync.

## 2. Real-Time Pipeline Architecture
- **`/server` (`src/server/`)**:
  - `POST /api/chat/stream`: Streams Gemini tokens via SSE (`text/event-stream`), splits tokens into speakable sentence/clause chunks on punctuation (`. ! ? । , ; —`), and emits each phrase immediately so TTS begins on sentence #1 while Gemini is still generating sentence #2.
  - `POST /api/tts/stream`: Accepts `{ text, characterId, language, voiceId }`, resolves the character's native-accent ElevenLabs `voiceId` and appropriate model (`eleven_flash_v2_5` vs `eleven_v3`), and streams binary audio back to the client.
- **`/src/config/characters.ts`**:
  - Defines 4 characters (2 Female: **Aria**, **priya**; 2 Male: **Aarav**, **Rohan**) with gender, 3D avatar visual/morph parameters, personality traits, and per-language `voiceMap` (`en`, `hi`, `as`, `bn`).
- **`/src/audio/audioEngine.ts`**:
  - Manages a single `AudioContext`, `GainNode`, and `AnalyserNode` (`fftSize = 512`).
  - Queues incoming sentence audio buffers for gapless sequential playback (`AudioBufferSourceNode`).
  - Supports instant interruption (`stopAll()`): cancels in-flight TTS fetches, stops active `AudioBufferSourceNode`, and resets viseme energy to `0` with zero overlap.
  - Computes per-frame formant frequency band energies (Low 100–400Hz -> `ou`/`oh`, Mid 400–1600Hz -> `aa`, High-Mid 1600–3200Hz -> `ee`/`ih`) with exponential smoothing to drive `aa`, `ee`, `ih`, `oh`, `ou` blendshapes at 60 FPS for any language (including Assamese and Hindi).
- **`/src/avatar/`**:
  - Built with `three` and `@react-three/fiber`.
  - Procedural 3D human head, neck, shoulders, eyes, eyelids, eyebrows, and articulated jaw/lips with real-time morph/viseme targets (`aa`, `ee`, `ih`, `oh`, `ou`, `blinkLeft`, `blinkRight`, `browUp`, `smile`) plus GLB/VRM loader support when a custom `.glb` with ARKit/viseme morph targets is present.
  - Full procedural state machine running inside `useFrame` at 60 FPS:
    - **Idle**: chest breathing, natural eyelid curve blinking (random 2–6s intervals), micro head/neck sway, eye saccades, subtle weight shift.
    - **Listening** (while user types/speaks): attentive forward lean, periodic acknowledgment nods.
    - **Thinking** (waiting for Gemini's first token): subtle upward/sideways gaze shift and thoughtful head tilt.
    - **Speaking**: real-time `AnalyserNode` viseme lip sync, speech-energy-driven head nods/tilts, eyebrow raises on vocal emphasis, and upper-body/hand gesture cadence at phrase boundaries.
