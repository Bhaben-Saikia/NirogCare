# NirogCare - Healthcare Platform

🎥 **[Watch Demo Video](https://drive.google.com/file/d/1_Am5XiA54TNi1FhmyzCG-ut23vu9eOKC/view?usp=drive_link)** | 🌐 **[Try MVP](https://nirogcare.lovable.app/)**

A comprehensive healthcare platform providing accessible medical services through web and mobile applications. NirogCare makes everyday health guidance simple and structured for everyone.

## 🌟 Platform Overview

### 📱 **Mobile App** (React Native)
- **AI Symptom Guidance** - Intelligent health assessment
- **Organized Health Sections** - Men's, Women's, Kids & General Health
- **Local Data Storage** - Privacy-first approach
- **Cross-Platform** - Android & iOS support

### 🌐 **Web App** (React + TypeScript)
- **Pharmacy Locator** - Real-time nearby medical stores
- **Emergency SOS** - One-tap emergency assistance
- **Health Monitoring Tools** - Comprehensive tracking suite
- **Prescription Scanner** - Digitize medical documents
- **AI Chat Assistant** - 24/7 health support

---

## 🚀 Core Features

### 🤖 AI-Powered Healthcare
- **Symptom Analysis** - Intelligent condition-based suggestions
- **Health Chat Assistant** - Real-time medical guidance
- **Personalized Recommendations** - Tailored health advice

### 📍 Location-Based Services
- **Pharmacy Finder** - Nearby medical stores with real-time data
- **Emergency Services** - Quick access to nearby hospitals

### 📊 Health Monitoring Suite
- **Heart Rate Monitor** - Cardiovascular tracking
- **Step Counter** - Daily activity monitoring
- **Sleep Tracker** - Sleep pattern analysis
- **Water Intake Tracker** - Hydration reminders
- **Calorie Counter** - Nutrition management
- **Period Tracker** - Women's health monitoring
- **Breathing Exercises** - Stress relief tools

### 🏥 Medical Management
- **Prescription Scanner** - OCR for medical documents
- **Medication Reminders** - Never miss doses
- **Health Records** - Organized medical history

---

## 🛠️ Technology Stack

### Mobile Application (React Native)
```
├── React Native          # Cross-platform development
├── TypeScript           # Type-safe development
├── Google Maps API      # Location services
└── Metro Bundler        # Development environment
```

### Web Application (React + TypeScript)
```
├── React 18             # Modern UI framework
├── TypeScript           # Type-safe development
├── Vite                 # Fast build tool
├── Tailwind CSS         # Utility-first styling
├── shadcn/ui           # Component library
├── Supabase            # Backend services
└── Framer Motion       # Animations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- React Native CLI (for mobile development)
- Android Studio / Xcode (for native builds)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/bhabens170-cell/NirogCare.git
cd NirogCare
```

#### 2. Install Dependencies
```bash
# Install web app dependencies
cd web
npm install

# Install mobile app dependencies
cd ../mobile
npm install
```

#### 3. Environment Setup
```bash
# Copy environment templates
cp web/.env.example web/.env.local
cp mobile/.env.example mobile/.env
```

Configure your `.env` file with required environment variable names (names only):
```bash
# Server-side Secrets (never exposed in client bundle or logs)
GEMINI_API_KEY
RAVATAR_PROJECT_ID
RAVATAR_API_KEY
ELEVENLABS_API_KEY
GOOGLE_APPLICATION_CREDENTIALS

# Client-side Variables (optional)
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_FIREBASE_API_KEY
```

#### 4. Run Development & Safety Evaluations

**Run Web Application:**
```bash
npm run dev
# Serves at http://localhost:8080 with API endpoints:
# /api/chat/stream      (Gemini 3.5 Flash Lite SSE token + punctuation sentence chunk stream)
# /api/tts/stream       (ElevenLabs streaming TTS proxy + neural MP3 stream fallback)
# /api/chat             (Gemini reasoning + pre-LLM red-flags)
# /api/ocr/prescription (Google Cloud Vision OCR + confidence)
```

**Run Healthcare Safety & Multi-Language Evals:**
```bash
npm run evals
# Runs safety gates across English, Hindi, and Assamese (100% pass)
```

---

## 🗣️ Real-Time 3D Talking AI Avatar (`/chat`)

### Architecture
- **`/src/config/characters.ts`** — Character definitions (`Aria` default female medical AI Health Assistant, `Priya`, `Aarav`, `Rohan`) with gender, persona prompts, 3D appearance parameters, and per-language ElevenLabs `voiceMap` (`en`, `hi`, `as`, `bn`).
- **`/src/server/wsChatServer.ts` & `/src/server/authSession.ts`** — Persistent authenticated WebSocket (`/api/ws/chat?token=...`) with HMAC-SHA256 session tokens (`POST /api/auth/session`), connection pre-warming, pre-LLM red-flag gate (`detectRedFlags`), PII stripping (`stripPII`), rate/spend caps (`checkRateLimit`), early 2–3 word clause `ChunkSplitter`, streaming output safety filter (`checkOutputChunkSafety`), and instant `{ type: 'barge_in' }` cancellation.
- **`/src/server/ttsBackend.ts` & `/src/server/sttBackend.ts`** — Swappable `TtsProvider` (`ElevenLabsTtsProvider` streaming 24kHz 16-bit PCM `pcm_24000` + character `alignment` via `/stream/with-timestamps` with immediate first NDJSON sub-frame emission `onFirstSubFrame`, plus `LocalPcmFallbackProvider`) and server-side STT (`POST /api/stt/transcribe` via ElevenLabs `scribe_v1`).
- **`/src/audio/audioEngine.ts`** — Hardware `AudioContext.currentTime` gapless PCM scheduler, character-alignment + `AnalyserNode` formant (`aa`, `ee`, `ih`, `oh`, `ou`) lip-sync, microphone VAD (400ms silence threshold) + Barge-In, and 10-stage latency telemetry.
- **`/src/chat/TalkingAvatarApp.tsx`** — Persisted per-user modes (`Text Mode` default where 3D avatar is not loaded, `Voice + Avatar` mode, and `Avatar Off`), persistent `"AI assistant, not a doctor"` badge, first-use mic consent modal, and dev latency overlay.

### Measured Latency (India Network `+05:30`, 90-Turn Harness: 30 Turns × `en-IN`, `hi`, `as`)

Reproduce via `npx tsx scripts/latencyHarness.ts`. Raw telemetry saved in `scripts/latency-phase2-baseline.json` and `scripts/latency-phase3-optimized.json`.

| Metric / Stage (p50 / p95 in ms) | Phase 2 Baseline (Before) | Phase 3 Optimized (After) | Improvement |
| :--- | :---: | :---: | :--- |
| **Avatar Non-Verbal Reaction** (`<300ms` target) | **12 / 12** | **12 / 12** | Immediate client listening nod on VAD speech-end |
| **WS Dispatch + Pre-LLM Safety Gates** | 1 / 1 | 1 / 2 | Deterministic regex + HMAC session check |
| **LLM First Token (TTFT — `gemini-3.5-flash-lite`)** | 950 / 1941 | **814 / 1886** | Removed `thinkingConfig` overhead + compact prompt |
| **ChunkSplit + Output Safety Gate** | 68 / 179 | **31 / 163** (`as`: **1 / 72**) | Early 2-word clause flush on opening comma |
| **TTS First Byte (`eleven_flash_v2_5` `pcm_24000`)** | 271 / 919 (`as`: 841 / 1027) | **289 / 586** (`as`: **289 / 365**) | Switched `as` Chunk 0 to `eleven_flash_v2_5` |
| **TTS Sub-Frame Delivery (`onFirstSubFrame` -> WS)** | 168 / 1505 (`as`: 1327 / 1633) | **9 / 104** (`as`: **4 / 29**) | Streamed first NDJSON PCM sub-frame immediately |
| **Viseme Apply (`mapCharacterToViseme`)** | 0 / 1 | **0 / 0** | Direct character-to-morph mapping on audio clock |
| **TOTAL Time-To-First-Audio (`en-IN` Normal)** | 1417 / 3394 | **1185 / 1897** | **-232ms p50 / -1497ms p95** |
| **TOTAL Time-To-First-Audio (`hi` Normal)** | 1648 / 1965 | **1238 / 2403** | **-410ms p50** |
| **TOTAL Time-To-First-Audio (`as` Normal)** | 3226 / 4069 | **1122 / 2196** | **-2104ms p50 (-65%) / -1873ms p95** |
| **TOTAL Time-To-First-Audio (Emergency Gate `12/12`)** | 1535 / 3301 | **295 / 359** | **-1240ms p50 (-81%) / -2942ms p95** |
| **TOTAL Time-To-First-Audio (TTS Fallback)** | 929 / 1581 | **1026 / 1232** | Local 24kHz formant PCM fallback (`1ms` TTS) |
| **Barge-In Cancellation Ack** | 1 / 4 | **1 / 6** | Instant `AbortController` + Web Audio stop |

> **Vendor Floor Note**: From India consumer networks (`+05:30`), uncached serial upstream network + inference latency is `~814ms` (Gemini `gemini-3.5-flash-lite` TTFT p50) + `~275ms` (ElevenLabs `eleven_flash_v2_5` first-byte p50) = `~1,089ms` vendor floor (`~35–95ms` total NirogCare pipeline overhead). With server-side opening-clause TTS caching enabled (default in production when `bypassCache` is false) or Vertex AI `asia-south1` (Mumbai) co-location (`cloudrun.yaml`), total Time-To-First-Audio drops to **~820ms p50 / ~1,450ms p95**.

### How to Add a New Language
1. Open [`src/config/characters.ts`](src/config/characters.ts) and add the language code to `LanguageCode` and `SUPPORTED_LANGUAGES` (specify `scriptInstruction`, `elevenLabsModel`, and `bcp47Locale`).
2. Add the native-accent ElevenLabs Voice ID for that language code to each character's `voiceMap` in `CHARACTERS`.

### How to Add a New Character
1. Open [`src/config/characters.ts`](src/config/characters.ts) and append a new `CharacterConfig` entry to `CHARACTERS` with `id`, `name`, `gender` (`'female' | 'male'`), `personaPrompt`, 3D `appearance` colors/proportions, and `voiceMap` voice IDs.

---

## 📱 Available Scripts

### Web Application
```bash
npm run dev          # Start development server
npm run typecheck    # Run TypeScript compiler check
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🏗️ Project Structure

```
NirogCare/
├── src/
│   ├── config/             # Character & language configs (characters.ts)
│   ├── server/             # Backend proxy (/api/chat/stream, /api/tts/stream)
│   ├── audio/              # Web Audio gapless queue & AnalyserNode viseme engine
│   ├── avatar/             # Three.js / react-three-fiber 3D procedural avatar
│   ├── chat/               # Minimal dark real-time talking avatar UI
│   ├── components/         # Reusable UI components
│   └── pages/              # Route-based pages (/chat mounts TalkingAvatarApp)
├── NOTES.md                # ElevenLabs model & language support documentation
├── PROGRESS.md             # Iteration log & latency verification metrics
└── README.md
```

---

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Configure authentication providers
3. Set up database tables for users, health records, prescriptions
4. Configure Row Level Security (RLS) policies

### Google Maps API
1. Enable Google Maps JavaScript API (web)
2. Enable Google Places API (mobile)
3. Enable Geocoding API
4. Set up API keys with proper restrictions

---

## 🔒 Privacy & Security

- **Local Storage** - Sensitive data stored locally
- **Encryption** - Data encrypted in transit and at rest
- **Authentication** - Secure user authentication
- **HIPAA Compliance** - Healthcare data protection standards
- **Location Privacy** - Geolocation processed locally

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ️ Roadmap

### Upcoming Features
- [ ] **Video Consultation** - Connect with doctors remotely
- [ ] **Wearable Integration** - Sync with fitness devices
- [ ] **Advanced AI Diagnostics** - Enhanced symptom analysis
- [ ] **Family Accounts** - Multi-user health management
- [ ] **Offline Mode** - Full offline functionality

---

## 🎯 Our Mission

> **Making quality healthcare accessible to everyone, regardless of language, location, or technical expertise.**

NirogCare bridges the gap between technology and healthcare, providing essential health tools while maintaining the highest standards of privacy and accessibility.

---

**NirogCare** - Your health, our priority. 🏥💚
