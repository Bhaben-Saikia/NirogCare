// src/server/apiRouter.ts
import * as crypto3 from "crypto";

// src/server/redFlags.ts
var EMERGENCY_RESPONSES = {
  "en-IN": {
    general: `\u{1F6A8} EMERGENCY ALERT: Your symptoms may indicate a life-threatening medical emergency requiring immediate medical attention.

Please do NOT wait:
\u2022 Call 108 (National Ambulance Helpline) or 112 (National Emergency Number) immediately.
\u2022 If someone is with you, ask them to take you to the nearest Emergency/Casualty hospital right away.
\u2022 Rest in a safe position and keep your airways clear.

\u26A0\uFE0F This is an automated safety alert. I am an AI assistant, not a doctor. Seek emergency medical care immediately.`,
    crisis: `\u{1F6A8} CRISIS HELPLINE: If you or someone you know is going through severe distress or having thoughts of self-harm, please reach out for immediate help:
\u2022 Tele-MANAS (Govt. of India 24/7 Mental Health Helpline): 14416 or 1800-891-4416 (Toll-Free)
\u2022 Kiran Helpline: 1800-599-0019
\u2022 Emergency: 112

You are not alone. Please speak with someone who can help right now.`
  },
  "hi": {
    general: `\u{1F6A8} \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u091A\u0947\u0924\u093E\u0935\u0928\u0940: \u0906\u092A\u0915\u0947 \u0932\u0915\u094D\u0937\u0923 \u0915\u093F\u0938\u0940 \u0917\u0902\u092D\u0940\u0930 \u091A\u093F\u0915\u093F\u0924\u094D\u0938\u0940\u092F \u0906\u092A\u093E\u0924 \u0938\u094D\u0925\u093F\u0924\u093F \u0915\u093E \u0938\u0902\u0915\u0947\u0924 \u0939\u094B \u0938\u0915\u0924\u0947 \u0939\u0948\u0902 \u091C\u093F\u0938\u0915\u0947 \u0932\u093F\u090F \u0924\u0924\u094D\u0915\u093E\u0932 \u0909\u092A\u091A\u093E\u0930 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964

\u0915\u0943\u092A\u092F\u093E \u092C\u093F\u0932\u094D\u0915\u0941\u0932 \u092A\u094D\u0930\u0924\u0940\u0915\u094D\u0937\u093E \u0928 \u0915\u0930\u0947\u0902:
\u2022 \u0924\u0941\u0930\u0902\u0924 108 (\u090F\u092E\u094D\u092C\u0941\u0932\u0947\u0902\u0938) \u092F\u093E 112 (\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0928\u0902\u092C\u0930) \u092A\u0930 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902\u0964
\u2022 \u092F\u0926\u093F \u0906\u092A\u0915\u0947 \u092A\u093E\u0938 \u0915\u094B\u0908 \u0939\u0948, \u0924\u094B \u0909\u0928\u0938\u0947 \u0924\u0941\u0930\u0902\u0924 \u0906\u092A\u0915\u094B \u0928\u091C\u0926\u0940\u0915\u0940 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u0932\u0947 \u091C\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u0939\u0947\u0902\u0964
\u2022 \u0936\u093E\u0902\u0924 \u092C\u0948\u0920\u0947\u0902 \u0914\u0930 \u0938\u093E\u0902\u0938 \u0932\u0947\u0928\u0947 \u092E\u0947\u0902 \u0915\u0920\u093F\u0928\u093E\u0908 \u0928 \u0939\u094B \u0910\u0938\u0940 \u0906\u0930\u093E\u092E\u0926\u093E\u092F\u0915 \u0938\u094D\u0925\u093F\u0924\u093F \u092E\u0947\u0902 \u0930\u0939\u0947\u0902\u0964

\u26A0\uFE0F \u092F\u0939 \u090F\u0915 \u0938\u094D\u0935\u091A\u093E\u0932\u093F\u0924 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u091A\u0947\u0924\u093E\u0935\u0928\u0940 \u0939\u0948\u0964 \u092E\u0948\u0902 \u090F\u0915 \u090F\u0906\u0908 \u0938\u0939\u093E\u092F\u0915 \u0939\u0942\u0901, \u0921\u0949\u0915\u094D\u091F\u0930 \u0928\u0939\u0940\u0902\u0964 \u0924\u0941\u0930\u0902\u0924 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u091A\u093F\u0915\u093F\u0924\u094D\u0938\u093E \u0938\u0939\u093E\u092F\u0924\u093E \u0932\u0947\u0902\u0964`,
    crisis: `\u{1F6A8} \u0938\u0902\u0915\u091F \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928: \u092F\u0926\u093F \u0906\u092A \u092F\u093E \u0906\u092A\u0915\u093E \u0915\u094B\u0908 \u092A\u0930\u093F\u091A\u093F\u0924 \u0905\u0924\u094D\u092F\u0927\u093F\u0915 \u092E\u093E\u0928\u0938\u093F\u0915 \u0924\u0928\u093E\u0935 \u092E\u0947\u0902 \u0939\u0948\u0902, \u0924\u094B \u0915\u0943\u092A\u092F\u093E \u0924\u0941\u0930\u0902\u0924 \u0938\u0939\u093E\u092F\u0924\u093E \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902:
\u2022 Tele-MANAS (\u092D\u093E\u0930\u0924 \u0938\u0930\u0915\u093E\u0930 24/7 \u092E\u093E\u0928\u0938\u093F\u0915 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928): 14416 \u092F\u093E 1800-891-4416 (\u091F\u094B\u0932-\u092B\u094D\u0930\u0940)
\u2022 \u0915\u093F\u0930\u0923 \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928: 1800-599-0019
\u2022 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928: 112

\u0906\u092A \u0905\u0915\u0947\u0932\u0947 \u0928\u0939\u0940\u0902 \u0939\u0948\u0902\u0964 \u0915\u0943\u092A\u092F\u093E \u0924\u0941\u0930\u0902\u0924 \u0915\u093F\u0938\u0940 \u0938\u0947 \u092C\u093E\u0924 \u0915\u0930\u0947\u0902\u0964`
  },
  "as": {
    general: `\u{1F6A8} \u099C\u09F0\u09C1\u09F0\u09C0\u0995\u09BE\u09B2\u09C0\u09A8 \u09B8\u09A4\u09F0\u09CD\u0995\u09AC\u09BE\u09F0\u09CD\u09A4\u09BE: \u0986\u09AA\u09CB\u09A8\u09BE\u09F0 \u09B2\u0995\u09CD\u09B7\u09A3\u09B8\u09AE\u09C2\u09B9\u09C7 \u0995\u09CB\u09A8\u09CB \u099C\u099F\u09BF\u09B2 \u099C\u09C0\u09F1\u09A8-\u09B8\u0982\u0995\u099F\u099C\u09A8\u0995 \u099C\u09F0\u09C1\u09F0\u09C0\u0995\u09BE\u09B2\u09C0\u09A8 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE\u09F0 \u0987\u0982\u0997\u09BF\u09A4 \u09A6\u09BF\u09AC \u09AA\u09BE\u09F0\u09C7 \u09AF\u09BE\u09F0 \u09AC\u09BE\u09AC\u09C7 \u09A4\u09BE\u09CE\u0995\u09CD\u09B7\u09A3\u09BF\u0995 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u09BE\u09F0 \u09AA\u09CD\u09F0\u09AF\u09BC\u09CB\u099C\u09A8\u0964

\u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u09AA\u09B2\u09AE \u09A8\u0995\u09F0\u09BF\u09AC:
\u2022 \u09A4\u09A4\u09BE\u09B2\u09BF\u0995\u09C7 \u09E7\u09E6\u09EE (\u09F0\u09BE\u09B7\u09CD\u099F\u09CD\u09F0\u09C0\u09AF\u09BC \u098F\u09AE\u09CD\u09AC\u09C1\u09B2\u09C7\u09A8\u09CD\u09B8) \u09AC\u09BE \u09E7\u09E7\u09E8 (\u09F0\u09BE\u09B7\u09CD\u099F\u09CD\u09F0\u09C0\u09AF\u09BC \u099C\u09F0\u09C1\u09F0\u09C0\u0995\u09BE\u09B2\u09C0\u09A8 \u09A8\u09AE\u09CD\u09AC\u09F0)\u09A4 \u09AB\u09CB\u09A8 \u0995\u09F0\u0995\u0964
\u2022 \u0986\u09AA\u09CB\u09A8\u09BE\u09F0 \u0993\u099A\u09F0\u09A4 \u0995\u09CB\u09A8\u09CB\u09AC\u09BE \u09A5\u09BE\u0995\u09BF\u09B2\u09C7 \u09A4\u09C7\u0993\u0981\u09B2\u09CB\u0995\u0995 \u0986\u09AA\u09CB\u09A8\u09BE\u0995 \u0993\u099A\u09F0\u09F0 \u099C\u09F0\u09C1\u09F0\u09C0\u0995\u09BE\u09B2\u09C0\u09A8 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u09BE\u09B2\u09AF\u09BC\u09B2\u09C8 \u09B2\u09C8 \u09AF\u09BE\u09AC\u09B2\u09C8 \u0995\u0993\u0995\u0964
\u2022 \u09AC\u09BF\u09B6\u09CD\u09F0\u09BE\u09AE \u09B2\u0993\u0995 \u0986\u09F0\u09C1 \u0989\u09B6\u09BE\u09B9-\u09A8\u09BF\u09B6\u09BE\u09B9 \u09B8\u09B9\u099C \u09B9\u09CB\u09F1\u09BE \u0985\u09F1\u09B8\u09CD\u09A5\u09BE\u09A4 \u09A5\u09BE\u0995\u0995\u0964

\u26A0\uFE0F \u098F\u0987\u099F\u09CB \u098F\u099F\u09BE \u09B8\u09CD\u09AC\u09AF\u09BC\u0982\u0995\u09CD\u09F0\u09BF\u09AF\u09BC \u09B8\u09C1\u09F0\u0995\u09CD\u09B7\u09BE \u09B8\u09A4\u09F0\u09CD\u0995\u09AC\u09BE\u09F0\u09CD\u09A4\u09BE\u0964 \u09AE\u0987 \u098F\u099C\u09A8 \u098F\u0986\u0987 \u09B8\u09B9\u09BE\u09AF\u09BC\u0995, \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 \u09A8\u09B9\u09AF\u09BC\u0964 \u09AA\u09B2\u09AE \u09A8\u0995\u09F0\u09BF \u099C\u09F0\u09C1\u09F0\u09C0\u0995\u09BE\u09B2\u09C0\u09A8 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u09BE \u09B8\u09C7\u09F1\u09BE \u0997\u09CD\u09F0\u09B9\u09A3 \u0995\u09F0\u0995\u0964`,
    crisis: `\u{1F6A8} \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF: \u09AF\u09A6\u09BF \u0986\u09AA\u09C1\u09A8\u09BF \u09AC\u09BE \u0986\u09AA\u09CB\u09A8\u09BE\u09F0 \u099A\u09BF\u09A8\u09BE\u0995\u09BF \u0995\u09CB\u09A8\u09CB\u09AC\u09BE\u0987 \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u09B8\u0982\u0995\u099F \u09AC\u09BE \u09A8\u09BF\u099C\u09F0 \u0995\u09CD\u09B7\u09A4\u09BF \u0995\u09F0\u09BE\u09F0 \u099A\u09BF\u09A8\u09CD\u09A4\u09BE\u09A4 \u09AD\u09C1\u0997\u09BF\u099B\u09C7, \u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u09B8\u09B9\u09BE\u09AF\u09BC \u09B2\u0993\u0995:
\u2022 Tele-MANAS (\u09AD\u09BE\u09F0\u09A4 \u099A\u09F0\u0995\u09BE\u09F0\u09F0 \u09E8\u09EA/\u09ED \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8): 14416 \u0985\u09A5\u09AC\u09BE 1800-891-4416 (\u099F\u09CB\u09B2-\u09AB\u09CD\u09F0\u09C0)
\u2022 \u0995\u09BF\u09F0\u09A3 \u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8: 1800-599-0019
\u2022 \u099C\u09F0\u09C1\u09F0\u09C0\u0995\u09BE\u09B2\u09C0\u09A8 \u09B8\u09C7\u09F1\u09BE: 112

\u0986\u09AA\u09C1\u09A8\u09BF \u0985\u0995\u09B2\u09B6\u09F0\u09C0\u09AF\u09BC\u09BE \u09A8\u09B9\u09AF\u09BC\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u09A4\u09BE\u09CE\u0995\u09CD\u09B7\u09A3\u09BF\u0995\u09AD\u09BE\u09F1\u09C7 \u0995\u09A5\u09BE \u09AA\u09BE\u09A4\u0995\u0964`
  }
};
var RED_FLAG_PATTERNS = [
  // Cardiac
  {
    category: "cardiac",
    regex: /(chest pain|heart attack|angina|crushing chest|radiating to left arm|chhati.*dard|seene.*dard|सीना.*दर्द|सीने.*दर्द|छाती.*दर्द|বুকুৰ বিষ|বুকুত.*বিষ|হৃদৰোগ|বুকু হেঁচি ধৰা|bukur bikh|bukut.*bikh)/i
  },
  // Stroke (FAST)
  {
    category: "stroke",
    regex: /(stroke|facial droop|face (is )?drooping|cannot speak clearly|arm weakness|slurred speech|sudden numbness|chehra.*tedha|mukh beka|bolne me ladkhada|लकवा|पक्षाघात|चेहरे.*टेढ़ा|बोलने में दिक्कत|মুখ বেঁকা|মুখৰ এফাল বেঁকা|হাত-ভৰি অসাৰ|পক্ষাঘাত|কথা ক['’]?ব(লৈ)? (নোৱাৰা|পৰা নাই))/i
  },
  // Severe Respiratory
  {
    category: "respiratory",
    regex: /(can('?t|not) breathe|severe breathlessness|gasping for breath|suffocating|choking|lips are turning blue|saans nahi aa rahi|saans lene me.*takleef|सा[ंँ]स नहीं आ रही|सा[ंँ]स लेने में.*तकली[फफ़]|दम घुट रहा है|উশাহ ল['’]?ব(লৈ)? (পৰা নাই|নোৱাৰা|বহুত কষ্ট|কষ্ট হৈছে)|ওঁঠ নীলা|দম বন্ধ|ushah lobo pora nai)/i
  },
  // Severe Hemorrhage
  {
    category: "hemorrhage",
    regex: /(coughing blood|vomiting blood|uncontrolled bleeding|profuse bleeding|khoon nikal raha|khoon beh raha|tej ulai|bohut tej|खून की उल्टी|अत्यधिक खून|তেজ বমি|অত্যধিক ৰক্তক্ষৰণ|অত্যধিক তেজ)/i
  },
  // Poisoning
  {
    category: "poisoning",
    regex: /(poison|swallowed poison|snake bite|consumed pesticide|zahar|zeher|zehar kha|कीटनाशक|सा[ंँ]प ने काट|বিষপান|বিষ খাইছে|সাপে খোৱা|সাপে কামুৰিছে|bikh pan)/i
  },
  // Unconscious / Seizures
  {
    category: "unconscious",
    regex: /(unconscious|passed out|fainted and not waking|unresponsive|seizure|convulsions|behos|behosh|mirgi|बेहोश|दौरा|অচেতন|জ্ঞান হেৰুওৱা|হঠাতে ঢলি পৰা)/i
  },
  // Mental Health / Crisis
  {
    category: "mental_health",
    regex: /(suicide|suicidal|want to end my life|kill myself|want to die|ending my life|end my life|jaan dena chahta|atmahatya|mar jana chahta|आत्महत्या|जान देना|আত্মহত্যা|জীৱন শেষ কৰিম)/i
  }
];
function detectRedFlags(userText, requestedLang = "en") {
  const normText = userText.toLowerCase();
  let langKey = "en-IN";
  if (requestedLang.includes("as") || requestedLang.includes("assam")) {
    langKey = "as";
  } else if (requestedLang.includes("hi") || requestedLang.includes("hindi")) {
    langKey = "hi";
  }
  for (const pattern of RED_FLAG_PATTERNS) {
    if (pattern.regex.test(normText)) {
      const responseTemplate = EMERGENCY_RESPONSES[langKey];
      const message = pattern.category === "mental_health" ? responseTemplate.crisis : responseTemplate.general;
      return {
        isEmergency: true,
        message,
        category: pattern.category,
        languageCode: langKey
      };
    }
  }
  return {
    isEmergency: false,
    languageCode: langKey
  };
}

// src/server/promptGuard.ts
var SAFE_INJECTION_REFUSALS = {
  en: "I am a NirogCare AI health assistant, not a doctor. I cannot override my safety rules, reveal system configurations, diagnose conditions, or prescribe medicines. Please ask a general wellness question.",
  hi: "\u092E\u0948\u0902 \u0928\u093F\u0930\u094B\u0917\u0915\u0947\u092F\u0930 \u090F\u0906\u0908 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0939\u093E\u092F\u0915 \u0939\u0942\u0901, \u0921\u0949\u0915\u094D\u091F\u0930 \u0928\u0939\u0940\u0902\u0964 \u092E\u0948\u0902 \u0905\u092A\u0928\u0947 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0928\u093F\u092F\u092E\u094B\u0902 \u0915\u094B \u0928\u0939\u0940\u0902 \u092C\u0926\u0932 \u0938\u0915\u0924\u0940 \u0914\u0930 \u0928 \u0939\u0940 \u0915\u093F\u0938\u0940 \u092C\u0940\u092E\u093E\u0930\u0940 \u0915\u093E \u0928\u093F\u0926\u093E\u0928 \u092F\u093E \u0926\u0935\u093E \u0932\u093F\u0916 \u0938\u0915\u0924\u0940 \u0939\u0942\u0901\u0964 \u0915\u0943\u092A\u092F\u093E \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u092A\u094D\u0930\u0936\u094D\u0928 \u092A\u0942\u091B\u0947\u0902\u0964",
  as: "\u09AE\u0987 \u09A8\u09BF\u09F0\u09CB\u0997\u0995\u09C7\u09AF\u09BC\u09BE\u09F0 \u098F\u0986\u0987 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09BE\u09AF\u09BC\u0995, \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 \u09A8\u09B9\u09AF\u09BC\u0964 \u09AE\u0987 \u09AE\u09CB\u09F0 \u09B8\u09C1\u09F0\u0995\u09CD\u09B7\u09BE \u09A8\u09BF\u09AF\u09BC\u09AE \u09B8\u09B2\u09A8\u09BF \u0995\u09F0\u09BF\u09AC \u09A8\u09CB\u09F1\u09BE\u09F0\u09CB\u0981 \u09AC\u09BE \u0995\u09CB\u09A8\u09CB \u09F0\u09CB\u0997 \u09A8\u09BF\u09F0\u09CD\u09A3\u09AF\u09BC \u0986\u09F0\u09C1 \u0994\u09B7\u09A7 \u09B2\u09BF\u0996\u09BF\u09AC \u09A8\u09CB\u09F1\u09BE\u09F0\u09CB\u0981\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u09B8\u09BE\u09A7\u09BE\u09F0\u09A3 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09AE\u09CD\u09AA\u09F0\u09CD\u0995\u09C0\u09AF\u09BC \u09AA\u09CD\u09F0\u09B6\u09CD\u09A8 \u09B8\u09CB\u09A7\u0995\u0964",
  bn: "\u0986\u09AE\u09BF \u09A8\u09BF\u09B0\u09CB\u0997\u0995\u09C7\u09AF\u09BC\u09BE\u09B0 \u098F\u0986\u0987 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09BE\u09AF\u09BC\u0995, \u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0 \u09A8\u0987\u0964 \u0986\u09AE\u09BF \u0986\u09AE\u09BE\u09B0 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u09A8\u09BF\u09AF\u09BC\u09AE \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AC\u09BE \u0995\u09CB\u09A8\u09CB \u09B0\u09CB\u0997 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC \u0993 \u0993\u09B7\u09C1\u09A7 \u09B2\u09BF\u0996\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF \u09A8\u09BE\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09AC\u09BF\u09B7\u09AF\u09BC\u0995 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09C1\u09A8\u0964"
};
var INJECTION_PATTERNS = [
  // English prompt injection, role hijack, DAN jailbreak, secret/system prompt extraction
  /\b(ignore (all )?(previous|prior|above|system) (instructions|prompts|rules)|disregard (all )?(previous|prior|system) (instructions|rules)|forget (all )?(previous|prior) instructions)\b/i,
  /\b(reveal|print|show|output|repeat) (your |the )?(full )?(system prompt|hidden prompt|developer instructions|api[ _-]?key|gemini_api_key|elevenlabs_api_key|secret key)\b/i,
  /\b(you are now in dan mode|dan mode enabled|jailbreak|bypass safety (rules|filters)|without safety (rules|restrictions)|act as a licensed (medical )?doctor and prescribe)\b/i,
  // Hindi prompt injection / role hijack
  /(पिछले सभी निर्देश(ों को)? (भूल जाओ|अनदेखा करो|अनदेखा करें)|पुराने नियम भूल जाओ|असली डॉक्टर बनकर .* दवा लिखो|सिस्टम प्रॉम्प्ट दिखाओ)/i,
  // Assamese prompt injection / role hijack
  /(পূৰ্বৰ (সকলো )?নিৰ্দেশনা পাহৰি যাওক|পুৰণি নিয়মবোৰ বাদ দিয়ক|এজন চিকিৎসক হিচাপে মোক ঔষধ লিখি দিয়ক|চিকিৎসক হিচাপে .* ঔষধ লিখক|চিষ্টেম প্ৰম্পট দেখুৱাওক)/i
];
function resolveEffectiveLanguage(userText, selectedLang = "en") {
  const trimmed = (userText || "").trim();
  const baseLang = selectedLang.startsWith("hi") ? "hi" : selectedLang.startsWith("as") ? "as" : selectedLang.startsWith("bn") ? "bn" : "en";
  if (!trimmed) return baseLang;
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    if (/[ৰৱ]/.test(trimmed) || baseLang !== "bn") {
      return "as";
    }
    return "bn";
  }
  if (/\b(mur|mor|mora|bikh|jor|hoise|kene|logai|ushah|bukur)\b/i.test(trimmed)) {
    return "as";
  }
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return "hi";
  }
  if (/\b(mujhe|mera|meri|bukhar|dard|sir|khansi|kya|karu|pet)\b/i.test(trimmed)) {
    return "hi";
  }
  if (/^[A-Za-z0-9\s.,?!'"-;:()]+$/.test(trimmed) && /\b(what|how|should|have|fever|headache|cough|pain|help|remedies|doctor|sleep|throat|cold|water)\b/i.test(
    trimmed
  )) {
    return "en";
  }
  return baseLang;
}
function detectPromptInjection(userText, requestedLang = "en") {
  const effectiveLang = resolveEffectiveLanguage(userText, requestedLang);
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(userText)) {
      return {
        isInjection: true,
        safeReply: SAFE_INJECTION_REFUSALS[effectiveLang],
        languageCode: effectiveLang
      };
    }
  }
  return {
    isInjection: false,
    languageCode: effectiveLang
  };
}

// src/server/piiStripper.ts
function stripPII(text) {
  let cleanText = text;
  let count = 0;
  const phoneRegex = /(\+91[\s-]?)?[6789]\d{9}\b|(\b\d{3}[-\s]\d{3}[-\s]\d{4}\b)/g;
  cleanText = cleanText.replace(phoneRegex, () => {
    count++;
    return "[REDACTED_PHONE]";
  });
  const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g;
  cleanText = cleanText.replace(aadhaarRegex, (match) => {
    if (match.replace(/\s/g, "").length === 12) {
      count++;
      return "[REDACTED_AADHAAR]";
    }
    return match;
  });
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  cleanText = cleanText.replace(emailRegex, () => {
    count++;
    return "[REDACTED_EMAIL]";
  });
  const nameIntroRegex = /\b(my name is|i am|mera naam|naam hai|mor naam)\s+([A-Za-z]{3,20}(\s+[A-Za-z]{3,20})?)\b/gi;
  cleanText = cleanText.replace(nameIntroRegex, (match, prefix) => {
    count++;
    return `${prefix} [REDACTED_NAME]`;
  });
  return { cleanText, strippedCount: count };
}

// src/server/elevenLabsPool.ts
import * as fs from "fs";
import * as path from "path";
function maskKey(key) {
  if (!key || key.length < 8) return "****";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
function getRawEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match) return match[1].trim();
    }
  } catch {
  }
  return "";
}
function parseKeyString(raw) {
  if (!raw) return [];
  let clean = raw.trim();
  if (clean.startsWith('"') && clean.endsWith('"') || clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.slice(1, -1);
  }
  const rawParts = clean.split(/[,;\n|]+/);
  const seen = /* @__PURE__ */ new Set();
  const keys = [];
  for (const part of rawParts) {
    const k = part.trim();
    if (k.length >= 10 && !k.startsWith("your_") && !seen.has(k)) {
      seen.add(k);
      keys.push(k);
    }
  }
  return keys;
}
var ElevenLabsKeyPool = class {
  slots = [];
  lastParsedRaw = "";
  activeSlotIndex = 0;
  // Key quota exhaustion lasts for 24 hours (or process lifetime) before being re-probed
  EXHAUSTION_COOLDOWN_MS = 24 * 60 * 60 * 1e3;
  // Rate limit backoff (HTTP 429) is 6 seconds
  RATE_LIMIT_COOLDOWN_MS = 6 * 1e3;
  constructor() {
    this.refreshSlots();
  }
  refreshSlots() {
    const raw = getRawEnv("ELEVENLABS_API_KEYS") || getRawEnv("ELEVENLABS_API_KEY") || process.env.ELEVENLABS_API_KEYS || process.env.ELEVENLABS_API_KEY || "";
    if (raw === this.lastParsedRaw && this.slots.length > 0) {
      return;
    }
    this.lastParsedRaw = raw;
    const parsedKeys = parseKeyString(raw);
    const existingMap = /* @__PURE__ */ new Map();
    for (const slot of this.slots) {
      existingMap.set(slot.key, slot);
    }
    this.slots = parsedKeys.map((key) => {
      const existing = existingMap.get(key);
      if (existing) {
        return existing;
      }
      return {
        key,
        masked: maskKey(key),
        exhausted: false,
        exhaustedAt: 0,
        rateLimitedUntil: 0,
        lastUsedAt: 0,
        charsSynthesized: 0
      };
    });
    if (this.activeSlotIndex >= this.slots.length) {
      this.activeSlotIndex = 0;
    }
  }
  getKeyCount() {
    this.refreshSlots();
    return this.slots.length;
  }
  getAllKeys() {
    this.refreshSlots();
    return this.slots.map((s) => s.key);
  }
  getAvailableKeys() {
    this.refreshSlots();
    const now = Date.now();
    return this.slots.filter((slot) => {
      if (slot.exhausted && now - slot.exhaustedAt > this.EXHAUSTION_COOLDOWN_MS) {
        slot.exhausted = false;
        slot.exhaustReason = void 0;
      }
      if (slot.exhausted) return false;
      if (slot.rateLimitedUntil > now) return false;
      return true;
    });
  }
  /**
   * Returns the next available key slot in the pool.
   * If a slot is rate-limited or exhausted, it automatically advances to the next slot.
   */
  getNextKey() {
    this.refreshSlots();
    if (this.slots.length === 0) return null;
    const available = this.getAvailableKeys();
    if (available.length === 0) {
      const nonExhausted = this.slots.filter((s) => !s.exhausted);
      if (nonExhausted.length > 0) {
        nonExhausted.sort((a, b) => a.rateLimitedUntil - b.rateLimitedUntil);
        return nonExhausted[0];
      }
      return null;
    }
    for (let i = 0; i < this.slots.length; i++) {
      const idx = (this.activeSlotIndex + i) % this.slots.length;
      const candidate = this.slots[idx];
      if (available.includes(candidate)) {
        this.activeSlotIndex = (idx + 1) % this.slots.length;
        candidate.lastUsedAt = Date.now();
        return candidate;
      }
    }
    return available[0];
  }
  /**
   * Marks a key as exhausted (e.g. 10k quota exceeded, invalid key)
   * Logs rotation and returns number of remaining available keys.
   */
  markExhausted(key, reason = "quota_exceeded") {
    this.refreshSlots();
    const slot = this.slots.find((s) => s.key === key);
    if (slot) {
      slot.exhausted = true;
      slot.exhaustedAt = Date.now();
      slot.exhaustReason = reason;
      const remaining = this.getAvailableKeys().length;
      console.warn(
        `[ElevenLabs Pool] Key ${slot.masked} marked exhausted (${reason}). ${remaining} of ${this.slots.length} keys remaining in pool.`
      );
      return remaining;
    }
    return this.getAvailableKeys().length;
  }
  /**
   * Marks a key as temporarily rate-limited (HTTP 429 concurrency)
   */
  markRateLimited(key, cooldownMs = this.RATE_LIMIT_COOLDOWN_MS) {
    this.refreshSlots();
    const slot = this.slots.find((s) => s.key === key);
    if (slot) {
      slot.rateLimitedUntil = Date.now() + cooldownMs;
      console.info(
        `[ElevenLabs Pool] Key ${slot.masked} concurrency/rate-limited for ${Math.round(
          cooldownMs / 1e3
        )}s. Rotating to next key.`
      );
    }
  }
  /**
   * Records successful character synthesis for usage tracking
   */
  recordUsage(key, charCount) {
    const slot = this.slots.find((s) => s.key === key);
    if (slot) {
      slot.charsSynthesized += charCount;
    }
  }
  /**
   * Resets exhaustion state for all keys (e.g. for testing or monthly billing cycle reset)
   */
  resetPool() {
    for (const slot of this.slots) {
      slot.exhausted = false;
      slot.exhaustedAt = 0;
      slot.exhaustReason = void 0;
      slot.rateLimitedUntil = 0;
      slot.charsSynthesized = 0;
    }
    this.activeSlotIndex = 0;
  }
  /**
   * Returns a diagnostic snapshot of all keys in the pool
   */
  getSnapshot() {
    this.refreshSlots();
    const now = Date.now();
    return {
      totalKeys: this.slots.length,
      availableKeys: this.getAvailableKeys().length,
      slots: this.slots.map((s) => ({
        masked: s.masked,
        exhausted: s.exhausted,
        exhaustReason: s.exhaustReason,
        rateLimited: s.rateLimitedUntil > now,
        charsSynthesized: s.charsSynthesized
      }))
    };
  }
};
var elevenLabsPool = new ElevenLabsKeyPool();
function getElevenLabsKeyCount() {
  return elevenLabsPool.getKeyCount();
}

// src/server/rateLimiter.ts
var userStore = /* @__PURE__ */ new Map();
var MAX_MESSAGE_LENGTH = 1e3;
var MAX_REQUESTS_PER_MINUTE = 45;
var MAX_REQUESTS_PER_DAY = 300;
var MAX_DAILY_GEMINI_TOKENS = Number(process.env.DAILY_GEMINI_TOKEN_CAP || 25e4);
function getMaxDailyElevenLabsChars() {
  if (process.env.DAILY_ELEVENLABS_CHAR_CAP) {
    const val = Number(process.env.DAILY_ELEVENLABS_CHAR_CAP);
    if (!isNaN(val) && val > 0) return val;
  }
  const keyCount = getElevenLabsKeyCount();
  return Math.max(3e4, keyCount * 1e4);
}
var dailySpendResetAt = Date.now() + 24 * 60 * 60 * 1e3;
var dailyGeminiTokensUsed = 0;
var dailyElevenLabsCharsUsed = 0;
function resetDailySpendIfNeeded(now) {
  if (now > dailySpendResetAt) {
    dailyGeminiTokensUsed = 0;
    dailyElevenLabsCharsUsed = 0;
    dailySpendResetAt = now + 24 * 60 * 60 * 1e3;
  }
}
function checkRateLimit(userId, messageLength) {
  if (messageLength > MAX_MESSAGE_LENGTH) {
    return {
      allowed: false,
      reason: `Message length exceeds maximum limit of ${MAX_MESSAGE_LENGTH} characters.`
    };
  }
  const now = Date.now();
  resetDailySpendIfNeeded(now);
  if (dailyGeminiTokensUsed >= MAX_DAILY_GEMINI_TOKENS) {
    return {
      allowed: false,
      reason: "Daily AI token cap reached. Please try again tomorrow."
    };
  }
  let usage = userStore.get(userId);
  if (!usage) {
    usage = {
      minuteCount: 0,
      minuteResetAt: now + 60 * 1e3,
      dailyCount: 0,
      dailyResetAt: now + 24 * 60 * 60 * 1e3
    };
    userStore.set(userId, usage);
  }
  if (now > usage.minuteResetAt) {
    usage.minuteCount = 0;
    usage.minuteResetAt = now + 60 * 1e3;
  }
  if (now > usage.dailyResetAt) {
    usage.dailyCount = 0;
    usage.dailyResetAt = now + 24 * 60 * 60 * 1e3;
  }
  if (usage.minuteCount >= MAX_REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      reason: "Rate limit exceeded: Too many messages in a short time. Please wait a minute."
    };
  }
  if (usage.dailyCount >= MAX_REQUESTS_PER_DAY) {
    return {
      allowed: false,
      reason: "Daily usage limit reached. Please return tomorrow."
    };
  }
  usage.minuteCount++;
  usage.dailyCount++;
  return {
    allowed: true,
    remainingDaily: MAX_REQUESTS_PER_DAY - usage.dailyCount
  };
}
function recordGeminiTokenUsage(estimatedTokens) {
  resetDailySpendIfNeeded(Date.now());
  dailyGeminiTokensUsed += Math.max(1, estimatedTokens);
}
function checkAndRecordElevenLabsCredits(charCount) {
  resetDailySpendIfNeeded(Date.now());
  const maxCap = getMaxDailyElevenLabsChars();
  if (dailyElevenLabsCharsUsed + charCount > maxCap) {
    return false;
  }
  dailyElevenLabsCharsUsed += charCount;
  return true;
}

// src/config/characters.ts
var SUPPORTED_LANGUAGES = [
  {
    code: "en",
    name: "Indian English",
    nativeName: "English (India)",
    scriptInstruction: "Reply in natural Indian English using Latin script.",
    elevenLabsModel: "eleven_v4_turbo",
    bcp47Locale: "en-IN"
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940",
    scriptInstruction: "Reply entirely in natural spoken Hindi using Devanagari script (\u0939\u093F\u0928\u094D\u0926\u0940).",
    elevenLabsModel: "eleven_v4_turbo",
    bcp47Locale: "hi-IN"
  },
  {
    code: "as",
    name: "Assamese",
    nativeName: "\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE",
    scriptInstruction: "Reply entirely in natural spoken Assamese using Assamese script (\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE). Use authentic Assamese vocabulary and grammar (such as \u09AE\u0987, \u0986\u09AA\u09C1\u09A8\u09BF, \u0995\u09C7\u09A8\u09C7\u0995\u09C1\u09F1\u09BE, \u09AC\u09BF\u09B6\u09CD\u09F0\u09BE\u09AE).",
    elevenLabsModel: "eleven_v4_turbo",
    bcp47Locale: "as-IN"
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "\u09AC\u09BE\u0982\u09B2\u09BE",
    scriptInstruction: "Reply entirely in natural spoken Bengali using Bengali script (\u09AC\u09BE\u0982\u09B2\u09BE).",
    elevenLabsModel: "eleven_v4_turbo",
    bcp47Locale: "bn-IN"
  }
];
var CHARACTERS = [
  {
    id: "aria",
    name: "Aria",
    gender: "female",
    title: "AI Health Assistant",
    glbUrl: "/avatars/medical_assistant.glb",
    videoUrl: "/avatars/doctor-loop-1080.mp4",
    posterUrl: "/avatars/doctor-poster-1080.jpg",
    geminiVoiceName: "Aoede",
    personaPrompt: "You are Aria, NirogCare AI Health Assistant (an AI assistant, not a doctor). You speak warmly, calmly, and clearly like a compassionate clinical health assistant in India. Never diagnose conditions or prescribe medicines; offer general evidence-based wellness guidance and advise when to consult a qualified clinician.",
    appearance: {
      skinColor: "#e2a985",
      hairColor: "#1b1411",
      eyeColor: "#3b2416",
      lipColor: "#b85d5c",
      outfitPrimary: "#0f766e",
      outfitSecondary: "#f8fafc",
      hairStyle: "bun",
      headWidthScale: 0.96,
      jawWidthScale: 0.92,
      browThickness: 0.9,
      hasStethoscope: false,
      fallbackPitchCents: 60,
      fallbackRate: 1.03
    },
    voiceMap: {
      // Sarah - Warm, Reassuring, Natural Human Female voice
      en: "EXAVITQu4vr4xnSDxMaL",
      hi: "EXAVITQu4vr4xnSDxMaL",
      as: "EXAVITQu4vr4xnSDxMaL",
      bn: "EXAVITQu4vr4xnSDxMaL"
    }
  },
  {
    id: "priya",
    name: "Priya",
    gender: "female",
    title: "AI Wellness Assistant",
    glbUrl: "/avatars/avaturn.glb",
    videoUrl: "/avatars/advisor-loop-1080.mp4",
    posterUrl: "/avatars/doctor-poster-1080.jpg",
    geminiVoiceName: "Kore",
    personaPrompt: "You are Priya, NirogCare AI Wellness Assistant (an AI assistant, not a doctor). You speak with gentle encouragement and practical clarity.",
    appearance: {
      skinColor: "#d99b72",
      hairColor: "#231712",
      eyeColor: "#2d1e14",
      lipColor: "#c25964",
      outfitPrimary: "#0369a1",
      outfitSecondary: "#f1f5f9",
      hairStyle: "waves",
      headWidthScale: 0.94,
      jawWidthScale: 0.9,
      browThickness: 0.85,
      hasStethoscope: false,
      fallbackPitchCents: 140,
      fallbackRate: 1.06
    },
    voiceMap: {
      // Jessica - Expressive Natural Female voice
      en: "cgSgspJ2msm6clMCkdW9",
      hi: "cgSgspJ2msm6clMCkdW9",
      as: "cgSgspJ2msm6clMCkdW9",
      bn: "cgSgspJ2msm6clMCkdW9"
    }
  },
  {
    id: "aarav",
    name: "Aarav",
    gender: "male",
    title: "AI Health Assistant",
    glbUrl: "/avatars/avatarsdk.glb",
    videoUrl: "/avatars/specialist-loop-1080.mp4",
    posterUrl: "/avatars/ravatar-doctor-poster.webp",
    geminiVoiceName: "Puck",
    personaPrompt: "You are Aarav, NirogCare AI Health Assistant (an AI assistant, not a doctor). You explain health guidance calmly and concisely in natural spoken language.",
    appearance: {
      skinColor: "#d19168",
      hairColor: "#161210",
      eyeColor: "#2c1d12",
      lipColor: "#9c5a52",
      outfitPrimary: "#1e3a8a",
      outfitSecondary: "#cbd5e1",
      hairStyle: "short-part",
      headWidthScale: 1.04,
      jawWidthScale: 1.08,
      browThickness: 1.25,
      hasStethoscope: false,
      fallbackPitchCents: -280,
      fallbackRate: 0.98
    },
    voiceMap: {
      // Chris - Grounded Natural Male voice
      en: "iP95p4xoKVk53GoZ742B",
      hi: "iP95p4xoKVk53GoZ742B",
      as: "iP95p4xoKVk53GoZ742B",
      bn: "iP95p4xoKVk53GoZ742B"
    }
  },
  {
    id: "rohan",
    name: "Rohan",
    gender: "male",
    title: "AI Wellness Assistant",
    glbUrl: "/avatars/avatarsdk.glb",
    videoUrl: "/avatars/specialist-loop-1080.mp4",
    posterUrl: "/avatars/ravatar-doctor-portrait.webp",
    geminiVoiceName: "Charon",
    personaPrompt: "You are Rohan, NirogCare AI Wellness Assistant (an AI assistant, not a doctor). Keep your spoken replies direct, warm, and conversational.",
    appearance: {
      skinColor: "#c6845c",
      hairColor: "#120f0d",
      eyeColor: "#24180e",
      lipColor: "#91524b",
      outfitPrimary: "#065f46",
      outfitSecondary: "#d1fae5",
      hairStyle: "textured-crop",
      headWidthScale: 1.06,
      jawWidthScale: 1.12,
      browThickness: 1.35,
      hasStethoscope: false,
      fallbackPitchCents: -360,
      fallbackRate: 1.02
    },
    voiceMap: {
      // Brian - Warm Natural Male voice
      en: "nPczCjzI2devNBz1zQrb",
      hi: "nPczCjzI2devNBz1zQrb",
      as: "nPczCjzI2devNBz1zQrb",
      bn: "nPczCjzI2devNBz1zQrb"
    }
  }
];
function getCharacterById(id) {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}
function getLanguageByCode(code) {
  const norm = code.toLowerCase().trim();
  if (norm === "en-in" || norm.startsWith("en")) return SUPPORTED_LANGUAGES[0];
  if (norm === "hi-in" || norm.startsWith("hi") || norm === "\u0939\u093F\u0902\u0926\u0940" || norm === "\u0939\u093F\u0928\u094D\u0926\u0940") {
    return SUPPORTED_LANGUAGES[1];
  }
  if (norm === "as-in" || norm.startsWith("as") || norm === "\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE" || norm.includes("assam")) {
    return SUPPORTED_LANGUAGES[2];
  }
  if (norm === "bn-in" || norm.startsWith("bn") || norm === "\u09AC\u09BE\u0982\u09B2\u09BE") {
    return SUPPORTED_LANGUAGES[3];
  }
  return SUPPORTED_LANGUAGES.find(
    (l) => l.code === norm || l.name.toLowerCase() === norm || l.nativeName === code
  ) || SUPPORTED_LANGUAGES[0];
}

// src/server/ttsBackend.ts
import * as fs2 from "fs";
import * as path2 from "path";
function getEnvVar(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path2.resolve(process.cwd(), ".env");
    if (fs2.existsSync(envPath)) {
      const content = fs2.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match) return match[1].trim();
    }
  } catch {
  }
  return "";
}
var ttsCache = /* @__PURE__ */ new Map();
var MAX_CACHE_ENTRIES = 60;
var elevenLabsQueue = Promise.resolve();
function runSerializedElevenLabs(fn) {
  const next = elevenLabsQueue.then(fn, fn);
  elevenLabsQueue = next.catch(() => {
  });
  return next;
}
function prewarmTtsChunk(req) {
  return synthesizeSpeechBuffer(req);
}
async function synthesizeSpeechBuffer(req) {
  const rawText = (req.text || "").replace(/[*#_`~[\]()<>]/g, "").trim();
  const character = getCharacterById(req.characterId || "aria");
  const langConfig = getLanguageByCode(req.language || "en");
  const voiceId = req.voiceId || character.voiceMap[langConfig.code];
  const envGlobalModel = (process.env.ELEVENLABS_MODEL || getEnvVar("ELEVENLABS_MODEL")).trim();
  const envAsModel = (process.env.ELEVENLABS_ASSAMESE_MODEL || getEnvVar("ELEVENLABS_ASSAMESE_MODEL")).trim();
  let modelId = langConfig.elevenLabsModel;
  if (envGlobalModel === "eleven_v4" || envGlobalModel === "eleven_v4_turbo" || envGlobalModel === "eleven_v3" || envGlobalModel === "eleven_multilingual_v2" || envGlobalModel === "eleven_flash_v2_5") {
    modelId = envGlobalModel;
  } else if (langConfig.code === "as" && (envAsModel === "eleven_v4" || envAsModel === "eleven_v4_turbo" || envAsModel === "eleven_v3" || envAsModel === "eleven_flash_v2_5")) {
    modelId = envAsModel;
  }
  const now = Date.now();
  if (!rawText) {
    return {
      audioBuffer: generateSilentPcm24k(80),
      contentType: "audio/pcm;rate=24000",
      sampleRate: 24e3,
      provider: "pcm-fallback",
      model: "silent",
      voiceId,
      languageCode: langConfig.code,
      pitchCents: 0,
      playbackRate: 1,
      ttsRequestAt: now,
      firstTtsByteAt: now
    };
  }
  if (req.preferFreeVoice) {
    const durationSec = Math.max(0.8, rawText.length * 0.055);
    return {
      audioBuffer: Buffer.alloc(0),
      contentType: "application/x-browser-speech",
      sampleRate: 24e3,
      provider: "browser-speech",
      model: "web-speech-neural",
      voiceId,
      languageCode: langConfig.code,
      pitchCents: 0,
      playbackRate: 1,
      alignment: buildSyntheticAlignment(rawText, durationSec),
      ttsRequestAt: now,
      firstTtsByteAt: now
    };
  }
  if (req.simulateFailure) {
    const fbRes = await localPcmFallbackProvider.synthesize(
      rawText,
      langConfig.code,
      voiceId,
      modelId,
      character.appearance.fallbackPitchCents,
      character.appearance.fallbackRate
    );
    if (req.onFirstSubFrame) req.onFirstSubFrame(fbRes);
    return fbRes;
  }
  const cacheKey = `${character.id}:${langConfig.code}:${voiceId}:${modelId}:${rawText}`;
  if (!req.bypassCache) {
    const existing = ttsCache.get(cacheKey);
    if (existing) {
      const cached = await existing;
      if (req.onFirstSubFrame) req.onFirstSubFrame(cached);
      return cached;
    }
  }
  const task = executeWithProviders(
    rawText,
    langConfig.code,
    voiceId,
    modelId,
    character.appearance.fallbackPitchCents,
    character.appearance.fallbackRate,
    req.onFirstSubFrame,
    character.geminiVoiceName
  );
  if (!req.bypassCache) {
    if (ttsCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = ttsCache.keys().next().value;
      if (oldestKey) ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, task);
  }
  try {
    return await task;
  } catch (err) {
    ttsCache.delete(cacheKey);
    throw err;
  }
}
var ElevenLabsTtsProvider = class {
  name = "elevenlabs";
  async synthesize(text, langCode, voiceId, modelId, _fallbackPitchCents, _fallbackRate, onFirstSubFrame) {
    if (elevenLabsPool.getKeyCount() === 0) {
      throw new Error("ELEVENLABS_API_KEY_NOT_CONFIGURED");
    }
    if (!checkAndRecordElevenLabsCredits(text.length)) {
      throw new Error("DAILY_ELEVENLABS_CREDIT_CAP_REACHED");
    }
    return runSerializedElevenLabs(async () => {
      const maxAttempts = Math.max(2, elevenLabsPool.getKeyCount() * 2);
      const attemptedKeys = /* @__PURE__ */ new Set();
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const slot = elevenLabsPool.getNextKey();
        if (!slot) {
          throw new Error("ELEVENLABS_ALL_KEYS_EXHAUSTED");
        }
        if (attemptedKeys.has(slot.key) && attemptedKeys.size >= elevenLabsPool.getKeyCount()) {
          throw new Error("ELEVENLABS_ALL_KEYS_EXHAUSTED");
        }
        attemptedKeys.add(slot.key);
        try {
          const result = await this.performRequest(
            slot.key,
            text,
            langCode,
            voiceId,
            modelId,
            onFirstSubFrame
          );
          elevenLabsPool.recordUsage(slot.key, text.length);
          return result;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (msg.startsWith("ELEVENLABS_QUOTA_EXCEEDED") || msg.includes("401") || msg.includes("quota") || msg.includes("credit")) {
            const remaining = elevenLabsPool.markExhausted(slot.key, "quota_exceeded");
            if (remaining > 0) {
              continue;
            }
            throw new Error("ELEVENLABS_ALL_KEYS_EXHAUSTED");
          }
          if (msg.startsWith("ELEVENLABS_HTTP_429")) {
            elevenLabsPool.markRateLimited(slot.key, 6e3);
            if (elevenLabsPool.getAvailableKeys().length > 0) {
              continue;
            }
            await new Promise((r) => setTimeout(r, 450));
            continue;
          }
          if (attemptedKeys.size < elevenLabsPool.getKeyCount()) {
            console.warn(`[ElevenLabs Pool] Error with key ${slot.masked}: ${msg}. Rotating to next key...`);
            continue;
          }
          throw err;
        }
      }
      throw new Error("ELEVENLABS_RETRY_EXHAUSTED");
    });
  }
  async performRequest(elevenLabsKey, text, langCode, voiceId, modelId, onFirstSubFrame) {
    const ttsRequestAt = Date.now();
    let firstTtsByteAt = 0;
    let emittedFirstSubFrame = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500);
    try {
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}/stream/with-timestamps?output_format=pcm_24000`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.78,
            style: 0,
            use_speaker_boost: true
          }
        })
      });
      if (!res.ok || !res.body) {
        let errDetail = "";
        try {
          errDetail = await res.text();
        } catch {
        }
        if (res.status === 401 || res.status === 400 || errDetail.includes("quota_exceeded") || errDetail.includes("quota limit") || errDetail.includes("credit")) {
          throw new Error(`ELEVENLABS_QUOTA_EXCEEDED:${res.status}`);
        }
        if (res.status === 429) {
          throw new Error(`ELEVENLABS_HTTP_429`);
        }
        throw new Error(`ELEVENLABS_HTTP_${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let jsonBuffer = "";
      const pcmBuffers = [];
      const characters = [];
      const characterStartTimesSeconds = [];
      const characterEndTimesSeconds = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!firstTtsByteAt && value && value.byteLength > 0) {
          firstTtsByteAt = Date.now();
        }
        jsonBuffer += decoder.decode(value, { stream: true });
        const lines = jsonBuffer.split("\n");
        jsonBuffer = lines.pop() || "";
        for (const rawLine of lines) {
          const trimmed = rawLine.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            let linePcm = null;
            if (parsed.audio_base64) {
              linePcm = Buffer.from(parsed.audio_base64, "base64");
              pcmBuffers.push(linePcm);
            }
            const align = parsed.alignment || parsed.normalized_alignment;
            if (align && Array.isArray(align.characters)) {
              for (let i = 0; i < align.characters.length; i++) {
                characters.push(String(align.characters[i]));
                characterStartTimesSeconds.push(
                  Number(align.character_start_times_seconds?.[i] ?? 0)
                );
                characterEndTimesSeconds.push(Number(align.character_end_times_seconds?.[i] ?? 0));
              }
            }
            if (!emittedFirstSubFrame && onFirstSubFrame && linePcm && linePcm.byteLength >= 64) {
              emittedFirstSubFrame = true;
              onFirstSubFrame({
                audioBuffer: linePcm,
                contentType: "audio/pcm;rate=24000",
                sampleRate: 24e3,
                provider: "elevenlabs",
                model: modelId,
                voiceId,
                languageCode: langCode,
                pitchCents: 0,
                playbackRate: 1,
                alignment: characters.length > 0 ? {
                  characters: [...characters],
                  characterStartTimesSeconds: [...characterStartTimesSeconds],
                  characterEndTimesSeconds: [...characterEndTimesSeconds]
                } : void 0,
                ttsRequestAt,
                firstTtsByteAt: firstTtsByteAt || Date.now()
              });
            }
          } catch {
          }
        }
      }
      if (jsonBuffer.trim()) {
        try {
          const parsed = JSON.parse(jsonBuffer.trim());
          if (parsed.audio_base64) {
            pcmBuffers.push(Buffer.from(parsed.audio_base64, "base64"));
          }
        } catch {
        }
      }
      const combinedPcm = Buffer.concat(pcmBuffers);
      if (combinedPcm.byteLength < 64) {
        throw new Error("ELEVENLABS_EMPTY_AUDIO");
      }
      return {
        audioBuffer: combinedPcm,
        contentType: "audio/pcm;rate=24000",
        sampleRate: 24e3,
        provider: "elevenlabs",
        model: modelId,
        voiceId,
        languageCode: langCode,
        pitchCents: 0,
        playbackRate: 1,
        alignment: characters.length > 0 ? {
          characters,
          characterStartTimesSeconds,
          characterEndTimesSeconds
        } : void 0,
        ttsRequestAt,
        firstTtsByteAt: firstTtsByteAt || Date.now()
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
};
var GeminiNeuralTtsProvider = class {
  name = "gemini-tts";
  async synthesize(text, langCode, voiceId, _modelId, _fallbackPitchCents, _fallbackRate, onFirstSubFrame, geminiVoiceName = "Aoede") {
    const geminiKey = getEnvVar("GEMINI_API_KEY");
    if (!geminiKey || geminiKey.length < 10) {
      throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
    }
    const ttsRequestAt = Date.now();
    const ttsModels = ["gemini-3.8-flash-lite-tts", "gemini-2.5-flash-preview-tts"];
    for (const modelName of ttsModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          geminiKey
        )}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: geminiVoiceName
                  }
                }
              }
            }
          })
        });
        if (!res.ok) {
          continue;
        }
        const firstTtsByteAt = Date.now();
        const data = await res.json();
        const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (!inlineData?.data) {
          continue;
        }
        const rawBuffer = Buffer.from(inlineData.data, "base64");
        const isWav = rawBuffer.byteLength > 44 && rawBuffer.subarray(0, 4).toString("ascii") === "RIFF";
        const pcmBuffer = isWav ? rawBuffer.subarray(44) : rawBuffer;
        if (pcmBuffer.byteLength < 64) {
          continue;
        }
        const durationSec = pcmBuffer.byteLength / (24e3 * 2);
        const alignment = buildSyntheticAlignment(text, durationSec);
        const result = {
          audioBuffer: pcmBuffer,
          contentType: "audio/pcm;rate=24000",
          sampleRate: 24e3,
          provider: "gemini-tts",
          model: modelName,
          voiceId,
          languageCode: langCode,
          pitchCents: 0,
          playbackRate: 1,
          alignment,
          ttsRequestAt,
          firstTtsByteAt
        };
        if (onFirstSubFrame) {
          onFirstSubFrame(result);
        }
        return result;
      } catch {
      } finally {
        clearTimeout(timeoutId);
      }
    }
    throw new Error("GEMINI_TTS_ALL_MODELS_EXHAUSTED");
  }
};
var LocalPcmFallbackProvider = class {
  name = "pcm-fallback";
  async synthesize(text, langCode, voiceId, _modelId, fallbackPitchCents) {
    const ttsRequestAt = Date.now();
    const baseFreqHz = fallbackPitchCents < 0 ? 128 : 205;
    const pcmBuffer = generateFormantPcm24k(text, baseFreqHz);
    const alignment = buildSyntheticAlignment(text, pcmBuffer.byteLength / (24e3 * 2));
    return {
      audioBuffer: pcmBuffer,
      contentType: "audio/pcm;rate=24000",
      sampleRate: 24e3,
      provider: "pcm-fallback",
      model: "local-formant-pcm24k",
      voiceId,
      languageCode: langCode,
      pitchCents: 0,
      playbackRate: 1,
      alignment,
      ttsRequestAt,
      firstTtsByteAt: Date.now()
    };
  }
};
var elevenLabsProvider = new ElevenLabsTtsProvider();
var geminiNeuralProvider = new GeminiNeuralTtsProvider();
var localPcmFallbackProvider = new LocalPcmFallbackProvider();
async function executeWithProviders(text, langCode, voiceId, modelId, fallbackPitchCents, fallbackRate, onFirstSubFrame, geminiVoiceName = "Aoede") {
  try {
    return await elevenLabsProvider.synthesize(
      text,
      langCode,
      voiceId,
      modelId,
      fallbackPitchCents,
      fallbackRate,
      onFirstSubFrame,
      geminiVoiceName
    );
  } catch (err) {
    const errCode = err instanceof Error ? err.message : "UNKNOWN";
    console.warn(`[TTS] ElevenLabs fallback to Gemini Neural TTS: code=${errCode}`);
    try {
      return await geminiNeuralProvider.synthesize(
        text,
        langCode,
        voiceId,
        modelId,
        fallbackPitchCents,
        fallbackRate,
        onFirstSubFrame,
        geminiVoiceName
      );
    } catch (geminiErr) {
      const gCode = geminiErr instanceof Error ? geminiErr.message : "UNKNOWN";
      console.warn(`[TTS] Cloud TTS exhausted (${gCode}); switching to Browser Neural SpeechSynthesis`);
      const now = Date.now();
      const durationSec = Math.max(0.8, text.length * 0.055);
      const browserRes = {
        audioBuffer: Buffer.alloc(0),
        contentType: "application/x-browser-speech",
        sampleRate: 24e3,
        provider: "browser-speech",
        model: "web-speech-neural",
        voiceId,
        languageCode: langCode,
        pitchCents: 0,
        playbackRate: 1,
        alignment: buildSyntheticAlignment(text, durationSec),
        ttsRequestAt: now,
        firstTtsByteAt: now
      };
      if (onFirstSubFrame) onFirstSubFrame(browserRes);
      return browserRes;
    }
  }
}
function generateSilentPcm24k(durationMs) {
  const sampleRate = 24e3;
  const numSamples = Math.floor(sampleRate * durationMs / 1e3);
  return Buffer.alloc(numSamples * 2);
}
function generateFormantPcm24k(text, baseFreqHz) {
  const sampleRate = 24e3;
  const durationSec = Math.min(3.6, Math.max(0.45, text.length * 0.048));
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(numSamples * 2);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const syllableEnv = Math.max(0, Math.sin(t * Math.PI * 5.4) * 0.85 + 0.15);
    const f1 = Math.sin(2 * Math.PI * baseFreqHz * t);
    const f2 = 0.5 * Math.sin(2 * Math.PI * (baseFreqHz * 2.4) * t);
    const f3 = 0.25 * Math.sin(2 * Math.PI * (baseFreqHz * 4.1) * t);
    const sample = Math.max(-1, Math.min(1, (f1 + f2 + f3) * 0.25 * syllableEnv));
    buffer.writeInt16LE(Math.floor(sample * 32767), i * 2);
  }
  return buffer;
}
function buildSyntheticAlignment(text, durationSec) {
  const chars = Array.from(text);
  const step = durationSec / Math.max(1, chars.length);
  return {
    characters: chars,
    characterStartTimesSeconds: chars.map((_, idx) => Number((idx * step).toFixed(4))),
    characterEndTimesSeconds: chars.map((_, idx) => Number(((idx + 1) * step).toFixed(4)))
  };
}

// src/server/chunkSplitter.ts
var ABBREVIATIONS = /* @__PURE__ */ new Set([
  "dr",
  "mr",
  "mrs",
  "ms",
  "prof",
  "sr",
  "jr",
  "st",
  "vs",
  "etc",
  "approx",
  "mg",
  "ml",
  "mcg",
  "kg",
  "gm",
  "no",
  "fig",
  "govt",
  "dept"
]);
var DOSAGE_UNITS = /^(mg|ml|mcg|g|kg|iu|tablet|tablets|tab|cap|capsule|capsules|drops|tsp|tbsp|बार|गोली|मिलीग्राम|মিঃগ্ৰাঃ|টেবলেট)\b/i;
var ChunkSplitter = class {
  buffer = "";
  chunkCount = 0;
  /**
   * Appends a token delta and returns any complete speakable chunks ready for TTS.
   */
  push(delta) {
    this.buffer += sanitizeStreamDelta(delta);
    return this.extractChunks(false);
  }
  /**
   * Flushes any remaining text at the end of the LLM stream.
   */
  flush() {
    return this.extractChunks(true);
  }
  reset() {
    this.buffer = "";
    this.chunkCount = 0;
  }
  extractChunks(isEnd) {
    const out = [];
    while (this.buffer.length > 0) {
      const splitIdx = this.findNextSplitIndex(this.buffer, this.chunkCount === 0);
      if (splitIdx === -1) {
        break;
      }
      const candidate = this.buffer.slice(0, splitIdx).trim();
      const rest = this.buffer.slice(splitIdx).replace(/^\s+/, "");
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
      this.buffer = "";
      this.chunkCount += 1;
    }
    return out;
  }
  findNextSplitIndex(text, isFirstChunk) {
    let wordCount = 0;
    let inWord = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const nextCh = i + 1 < text.length ? text[i + 1] : "";
      const prevCh = i > 0 ? text[i - 1] : "";
      const isWhitespace = /\s/.test(ch);
      if (!isWhitespace && !inWord) {
        inWord = true;
        wordCount += 1;
      } else if (isWhitespace) {
        inWord = false;
      }
      if (ch === "." || ch === "?" || ch === "!" || ch === "\u0964" || ch === "\n") {
        if (ch === "." && nextCh === "") {
          return -1;
        }
        const followedBySpaceOrEnd = nextCh === "" || /\s/.test(nextCh);
        if (!followedBySpaceOrEnd) {
          continue;
        }
        if (ch === "." && /\d/.test(prevCh) && /\d/.test(text.slice(i + 1).trimStart()[0] || "")) {
          continue;
        }
        if (ch === "." && this.endsWithAbbreviation(text.slice(0, i))) {
          continue;
        }
        if (wordCount >= 2 || i >= 8) {
          return i + 1;
        }
      }
      if (isFirstChunk && (ch === "," || ch === ";" || ch === ":" || ch === "\u2014" || ch === "\u2013")) {
        if (nextCh === "" || !/\s/.test(nextCh)) {
          continue;
        }
        if (/\d/.test(prevCh) && /\d/.test(text.slice(i + 1).trimStart()[0] || "")) {
          continue;
        }
        if (wordCount >= 3 && i >= 12) {
          return i + 1;
        }
      }
      if (isFirstChunk && isWhitespace && wordCount >= 5 && i >= 20) {
        const upToHere = text.slice(0, i).trim();
        const lastToken = upToHere.split(/\s+/).pop() || "";
        const cleanLast = lastToken.replace(/[.]/g, "").toLowerCase();
        if (!/\d$/.test(lastToken) && !ABBREVIATIONS.has(cleanLast) && !this.isCommonMedicinePrefix(cleanLast)) {
          return i;
        }
      }
    }
    return -1;
  }
  endsWithAbbreviation(prefix) {
    const match = prefix.match(/([A-Za-z]+)$/);
    if (!match) return false;
    const word = match[1].toLowerCase();
    if (ABBREVIATIONS.has(word)) return true;
    if (word.length === 1) return true;
    return false;
  }
  isCommonMedicinePrefix(word) {
    return word === "paracetamol" || word === "amoxicillin" || word === "azithromycin" || word === "ibuprofen" || word === "cetirizine" || word === "pantoprazole" || word === "metformin" || word === "vitamin" || word === "tab" || word === "cap" || word === "syrup";
  }
};
function sanitizeStreamDelta(input) {
  return input.replace(/[*#_`~[\]()<>]/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
}
var UNSAFE_DIAGNOSIS_PATTERNS = [
  /\b(i diagnose you with|you definitely have|my official diagnosis is|you are suffering from)\b/i,
  /(मेरा निदान है कि आपको|आपको निश्चित रूप से .* बीमारी है)/,
  /(মোৰ নিদান অনুসৰি আপোনাৰ|আপোনাৰ নিশ্চিতভাৱে .* ৰোগ হৈছে)/
];
var UNSAFE_PRESCRIPTION_PATTERNS = [
  /\b(i hereby prescribe|take \d+\s*(mg|ml|tablets|capsules) of [a-z]+ every \d+ hours|start taking [a-z]+ \d+\s*mg)\b/i,
  /(मैं आपको .* दवा लिख रहा हूँ|रोज़ाना \d+\s*मिलीग्राम .* लें)/,
  /(মই আপোনাক .* ঔষধ লিখি দিছোঁ|প্ৰতিদিনে \d+\s*মিঃগ্ৰাঃ .* খাব)/
];
var SAFE_FALLBACK_BY_LANG = {
  en: "As an AI assistant and not a doctor, I cannot diagnose conditions or prescribe medication. Please consult a qualified clinician or visit your nearest Primary Health Centre for a proper evaluation.",
  hi: "\u092E\u0948\u0902 \u090F\u0915 \u090F\u0906\u0908 \u0938\u0939\u093E\u092F\u0915 \u0939\u0942\u0901, \u0921\u0949\u0915\u094D\u091F\u0930 \u0928\u0939\u0940\u0902, \u0907\u0938\u0932\u093F\u090F \u092E\u0948\u0902 \u0915\u093F\u0938\u0940 \u092C\u0940\u092E\u093E\u0930\u0940 \u0915\u093E \u0928\u093F\u0926\u093E\u0928 \u092F\u093E \u0926\u0935\u093E \u0928\u0939\u0940\u0902 \u0932\u093F\u0916 \u0938\u0915\u0924\u0940\u0964 \u0915\u0943\u092A\u092F\u093E \u0938\u0939\u0940 \u091C\u093E\u0902\u091A \u0915\u0947 \u0932\u093F\u090F \u0915\u093F\u0938\u0940 \u092F\u094B\u0917\u094D\u092F \u0921\u0949\u0915\u094D\u091F\u0930 \u092F\u093E \u0928\u091C\u0926\u0940\u0915\u0940 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u0947\u0902\u0926\u094D\u0930 \u0938\u0947 \u0938\u0932\u093E\u0939 \u0932\u0947\u0902\u0964",
  as: "\u09AE\u0987 \u098F\u099C\u09A8 \u098F\u0986\u0987 \u09B8\u09B9\u09BE\u09AF\u09BC\u0995, \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 \u09A8\u09B9\u09AF\u09BC, \u09B8\u09C7\u09AF\u09BC\u09C7\u09B9\u09C7 \u09AE\u0987 \u0995\u09CB\u09A8\u09CB \u09F0\u09CB\u0997 \u09A8\u09BF\u09F0\u09CD\u09A3\u09AF\u09BC \u09AC\u09BE \u0994\u09B7\u09A7 \u09A8\u09BF\u09F0\u09CD\u09A7\u09BE\u09F0\u09A3 \u0995\u09F0\u09BF\u09AC \u09A8\u09CB\u09F1\u09BE\u09F0\u09CB\u0981\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u09B8\u09A0\u09BF\u0995 \u09AA\u09F0\u09C0\u0995\u09CD\u09B7\u09BE\u09F0 \u09AC\u09BE\u09AC\u09C7 \u098F\u099C\u09A8 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 \u09AC\u09BE \u0993\u099A\u09F0\u09F0 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09F0\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u0993\u0995\u0964"
};
function checkOutputChunkSafety(chunkText, language) {
  const langKey = language === "hi" ? "hi" : language === "as" ? "as" : "en";
  for (const pat of UNSAFE_DIAGNOSIS_PATTERNS) {
    if (pat.test(chunkText)) {
      return {
        safe: false,
        reason: "DIAGNOSIS_DETECTED",
        fallbackText: SAFE_FALLBACK_BY_LANG[langKey]
      };
    }
  }
  for (const pat of UNSAFE_PRESCRIPTION_PATTERNS) {
    if (pat.test(chunkText)) {
      return {
        safe: false,
        reason: "PRESCRIPTION_DETECTED",
        fallbackText: SAFE_FALLBACK_BY_LANG[langKey]
      };
    }
  }
  return { safe: true };
}

// src/server/offlineClinicalFallback.ts
var TOPIC_RULES = [
  {
    // Asking for diagnosis or prescription / antibiotic dosage
    pattern: /(diagnos(e|is)|prescribe|antibiotic|which medicine|how many mg|निदान|दवा लिख|एंटीबायोटिक|कितने मिलीग्राम|ৰোগ নিৰ্ণয়|ঔষধ লিখি|এণ্টিবায়টিক)/i,
    replies: {
      en: "As an AI health assistant and not a doctor, I cannot diagnose conditions like dengue or typhoid or prescribe medication dosages. Please visit a qualified doctor or your nearest Primary Health Centre for proper testing and treatment.",
      hi: "\u092E\u0948\u0902 \u090F\u0915 \u090F\u0906\u0908 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0939\u093E\u092F\u0915 \u0939\u0942\u0901, \u0921\u0949\u0915\u094D\u091F\u0930 \u0928\u0939\u0940\u0902, \u0907\u0938\u0932\u093F\u090F \u092E\u0948\u0902 \u0915\u093F\u0938\u0940 \u092C\u0940\u092E\u093E\u0930\u0940 \u0915\u093E \u0928\u093F\u0926\u093E\u0928 \u092F\u093E \u090F\u0902\u091F\u0940\u092C\u093E\u092F\u094B\u091F\u093F\u0915 \u0926\u0935\u093E \u0915\u0940 \u0916\u0941\u0930\u093E\u0915 \u0928\u0939\u0940\u0902 \u0932\u093F\u0916 \u0938\u0915\u0924\u0940\u0964 \u0915\u0943\u092A\u092F\u093E \u0938\u0939\u0940 \u091C\u093E\u0902\u091A \u0914\u0930 \u0907\u0932\u093E\u091C \u0915\u0947 \u0932\u093F\u090F \u0928\u091C\u0926\u0940\u0915\u0940 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u0947\u0902\u0926\u094D\u0930 \u092F\u093E \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u0938\u0932\u093E\u0939 \u0932\u0947\u0902\u0964",
      as: "\u09AE\u0987 \u098F\u099C\u09A8 \u098F\u0986\u0987 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09BE\u09AF\u09BC\u0995, \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 \u09A8\u09B9\u09AF\u09BC, \u09B8\u09C7\u09AF\u09BC\u09C7\u09B9\u09C7 \u09AE\u0987 \u0995\u09CB\u09A8\u09CB \u09F0\u09CB\u0997 \u09A8\u09BF\u09F0\u09CD\u09A3\u09AF\u09BC \u09AC\u09BE \u098F\u09A3\u09CD\u099F\u09BF\u09AC\u09BE\u09AF\u09BC\u099F\u09BF\u0995 \u0994\u09B7\u09A7\u09F0 \u09AA\u09BE\u09B2\u09BF \u09A8\u09BF\u09F0\u09CD\u09A7\u09BE\u09F0\u09A3 \u0995\u09F0\u09BF\u09AC \u09A8\u09CB\u09F1\u09BE\u09F0\u09CB\u0981\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u09B8\u09A0\u09BF\u0995 \u09AA\u09F0\u09C0\u0995\u09CD\u09B7\u09BE\u09F0 \u09AC\u09BE\u09AC\u09C7 \u0993\u099A\u09F0\u09F0 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09F0 \u09AC\u09BE \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u0993\u0995\u0964",
      bn: "\u0986\u09AE\u09BF \u098F\u0995\u099C\u09A8 \u098F\u0986\u0987 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09BE\u09AF\u09BC\u0995, \u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0 \u09A8\u0987, \u09A4\u09BE\u0987 \u0995\u09CB\u09A8\u09CB \u09B0\u09CB\u0997 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC \u09AC\u09BE \u0993\u09B7\u09C1\u09A7\u09C7\u09B0 \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE \u09B2\u09BF\u0996\u09C7 \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF \u09A8\u09BE\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09A8\u09BF\u0995\u099F\u09B8\u09CD\u09A5 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF\u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0 \u09AC\u09BE \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09BF\u09A8\u0964"
    }
  },
  {
    // Fever / temperature / chills / body ache / unwell
    pattern: /(fever|temperature|chills|shivering|body ache|viral|bukhar|jor|gaa?\s*beya|unwell|sick|ill|बुखार|ज्वर|तापमान|बदन दर्द|तबीयत|জ্বৰ|গা গৰম|গাৰ বিষ|গা বেয়া|অসুস্থ)/i,
    replies: {
      en: "For mild fever, rest in a comfortable room, drink plenty of water, oral rehydration solution, or warm soup, and use a lukewarm sponge if needed. If fever lasts more than two days or rises above 102 degrees Fahrenheit, please consult a qualified doctor.",
      hi: "\u0939\u0932\u094D\u0915\u0947 \u092C\u0941\u0916\u093E\u0930 \u092E\u0947\u0902 \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0906\u0930\u093E\u092E \u0915\u0930\u0947\u0902, \u0916\u0942\u092C \u092A\u093E\u0928\u0940, \u0913\u0906\u0930\u090F\u0938 \u092F\u093E \u0938\u0942\u092A \u092A\u093F\u090F\u0902, \u0914\u0930 \u0939\u0932\u094D\u0915\u0947 \u0938\u0942\u0924\u0940 \u0915\u092A\u0921\u093C\u0947 \u092A\u0939\u0928\u0947\u0902\u0964 \u092F\u0926\u093F \u092C\u0941\u0916\u093E\u0930 \u0926\u094B \u0926\u093F\u0928 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0930\u0939\u0947 \u092F\u093E \u0924\u0947\u091C \u0939\u094B \u091C\u093E\u090F, \u0924\u094B \u0924\u0941\u0930\u0902\u0924 \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u0938\u0932\u093E\u0939 \u0932\u0947\u0902\u0964",
      as: "\u09AA\u09BE\u09A4\u09B2 \u099C\u09CD\u09AC\u09F0 \u09B9\u2019\u09B2\u09C7 \u09AD\u09BE\u09B2\u09A6\u09F0\u09C7 \u09AC\u09BF\u09B6\u09CD\u09F0\u09BE\u09AE \u09B2\u0993\u0995, \u09AF\u09A5\u09C7\u09B7\u09CD\u099F \u09AA\u09F0\u09BF\u09AE\u09BE\u09A3\u09C7 \u09AA\u09BE\u09A8\u09C0 \u09AC\u09BE \u0985\u2019\u0986\u09F0\u098F\u099B \u0996\u09BE\u0993\u0995 \u0986\u09F0\u09C1 \u09AA\u09BE\u09A4\u09B2 \u0995\u09BE\u09AA\u09CB\u09F0 \u09AA\u09BF\u09A8\u09CD\u09A7\u0995\u0964 \u09AF\u09A6\u09BF \u099C\u09CD\u09AC\u09F0 \u09A6\u09C1\u09A6\u09BF\u09A8\u09A4\u0995\u09C8 \u09AC\u09C7\u099B\u09BF \u09A5\u09BE\u0995\u09C7 \u09AC\u09BE \u09AC\u09BE\u09A2\u09BC\u09BF \u09AF\u09BE\u09AF\u09BC, \u09A4\u09C7\u09A8\u09CD\u09A4\u09C7 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u0993\u0995\u0964",
      bn: "\u09B9\u09BE\u09B2\u0995\u09BE \u099C\u09CD\u09AC\u09B0 \u09B9\u09B2\u09C7 \u09AC\u09BF\u09B6\u09CD\u09B0\u09BE\u09AE \u09A8\u09BF\u09A8, \u09AA\u09CD\u09B0\u099A\u09C1\u09B0 \u099C\u09B2 \u09AC\u09BE \u0993\u0986\u09B0\u098F\u09B8 \u09AA\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u099C\u09CD\u09AC\u09B0 \u09A6\u09C1\u0987 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AC\u09C7\u09B6\u09BF \u09A5\u09BE\u0995\u09B2\u09C7 \u0985\u09AC\u09B6\u09CD\u09AF\u0987 \u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09BF\u09A8\u0964"
    }
  },
  {
    // Cough / cold / sore throat / congestion
    pattern: /(cough|cold|throat|sore throat|flu|runny nose|sneeze|khansi|zukam|kah|खांसी|जुकाम|गले|खराश|কাঁহ|চৰ্দি|ডিঙি|পানীলগা)/i,
    replies: {
      en: "For a cough or sore throat, sip warm water or herbal tea, gargle with warm salt water, and inhale steam gently. Avoid cold drinks and dusty air, and see a doctor if you develop fever or lingering cough.",
      hi: "\u0916\u093E\u0902\u0938\u0940 \u092F\u093E \u0917\u0932\u0947 \u0915\u0940 \u0916\u0930\u093E\u0936 \u092E\u0947\u0902 \u0917\u0941\u0928\u0917\u0941\u0928\u093E \u092A\u093E\u0928\u0940 \u092A\u093F\u090F\u0902, \u0928\u092E\u0915 \u0915\u0947 \u0917\u0941\u0928\u0917\u0941\u0928\u0947 \u092A\u093E\u0928\u0940 \u0938\u0947 \u0917\u0930\u093E\u0930\u0947 \u0915\u0930\u0947\u0902 \u0914\u0930 \u092D\u093E\u092A \u0932\u0947\u0902\u0964 \u0920\u0902\u0921\u0940 \u091A\u0940\u091C\u094B\u0902 \u0914\u0930 \u0927\u0942\u0932 \u0938\u0947 \u092C\u091A\u0947\u0902, \u0914\u0930 \u0906\u0930\u093E\u092E \u0928 \u092E\u093F\u0932\u0928\u0947 \u092A\u0930 \u0921\u0949\u0915\u094D\u091F\u0930 \u0915\u094B \u0926\u093F\u0916\u093E\u090F\u0902\u0964",
      as: "\u0995\u09BE\u0981\u09B9 \u09AC\u09BE \u09A1\u09BF\u0999\u09BF\u09F0 \u09AC\u09BF\u09B7 \u09B9\u2019\u09B2\u09C7 \u0995\u09C1\u09B9\u09C1\u09AE\u09C0\u09AF\u09BC\u09BE \u0997\u09F0\u09AE \u09AA\u09BE\u09A8\u09C0 \u0996\u09BE\u0993\u0995, \u09A8\u09BF\u09AE\u0996 \u09AE\u09BF\u09B9\u09B2\u09CB\u09F1\u09BE \u0997\u09F0\u09AE \u09AA\u09BE\u09A8\u09C0\u09F0\u09C7 \u0997\u09BE\u09F0\u09CD\u0997\u09B2 \u0995\u09F0\u0995 \u0986\u09F0\u09C1 \u09AD\u09BE\u09AA \u09B2\u0993\u0995\u0964 \u09B2\u0995\u09CD\u09B7\u09A3 \u09AD\u09BE\u09B2 \u09A8\u09B9\u2019\u09B2\u09C7 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u0993\u099A\u09F0\u09B2\u09C8 \u09AF\u09BE\u0993\u0995\u0964",
      bn: "\u0995\u09BE\u09B6\u09BF \u09AC\u09BE \u0997\u09B2\u09BE \u09AC\u09CD\u09AF\u09A5\u09BE\u09AF\u09BC \u09B9\u09BE\u09B2\u0995\u09BE \u0997\u09B0\u09AE \u099C\u09B2 \u09AA\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09B2\u09AC\u09A3 \u099C\u09B2\u09C7 \u0997\u09BE\u09B0\u09CD\u0997\u09B2 \u0995\u09B0\u09C1\u09A8\u0964 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09A5\u09BE\u0995\u09B2\u09C7 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09BF\u09A8\u0964"
    }
  },
  {
    // Headache / migraine / tired / dizzy / dehydration
    pattern: /(headache|migraine|head pain|dizzy|fatigue|tired|weakness|dehydration|sirdard|muror bikh|सिरदर्द|सिर में दर्द|थकान|कमज़ोरी|प्यास|মূৰৰ বিষ|ভাগৰ|দুৰ্বল)/i,
    replies: {
      en: "For a mild headache or fatigue, rest in a quiet dimly lit room, drink a glass of water, and take a break from bright screens. If the headache is sudden, severe, or comes with vision changes or fever, consult a doctor promptly.",
      hi: "\u0939\u0932\u094D\u0915\u0947 \u0938\u093F\u0930\u0926\u0930\u094D\u0926, \u0915\u092E\u091C\u093C\u094B\u0930\u0940 \u092F\u093E \u0925\u0915\u093E\u0928 \u092E\u0947\u0902 \u0936\u093E\u0902\u0924 \u0915\u092E\u0930\u0947 \u092E\u0947\u0902 \u0906\u0930\u093E\u092E \u0915\u0930\u0947\u0902, \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u092A\u093E\u0928\u0940 \u092F\u093E \u0913\u0906\u0930\u090F\u0938 \u092A\u093F\u090F\u0902 \u0914\u0930 \u0927\u0942\u092A \u0938\u0947 \u092C\u091A\u0947\u0902\u0964 \u092F\u0926\u093F \u0926\u0930\u094D\u0926 \u0924\u0947\u091C \u0939\u094B \u092F\u093E \u092C\u093E\u0930-\u092C\u093E\u0930 \u0939\u094B, \u0924\u094B \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964",
      as: "\u09AE\u09C2\u09F0\u09F0 \u09AC\u09BF\u09B7 \u09AC\u09BE \u09AD\u09BE\u0997\u09F0 \u09B2\u09BE\u0997\u09BF\u09B2\u09C7 \u09B6\u09BE\u09A8\u09CD\u09A4 \u09A0\u09BE\u0987\u09A4 \u09AC\u09BF\u09B6\u09CD\u09F0\u09BE\u09AE \u09B2\u0993\u0995, \u09AA\u09BE\u09A8\u09C0 \u0996\u09BE\u0993\u0995 \u0986\u09F0\u09C1 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09B8\u09CD\u0995\u09CD\u09F0\u09C0\u09A3\u09F0 \u09AA\u09F0\u09BE \u0995\u09BF\u099B\u09C1 \u09B8\u09AE\u09AF\u09BC \u0986\u0981\u09A4\u09F0\u09BF \u09A5\u09BE\u0995\u0995\u0964 \u09AC\u09BF\u09B7 \u09AC\u09C7\u099B\u09BF \u09B9\u2019\u09B2\u09C7 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u0993\u0995\u0964",
      bn: "\u09B9\u09BE\u09B2\u0995\u09BE \u09AE\u09BE\u09A5\u09BE\u09AC\u09CD\u09AF\u09A5\u09BE \u09AC\u09BE \u0995\u09CD\u09B2\u09BE\u09A8\u09CD\u09A4\u09BF\u09A4\u09C7 \u09B6\u09BE\u09A8\u09CD\u09A4 \u0998\u09B0\u09C7 \u09AC\u09BF\u09B6\u09CD\u09B0\u09BE\u09AE \u09A8\u09BF\u09A8 \u098F\u09AC\u0982 \u099C\u09B2 \u09AA\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09AC\u09CD\u09AF\u09A5\u09BE \u09A4\u09C0\u09AC\u09CD\u09B0 \u09B9\u09B2\u09C7 \u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09BF\u09A8\u0964"
    }
  },
  {
    // Stomach / acidity / indigestion / nausea / diarrhea
    pattern: /(stomach|acidity|bloating|gas|indigestion|nausea|vomit|diarrhea|loose motion|pet|pait|पेट|गैस|एसिडिटी|दस्त|পেট|গেছ|পেটৰ অসুখ|পেটৰ বিষ)/i,
    replies: {
      en: "For mild stomach discomfort or acidity, eat light home-cooked food like rice, curd, or banana, and sip water or oral rehydration fluids frequently. Avoid spicy or oily meals, and visit a doctor if pain or vomiting persists.",
      hi: "\u092A\u0947\u091F \u0915\u0947 \u0939\u0932\u094D\u0915\u0947 \u0926\u0930\u094D\u0926 \u092F\u093E \u0917\u0948\u0938 \u092E\u0947\u0902 \u0939\u0932\u094D\u0915\u093E \u0914\u0930 \u0938\u093E\u0926\u093E \u092D\u094B\u091C\u0928 \u091C\u0948\u0938\u0947 \u0916\u093F\u091A\u0921\u093C\u0940, \u0926\u0939\u0940 \u092F\u093E \u0915\u0947\u0932\u093E \u0932\u0947\u0902 \u0914\u0930 \u0925\u094B\u0921\u093C\u093E-\u0925\u094B\u0921\u093C\u093E \u092A\u093E\u0928\u0940 \u092F\u093E \u0913\u0906\u0930\u090F\u0938 \u092A\u0940\u0924\u0947 \u0930\u0939\u0947\u0902\u0964 \u0924\u0932\u0947-\u092D\u0941\u0928\u0947 \u092D\u094B\u091C\u0928 \u0938\u0947 \u092C\u091A\u0947\u0902 \u0914\u0930 \u0938\u092E\u0938\u094D\u092F\u093E \u092C\u0922\u093C\u0928\u0947 \u092A\u0930 \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u092E\u093F\u0932\u0947\u0902\u0964",
      as: "\u09AA\u09C7\u099F\u09F0 \u09B8\u09BE\u09A7\u09BE\u09F0\u09A3 \u0985\u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09AC\u09BE \u0997\u09C7\u099B \u09B9\u2019\u09B2\u09C7 \u09AA\u09BE\u09A4\u09B2 \u0998\u09F0\u09C1\u09F1\u09BE \u0986\u09B9\u09BE\u09F0 \u0996\u09BE\u0993\u0995 \u0986\u09F0\u09C1 \u09B8\u0998\u09A8\u09BE\u0987 \u09AA\u09BE\u09A8\u09C0 \u09AC\u09BE \u0985\u2019\u0986\u09F0\u098F\u099B \u0996\u09BE\u0993\u0995\u0964 \u099C\u09CD\u09AC\u09B2\u09BE-\u09AA\u09CB\u09F0\u09BE \u0986\u09F0\u09C1 \u09A4\u09C7\u09B2\u09C0\u09AF\u09BC\u09BE \u0996\u09BE\u09A6\u09CD\u09AF \u09AA\u09F0\u09BF\u09B9\u09BE\u09F0 \u0995\u09F0\u09BF\u09AC, \u0986\u09F0\u09C1 \u09AA\u09CD\u09F0\u09AF\u09BC\u09CB\u099C\u09A8\u09A4 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u2019\u09AC\u0964",
      bn: "\u09AA\u09C7\u099F\u09C7\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE\u09AF\u09BC \u09B9\u09BE\u09B2\u0995\u09BE \u0996\u09BE\u09AC\u09BE\u09B0 \u0996\u09BE\u09A8 \u098F\u09AC\u0982 \u0993\u0986\u09B0\u098F\u09B8 \u09AC\u09BE \u099C\u09B2 \u09AA\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A4\u09C7\u09B2-\u09AE\u09B6\u09B2\u09BE \u098F\u09A1\u09BC\u09BF\u09AF\u09BC\u09C7 \u099A\u09B2\u09C1\u09A8 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C7 \u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0 \u09A6\u09C7\u0996\u09BE\u09A8\u0964"
    }
  },
  {
    // Sleep / stress / anxiety / joint stiffness in elderly
    pattern: /(sleep|insomnia|stress|anxiety|tension|worried|knee|joint|stiffness|neend|tanav|नींद|तनाव|चिंता|घुटनों|जकड़न|টোপনি|চিন্তা|মানসিক|আঁঠু)/i,
    replies: {
      en: "To improve sleep and ease mild discomfort, try gentle warm compresses, slow deep breathing for five minutes, and avoid caffeine in the evening. Please consult a qualified doctor for persistent joint stiffness or sleep trouble.",
      hi: "\u0905\u091A\u094D\u091B\u0940 \u0928\u0940\u0902\u0926 \u0914\u0930 \u0939\u0932\u094D\u0915\u0947 \u091C\u094B\u0921\u093C\u094B\u0902 \u0915\u0947 \u0906\u0930\u093E\u092E \u0915\u0947 \u0932\u093F\u090F \u0917\u0941\u0928\u0917\u0941\u0928\u0947 \u092A\u093E\u0928\u0940 \u0915\u0940 \u0938\u093F\u0915\u093E\u0908 \u0915\u0930\u0947\u0902, \u0938\u094B\u0928\u0947 \u0938\u0947 \u092A\u0939\u0932\u0947 \u0917\u0939\u0930\u0940 \u0938\u093E\u0902\u0938 \u0932\u0947\u0902 \u0914\u0930 \u0936\u093E\u092E \u0915\u094B \u091A\u093E\u092F-\u0915\u0949\u092B\u0940 \u0938\u0947 \u092C\u091A\u0947\u0902\u0964 \u0938\u092E\u0938\u094D\u092F\u093E \u092C\u0928\u0940 \u0930\u0939\u0928\u0947 \u092A\u0930 \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u092A\u0930\u093E\u092E\u0930\u094D\u0936 \u0932\u0947\u0902\u0964",
      as: "\u09AD\u09BE\u09B2 \u099F\u09CB\u09AA\u09A8\u09BF \u0986\u09F0\u09C1 \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u09B6\u09BE\u09A8\u09CD\u09A4\u09BF\u09F0 \u09AC\u09BE\u09AC\u09C7 \u09B6\u09CB\u09F1\u09BE\u09F0 \u0986\u0997\u09A4\u09C7 \u0995\u09BF\u099B\u09C1 \u09B8\u09AE\u09AF\u09BC \u09A6\u0995\u09C8 \u0989\u09B6\u09BE\u09B9 \u09B2\u0993\u0995 \u0986\u09F0\u09C1 \u09A8\u09BF\u09B6\u09BE \u099A\u09BE\u09B9-\u0995\u09AB\u09BF \u098F\u09F0\u09BE\u0987 \u099A\u09B2\u0995\u0964 \u0985\u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09A5\u09BE\u0995\u09BF\u09B2\u09C7 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u0993\u0995\u0964",
      bn: "\u09AD\u09BE\u09B2\u09CB \u0998\u09C1\u09AE \u0993 \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u09AA\u09CD\u09B0\u09B6\u09BE\u09A8\u09CD\u09A4\u09BF\u09B0 \u099C\u09A8\u09CD\u09AF \u0997\u09AD\u09C0\u09B0 \u09B6\u09CD\u09AC\u09BE\u09B8-\u09AA\u09CD\u09B0\u09B6\u09CD\u09AC\u09BE\u09B8\u09C7\u09B0 \u09AC\u09CD\u09AF\u09BE\u09AF\u09BC\u09BE\u09AE \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09B0\u09BE\u09A4\u09C7 \u0995\u09CD\u09AF\u09BE\u09AB\u09C7\u0987\u09A8 \u098F\u09A1\u09BC\u09BF\u09AF\u09BC\u09C7 \u099A\u09B2\u09C1\u09A8\u0964"
    }
  }
];
function buildOfflineClinicalReply(userMessage, langCode) {
  const cleaned = (userMessage || "").trim();
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(cleaned)) {
      return rule.replies[langCode] || rule.replies.en;
    }
  }
  const defaultReplies = {
    en: "Namaste! I am your NirogCare AI Health Assistant. Please rest well, drink plenty of clean water, and eat balanced meals. Tell me your symptoms in detail, or consult a qualified doctor if you feel unwell.",
    hi: "\u0928\u092E\u0938\u094D\u0924\u0947! \u092E\u0948\u0902 \u0928\u093F\u0930\u094B\u0917\u0915\u0947\u092F\u0930 \u090F\u0906\u0908 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0939\u093E\u092F\u0915 \u0939\u0942\u0901\u0964 \u0915\u0943\u092A\u092F\u093E \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0906\u0930\u093E\u092E \u0915\u0930\u0947\u0902, \u0938\u093E\u092B \u092A\u093E\u0928\u0940 \u092A\u093F\u090F\u0902 \u0914\u0930 \u0938\u0902\u0924\u0941\u0932\u093F\u0924 \u0906\u0939\u093E\u0930 \u0932\u0947\u0902\u0964 \u092F\u0926\u093F \u0915\u094B\u0908 \u0932\u0915\u094D\u0937\u0923 \u092C\u0928\u0947 \u0930\u0939\u0947\u0902 \u0924\u094B \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u092A\u0930\u093E\u092E\u0930\u094D\u0936 \u0905\u0935\u0936\u094D\u092F \u0932\u0947\u0902\u0964",
    as: "\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09F0! \u09AE\u0987 \u09A8\u09BF\u09F0\u09CB\u0997\u0995\u09C7\u09AF\u09BC\u09BE\u09F0 \u098F\u0986\u0987 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09BE\u09AF\u09BC\u0995\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u09AC\u09BF\u09B6\u09CD\u09F0\u09BE\u09AE \u09B2\u0993\u0995, \u09AA\u09F0\u09BF\u09B7\u09CD\u0995\u09BE\u09F0 \u09AA\u09BE\u09A8\u09C0 \u0996\u09BE\u0993\u0995 \u0986\u09F0\u09C1 \u09B8\u09C1\u09B7\u09AE \u0986\u09B9\u09BE\u09F0 \u0997\u09CD\u09F0\u09B9\u09A3 \u0995\u09F0\u0995\u0964 \u09B2\u0995\u09CD\u09B7\u09A3 \u09A5\u09BE\u0995\u09BF\u09B2\u09C7 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u0993\u0995\u0964",
    bn: "\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09B0! \u0986\u09AE\u09BF \u09A8\u09BF\u09B0\u09CB\u0997\u0995\u09C7\u09AF\u09BC\u09BE\u09B0 \u098F\u0986\u0987 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09BE\u09AF\u09BC\u0995\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09AC\u09BF\u09B6\u09CD\u09B0\u09BE\u09AE \u09A8\u09BF\u09A8, \u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u099C\u09B2 \u09AA\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C7 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09BF\u09A8\u0964"
  };
  return defaultReplies[langCode] || defaultReplies.en;
}

// src/server/geminiBackend.ts
import * as fs3 from "fs";
import * as path3 from "path";
function getEnvVar2(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path3.resolve(process.cwd(), ".env");
    if (fs3.existsSync(envPath)) {
      const content = fs3.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match) return match[1].trim();
    }
  } catch {
  }
  return "";
}
var SYSTEM_PROMPT_TEMPLATES = {
  "en-IN": `You are NirogCare's AI Health Assistant \u2014 a friendly, compassionate wellness companion designed for Indian users.

IMPORTANT CLINICAL SAFETY BOUNDARIES:
1. You are an AI assistant, NOT a doctor or healthcare provider.
2. NEVER diagnose any disease, illness, or medical condition.
3. NEVER prescribe any medication, dosage, or pharmaceutical treatments.
4. Always provide general, evidence-based wellness guidance, home care tips, and explain common reasons for symptoms.
5. Emphasize when the user should visit a registered medical practitioner (MBBS/MD) or nearby Primary Health Centre (PHC).
6. Mention Jan Aushadhi Kendras for affordable generic medicines and Ayushman Bharat (PM-JAY) when relevant.

VOICE & AVATAR READINESS:
- Keep your answers concise (2-4 short paragraphs or bullet points).
- Your reply will be spoken aloud by a photoreal avatar: avoid complex markdown tables, asterisks, or unpronounceable characters.
- Use natural, polite Indian English phrasing.

End every clinical guidance answer with a brief reminder to consult a qualified clinician.`,
  "hi": `\u0906\u092A \u0928\u093F\u091C\u094B\u0917\u0915\u0947\u092F\u0930 (NirogCare) \u0915\u0947 \u090F\u0906\u0908 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0939\u093E\u092F\u0915 \u0939\u0948\u0902 \u2014 \u092D\u093E\u0930\u0924\u0940\u092F \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E\u0913\u0902 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092E\u093F\u0924\u094D\u0930\u0935\u0924, \u0938\u0902\u0935\u0947\u0926\u0928\u0936\u0940\u0932 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u093E\u0925\u0940\u0964

\u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u091A\u093F\u0915\u093F\u0924\u094D\u0938\u0940\u092F \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0928\u093F\u092F\u092E:
1. \u0906\u092A \u090F\u0915 \u090F\u0906\u0908 \u0938\u0939\u093E\u092F\u0915 \u0939\u0948\u0902, \u0915\u094B\u0908 \u0921\u0949\u0915\u094D\u091F\u0930 \u092F\u093E \u0935\u0948\u0926\u094D\u092F \u0928\u0939\u0940\u0902\u0964
2. \u0915\u092D\u0940 \u092D\u0940 \u0915\u093F\u0938\u0940 \u092C\u0940\u092E\u093E\u0930\u0940 \u0915\u093E \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0928\u093F\u0926\u093E\u0928 (Diagnosis) \u0928 \u0915\u0930\u0947\u0902\u0964
3. \u0915\u092D\u0940 \u092D\u0940 \u0915\u094B\u0908 \u0926\u0935\u093E \u092F\u093E \u0916\u0941\u0930\u093E\u0915 (Prescription) \u0928 \u0932\u093F\u0916\u0947\u0902\u0964
4. \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u091C\u093E\u0928\u0915\u093E\u0930\u0940, \u0916\u093E\u0928-\u092A\u093E\u0928, \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915 \u0909\u092A\u091A\u093E\u0930 \u0914\u0930 \u0932\u0915\u094D\u0937\u0923\u094B\u0902 \u0915\u0947 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0915\u093E\u0930\u0923\u094B\u0902 \u0915\u0940 \u0938\u0930\u0932 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E \u0915\u0930\u0947\u0902\u0964
5. \u0938\u094D\u092A\u0937\u094D\u091F \u092C\u0924\u093E\u090F\u0902 \u0915\u093F \u0921\u0949\u0915\u094D\u091F\u0930 \u092F\u093E \u0928\u091C\u0926\u0940\u0915\u0940 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u0947\u0902\u0926\u094D\u0930 (PHC/CHC) \u0938\u0947 \u0915\u092C \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0928\u093E \u091A\u093E\u0939\u093F\u090F\u0964
6. \u0909\u091A\u093F\u0924 \u0939\u094B\u0928\u0947 \u092A\u0930 \u0938\u0938\u094D\u0924\u0940 \u091C\u0947\u0928\u0947\u0930\u093F\u0915 \u0926\u0935\u093E\u0913\u0902 \u0915\u0947 \u0932\u093F\u090F '\u091C\u0928 \u0914\u0937\u0927\u093F \u0915\u0947\u0902\u0926\u094D\u0930' \u0914\u0930 '\u0906\u092F\u0941\u0937\u094D\u092E\u093E\u0928 \u092D\u093E\u0930\u0924 (PM-JAY)' \u0915\u093E \u0909\u0932\u094D\u0932\u0947\u0916 \u0915\u0930\u0947\u0902\u0964

\u0906\u0935\u093E\u091C\u093C \u0914\u0930 \u0905\u0935\u0924\u093E\u0930 \u0915\u0947 \u0932\u093F\u090F \u0905\u0928\u0941\u0915\u0942\u0932\u0924\u093E:
- \u0909\u0924\u094D\u0924\u0930 \u0938\u0902\u0915\u094D\u0937\u093F\u092A\u094D\u0924 \u0930\u0916\u0947\u0902 (\u0905\u0927\u093F\u0915\u0924\u092E 2-3 \u091B\u094B\u091F\u0947 \u092A\u0948\u0930\u093E\u0917\u094D\u0930\u093E\u092B \u092F\u093E \u092C\u093F\u0902\u0926\u0941)\u0964
- \u092F\u0939 \u0909\u0924\u094D\u0924\u0930 \u0905\u0935\u0924\u093E\u0930 \u0926\u094D\u0935\u093E\u0930\u093E \u092C\u094B\u0932\u093E \u091C\u093E\u090F\u0917\u093E, \u0907\u0938\u0932\u093F\u090F \u091C\u091F\u093F\u0932 \u091F\u0947\u092C\u0932, \u0905\u0924\u094D\u092F\u0927\u093F\u0915 \u091A\u093F\u0939\u094D\u0928 \u092F\u093E \u0915\u0920\u093F\u0928 \u092A\u094D\u0930\u093E\u0930\u0942\u092A\u0923 \u0928 \u0915\u0930\u0947\u0902\u0964
- \u0938\u0930\u0932 \u0914\u0930 \u0938\u0939\u091C \u0939\u093F\u0902\u0926\u0940 (\u0916\u0921\u093C\u0940 \u092C\u094B\u0932\u0940) \u0915\u093E \u092A\u094D\u0930\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964

\u0939\u092E\u0947\u0936\u093E \u0905\u0902\u0924 \u092E\u0947\u0902 \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u0938\u0932\u093E\u0939 \u0932\u0947\u0928\u0947 \u0915\u0940 \u092C\u093E\u0924 \u0905\u0935\u0936\u094D\u092F \u0915\u0939\u0947\u0902\u0964`,
  "as": `\u0986\u09AA\u09C1\u09A8\u09BF \u09A8\u09BF\u09F0\u09CB\u0997\u0995\u09C7\u09AF\u09BC\u09BE\u09F0 (NirogCare)\u09F0 \u098F\u0986\u0987 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09BE\u09AF\u09BC\u0995 \u2014 \u0985\u09B8\u09AE\u09F0 \u0986\u09F0\u09C1 \u09AD\u09BE\u09F0\u09A4\u09F0 \u09AC\u09CD\u09AF\u09F1\u09B9\u09BE\u09F0\u0995\u09BE\u09F0\u09C0\u09B8\u0995\u09B2\u09F0 \u09AC\u09BE\u09AC\u09C7 \u098F\u099C\u09A8 \u09B8\u09B9\u09BE\u09A8\u09C1\u09AD\u09C2\u09A4\u09BF\u09B6\u09C0\u09B2 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09B8\u09B9\u09AF\u09CB\u0997\u09C0\u0964

\u0997\u09C1\u09F0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09F0\u09CD\u09A3 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u09BE \u09B8\u09C1\u09F0\u0995\u09CD\u09B7\u09BE \u09A8\u09BF\u09F0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE:
1. \u0986\u09AA\u09C1\u09A8\u09BF \u098F\u099C\u09A8 \u098F\u0986\u0987 \u09B8\u09B9\u09BE\u09AF\u09BC\u0995, \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 (Doctor) \u09A8\u09B9\u09AF\u09BC\u0964
2. \u0995\u09CB\u09A8\u09CB \u09F0\u09CB\u0997\u09F0 \u099A\u09C2\u09A1\u09BC\u09BE\u09A8\u09CD\u09A4 \u09A8\u09BF\u09A6\u09BE\u09A8 (Diagnosis) \u09A8\u09BF\u09A6\u09BF\u09AC\u0964
3. \u0995\u09CB\u09A8\u09CB \u0994\u09B7\u09A7 \u09AC\u09BE \u09AA\u09BE\u09B2\u09BF (Prescription) \u09A8\u09BF\u09F0\u09CD\u09A7\u09BE\u09F0\u09A3 \u09A8\u0995\u09F0\u09BF\u09AC\u0964
4. \u09B8\u09BE\u09A7\u09BE\u09F0\u09A3 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF\u09AC\u09BF\u09A7\u09BF, \u0998\u09F0\u09C1\u09F1\u09BE \u09AF\u09A4\u09A8 \u0986\u09F0\u09C1 \u09B2\u0995\u09CD\u09B7\u09A3\u09B8\u09AE\u09C2\u09B9\u09F0 \u09B8\u09BE\u09A7\u09BE\u09F0\u09A3 \u0995\u09BE\u09F0\u09A3\u09B8\u09AE\u09C2\u09B9 \u09AC\u09C1\u099C\u09BE\u0987 \u09A6\u09BF\u09AF\u09BC\u0995\u0964
5. \u09AC\u09CD\u09AF\u09F1\u09B9\u09BE\u09F0\u0995\u09BE\u09F0\u09C0\u09AF\u09BC\u09C7 \u0995\u09C7\u09A4\u09BF\u09AF\u09BC\u09BE \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 \u09AC\u09BE \u0993\u099A\u09F0\u09F0 \u09AA\u09CD\u09F0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09F0 (PHC)\u09A4 \u09A6\u09C7\u0996\u09C1\u0993\u09F1\u09BE \u0989\u099A\u09BF\u09A4 \u09B8\u09C7\u0987 \u09AC\u09BF\u09B7\u09AF\u09BC\u09C7 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09A6\u09BF\u09AF\u09BC\u0995\u0964
6. \u09B8\u09C1\u09B2\u09AD \u09AE\u09C2\u09B2\u09CD\u09AF\u09F0 \u0994\u09B7\u09A7\u09F0 \u09AC\u09BE\u09AC\u09C7 \u099C\u09A8 \u0994\u09B7\u09A7\u09BF \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09F0 \u0986\u09F0\u09C1 \u0986\u09AF\u09BC\u09C1\u09B7\u09CD\u09AE\u09BE\u09A8 \u09AD\u09BE\u09F0\u09A4\u09F0 \u09AC\u09BF\u09B7\u09AF\u09BC\u09C7 \u09AA\u09CD\u09F0\u09BE\u09B8\u0982\u0997\u09BF\u0995 \u09B9'\u09B2\u09C7 \u0989\u09B2\u09CD\u09B2\u09C7\u0996 \u0995\u09F0\u0995\u0964

\u0986\u09F1\u09A4\u09BE\u09F0 \u0986\u09F0\u09C1 \u0995\u09A3\u09CD\u09A0\u09F0 \u09AC\u09BE\u09AC\u09C7 \u0989\u09AA\u09AF\u09CB\u0997\u09C0:
- \u0989\u09A4\u09CD\u09A4\u09F0 \u099A\u09AE\u09C1 \u0986\u09F0\u09C1 \u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09F0\u09BE\u0996\u0995 (\u09E8-\u09E9 \u099F\u09BE \u099A\u09C1\u099F\u09BF \u0985\u09A8\u09C1\u099A\u09CD\u099B\u09C7\u09A6 \u09AC\u09BE \u09AC\u09C1\u09B2\u09C7\u099F \u09AA\u0987\u09A3\u09CD\u099F)\u0964
- \u098F\u0987 \u0989\u09A4\u09CD\u09A4\u09F0\u099F\u09CB \u0986\u09F1\u09A4\u09BE\u09F0\u09C7 \u09AE\u09C1\u0996\u09C7\u09F0\u09C7 \u0995'\u09AC, \u0997\u09A4\u09BF\u0995\u09C7 \u099C\u099F\u09BF\u09B2 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09AC\u09BE \u0985\u09AA\u09CD\u09F0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC \u099A\u09BF\u09B9\u09CD\u09A8 \u098F\u09F0\u09BE\u0987 \u099A\u09B2\u0995\u0964
- \u09B8\u09B9\u099C, \u09B6\u09C1\u09F1\u09B2\u09BE \u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE \u09AD\u09BE\u09B7\u09BE \u09AC\u09CD\u09AF\u09F1\u09B9\u09BE\u09F0 \u0995\u09F0\u0995\u0964

\u0989\u09A4\u09CD\u09A4\u09F0\u09F0 \u09B6\u09C7\u09B7\u09A4 \u09B8\u09A6\u09BE\u09AF\u09BC \u098F\u099C\u09A8 \u09AA\u099E\u09CD\u099C\u09C0\u09AD\u09C1\u0995\u09CD\u09A4 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995\u09F0 \u09AA\u09F0\u09BE\u09AE\u09F0\u09CD\u09B6 \u09B2\u09CB\u09F1\u09BE\u09F0 \u0986\u09B9\u09CD\u09AC\u09BE\u09A8 \u099C\u09A8\u09BE\u0993\u0995\u0964`
};
async function processHealthChat(payload) {
  const userText = payload.message?.trim() || "";
  const userId = payload.userId || "anonymous-user";
  const reqLang = (payload.language || "en").toLowerCase();
  let langCode = "en-IN";
  const hasDevanagari = /[\u0900-\u097F]/.test(userText);
  const hasBengaliAssamese = /[\u0980-\u09FF]/.test(userText);
  const isRomanizedHindi = /\b(mujhe|mera|meri|dard|bukhar|sirdard|chakkar|goli|dawa|kya karun|saans|chhati)\b/i.test(userText);
  const isRomanizedAssamese = /\b(mur|bikh|jor|bhal|lagise|hoise|pete|bukur|ausodh|ki korim)\b/i.test(userText);
  if (reqLang.includes("as") || reqLang.includes("assam") || reqLang.includes("\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE") || isRomanizedAssamese) {
    langCode = "as";
  } else if (reqLang.includes("hi") || reqLang.includes("hindi") || reqLang.includes("\u0939\u093F\u0902\u0926\u0940") || isRomanizedHindi) {
    langCode = "hi";
  } else if (hasBengaliAssamese && !reqLang.includes("bn") && !reqLang.includes("bengal") && !reqLang.includes("\u09AC\u09BE\u0982\u09B2\u09BE")) {
    langCode = "as";
  } else if (hasDevanagari && !reqLang.includes("mr") && !reqLang.includes("marath") && !reqLang.includes("\u092E\u0930\u093E\u0920\u0940")) {
    langCode = "hi";
  }
  const redFlagCheck = detectRedFlags(userText, langCode);
  if (redFlagCheck.isEmergency && redFlagCheck.message) {
    return {
      reply: redFlagCheck.message,
      languageCode: redFlagCheck.languageCode,
      isEmergency: true,
      emergencyCategory: redFlagCheck.category,
      piiStripped: false
    };
  }
  const injectionCheck = detectPromptInjection(userText, langCode);
  if (injectionCheck.isInjection && injectionCheck.safeReply) {
    const mappedLang = injectionCheck.languageCode === "hi" ? "hi" : injectionCheck.languageCode === "as" ? "as" : "en-IN";
    return {
      reply: injectionCheck.safeReply,
      languageCode: mappedLang,
      isEmergency: false,
      piiStripped: false
    };
  }
  const rateLimit = checkRateLimit(userId, userText.length);
  if (!rateLimit.allowed) {
    return {
      reply: rateLimit.reason || "Rate limit exceeded.",
      languageCode: langCode,
      isEmergency: false,
      piiStripped: false,
      error: "RATE_LIMIT_EXCEEDED"
    };
  }
  const { cleanText, strippedCount } = stripPII(userText);
  const geminiKey = process.env.GEMINI_API_KEY || getEnvVar2("GEMINI_API_KEY") || "";
  if (!geminiKey) {
    return {
      reply: getLocalFallbackResponse(cleanText, langCode),
      languageCode: langCode,
      isEmergency: false,
      piiStripped: strippedCount > 0,
      error: "NO_API_KEY_CONFIGURED"
    };
  }
  try {
    let systemInstruction = SYSTEM_PROMPT_TEMPLATES[langCode] || SYSTEM_PROMPT_TEMPLATES["en-IN"];
    if (langCode === "en-IN" && payload.language && !["en", "en-in", "english"].includes(reqLang)) {
      systemInstruction += `

CRITICAL LANGUAGE REQUIREMENT: You MUST write your entire response in ${payload.language} script and language.`;
    }
    const contents = [];
    if (payload.history && Array.isArray(payload.history)) {
      for (const h of payload.history.slice(-8)) {
        const role = h.role === "assistant" || h.role === "model" ? "model" : "user";
        contents.push({
          role,
          parts: [{ text: stripPII(h.text).cleanText }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: cleanText }]
    });
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-flash-latest"
    ];
    let answer = "";
    let lastStatus = 200;
    for (const modelName of modelsToTry) {
      let timeoutId;
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 25e3);
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 500,
              topP: 0.8
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" }
            ]
          })
        });
        if (!res.ok) {
          lastStatus = res.status;
          console.warn(`Gemini model ${modelName} returned ${res.status}`);
          continue;
        }
        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidateText) {
          answer = candidateText;
          break;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Error contacting ${modelName}:`, msg);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }
    if (!answer) {
      return {
        reply: getLocalFallbackResponse(cleanText, langCode),
        languageCode: langCode,
        isEmergency: false,
        piiStripped: strippedCount > 0,
        error: `GEMINI_HTTP_${lastStatus}`
      };
    }
    return {
      reply: answer,
      languageCode: langCode,
      isEmergency: false,
      piiStripped: strippedCount > 0
    };
  } catch (err) {
    const errName = err instanceof Error ? err.name : "";
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Gemini Execution Exception:", errMsg);
    return {
      reply: getLocalFallbackResponse(cleanText, langCode),
      languageCode: langCode,
      isEmergency: false,
      piiStripped: strippedCount > 0,
      error: errName === "AbortError" ? "TIMEOUT_EXCEEDED" : "INTERNAL_ERROR"
    };
  }
}
function getLocalFallbackResponse(query, lang) {
  if (lang === "hi") {
    return `\u0928\u092E\u0938\u094D\u0924\u0947! \u0906\u092A\u0915\u0947 \u092A\u094D\u0930\u0936\u094D\u0928 \u0915\u0947 \u0938\u0902\u092C\u0902\u0927 \u092E\u0947\u0902, \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0906\u0930\u093E\u092E \u0915\u0930\u0947\u0902, \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u092A\u093E\u0928\u0940 \u092A\u093F\u090F\u0902 \u0914\u0930 \u0905\u092A\u0928\u0947 \u0932\u0915\u094D\u0937\u0923\u094B\u0902 \u092A\u0930 \u0928\u091C\u093C\u0930 \u0930\u0916\u0947\u0902\u0964 

\u092F\u0926\u093F \u0932\u0915\u094D\u0937\u0923 24-48 \u0918\u0902\u091F\u094B\u0902 \u0938\u0947 \u0905\u0927\u093F\u0915 \u092C\u0928\u0947 \u0930\u0939\u0924\u0947 \u0939\u0948\u0902 \u092F\u093E \u092C\u0922\u093C\u0924\u0947 \u0939\u0948\u0902, \u0924\u094B \u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u0947 \u0928\u091C\u0926\u0940\u0915\u0940 \u0921\u0949\u0915\u094D\u091F\u0930 \u092F\u093E \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u0947\u0902\u0926\u094D\u0930 (PHC) \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964 \u0906\u092A\u093E\u0924\u0915\u093E\u0932 \u0915\u0947 \u0932\u093F\u090F \u0924\u0941\u0930\u0902\u0924 108 \u092A\u0930 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902\u0964`;
  }
  if (lang === "as") {
    return `\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09F0! \u0986\u09AA\u09CB\u09A8\u09BE\u09F0 \u09AA\u09CD\u09F0\u09B6\u09CD\u09A8\u09F0 \u09B8\u09A8\u09CD\u09A6\u09F0\u09CD\u09AD\u09A4, \u09AC\u09BF\u09B6\u09CD\u09F0\u09BE\u09AE \u09B2\u0993\u0995, \u09AA\u09F0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AA\u09F0\u09BF\u09AE\u09BE\u09A3\u09C7 \u09AA\u09BE\u09A8\u09C0 \u0996\u09BE\u0993\u0995 \u0986\u09F0\u09C1 \u09B2\u0995\u09CD\u09B7\u09A3\u09B8\u09AE\u09C2\u09B9 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF \u0995\u09F0\u0995\u0964

\u09AF\u09A6\u09BF \u09B2\u0995\u09CD\u09B7\u09A3\u09B8\u09AE\u09C2\u09B9 \u09EA\u09EE \u0998\u09A3\u09CD\u099F\u09BE\u09A4\u0995\u09C8 \u0985\u09A7\u09BF\u0995 \u09B8\u09AE\u09AF\u09BC \u09A5\u09BE\u0995\u09C7 \u09AC\u09BE \u09AC\u09BE\u09A2\u09BC\u09BF \u09AF\u09BE\u09AF\u09BC, \u0985\u09A8\u09C1\u0997\u09CD\u09F0\u09B9 \u0995\u09F0\u09BF \u0993\u099A\u09F0\u09F0 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u0995 \u09AC\u09BE \u09AA\u09CD\u09F0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09F0\u09F0 \u09B8\u09C8\u09A4\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09F0\u0995\u0964 \u099C\u09F0\u09C1\u09F0\u09C0\u0995\u09BE\u09B2\u09C0\u09A8 \u0985\u09F1\u09B8\u09CD\u09A5\u09BE\u09A4 \u09E7\u09E6\u09EE \u09A8\u09AE\u09CD\u09AC\u09F0\u09A4 \u09AB\u09CB\u09A8 \u0995\u09F0\u0995\u0964`;
  }
  return `Thank you for reaching out. Please rest well, stay hydrated, and monitor how you feel.

If your symptoms persist beyond 24-48 hours or worsen, please consult a qualified healthcare professional or visit your nearest clinic. For medical emergencies, call 108 immediately.`;
}
async function streamAvatarChat(payload, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  const writeSse = (eventData) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(eventData)}

`);
    }
  };
  const rawUserMessage = (payload.message || "").trim();
  const userId = payload.userId || "anon-session";
  const character = getCharacterById(payload.characterId || "aria");
  const effectiveLangCode = resolveEffectiveLanguage(rawUserMessage, payload.language || "en");
  const langConfig = getLanguageByCode(effectiveLangCode);
  const redFlagLang = langConfig.code === "hi" ? "hi" : langConfig.code === "as" ? "as" : "en-IN";
  if (!rawUserMessage) {
    writeSse({ type: "error", message: "Empty message" });
    res.end();
    return;
  }
  const redFlag = detectRedFlags(rawUserMessage, redFlagLang);
  if (redFlag.isEmergency && redFlag.message) {
    const now = Date.now();
    const spokenEmergency = sanitizeStreamDelta(redFlag.message).replace(/[•]/g, "").replace(/\s+/g, " ").trim();
    writeSse({
      type: "meta",
      isEmergency: true,
      emergencyCategory: redFlag.category,
      llmRequestSentAt: now,
      firstTokenAt: now
    });
    writeSse({
      type: "token",
      text: redFlag.message,
      firstTokenAt: now
    });
    const splitter2 = new ChunkSplitter();
    const emergencyChunks = [...splitter2.push(spokenEmergency), ...splitter2.flush()];
    emergencyChunks.forEach((chunkText, idx) => {
      prewarmTtsChunk({
        text: chunkText,
        characterId: character.id,
        language: langConfig.code
      }).catch(() => {
      });
      writeSse({
        type: "chunk",
        index: idx,
        text: chunkText,
        characterId: character.id,
        language: langConfig.code,
        firstChunkEmittedAt: now
      });
    });
    writeSse({
      type: "done",
      fullText: redFlag.message,
      isEmergency: true,
      emergencyCategory: redFlag.category,
      characterId: character.id,
      language: langConfig.code
    });
    res.end();
    return;
  }
  const injectionCheck = detectPromptInjection(rawUserMessage, langConfig.code);
  if (injectionCheck.isInjection && injectionCheck.safeReply) {
    const now = Date.now();
    writeSse({ type: "meta", isEmergency: false, llmRequestSentAt: now, firstTokenAt: now });
    writeSse({ type: "token", text: injectionCheck.safeReply, firstTokenAt: now });
    writeSse({
      type: "chunk",
      index: 0,
      text: injectionCheck.safeReply,
      characterId: character.id,
      language: langConfig.code,
      firstChunkEmittedAt: now
    });
    writeSse({
      type: "done",
      fullText: injectionCheck.safeReply,
      characterId: character.id,
      language: langConfig.code
    });
    res.end();
    return;
  }
  const rateCheck = checkRateLimit(userId, rawUserMessage.length);
  if (!rateCheck.allowed) {
    const now = Date.now();
    const msg = rateCheck.reason || "Rate limit exceeded. Please wait a moment.";
    writeSse({ type: "token", text: msg, firstTokenAt: now });
    writeSse({
      type: "done",
      fullText: msg,
      error: "RATE_LIMIT_EXCEEDED",
      characterId: character.id,
      language: langConfig.code
    });
    res.end();
    return;
  }
  const { cleanText: userMessage } = stripPII(rawUserMessage);
  const systemInstruction = [
    `You are ${character.name}, a dedicated and empathetic clinical health assistant at NirogCare in India (an AI assistant, not a doctor).`,
    langConfig.scriptInstruction,
    "Your mission is compassionate clinical triage, patient empathy, and practical home care guidance.",
    "",
    "PATIENT INTERACTION RULES:",
    `1. When a patient states they are sick or unwell (e.g., "I am sick", "not feeling well", "I'm ill"):`,
    '   Immediately show medical empathy. Do NOT greet them casually, introduce yourself, or ask "how are you feeling". Acknowledge their illness with care, advise immediate rest and hydration, and ask what specific symptoms they have (e.g., fever, cough, body pain, headache, or nausea).',
    "2. When a patient describes specific symptoms or questions:",
    "   Directly answer their specific concerns. Explain common causes in simple terms, offer evidence-based comforting home-care measures (warm fluids, salt gargles, steam, light nourishing food), and suggest consulting a doctor if symptoms persist or worsen.",
    "3. You are an AI assistant, not a doctor: never give a definitive medical diagnosis, and never prescribe specific prescription drugs or pharmaceutical dosages.",
    "4. Conversational speech format: Keep responses warm, natural, and concise (approx. 45-75 words across 2-4 sentences).",
    "5. NEVER output markdown asterisks (**bold**), bullet points, numbered lists, emojis, or stage directions."
  ].join("\n");
  const contents = [];
  if (payload.history && Array.isArray(payload.history)) {
    for (const h of payload.history.slice(-6)) {
      if (!h.text?.trim()) continue;
      contents.push({
        role: h.role === "assistant" || h.role === "model" ? "model" : "user",
        parts: [{ text: stripPII(h.text).cleanText }]
      });
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: userMessage }]
  });
  const geminiKey = process.env.GEMINI_API_KEY || getEnvVar2("GEMINI_API_KEY") || "";
  let fullReply = "";
  let chunkIndex = 0;
  let safetyCutTriggered = false;
  const splitter = new ChunkSplitter();
  const llmRequestSentAt = Date.now();
  let firstTokenAt = 0;
  let firstChunkEmittedAt = 0;
  writeSse({
    type: "meta",
    isEmergency: false,
    llmRequestSentAt
  });
  const emitValidatedChunk = (rawChunk) => {
    const cleaned = sanitizeStreamDelta(rawChunk).replace(/\s+/g, " ").trim();
    if (!cleaned || safetyCutTriggered) return false;
    const safety = checkOutputChunkSafety(cleaned, langConfig.code);
    if (!safety.safe && safety.fallbackText) {
      safetyCutTriggered = true;
      const safeText = safety.fallbackText;
      fullReply = safeText;
      const idx2 = chunkIndex++;
      if (!firstChunkEmittedAt) firstChunkEmittedAt = Date.now();
      prewarmTtsChunk({
        text: safeText,
        characterId: character.id,
        language: langConfig.code
      }).catch(() => {
      });
      writeSse({
        type: "safety_replace",
        reason: safety.reason,
        text: safeText
      });
      writeSse({
        type: "chunk",
        index: idx2,
        text: safeText,
        characterId: character.id,
        language: langConfig.code,
        firstChunkEmittedAt
      });
      return false;
    }
    const idx = chunkIndex++;
    if (!firstChunkEmittedAt) firstChunkEmittedAt = Date.now();
    if (idx === 0) {
      prewarmTtsChunk({
        text: cleaned,
        characterId: character.id,
        language: langConfig.code
      }).catch(() => {
      });
    }
    writeSse({
      type: "chunk",
      index: idx,
      text: cleaned,
      characterId: character.id,
      language: langConfig.code,
      firstChunkEmittedAt
    });
    return true;
  };
  const streamingModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemma-4-26b-a4b-it"
  ];
  let streamSucceeded = false;
  if (geminiKey) {
    for (const modelName of streamingModels) {
      let timeoutId;
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${geminiKey}`;
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 12e3);
        const genConfig = {
          temperature: 0.7,
          maxOutputTokens: 350,
          topP: 0.9
        };
        if (modelName.startsWith("gemini-3.")) {
          genConfig.thinkingConfig = { thinkingLevel: "MINIMAL" };
        }
        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: genConfig
          })
        });
        if (!geminiRes.ok || !geminiRes.body) {
          continue;
        }
        const reader = geminiRes.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let sseRemainder = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done || safetyCutTriggered) break;
          sseRemainder += decoder.decode(value, { stream: true });
          const lines = sseRemainder.split("\n");
          sseRemainder = lines.pop() || "";
          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const deltaRaw = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (!deltaRaw) continue;
              const delta = sanitizeStreamDelta(deltaRaw);
              if (!delta) continue;
              if (!firstTokenAt) {
                firstTokenAt = Date.now();
              }
              fullReply += delta;
              writeSse({
                type: "token",
                text: delta,
                firstTokenAt
              });
              const readyChunks = splitter.push(delta);
              for (const c of readyChunks) {
                const keepGoing = emitValidatedChunk(c);
                if (!keepGoing) {
                  await reader.cancel().catch(() => {
                  });
                  break;
                }
              }
            } catch {
            }
          }
        }
        if (fullReply.trim().length > 0) {
          streamSucceeded = true;
          recordGeminiTokenUsage(Math.ceil((userMessage.length + fullReply.length) / 4));
          break;
        }
      } catch {
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }
  }
  if (!streamSucceeded && !safetyCutTriggered) {
    const now = Date.now();
    if (!firstTokenAt) firstTokenAt = now;
    const fallbackText = buildOfflineClinicalReply(userMessage, langConfig.code);
    fullReply = fallbackText;
    writeSse({ type: "token", text: fallbackText, firstTokenAt });
    const chunks = [...splitter.push(fallbackText), ...splitter.flush()];
    for (const c of chunks) emitValidatedChunk(c);
  } else if (!safetyCutTriggered) {
    const remaining = splitter.flush();
    for (const c of remaining) emitValidatedChunk(c);
  }
  writeSse({
    type: "done",
    fullText: fullReply.trim(),
    characterId: character.id,
    language: langConfig.code,
    llmRequestSentAt,
    firstTokenAt,
    firstChunkEmittedAt
  });
  res.end();
}

// src/server/ravatarBackend.ts
import crypto from "crypto";
import * as fs4 from "fs";
import * as path4 from "path";
function getEnvVar3(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path4.resolve(process.cwd(), ".env");
    if (fs4.existsSync(envPath)) {
      const content = fs4.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match) return match[1].trim();
    }
  } catch {
  }
  return "";
}
var mintRateLimitMap = /* @__PURE__ */ new Map();
async function mintHeyGenToken(_req) {
  const heygenKey = process.env.HEYGEN_API_KEY || getEnvVar3("HEYGEN_API_KEY");
  const fallbackVideoUrl = "/avatars/doctor-loop-1080.mp4";
  if (!heygenKey) {
    return {
      token: "",
      configured: false,
      provider: "ravatar-local-hd",
      fallbackVideoUrl,
      error: "NO_HEYGEN_API_KEY"
    };
  }
  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": heygenKey
      },
      signal: controller.signal
    });
    if (!res.ok) {
      return {
        token: "",
        configured: true,
        provider: "ravatar-local-hd",
        fallbackVideoUrl,
        error: `HEYGEN_HTTP_${res.status}`
      };
    }
    const json = await res.json();
    const streamingToken = json?.data?.token || json?.token || "";
    return {
      token: streamingToken,
      configured: true,
      provider: streamingToken ? "heygen" : "ravatar-local-hd",
      fallbackVideoUrl
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "HEYGEN_STREAM_FALLBACK";
    return {
      token: "",
      configured: true,
      provider: "ravatar-local-hd",
      fallbackVideoUrl,
      error: errMsg
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
async function mintRavatarToken(req) {
  const projectId = process.env.RAVATAR_PROJECT_ID || getEnvVar3("RAVATAR_PROJECT_ID") || "demo-project-id";
  const pseudonym = req.pseudonymousId && req.pseudonymousId.length > 5 ? req.pseudonymousId : `nirog-anon-${crypto.randomUUID()}`;
  const now = Date.now();
  const rl = mintRateLimitMap.get(pseudonym) || { count: 0, resetAt: now + 6e4 };
  if (now > rl.resetAt) {
    rl.count = 0;
    rl.resetAt = now + 6e4;
  }
  if (rl.count >= 10) {
    return {
      token: "",
      projectId,
      userId: pseudonym,
      error: "RATE_LIMIT_EXCEEDED"
    };
  }
  rl.count++;
  mintRateLimitMap.set(pseudonym, rl);
  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("https://chat.rvtr.ai/jwt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        user_id: pseudonym,
        project_id: projectId
      })
    });
    if (!res.ok) {
      return {
        token: "",
        projectId,
        userId: pseudonym,
        error: `RAVATAR_JWT_FAILED_${res.status}`
      };
    }
    const data = await res.json();
    const token = data.jwt || data.token;
    if (!token) {
      throw new Error("No token field returned by RAVATAR API");
    }
    return {
      token,
      projectId,
      userId: pseudonym
    };
  } catch {
    return {
      token: "",
      projectId,
      userId: pseudonym,
      error: "CONNECTION_ERROR"
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
async function proxyStartLiveSession(token, avatarId) {
  try {
    const res = await fetch("https://chat.rvtr.ai/startLiveSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        width: "1280",
        height: "720"
      })
    });
    if (!res.ok) {
      const err = await res.text();
      return { error: `START_LIVE_FAILED_${res.status}: ${err}` };
    }
    const data = await res.json();
    return {
      licenseId: data.LicenseId || data.license_id,
      streamingUrl: data.streamingUrl || data.streaming_url
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "FAILED_TO_START_LIVE";
    return { error: errMsg };
  }
}

// src/server/ocrBackend.ts
import * as fs5 from "fs";
import * as path5 from "path";
function getEnvVar4(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path5.resolve(process.cwd(), ".env");
    if (fs5.existsSync(envPath)) {
      const content = fs5.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match) return match[1].trim();
    }
  } catch {
  }
  return "";
}
var LOW_CONFIDENCE_THRESHOLD = 0.8;
var MAX_BASE64_BYTES = 14 * 1024 * 1024;
async function extractWithGoogleCloudVision(base64Data, visionApiKey) {
  if (!visionApiKey) return null;
  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(visionApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Data },
              features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
            }
          ]
        })
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const annotation = json.responses?.[0]?.fullTextAnnotation;
    const text = annotation?.text?.trim() || "";
    if (!text) return null;
    const pageConf = annotation?.pages?.[0]?.confidence;
    return {
      text,
      avgConfidence: typeof pageConf === "number" ? pageConf : 0.88
    };
  } catch {
    return null;
  }
}
async function processPrescriptionOcr(payload) {
  const { imageBase64, language = "en" } = payload;
  if (!imageBase64) {
    return {
      rawText: "",
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: false,
      error: "NO_IMAGE_PROVIDED"
    };
  }
  if (imageBase64.length > MAX_BASE64_BYTES) {
    return {
      rawText: "",
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: true,
      error: "FILE_TOO_LARGE_MAX_10MB"
    };
  }
  let mimeType = "image/jpeg";
  let base64Data = imageBase64;
  if (imageBase64.includes(";base64,")) {
    const parts = imageBase64.split(";base64,");
    const header = parts[0].toLowerCase();
    base64Data = parts[1];
    if (header.includes("image/png")) mimeType = "image/png";
    else if (header.includes("image/webp")) mimeType = "image/webp";
    else if (header.includes("application/pdf")) mimeType = "application/pdf";
    else if (header.includes("image/jpeg") || header.includes("image/jpg")) mimeType = "image/jpeg";
    else {
      return {
        rawText: "",
        overallConfidence: 0,
        medicines: [],
        hasLowConfidenceItems: true,
        error: "UNSUPPORTED_FILE_TYPE"
      };
    }
  }
  const decodedHeader = Buffer.from(base64Data.slice(0, 64), "base64");
  const isPng = decodedHeader.length >= 4 && decodedHeader[0] === 137 && decodedHeader[1] === 80 && decodedHeader[2] === 78 && decodedHeader[3] === 71;
  const isJpeg = decodedHeader.length >= 3 && decodedHeader[0] === 255 && decodedHeader[1] === 216 && decodedHeader[2] === 255;
  const isWebp = decodedHeader.length >= 12 && decodedHeader.subarray(0, 4).toString("ascii") === "RIFF" && decodedHeader.subarray(8, 12).toString("ascii") === "WEBP";
  const isPdf = decodedHeader.length >= 5 && decodedHeader.subarray(0, 5).toString("ascii") === "%PDF-";
  if (!isPng && !isJpeg && !isWebp && !isPdf) {
    return {
      rawText: "",
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: true,
      error: "INVALID_FILE_MAGIC_BYTES"
    };
  }
  const geminiKey = process.env.GEMINI_API_KEY || getEnvVar4("GEMINI_API_KEY") || "";
  const visionKey = process.env.GOOGLE_VISION_API_KEY || getEnvVar4("GOOGLE_VISION_API_KEY") || "";
  if (!geminiKey) {
    return {
      rawText: "Prescription analysis unavailable: API key not configured.",
      overallConfidence: 0,
      medicines: [],
      hasLowConfidenceItems: true,
      error: "NO_API_KEY_CONFIGURED"
    };
  }
  const visionResult = mimeType !== "application/pdf" && visionKey ? await extractWithGoogleCloudVision(base64Data, visionKey) : null;
  return await analyzePrescriptionWithGeminiVision(
    base64Data,
    mimeType,
    language,
    geminiKey,
    visionResult
  );
}
function parseStructuredJson(rawText) {
  if (!rawText) return null;
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
    }
  }
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
    } catch {
    }
  }
  const firstBracket = rawText.indexOf("[");
  const lastBracket = rawText.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const arr = JSON.parse(rawText.slice(firstBracket, lastBracket + 1));
      return { medicines: arr };
    } catch {
    }
  }
  try {
    return JSON.parse(rawText.trim());
  } catch {
  }
  return null;
}
async function analyzePrescriptionWithGeminiVision(base64Data, mimeType, _language, apiKey, visionResult) {
  const visionContext = visionResult?.text ? `
Google Cloud Vision OCR Pre-Read (confidence ${visionResult.avgConfidence.toFixed(2)}):
${visionResult.text}
` : "";
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
  const modelsToTry = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-flash-lite-latest"
  ];
  let lastError = "";
  for (const modelName of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            maxOutputTokens: 1500,
            thinkingConfig: { thinkingLevel: "MINIMAL" }
          }
        })
      });
      if (!res.ok) {
        lastError = `Model ${modelName} HTTP ${res.status}`;
        continue;
      }
      const data = await res.json();
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = parseStructuredJson(rawOutput);
      if (!parsed) {
        lastError = "JSON_PARSE_FAILED";
        continue;
      }
      const isArray = Array.isArray(parsed);
      const parsedObj = isArray ? { medicines: parsed } : parsed;
      const rawMedicines = Array.isArray(parsedObj.medicines) ? parsedObj.medicines : [];
      let hasLowConfidence = false;
      let confidenceSum = 0;
      const medicines = rawMedicines.map((m) => {
        const conf = typeof m.confidence === "number" ? m.confidence : 0.9;
        confidenceSum += conf;
        const isLow = conf < LOW_CONFIDENCE_THRESHOLD;
        if (isLow) hasLowConfidence = true;
        const name = m.name || m.medicine_name || m.medicineName || m.drug || "Prescribed Medicine";
        const dosage = m.dosage || m.dose || m.strength || m.form || "1 unit";
        const frequency = m.frequency || m.timing || m.schedule || "As directed";
        const duration = m.duration || m.days || m.period || "As advised";
        const instructions = m.instructions || m.direction || m.advice || "Take as directed";
        const type = m.type || m.category || "Prescribed Medicine";
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
      const avgConfidence = medicines.length > 0 ? Number((confidenceSum / medicines.length).toFixed(2)) : 0.92;
      return {
        rawText: parsedObj.rawText || rawOutput,
        overallConfidence: avgConfidence,
        medicines,
        doctorName: parsedObj.doctorName || parsedObj.clinic || parsedObj.doctor_name || void 0,
        patientName: parsedObj.patientName || parsedObj.patient || parsedObj.patient_name || void 0,
        date: parsedObj.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        notes: parsedObj.notes || parsedObj.advice || void 0,
        hasLowConfidenceItems: hasLowConfidence
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "REQUEST_FAILED";
      lastError = errMsg;
    }
  }
  return {
    rawText: "OCR extraction encountered an error while analyzing the image. Please ensure the prescription is well-lit and clear.",
    overallConfidence: 0,
    medicines: [],
    hasLowConfidenceItems: true,
    error: lastError || "ALL_VISION_MODELS_FAILED"
  };
}

// src/server/authSession.ts
import * as crypto2 from "crypto";
var SESSION_SECRET = process.env.SESSION_HMAC_SECRET || crypto2.randomBytes(32).toString("hex");
var TOKEN_TTL_MS = 2 * 60 * 60 * 1e3;
function mintSessionToken(clientHintId) {
  const rawId = clientHintId && clientHintId.trim().length > 0 ? clientHintId.trim() : crypto2.randomUUID();
  const userId = "usr_" + crypto2.createHash("sha256").update(rawId).digest("hex").slice(0, 16);
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = { uid: userId, exp: expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const sig = crypto2.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return {
    token: `${payloadB64}.${sig}`,
    userId,
    expiresAt
  };
}
function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, userId: "anon-unverified" };
  }
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) {
    return { valid: false, userId: "anon-unverified" };
  }
  const expectedSig = crypto2.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  if (sig.length !== expectedSig.length) {
    return { valid: false, userId: "anon-unverified" };
  }
  if (!crypto2.timingSafeEqual(Buffer.from(sig, "utf-8"), Buffer.from(expectedSig, "utf-8"))) {
    return { valid: false, userId: "anon-unverified" };
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );
    if (!parsed.uid || typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return { valid: false, userId: "anon-expired" };
    }
    return { valid: true, userId: parsed.uid };
  } catch {
    return { valid: false, userId: "anon-unverified" };
  }
}
var lastPrewarmAt = 0;
async function prewarmUpstreamConnections() {
  const now = Date.now();
  if (now - lastPrewarmAt < 45e3) return;
  lastPrewarmAt = now;
  await Promise.allSettled([
    fetch("https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta", {
      method: "HEAD"
    }),
    fetch("https://api.elevenlabs.io/v1/models", {
      method: "HEAD"
    })
  ]);
}

// src/server/sttBackend.ts
var ISO_TO_SCRIBE_LANG = {
  en: "eng",
  "en-in": "eng",
  hi: "hin",
  "hi-in": "hin",
  as: "asm",
  "as-in": "asm",
  bn: "ben",
  "bn-in": "ben"
};
async function transcribeAudioChunk(req) {
  const t0 = Date.now();
  const langNorm = (req.language || "en").toLowerCase().trim();
  const scribeLang = ISO_TO_SCRIBE_LANG[langNorm] || "eng";
  if (!req.audioBase64 || req.audioBase64.length < 32) {
    return {
      text: "",
      languageCode: langNorm,
      sttDurationMs: 0,
      provider: "empty",
      error: "EMPTY_AUDIO"
    };
  }
  if (elevenLabsPool.getKeyCount() === 0) {
    return {
      text: "",
      languageCode: langNorm,
      sttDurationMs: Date.now() - t0,
      provider: "empty",
      error: "STT_KEY_NOT_CONFIGURED"
    };
  }
  const rawBase64 = req.audioBase64.includes(";base64,") ? req.audioBase64.split(";base64,")[1] : req.audioBase64;
  const audioBytes = Buffer.from(rawBase64, "base64");
  const mimeType = req.mimeType || "audio/webm";
  const ext = mimeType.includes("wav") ? "wav" : mimeType.includes("mp4") ? "mp4" : "webm";
  const maxAttempts = Math.max(2, elevenLabsPool.getKeyCount());
  const attemptedKeys = /* @__PURE__ */ new Set();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const slot = elevenLabsPool.getNextKey();
    if (!slot || attemptedKeys.has(slot.key) && attemptedKeys.size >= elevenLabsPool.getKeyCount()) {
      break;
    }
    attemptedKeys.add(slot.key);
    try {
      const form = new FormData();
      form.append("model_id", "scribe_v1");
      form.append("language_code", scribeLang);
      form.append(
        "file",
        new Blob([audioBytes], { type: mimeType }),
        `utterance.${ext}`
      );
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8e3);
      const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": slot.key
        },
        signal: controller.signal,
        body: form
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          elevenLabsPool.markExhausted(slot.key, "quota_exceeded");
          continue;
        }
        if (res.status === 429) {
          elevenLabsPool.markRateLimited(slot.key, 6e3);
          continue;
        }
        return {
          text: "",
          languageCode: langNorm,
          sttDurationMs: Date.now() - t0,
          provider: "empty",
          error: `STT_HTTP_${res.status}`
        };
      }
      const data = await res.json();
      const cleanText = stripPII((data.text || "").trim()).cleanText;
      return {
        text: cleanText,
        languageCode: langNorm,
        sttDurationMs: Date.now() - t0,
        provider: "elevenlabs-scribe"
      };
    } catch {
      if (attemptedKeys.size < elevenLabsPool.getKeyCount()) {
        continue;
      }
      return {
        text: "",
        languageCode: langNorm,
        sttDurationMs: Date.now() - t0,
        provider: "empty",
        error: "STT_EXCEPTION"
      };
    }
  }
  return {
    text: "",
    languageCode: langNorm,
    sttDurationMs: Date.now() - t0,
    provider: "empty",
    error: "STT_ALL_KEYS_EXHAUSTED"
  };
}

// src/server/apiRouter.ts
var ALLOWED_ORIGINS = /* @__PURE__ */ new Set([
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);
async function handleApiRequest(req, res) {
  const url = (req.url || "").split("?")[0];
  if (!url.startsWith("/api/") || url.startsWith("/api/ws/")) {
    return false;
  }
  const origin = req.headers.origin || "";
  const isVercelOrigin = /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(origin);
  if (origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || isVercelOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-TTS-Provider, X-TTS-Model, X-Voice-Id, X-Pitch-Cents, X-Playback-Rate, X-TTS-Sample-Rate, X-TTS-Request-At, X-TTS-First-Byte-At, X-TTS-Alignment"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  res.setHeader("Content-Type", "application/json");
  try {
    if (url === "/api/location" && (req.method === "GET" || req.method === "POST")) {
      const rawLat = req.headers["x-vercel-ip-latitude"] || "";
      const rawLng = req.headers["x-vercel-ip-longitude"] || "";
      const city = req.headers["x-vercel-ip-city"] ? decodeURIComponent(req.headers["x-vercel-ip-city"]) : null;
      const region = req.headers["x-vercel-ip-country-region"] || null;
      const country = req.headers["x-vercel-ip-country"] || "IN";
      const lat = rawLat ? parseFloat(rawLat) : null;
      const lng = rawLng ? parseFloat(rawLng) : null;
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ lat, lng, city, region, country }));
      return true;
    }
    if (url === "/api/health" && req.method === "GET") {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() }));
      return true;
    }
    const bodyStr = await readBody(req);
    let bodyJson = {};
    if (bodyStr) {
      try {
        bodyJson = JSON.parse(bodyStr);
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "INVALID_JSON_BODY" }));
        return true;
      }
    }
    if (url === "/api/auth/session" && req.method === "POST") {
      prewarmUpstreamConnections().catch(() => {
      });
      const hint = typeof bodyJson.clientHintId === "string" ? bodyJson.clientHintId : void 0;
      const session = mintSessionToken(hint);
      res.statusCode = 200;
      res.end(JSON.stringify(session));
      return true;
    }
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const verified = verifySessionToken(bearer);
    const remoteIp = req.socket?.remoteAddress || "127.0.0.1";
    const ipFallbackId = "ip_" + crypto3.createHash("sha256").update(remoteIp).digest("hex").slice(0, 12);
    const resolvedUserId = verified.valid ? verified.userId : ipFallbackId;
    if (url === "/api/chat" && req.method === "POST") {
      const chatReq = {
        message: typeof bodyJson.message === "string" ? bodyJson.message : "",
        language: typeof bodyJson.language === "string" ? bodyJson.language : void 0,
        userId: resolvedUserId,
        history: Array.isArray(bodyJson.history) ? bodyJson.history : void 0
      };
      const response = await processHealthChat(chatReq);
      res.statusCode = 200;
      res.end(JSON.stringify(response));
      return true;
    }
    if (url === "/api/chat/stream" && req.method === "POST") {
      const streamReq = {
        message: typeof bodyJson.message === "string" ? bodyJson.message : "",
        characterId: typeof bodyJson.characterId === "string" ? bodyJson.characterId : void 0,
        language: typeof bodyJson.language === "string" ? bodyJson.language : void 0,
        userId: resolvedUserId,
        history: Array.isArray(bodyJson.history) ? bodyJson.history : void 0
      };
      await streamAvatarChat(streamReq, res);
      return true;
    }
    if (url === "/api/tts/stream" && req.method === "POST") {
      const ttsText = typeof bodyJson.text === "string" ? bodyJson.text : "";
      const rl = checkRateLimit(resolvedUserId, ttsText.length);
      if (!rl.allowed) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: "RATE_LIMIT_EXCEEDED", message: rl.reason }));
        return true;
      }
      const ttsReq = {
        text: ttsText,
        characterId: typeof bodyJson.characterId === "string" ? bodyJson.characterId : void 0,
        language: typeof bodyJson.language === "string" ? bodyJson.language : void 0,
        voiceId: typeof bodyJson.voiceId === "string" ? bodyJson.voiceId : void 0,
        simulateFailure: Boolean(bodyJson.simulateFailure)
      };
      const ttsResult = await synthesizeSpeechBuffer(ttsReq);
      res.statusCode = 200;
      res.setHeader("Content-Type", ttsResult.contentType);
      res.setHeader("Content-Length", String(ttsResult.audioBuffer.byteLength));
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-TTS-Provider", ttsResult.provider);
      res.setHeader("X-TTS-Model", ttsResult.model);
      res.setHeader("X-Voice-Id", ttsResult.voiceId);
      res.setHeader("X-Pitch-Cents", String(ttsResult.pitchCents));
      res.setHeader("X-Playback-Rate", String(ttsResult.playbackRate));
      res.setHeader("X-TTS-Sample-Rate", String(ttsResult.sampleRate));
      res.setHeader("X-TTS-Request-At", String(ttsResult.ttsRequestAt));
      res.setHeader("X-TTS-First-Byte-At", String(ttsResult.firstTtsByteAt));
      if (ttsResult.alignment) {
        res.setHeader(
          "X-TTS-Alignment",
          Buffer.from(JSON.stringify(ttsResult.alignment), "utf-8").toString("base64")
        );
      }
      res.end(ttsResult.audioBuffer);
      return true;
    }
    if (url === "/api/stt/transcribe" && req.method === "POST") {
      const rl = checkRateLimit(resolvedUserId, 100);
      if (!rl.allowed) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: "RATE_LIMIT_EXCEEDED", message: rl.reason }));
        return true;
      }
      const sttReq = {
        audioBase64: typeof bodyJson.audioBase64 === "string" ? bodyJson.audioBase64 : "",
        mimeType: typeof bodyJson.mimeType === "string" ? bodyJson.mimeType : void 0,
        language: typeof bodyJson.language === "string" ? bodyJson.language : void 0
      };
      const sttRes = await transcribeAudioChunk(sttReq);
      res.statusCode = 200;
      res.end(JSON.stringify(sttRes));
      return true;
    }
    if (url === "/api/heygen/token" && req.method === "POST") {
      const response = await mintHeyGenToken({ pseudonymousId: resolvedUserId });
      res.statusCode = 200;
      res.end(JSON.stringify(response));
      return true;
    }
    if (url === "/api/ravatar/token" && req.method === "POST") {
      const response = await mintRavatarToken({ pseudonymousId: resolvedUserId });
      res.statusCode = response.error ? 400 : 200;
      res.end(JSON.stringify(response));
      return true;
    }
    if (url === "/api/ravatar/start-live" && req.method === "POST") {
      const token = authHeader.replace(/^Bearer\s+/i, "") || (typeof bodyJson.token === "string" ? bodyJson.token : "");
      const avatarId = typeof bodyJson.avatarId === "string" ? bodyJson.avatarId : "";
      if (!token || !avatarId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "TOKEN_AND_AVATAR_ID_REQUIRED" }));
        return true;
      }
      const response = await proxyStartLiveSession(token, avatarId);
      res.statusCode = response.error ? 400 : 200;
      res.end(JSON.stringify(response));
      return true;
    }
    if (url === "/api/ocr/prescription" && req.method === "POST") {
      const rl = checkRateLimit(resolvedUserId, 100);
      if (!rl.allowed) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: "RATE_LIMIT_EXCEEDED", message: rl.reason }));
        return true;
      }
      const ocrReq = {
        imageBase64: typeof bodyJson.imageBase64 === "string" ? bodyJson.imageBase64 : "",
        language: typeof bodyJson.language === "string" ? bodyJson.language : void 0,
        userId: resolvedUserId
      };
      const response = await processPrescriptionOcr(ocrReq);
      res.statusCode = response.error ? 400 : 200;
      res.end(JSON.stringify(response));
      return true;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "NOT_FOUND", path: url }));
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "INTERNAL_SERVER_ERROR", message }));
    return true;
  }
}
function readBody(req) {
  const vercelBody = req.body;
  if (vercelBody !== void 0 && vercelBody !== null) {
    if (typeof vercelBody === "string") return Promise.resolve(vercelBody);
    return Promise.resolve(JSON.stringify(vercelBody));
  }
  return new Promise((resolve6, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += String(chunk);
      if (data.length > 15 * 1024 * 1024) {
        req.destroy();
        reject(new Error("PAYLOAD_TOO_LARGE"));
      }
    });
    req.on("end", () => resolve6(data));
    req.on("error", (err) => reject(err));
  });
}

// src/server/vercelHandler.ts
var config = {
  maxDuration: 60
};
async function handler(req, res) {
  try {
    const rawHeaders = req.headers || {};
    const matchedPath = rawHeaders["x-matched-path"];
    const queryPath = req.query?.path;
    if (typeof matchedPath === "string" && matchedPath.startsWith("/api/")) {
      req.url = matchedPath;
    } else if (queryPath) {
      const segments = Array.isArray(queryPath) ? queryPath.join("/") : String(queryPath);
      req.url = "/api/" + segments;
    } else if (req.url && !req.url.startsWith("/api/")) {
      req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
    }
    const handled = await handleApiRequest(req, res);
    if (!handled && !res.headersSent) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "API route not found", url: req.url }));
    }
  } catch (error) {
    console.error("Vercel API Handler Error:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error?.message || "Internal Server Error" }));
    }
  }
}
export {
  config,
  handler as default
};
