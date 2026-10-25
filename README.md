# NirogCare (निरोग केयर)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=flat-square&logo=vercel)](https://nirog-care-8e4v.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

An AI-powered multilingual healthcare platform designed for accessible, low-latency clinical assistance across India. Features real-time 3D interactive medical avatars, deterministic emergency triage, prescription OCR, and location-based Jan Aushadhi pharmacy discovery.

**Production Deployment:** [https://nirog-care-8e4v.vercel.app/](https://nirog-care-8e4v.vercel.app/)

---

## Key Features

- **Real-Time 3D Medical Avatar (`/chat`)**: Interactive 3D clinical avatar built with Three.js and React Three Fiber, featuring 72 ARKit and Oculus Viseme morph targets for 60 FPS real-time phoneme lip synchronization.
- **Native Multilingual Voice and Text**: Conversational healthcare assistance in Indian English, Hindi (हिन्दी), Assamese (অসমীয়া), and Bengali (বাংলা) with automatic script detection and language switching.
- **Multi-Tier Voice Architecture**: Fallback mechanism routing from ElevenLabs v4 to Google Gemini Neural TTS, with an unlimited zero-token browser speech synthesis option to prevent quota exhaustion.
- **Pre-LLM Clinical Emergency Triage**: Deterministic regex-based red-flag evaluation (cardiac events, stroke, respiratory distress, acute trauma) that triggers emergency response protocols (108 / 112) in under 1ms.
- **Prescription Digitization (OCR)**: Extraction of medication names, dosages, timings, and clinical precautions powered by Gemini Vision with image validation.
- **Pharmacy and Jan Aushadhi Locator**: Geographic discovery of generic medicine centers and local pharmacies with distance calculations and contact details.
- **Privacy and Data Isolation**: Client-side PII stripping (phone numbers, Aadhaar, email addresses) before model submission, local encryption, and strict database row-level security.

---

## Architecture

```
NirogCare/
├── src/
│   ├── chat/               # Streaming voice and talking avatar interface
│   ├── avatar/             # 3D procedural avatar renderer (Three.js / R3F)
│   ├── audio/              # Web Audio scheduler and viseme formant engine
│   ├── config/             # Character configurations and voice mappings
│   ├── server/             # API routes, WebSocket chat server, and security guards
│   │   ├── wsChatServer.ts           # Authenticated bi-directional streaming chat
│   │   ├── geminiBackend.ts          # Gemini LLM streaming integration
│   │   ├── ttsBackend.ts             # Multi-tier ElevenLabs / Gemini / Web Speech engine
│   │   ├── promptGuard.ts            # Anti-jailbreak and prompt injection filter
│   │   ├── redFlags.ts               # Multi-lingual clinical emergency detector
│   │   └── offlineClinicalFallback.ts# Offline clinical guidance system
│   ├── components/         # Design system components (Radix UI, Tailwind CSS)
│   └── pages/              # Primary routes (Dashboard, Chat, Pharmacy, Prescriptions)
├── public/avatars/         # 3D avatar assets (.glb) and media loops
├── scripts/                # Automated verification and testing suites
└── supabase/               # Edge functions and database security definitions
```

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

```bash
git clone https://github.com/bhabens170-cell/NirogCare.git
cd NirogCare
npm install
```

### Environment Configuration

Configure environment variables in a `.env` file (refer to `.env.example` for full reference):

```env
# Server-side API Keys
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Client Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Running Locally

```bash
npm run dev
```

The application will start at **http://localhost:8080**.

---

## Quality Assurance and Testing

All core pipelines are verified through five automated testing gates:

| Command | Suite | Scope | Result |
| :--- | :--- | :--- | :---: |
| `npm run test:unit` | Unit Tests | Emergency red flags (EN/HI/AS), chunk splitter, rate limiter, phoneme mappers | `PASS` |
| `npm run test:integration` | Integration | End-to-end pipeline: chat, STT, OCR, mock LLM/TTS endpoints, database security | `PASS` |
| `npm run test:tdd` | TDD Suite | PromptGuard injection protection across 3 languages, dynamic language switching | `PASS` |
| `npm run test:pentest` | Security / Pentest | Secret scanning, XSS sanitization, MIME verification, rate-limit enforcement | `PASS` |
| `npm run test:simulation` | User Simulation | 20 real-world personas (elderly, emergency, rural users, prompt injection) | `PASS` |

To execute all test suites:

```powershell
npm run typecheck; npm run test:unit; npm run test:integration; npm run test:tdd; npm run test:pentest; npm run test:simulation
```

---

## Security and Clinical Safety

- **Clinical Scope**: NirogCare provides wellness guidance, general triage information, and home-care education. It is explicitly designated as an AI Health Assistant and does not issue definitive diagnoses or prescriptive medical orders.
- **Emergency Escalation**: Critical health complaints bypass generative language models and directly surface national emergency hotlines (108 / 112).
- **Credential Protection**: API keys and service credentials are strictly maintained on the server tier and excluded from client bundles and repository tracking.

---

## License

This project is licensed under the MIT License. See [LICENSES.md](LICENSES.md) for details.
