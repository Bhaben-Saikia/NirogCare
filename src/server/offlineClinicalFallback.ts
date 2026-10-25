/**
 * NirogCare - Deterministic Symptom-Aware Offline/Zero-Token Clinical Wellness Fallback
 * (`src/server/offlineClinicalFallback.ts`)
 *
 * Used ONLY when all upstream Gemini/Gemma LLM model buckets return 429/quota-exhausted
 * or when the server is running without an active LLM quota.
 *
 * Safety rules:
 * - Never diagnoses conditions or prescribes medications/dosages.
 * - Provides safe, evidence-based general self-care guidance tailored to the user's topic
 *   in Indian English (`en`), Hindi (`hi`), Assamese (`as`), or Bengali (`bn`).
 * - Always advises consulting a qualified doctor if symptoms persist or worsen.
 */

import type { LanguageCode } from '../config/characters';

interface TopicRule {
  pattern: RegExp;
  replies: Record<LanguageCode, string>;
}

const TOPIC_RULES: TopicRule[] = [
  {
    // Asking for diagnosis or prescription / antibiotic dosage
    pattern: /(diagnos(e|is)|prescribe|antibiotic|which medicine|how many mg|निदान|दवा लिख|एंटीबायोटिक|कितने मिलीग्राम|ৰোগ নিৰ্ণয়|ঔষধ লিখি|এণ্টিবায়টিক)/i,
    replies: {
      en: 'As an AI health assistant and not a doctor, I cannot diagnose conditions like dengue or typhoid or prescribe medication dosages. Please visit a qualified doctor or your nearest Primary Health Centre for proper testing and treatment.',
      hi: 'मैं एक एआई स्वास्थ्य सहायक हूँ, डॉक्टर नहीं, इसलिए मैं किसी बीमारी का निदान या एंटीबायोटिक दवा की खुराक नहीं लिख सकती। कृपया सही जांच और इलाज के लिए नजदीकी स्वास्थ्य केंद्र या डॉक्टर से सलाह लें।',
      as: 'মই এজন এআই স্বাস্থ্য সহায়ক, চিকিৎসক নহয়, সেয়েহে মই কোনো ৰোগ নিৰ্ণয় বা এণ্টিবায়টিক ঔষধৰ পালি নিৰ্ধাৰণ কৰিব নোৱাৰোঁ। অনুগ্ৰহ কৰি সঠিক পৰীক্ষাৰ বাবে ওচৰৰ স্বাস্থ্য কেন্দ্ৰ বা চিকিৎসকৰ পৰামৰ্শ লওক।',
      bn: 'আমি একজন এআই স্বাস্থ্য সহায়ক, ডাক্তার নই, তাই কোনো রোগ নির্ণয় বা ওষুধের মাত্রা লিখে দিতে পারি না। অনুগ্রহ করে নিকটস্থ স্বাস্থ্যকেন্দ্র বা চিকিৎসকের পরামর্শ নিন।'
    }
  },
  {
    // Fever / temperature / chills / body ache / unwell
    pattern: /(fever|temperature|chills|shivering|body ache|viral|bukhar|jor|gaa?\s*beya|unwell|sick|ill|बुखार|ज्वर|तापमान|बदन दर्द|तबीयत|জ্বৰ|গা গৰম|গাৰ বিষ|গা বেয়া|অসুস্থ)/i,
    replies: {
      en: 'For mild fever, rest in a comfortable room, drink plenty of water, oral rehydration solution, or warm soup, and use a lukewarm sponge if needed. If fever lasts more than two days or rises above 102 degrees Fahrenheit, please consult a qualified doctor.',
      hi: 'हल्के बुखार में पर्याप्त आराम करें, खूब पानी, ओआरएस या सूप पिएं, और हल्के सूती कपड़े पहनें। यदि बुखार दो दिन से अधिक रहे या तेज हो जाए, तो तुरंत डॉक्टर से सलाह लें।',
      as: 'পাতল জ্বৰ হ’লে ভালদৰে বিশ্ৰাম লওক, যথেষ্ট পৰিমাণে পানী বা অ’আৰএছ খাওক আৰু পাতল কাপোৰ পিন্ধক। যদি জ্বৰ দুদিনতকৈ বেছি থাকে বা বাঢ়ি যায়, তেন্তে চিকিৎসকৰ পৰামৰ্শ লওক।',
      bn: 'হালকা জ্বর হলে বিশ্রাম নিন, প্রচুর জল বা ওআরএস পান করুন। জ্বর দুই দিনের বেশি থাকলে অবশ্যই ডাক্তারের পরামর্শ নিন।'
    }
  },
  {
    // Cough / cold / sore throat / congestion
    pattern: /(cough|cold|throat|sore throat|flu|runny nose|sneeze|khansi|zukam|kah|खांसी|जुकाम|गले|खराश|কাঁহ|চৰ্দি|ডিঙি|পানীলগা)/i,
    replies: {
      en: 'For a cough or sore throat, sip warm water or herbal tea, gargle with warm salt water, and inhale steam gently. Avoid cold drinks and dusty air, and see a doctor if you develop fever or lingering cough.',
      hi: 'खांसी या गले की खराश में गुनगुना पानी पिएं, नमक के गुनगुने पानी से गरारे करें और भाप लें। ठंडी चीजों और धूल से बचें, और आराम न मिलने पर डॉक्टर को दिखाएं।',
      as: 'কাঁহ বা ডিঙিৰ বিষ হ’লে কুহুমীয়া গৰম পানী খাওক, নিমখ মিহলোৱা গৰম পানীৰে গাৰ্গল কৰক আৰু ভাপ লওক। লক্ষণ ভাল নহ’লে চিকিৎসকৰ ওচৰলৈ যাওক।',
      bn: 'কাশি বা গলা ব্যথায় হালকা গরম জল পান করুন এবং লবণ জলে গার্গল করুন। সমস্যা থাকলে চিকিৎসকের পরামর্শ নিন।'
    }
  },
  {
    // Headache / migraine / tired / dizzy / dehydration
    pattern: /(headache|migraine|head pain|dizzy|fatigue|tired|weakness|dehydration|sirdard|muror bikh|सिरदर्द|सिर में दर्द|थकान|कमज़ोरी|प्यास|মূৰৰ বিষ|ভাগৰ|দুৰ্বল)/i,
    replies: {
      en: 'For a mild headache or fatigue, rest in a quiet dimly lit room, drink a glass of water, and take a break from bright screens. If the headache is sudden, severe, or comes with vision changes or fever, consult a doctor promptly.',
      hi: 'हल्के सिरदर्द, कमज़ोरी या थकान में शांत कमरे में आराम करें, पर्याप्त पानी या ओआरएस पिएं और धूप से बचें। यदि दर्द तेज हो या बार-बार हो, तो डॉक्टर से संपर्क करें।',
      as: 'মূৰৰ বিষ বা ভাগৰ লাগিলে শান্ত ঠাইত বিশ্ৰাম লওক, পানী খাওক আৰু মোবাইল স্ক্ৰীণৰ পৰা কিছু সময় আঁতৰি থাকক। বিষ বেছি হ’লে চিকিৎসকৰ পৰামৰ্শ লওক।',
      bn: 'হালকা মাথাব্যথা বা ক্লান্তিতে শান্ত ঘরে বিশ্রাম নিন এবং জল পান করুন। ব্যথা তীব্র হলে ডাক্তারের পরামর্শ নিন।'
    }
  },
  {
    // Stomach / acidity / indigestion / nausea / diarrhea
    pattern: /(stomach|acidity|bloating|gas|indigestion|nausea|vomit|diarrhea|loose motion|pet|pait|पेट|गैस|एसिडिटी|दस्त|পেট|গেছ|পেটৰ অসুখ|পেটৰ বিষ)/i,
    replies: {
      en: 'For mild stomach discomfort or acidity, eat light home-cooked food like rice, curd, or banana, and sip water or oral rehydration fluids frequently. Avoid spicy or oily meals, and visit a doctor if pain or vomiting persists.',
      hi: 'पेट के हल्के दर्द या गैस में हल्का और सादा भोजन जैसे खिचड़ी, दही या केला लें और थोड़ा-थोड़ा पानी या ओआरएस पीते रहें। तले-भुने भोजन से बचें और समस्या बढ़ने पर डॉक्टर से मिलें।',
      as: 'পেটৰ সাধাৰণ অসুবিধা বা গেছ হ’লে পাতল ঘৰুৱা আহাৰ খাওক আৰু সঘনাই পানী বা অ’আৰএছ খাওক। জ্বলা-পোৰা আৰু তেলীয়া খাদ্য পৰিহাৰ কৰিব, আৰু প্ৰয়োজনত চিকিৎসকৰ পৰামৰ্শ ল’ব।',
      bn: 'পেটের সমস্যায় হালকা খাবার খান এবং ওআরএস বা জল পান করুন। তেল-মশলা এড়িয়ে চলুন এবং প্রয়োজনে ডাক্তার দেখান।'
    }
  },
  {
    // Sleep / stress / anxiety / joint stiffness in elderly
    pattern: /(sleep|insomnia|stress|anxiety|tension|worried|knee|joint|stiffness|neend|tanav|नींद|तनाव|चिंता|घुटनों|जकड़न|টোপনি|চিন্তা|মানসিক|আঁঠু)/i,
    replies: {
      en: 'To improve sleep and ease mild discomfort, try gentle warm compresses, slow deep breathing for five minutes, and avoid caffeine in the evening. Please consult a qualified doctor for persistent joint stiffness or sleep trouble.',
      hi: 'अच्छी नींद और हल्के जोड़ों के आराम के लिए गुनगुने पानी की सिकाई करें, सोने से पहले गहरी सांस लें और शाम को चाय-कॉफी से बचें। समस्या बनी रहने पर डॉक्टर से परामर्श लें।',
      as: 'ভাল টোপনি আৰু মানসিক শান্তিৰ বাবে শোৱাৰ আগতে কিছু সময় দকৈ উশাহ লওক আৰু নিশা চাহ-কফি এৰাই চলক। অসুবিধা থাকিলে চিকিৎসকৰ পৰামৰ্শ লওক।',
      bn: 'ভালো ঘুম ও মানসিক প্রশান্তির জন্য গভীর শ্বাস-প্রশ্বাসের ব্যায়াম করুন এবং রাতে ক্যাফেইন এড়িয়ে চলুন।'
    }
  }
];

export function buildOfflineClinicalReply(userMessage: string, langCode: LanguageCode): string {
  const cleaned = (userMessage || '').trim();
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(cleaned)) {
      return rule.replies[langCode] || rule.replies.en;
    }
  }

  const defaultReplies: Record<LanguageCode, string> = {
    en: 'Namaste! I am your NirogCare AI Health Assistant. Please rest well, drink plenty of clean water, and eat balanced meals. Tell me your symptoms in detail, or consult a qualified doctor if you feel unwell.',
    hi: 'नमस्ते! मैं निरोगकेयर एआई स्वास्थ्य सहायक हूँ। कृपया पर्याप्त आराम करें, साफ पानी पिएं और संतुलित आहार लें। यदि कोई लक्षण बने रहें तो डॉक्टर से परामर्श अवश्य लें।',
    as: 'নমস্কাৰ! মই নিৰোগকেয়াৰ এআই স্বাস্থ্য সহায়ক। অনুগ্ৰহ কৰি বিশ্ৰাম লওক, পৰিষ্কাৰ পানী খাওক আৰু সুষম আহাৰ গ্ৰহণ কৰক। লক্ষণ থাকিলে চিকিৎসকৰ পৰামৰ্শ লওক।',
    bn: 'নমস্কার! আমি নিরোগকেয়ার এআই স্বাস্থ্য সহায়ক। অনুগ্রহ করে বিশ্রাম নিন, পর্যাপ্ত জল পান করুন এবং প্রয়োজনে চিকিৎসকের পরামর্শ নিন।'
  };

  return defaultReplies[langCode] || defaultReplies.en;
}
