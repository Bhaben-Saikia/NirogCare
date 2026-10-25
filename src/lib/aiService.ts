/**
 * AI Service - NirogCare Secure Backend Integration
 * All reasoning and responses are routed through NirogCare's secure backend (/api/chat).
 * No raw AI keys or third-party endpoints are contacted directly from the browser.
 */

import { toast } from "sonner";

export interface ChatMessage {
  type: 'user' | 'bot' | 'system';
  text: string;
  isEmergency?: boolean;
}

export interface MedicineInfo {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  confidence?: number;
  isLowConfidence?: boolean;
  type?: string;        // e.g. "Antibiotic", "Pain Relief"
  sideEffects?: string; // e.g. "Drowsiness, Nausea"
  usage?: string;       // e.g. "For fever"
}

export interface PrescriptionResult {
  medicines: MedicineInfo[];
  doctorName?: string;
  patientName?: string;
  date?: string;
  notes?: string;
  rawText?: string;
  overallConfidence?: number;
  hasLowConfidenceItems?: boolean;
}

/**
 * Health Chat - Solely calls the secure NirogCare Gemini backend (/api/chat)
 * Pre-LLM red-flag safety, PII stripping, and rate-limits are enforced server-side.
 */
export async function chatWithAI(
  userMessage: string,
  conversationHistory: { type: 'user' | 'bot' | 'system'; text: string }[],
  language: string = 'English',
  userId?: string
): Promise<{ text: string; isEmergency?: boolean; languageCode?: string }> {
  try {
    const historyPayload = conversationHistory.map(h => ({
      role: h.type === 'user' ? ('user' as const) : ('assistant' as const),
      text: h.text
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: historyPayload,
        language,
        userId: userId || localStorage.getItem('nirogcare_anon_id') || undefined
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isEmergency) {
        toast.error("Emergency Alert", {
          description: "Potential urgent medical situation detected. Please follow the guidance immediately.",
          duration: 6000
        });
      }
      return {
        text: data.reply,
        isEmergency: data.isEmergency,
        languageCode: data.languageCode
      };
    }

    throw new Error(`Server returned ${response.status}`);

  } catch (error) {
    console.warn('Backend Chat API unreachable, activating offline safeguard:', error);
    toast.error("Connection issue", {
      description: "Switched to offline safety mode",
      duration: 3000
    });

    return {
      text: getOfflineFallback(userMessage, language),
      isEmergency: false
    };
  }
}

/**
 * Prescription Scanning - Calls the Google Cloud Vision OCR backend (/api/ocr/prescription)
 */
export async function analyzePrescription(
  imageBase64: string,
  language: string = 'English'
): Promise<PrescriptionResult> {
  try {
    const response = await fetch('/api/ocr/prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        language,
        userId: localStorage.getItem('nirogcare_anon_id') || undefined
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.error && (!data.medicines || data.medicines.length === 0)) {
        throw new Error(data.error);
      }
      return {
        medicines: data.medicines || [],
        doctorName: data.doctorName,
        patientName: data.patientName,
        date: data.date,
        notes: data.notes,
        rawText: data.rawText,
        overallConfidence: data.overallConfidence,
        hasLowConfidenceItems: data.hasLowConfidenceItems
      };
    }

    throw new Error(`OCR Server returned ${response.status}`);

  } catch (error: any) {
    console.error('Prescription OCR error:', error);
    toast.error("Analysis failed", {
      description: error?.message || "Could not read prescription. Please try with a clearer photo.",
      duration: 4000
    });

    return {
      medicines: [],
      rawText: 'OCR extraction failed. Please ensure the image is clear and well-lit.',
      overallConfidence: 0,
      hasLowConfidenceItems: true
    };
  }
}

function getOfflineFallback(message: string, language: string): string {
  const isHindi = language.toLowerCase().includes('hi');
  const isAssamese = language.toLowerCase().includes('as');

  if (isHindi) {
    return `नमस्ते! आपके स्वास्थ्य प्रश्न के लिए:
1. पर्याप्त आराम करें और पानी पिएं।
2. अपने लक्षणों पर नज़र रखें।
3. यदि समस्या 24 घंटे से अधिक रहे या बढ़े, तो तुरंत नजदीकी डॉक्टर या प्राथमिक स्वास्थ्य केंद्र (PHC) से संपर्क करें।

⚠️ आपातकाल में तुरंत 108 पर कॉल करें।`;
  }

  if (isAssamese) {
    return `নমস্কাৰ! আপোনাৰ স্বাস্থ্য সম্পৰ্কীয় প্ৰশ্নৰ বাবে:
১. বিশ্ৰাম লওক আৰু পৰ্যাপ্ত পানী খাওক।
২. লক্ষণসমূহ লক্ষ্য কৰক।
৩. যদি সমস্যাটো বাঢ়ি যায়, ওচৰৰ চিকিৎসক বা প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰ (PHC)ৰ পৰামৰ্শ লওক।

⚠️ জৰুৰীকালীন অৱস্থাত পলম নকৰি ১০৮ নম্বৰত ফোন কৰক।`;
  }

  return `Namaste! For your health inquiry:
1. Rest well and maintain good hydration.
2. Monitor your symptoms closely.
3. If symptoms persist beyond 24-48 hours or worsen, please consult a registered medical practitioner at your nearest clinic or Primary Health Centre (PHC).

⚠️ For immediate medical emergencies, call 108 or 112.`;
}

function getDemoPrescription(): PrescriptionResult {
  return {
    medicines: [
      {
        name: 'Paracetamol 500mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '3 days',
        instructions: 'Take after meals',
        confidence: 0.95,
        isLowConfidence: false,
        type: 'Analgesic',
        sideEffects: 'Liver risk with overdose',
        usage: 'For fever and pain'
      },
      {
        name: 'Cetirizine 10mg',
        dosage: '1 tablet',
        frequency: 'Once daily at bedtime',
        duration: '5 days',
        instructions: 'Take at night',
        confidence: 0.90,
        isLowConfidence: false,
        type: 'Antihistamine',
        sideEffects: 'Drowsiness, dry mouth',
        usage: 'For allergic rhinitis / cold'
      }
    ],
    doctorName: 'Dr. Sharma (MBBS)',
    date: new Date().toLocaleDateString('en-IN'),
    rawText: 'Paracetamol 500mg 1 tab BD x 3d\nCetirizine 10mg 1 tab HS x 5d',
    overallConfidence: 0.92,
    hasLowConfidenceItems: false,
    notes: 'Confirm all medicines with your pharmacist or doctor before taking.'
  };
}

export function isAIConfigured(): boolean {
  return true;
}
