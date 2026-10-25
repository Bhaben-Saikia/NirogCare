/**
 * NirogCare Server - Real Prescription OCR Engine
 * Uses Gemini Flash Multimodal Vision & Google Cloud Vision to transcribe
 * real handwritten and printed doctor prescriptions into structured medical data.
 */

import * as fs from 'fs';
import * as path from 'path';

function getEnvVar(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
      if (match) return match[1].trim();
    }
  } catch {
    // Ignore missing .env
  }
  return '';
}

export interface OcrRequestPayload {
  imageBase64: string;
  language?: string; // 'en-IN' | 'hi' | 'as'
  userId?: string;
}

export interface ExtractedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  confidence: number; // 0 to 1
  isLowConfidence: boolean;
  type?: string;
}

export interface OcrResponsePayload {
  rawText: string;
  overallConfidence: number;
  medicines: ExtractedMedicine[];
  doctorName?: string;
  patientName?: string;
  date?: string;
  notes?: string;
  hasLowConfidenceItems: boolean;
  error?: string;
}

const LOW_CONFIDENCE_THRESHOLD = 0.80; // 80%
const MAX_BASE64_BYTES = 14 * 1024 * 1024; // ~10MB binary payload

interface CloudVisionResult {
  text: string;
  avgConfidence: number;
}

async function extractWithGoogleCloudVision(
  base64Data: string,
  visionApiKey: string
): Promise<CloudVisionResult | null> {
  if (!visionApiKey) return null;
  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(visionApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Data },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
            }
          ]
        })
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      responses?: Array<{
        fullTextAnnotation?: {
          text?: string;
          pages?: Array<{ confidence?: number }>;
        };
      }>;
    };
    const annotation = json.responses?.[0]?.fullTextAnnotation;
    const text = annotation?.text?.trim() || '';
    if (!text) return null;
    const pageConf = annotation?.pages?.[0]?.confidence;
    return {
      text,
      avgConfidence: typeof pageConf === 'number' ? pageConf : 0.88
    };
  } catch {
    return null;
  }
}

export async function processPrescriptionOcr(payload: OcrRequestPayload): Promise<OcrResponsePayload> {
  const { imageBase64, language = 'en' } = payload;

  if (!imageBase64) {
    return {
      rawText: '',
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: false,
      error: 'NO_IMAGE_PROVIDED'
    };
  }

  if (imageBase64.length > MAX_BASE64_BYTES) {
    return {
      rawText: '',
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: true,
      error: 'FILE_TOO_LARGE_MAX_10MB'
    };
  }

  // Detect mime type and extract raw base64 data
  let mimeType = 'image/jpeg';
  let base64Data = imageBase64;

  if (imageBase64.includes(';base64,')) {
    const parts = imageBase64.split(';base64,');
    const header = parts[0].toLowerCase();
    base64Data = parts[1];
    if (header.includes('image/png')) mimeType = 'image/png';
    else if (header.includes('image/webp')) mimeType = 'image/webp';
    else if (header.includes('application/pdf')) mimeType = 'application/pdf';
    else if (header.includes('image/jpeg') || header.includes('image/jpg')) mimeType = 'image/jpeg';
    else {
      return {
        rawText: '',
        overallConfidence: 0,
        medicines: [],
        hasLowConfidenceItems: true,
        error: 'UNSUPPORTED_FILE_TYPE'
      };
    }
  }

  // Verify binary magic bytes to prevent MIME spoofing or XSS/SVG/HTML upload abuse
  const decodedHeader = Buffer.from(base64Data.slice(0, 64), 'base64');
  const isPng =
    decodedHeader.length >= 4 &&
    decodedHeader[0] === 0x89 &&
    decodedHeader[1] === 0x50 &&
    decodedHeader[2] === 0x4e &&
    decodedHeader[3] === 0x47;
  const isJpeg =
    decodedHeader.length >= 3 &&
    decodedHeader[0] === 0xff &&
    decodedHeader[1] === 0xd8 &&
    decodedHeader[2] === 0xff;
  const isWebp =
    decodedHeader.length >= 12 &&
    decodedHeader.subarray(0, 4).toString('ascii') === 'RIFF' &&
    decodedHeader.subarray(8, 12).toString('ascii') === 'WEBP';
  const isPdf =
    decodedHeader.length >= 5 && decodedHeader.subarray(0, 5).toString('ascii') === '%PDF-';

  if (!isPng && !isJpeg && !isWebp && !isPdf) {
    return {
      rawText: '',
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: true,
      error: 'INVALID_FILE_MAGIC_BYTES'
    };
  }

  const geminiKey = process.env.GEMINI_API_KEY || getEnvVar('GEMINI_API_KEY') || '';
  const visionKey = process.env.GOOGLE_VISION_API_KEY || getEnvVar('GOOGLE_VISION_API_KEY') || '';

  if (!geminiKey) {
    return {
      rawText: 'Prescription analysis unavailable: API key not configured.',
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: true,
      error: 'NO_API_KEY_CONFIGURED'
    };
  }

  const visionResult =
    mimeType !== 'application/pdf' && visionKey
      ? await extractWithGoogleCloudVision(base64Data, visionKey)
      : null;

  return await analyzePrescriptionWithGeminiVision(
    base64Data,
    mimeType,
    language,
    geminiKey,
    visionResult
  );
}


interface RawParsedMedicine {
  name?: string;
  medicine_name?: string;
  medicineName?: string;
  drug?: string;
  dosage?: string;
  dose?: string;
  strength?: string;
  form?: string;
  frequency?: string;
  timing?: string;
  schedule?: string;
  duration?: string;
  days?: string;
  period?: string;
  instructions?: string;
  direction?: string;
  advice?: string;
  confidence?: number;
  type?: string;
  category?: string;
}

interface RawParsedOcrPayload {
  rawText?: string;
  doctorName?: string;
  clinic?: string;
  doctor_name?: string;
  patientName?: string;
  patient?: string;
  patient_name?: string;
  date?: string;
  notes?: string;
  advice?: string;
  medicines?: RawParsedMedicine[];
}

/**
 * Parse structured JSON output from Gemini Vision, handling markdown fences and preamble
 */
function parseStructuredJson(rawText: string): RawParsedOcrPayload | RawParsedMedicine[] | null {
  if (!rawText) return null;

  // 1. Try markdown code block ```json ... ```
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as RawParsedOcrPayload;
    } catch {
      // Fallback to brace matching
    }
  }

  // 2. Try object { ... }
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(rawText.slice(firstBrace, lastBrace + 1)) as RawParsedOcrPayload;
    } catch {
      // Fallback to array matching
    }
  }

  // 3. Try array [ ... ]
  const firstBracket = rawText.indexOf('[');
  const lastBracket = rawText.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const arr = JSON.parse(rawText.slice(firstBracket, lastBracket + 1)) as RawParsedMedicine[];
      return { medicines: arr };
    } catch {
      // Fallback to direct parse
    }
  }

  // 4. Try direct parse
  try {
    return JSON.parse(rawText.trim()) as RawParsedOcrPayload;
  } catch {
    // Parse failed
  }

  return null;
}

/**
 * Direct Multimodal Vision Prescription OCR & Structuring via Gemini Flash with Model Cascade
 */
async function analyzePrescriptionWithGeminiVision(
  base64Data: string,
  mimeType: string,
  _language: string,
  apiKey: string,
  visionResult?: CloudVisionResult | null
): Promise<OcrResponsePayload> {
  const visionContext = visionResult?.text
    ? `\nGoogle Cloud Vision OCR Pre-Read (confidence ${visionResult.avgConfidence.toFixed(2)}):\n${visionResult.text}\n`
    : '';
  const prompt = `You are an expert clinical medical OCR specialist. Accurately transcribe and extract all clinical information from this doctor's prescription document.${visionContext}

CRITICAL INSTRUCTIONS:
1. Transcribe every line of visible text (clinic name, doctor details, patient details, date, Rx section, and advice) into "rawText".
2. Extract Patient Name (include age/gender if written).
3. Extract Doctor Name or Clinic Name.
4. Extract Prescription Date.
5. Extract each prescribed medicine:
   - "name": full brand/generic name with strength ONLY as written on the prescription. NEVER guess ambiguous handwriting and NEVER suggest drug substitutions or dosage changes.
   - "dosage": form or amount as written (e.g. "1 tablet", "5ml")
   - "frequency": timing as written (e.g. "1-0-1 (Twice daily)")
   - "duration": length of course as written (e.g. "5 days")
   - "instructions": food/usage instructions as written (e.g. "After meals")
   - "confidence": honest confidence score from 0.0 to 1.0 (set below 0.80 if handwriting is unclear or ambiguous)
   - "type": category (e.g. "Antibiotic", "Analgesic", "Antacid")
6. Extract non-pharmacological advice or doctor instructions in "notes".
7. Return ONLY valid JSON in this exact structure:
{
  "rawText": "transcribed text",
  "doctorName": "Doctor / Clinic name",
  "patientName": "Patient name",
  "date": "Date",
  "medicines": [
    {
      "name": "Medicine name with strength",
      "dosage": "dosage form",
      "frequency": "frequency",
      "duration": "duration",
      "instructions": "instructions",
      "confidence": 0.95,
      "type": "type"
    }
  ],
  "notes": "Doctor notes and advice"
}`;

  // Multi-model fallback cascade to guarantee high availability
  const modelsToTry = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-flash-lite-latest'
  ];

  let lastError = '';

  for (const modelName of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64Data } }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048
          }
        })
      });

      if (!res.ok) {
        lastError = `Model ${modelName} HTTP ${res.status}`;
        continue; // Try next fallback model
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseStructuredJson(rawOutput);

      if (!parsed) {
        lastError = 'JSON_PARSE_FAILED';
        continue;
      }

      const isArray = Array.isArray(parsed);
      const parsedObj: RawParsedOcrPayload = isArray ? { medicines: parsed } : parsed;
      const rawMedicines: RawParsedMedicine[] = Array.isArray(parsedObj.medicines)
        ? parsedObj.medicines
        : [];

      let hasLowConfidence = false;
      let confidenceSum = 0;
      const medicines: ExtractedMedicine[] = rawMedicines.map((m: RawParsedMedicine) => {
        const conf = typeof m.confidence === 'number' ? m.confidence : 0.90;
        confidenceSum += conf;
        const isLow = conf < LOW_CONFIDENCE_THRESHOLD;
        if (isLow) hasLowConfidence = true;

        const name = m.name || m.medicine_name || m.medicineName || m.drug || 'Prescribed Medicine';
        const dosage = m.dosage || m.dose || m.strength || m.form || '1 unit';
        const frequency = m.frequency || m.timing || m.schedule || 'As directed';
        const duration = m.duration || m.days || m.period || 'As advised';
        const instructions = m.instructions || m.direction || m.advice || 'Take as directed';
        const type = m.type || m.category || 'Prescribed Medicine';

        return {
          name,
          dosage,
          frequency,
          duration,
          instructions,
          confidence: Number(conf.toFixed(2)),
          isLowConfidence: isLow,
          type
        };
      });

      const avgConfidence = medicines.length > 0
        ? Number((confidenceSum / medicines.length).toFixed(2))
        : 0.92;

      return {
        rawText: parsedObj.rawText || rawOutput,
        overallConfidence: avgConfidence,
        medicines,
        doctorName: parsedObj.doctorName || parsedObj.clinic || parsedObj.doctor_name || undefined,
        patientName: parsedObj.patientName || parsedObj.patient || parsedObj.patient_name || undefined,
        date: parsedObj.date || new Date().toISOString().split('T')[0],
        notes: parsedObj.notes || parsedObj.advice || undefined,
        hasLowConfidenceItems: hasLowConfidence
      };

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'REQUEST_FAILED';
      lastError = errMsg;
    }
  }

  return {
    rawText: 'OCR extraction encountered an error while analyzing the image. Please ensure the prescription is well-lit and clear.',
    overallConfidence: 0,
    medicines: [],
    hasLowConfidenceItems: true,
    error: lastError || 'ALL_VISION_MODELS_FAILED'
  };
}
