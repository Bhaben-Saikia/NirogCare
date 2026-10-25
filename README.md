# NirogCare (निरोग केयर) 🏥

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://nirog-care-8e4v.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **Next-generation AI-powered multilingual healthcare companion designed for underserved and rural communities across India.** Combining real-time 3D talking medical avatars, clinical red-flag triage, prescription OCR, and location-based Jan Aushadhi pharmacy discovery into a privacy-first web application.

🌐 **Production Website:** [https://nirog-care-8e4v.vercel.app/](https://nirog-care-8e4v.vercel.app/)

---

## 🌟 Key Highlights

- 🗣️ **Real-Time 3D Medical Avatar (`/chat`)**: Photorealistic 3D clinical avatar built with Three.js / React Three Fiber featuring 72 ARKit + Oculus Viseme morph targets and 60 FPS sub-second phoneme lip-sync.
- 🌐 **Native Multilingual Voice & Text**: Full conversational clinical assistance in **Indian English, हिन्दी (Hindi), অসমীয়া (Assamese), and বাংলা (Bengali)** with automated script detection and voice switching.
- ⚡ **Multi-Tier Voice Resilience**: Seamless failover from **ElevenLabs v4** to **Google Gemini Neural TTS**, with an unlimited **Zero-Token Browser Neural Speech** fallback ensuring 100% uptime with zero quota exhaustion.
- 🚨 **Pre-LLM Clinical Emergency Triage**: Instant regex-based red-flag detection (cardiac, stroke, acute hemorrhage, snakebite, respiratory crisis) triggering immediate national emergency guidance (108 / 112) in `<1ms`.
- 📋 **Prescription Scanner & OCR**: Intelligent extraction of medicines, dosages, timings, and clinical precautions powered by Gemini Vision AI with image validation.
- 📍 **Affordable Pharmacy Locator**: Interactive Jan Aushadhi Kendra and local pharmacy discovery with route calculation, distance sorting, and direct contact options.
- 🛡️ **HIPAA & Privacy-First Architecture**: Client-side PII stripping (removing phone numbers, Aadhaar, emails), no unencrypted patient storage, and strict row-level data isolation.

---

## 🏗️ Technical Architecture

```
NirogCare/
├── src/
│   ├── chat/               # Real-time streaming voice + talking avatar interface
│   ├── avatar/             # 3D procedural avatar renderer (Three.js / R3F)
│   ├── audio/              # Web Audio gapless PCM scheduler & formant viseme engine
│   ├── config/             # Multi-character & language voice mappings
│   ├── server/             # Secure API router, WebSocket server & clinical guards
│   │   ├── wsChatServer.ts           # Authenticated bi-directional streaming chat
│   │   ├── geminiBackend.ts          # Gemini 2.5/3.5 LLM integration & streaming
│   │   ├── ttsBackend.ts             # Multi-tier ElevenLabs / Gemini / Browser TTS
│   │   ├── promptGuard.ts            # Anti-jailbreak & prompt injection guard
│   │   ├── redFlags.ts               # Multi-language clinical emergency detector
│   │   └── offlineClinicalFallback.ts# Zero-token offline medical guidance
│   ├── components/         # Modular UI design system (Radix + Tailwind CSS)
│   └── pages/              # Route views (Dashboard, Chat, Pharmacy, Prescriptions)
├── public/avatars/         # 3D avatars (.glb) & studio video background loops
├── scripts/                # Automated pre-push testing & verification suites
└── supabase/               # Backend edge functions & database security schemas
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install
```bash
git clone https://github.com/bhabens170-cell/NirogCare.git
cd NirogCare
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root (see `.env.example` for details):
```env
# Server-side APIs (Optional for enhanced cloud AI)
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Client Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```
*(Note: If API keys are omitted, the platform gracefully runs on local neural synthesis and offline clinical fallbacks).*

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

---

## 🧪 Quality Assurance & Test Verification

All critical pathways are validated through 5 automated test gates before deployment:

| Command | Suite | Focus Areas | Status |
| :--- | :--- | :--- | :---: |
| `npm run test:unit` | **Unit Tests** | Emergency triage (EN/HI/AS), chunk splitter, rate limiter, phoneme mappers | `PASS` |
| `npm run test:integration` | **Integration** | Full pipeline: chat, STT, OCR, mock Gemini & ElevenLabs APIs, database rules | `PASS` |
| `npm run test:tdd` | **TDD Suite** | PromptGuard jailbreak refusal across 3 languages & mid-dialogue language switching | `PASS` |
| `npm run test:pentest` | **Pentester** | Secret leak audits, XSS sanitation, MIME magic-byte validation, IDOR checks | `PASS` |
| `npm run test:simulation` | **User Simulation** | 20 real-world rural personas (elderly, emergency, anxious parents, prompt injection) | `PASS` |

To run the complete verification suite at once:
```powershell
npm run typecheck; npm run test:unit; npm run test:integration; npm run test:tdd; npm run test:pentest; npm run test:simulation
```

---

## 🔒 Security & Medical Responsibility

- **Not a Diagnostic Tool**: NirogCare provides evidence-based wellness guidance, triage support, and home-care education. It is explicitly labeled as an AI Health Assistant and never provides definitive diagnoses or unverified pharmaceutical prescriptions.
- **Local-First Safety**: High-risk medical queries (chest pain, stroke, breathing distress, acute pediatric fever) bypass generative processing and immediately surface national emergency dispatch hotlines (**108** / **112** / **14416**).
- **Zero Cloud Leakage**: API credentials, service account tokens, and raw patient identifiers are strictly isolated from client-side bundles.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSES.md) file for details.

**NirogCare** — *Bridging modern artificial intelligence and accessible healthcare for everyone.* 🏥💚
