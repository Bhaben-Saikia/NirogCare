export type LanguageCode = 'en' | 'hi' | 'as' | 'ta' | 'te' | 'bn' | 'mr' | 'kn' | 'gu';

export interface Translations {
  // Common
  common: {
    backToHome: string;
    search: string;
    loading: string;
    noResults: string;
    refresh: string;
    close: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    viewMore: string;
    directions: string;
    openNow: string;
    closed: string;
    hoursNA: string;
    reviews: string;
    nearest: string;
    pharmaciesFound: string;
    explore: string;
  };
  
  // Header
  header: {
    home: string;
    services: string;
    nearbyStores: string;
    chat: string;
    chooseLanguage: string;
    aiChat: string;
  };
  
  // Hero Section
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    getStarted: string;
    aiHealthChat: string;
    freeSecure: string;
    aiAvailable: string;
    languages: string;
    emergency: string;
  };
  
  // Categories
  categories: {
    title: string;
    subtitle: string;
    exploreServices: string;
    male: {
      title: string;
      subtitle: string;
    };
    female: {
      title: string;
      subtitle: string;
    };
    baby: {
      title: string;
      subtitle: string;
    };
    mental: {
      title: string;
      subtitle: string;
    };
  };
  
  // Quick Tools
  quickTools: {
    title: string;
    subtitle: string;
    govtSchemes: string;
    govtSchemesSubtitle: string;
    healthTips: string;
    healthTipsSubtitle: string;
    reminders: string;
    remindersSubtitle: string;
    healthTools: string;
    healthToolsSubtitle: string;
  };
  
  // Prescription Scanner
  prescription: {
    title: string;
    subtitle: string;
    uploadBtn: string;
    scanBtn: string;
    analyzing: string;
    dragDrop: string;
    supportedFormats: string;
  };
  
  // Nearby Stores
  nearbyStores: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    enableLocation: string;
    locationRequired: string;
    noPharmacies: string;
    tryExpanding: string;
  };
  
  // Health Tips
  healthTips: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    tipsFound: string;
    noTipsFound: string;
    startChat: string;
  };
  
  // Govt Schemes
  govtSchemes: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    schemesAvailable: string;
    eligibility: string;
    benefits: string;
    learnMore: string;
  };
  
  // Reminders
  reminders: {
    title: string;
    subtitle: string;
    addReminder: string;
    medicineName: string;
    time: string;
    frequency: string;
    daily: string;
    weekly: string;
    noReminders: string;
    active: string;
    inactive: string;
  };
  
  // Health Tools
  healthTools: {
    title: string;
    subtitle: string;
    bmiCalculator: string;
    bmiSubtitle: string;
    heartRate: string;
    heartRateSubtitle: string;
    waterIntake: string;
    waterIntakeSubtitle: string;
    sleepTracker: string;
    sleepTrackerSubtitle: string;
    calculate: string;
    height: string;
    weight: string;
    age: string;
    yourBmi: string;
    underweight: string;
    normal: string;
    overweight: string;
    obese: string;
  };
  
  // Services
  services: {
    title: string;
    subtitle: string;
    allCategories: string;
    tips: string;
    schemes: string;
  };
  
  // Chat
  chat: {
    title: string;
    subtitle: string;
    placeholder: string;
    welcome: string;
    typing: string;
    send: string;
  };
  
  // Location Permission
  location: {
    title: string;
    subtitle: string;
    enableBtn: string;
    permissionDenied: string;
    unavailable: string;
    timeout: string;
  };
  
  // Emergency
  emergency: {
    title: string;
    callNow: string;
    ambulance: string;
  };
}

const en: Translations = {
  common: {
    backToHome: 'Back to Home',
    search: 'Search',
    loading: 'Loading...',
    noResults: 'No results found',
    refresh: 'Refresh',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    viewMore: 'View More',
    directions: 'Directions',
    openNow: 'Open Now',
    closed: 'Closed',
    hoursNA: 'Hours N/A',
    reviews: 'reviews',
    nearest: 'Nearest',
    pharmaciesFound: 'pharmacies found near you',
    explore: 'Explore',
  },
  header: {
    home: 'Home',
    services: 'Services',
    nearbyStores: 'Nearby Stores',
    chat: 'Chat',
    chooseLanguage: 'Choose Language',
    aiChat: 'AI Chat',
  },
  hero: {
    badge: 'Your AI-Powered Health Companion',
    title: 'Nirog Care',
    subtitle: 'AI-powered prescription scanning, personalized health guidance, and instant access to wellness resources — all in one place',
    getStarted: 'Get Started',
    aiHealthChat: 'AI Health Chat',
    freeSecure: 'Free & Secure',
    aiAvailable: 'AI Available',
    languages: 'Languages',
    emergency: 'Emergency - 108',
  },
  categories: {
    title: 'Choose Your Health Category',
    subtitle: 'Personalized health guidance tailored to your specific needs',
    exploreServices: 'Explore Services',
    male: {
      title: "Men's Health",
      subtitle: 'Comprehensive male wellness',
    },
    female: {
      title: "Women's Health",
      subtitle: 'Complete women care',
    },
    baby: {
      title: 'Baby Care',
      subtitle: "Your child's health partner",
    },
    mental: {
      title: 'Mental Health',
      subtitle: 'Mind & wellness support',
    },
  },
  quickTools: {
    title: 'Quick Access Tools',
    subtitle: 'Everything you need at your fingertips',
    govtSchemes: 'Govt Schemes',
    govtSchemesSubtitle: 'Free health benefits',
    healthTips: 'Health Tips',
    healthTipsSubtitle: 'Daily wellness advice',
    reminders: 'Reminders',
    remindersSubtitle: 'Medicine alerts',
    healthTools: 'Health Tools',
    healthToolsSubtitle: 'BMI & trackers',
  },
  prescription: {
    title: 'AI Prescription Scanner',
    subtitle: 'Upload your prescription for instant medicine details',
    uploadBtn: 'Upload Prescription',
    scanBtn: 'Scan Now',
    analyzing: 'Analyzing...',
    dragDrop: 'Drag & drop or click to upload',
    supportedFormats: 'Supports JPG, PNG, PDF',
  },
  nearbyStores: {
    title: 'Nearby Pharmacies',
    subtitle: 'Find medical stores around you in real-time',
    searchPlaceholder: 'Search pharmacies...',
    enableLocation: 'Enable Location',
    locationRequired: 'Location access is required to find pharmacies near you',
    noPharmacies: 'No pharmacies found',
    tryExpanding: 'Try expanding your search or refresh the results',
  },
  healthTips: {
    title: 'Health Tips',
    subtitle: 'Daily tips for a healthier lifestyle',
    searchPlaceholder: 'Search health tips...',
    tipsFound: 'health tips found',
    noTipsFound: 'No tips found matching your search',
    startChat: 'Start Health Chat',
  },
  govtSchemes: {
    title: 'Government Health Schemes',
    subtitle: 'Discover free health benefits available to you',
    searchPlaceholder: 'Search schemes...',
    schemesAvailable: 'schemes available',
    eligibility: 'Eligibility',
    benefits: 'Benefits',
    learnMore: 'Learn More',
  },
  reminders: {
    title: 'Medicine Reminders',
    subtitle: 'Never miss your medication',
    addReminder: 'Add Reminder',
    medicineName: 'Medicine Name',
    time: 'Time',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    noReminders: 'No reminders set',
    active: 'Active',
    inactive: 'Inactive',
  },
  healthTools: {
    title: 'Health Tools',
    subtitle: 'Track and calculate your health metrics',
    bmiCalculator: 'BMI Calculator',
    bmiSubtitle: 'Calculate your Body Mass Index',
    heartRate: 'Heart Rate',
    heartRateSubtitle: 'Monitor your heart rate',
    waterIntake: 'Water Intake',
    waterIntakeSubtitle: 'Track daily water consumption',
    sleepTracker: 'Sleep Tracker',
    sleepTrackerSubtitle: 'Monitor your sleep patterns',
    calculate: 'Calculate',
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    age: 'Age',
    yourBmi: 'Your BMI',
    underweight: 'Underweight',
    normal: 'Normal',
    overweight: 'Overweight',
    obese: 'Obese',
  },
  services: {
    title: 'Health Services',
    subtitle: 'Explore our comprehensive health services',
    allCategories: 'All Categories',
    tips: 'Tips',
    schemes: 'Related Schemes',
  },
  chat: {
    title: 'AI Health Assistant',
    subtitle: 'Ask me anything about health',
    placeholder: 'Type your health question...',
    welcome: 'Hello! I am your AI Health Assistant. How can I help you today?',
    typing: 'Typing...',
    send: 'Send',
  },
  location: {
    title: 'Enable Location Access',
    subtitle: 'We need your location to find nearby pharmacies',
    enableBtn: 'Enable Location',
    permissionDenied: 'Location permission denied. Please enable it in your browser settings.',
    unavailable: 'Location information is unavailable.',
    timeout: 'Location request timed out. Please try again.',
  },
  emergency: {
    title: 'Emergency',
    callNow: 'Call Now',
    ambulance: 'Ambulance',
  },
};

const hi: Translations = {
  common: {
    backToHome: 'होम पर वापस जाएं',
    search: 'खोजें',
    loading: 'लोड हो रहा है...',
    noResults: 'कोई परिणाम नहीं मिला',
    refresh: 'रिफ्रेश करें',
    close: 'बंद करें',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    add: 'जोड़ें',
    viewMore: 'और देखें',
    directions: 'दिशाएं',
    openNow: 'अभी खुला है',
    closed: 'बंद है',
    hoursNA: 'समय उपलब्ध नहीं',
    reviews: 'समीक्षाएं',
    nearest: 'निकटतम',
    pharmaciesFound: 'आपके पास फार्मेसी मिलीं',
    explore: 'जानें',
  },
  header: {
    home: 'होम',
    services: 'सेवाएं',
    nearbyStores: 'पास की दुकानें',
    chat: 'चैट',
    chooseLanguage: 'भाषा चुनें',
    aiChat: 'AI चैट',
  },
  hero: {
    badge: 'आपका AI-संचालित स्वास्थ्य साथी',
    title: 'निरोग केयर',
    subtitle: 'AI-संचालित प्रिस्क्रिप्शन स्कैनिंग, व्यक्तिगत स्वास्थ्य मार्गदर्शन, और वेलनेस संसाधनों तक त्वरित पहुंच — सब एक जगह',
    getStarted: 'शुरू करें',
    aiHealthChat: 'AI स्वास्थ्य चैट',
    freeSecure: 'मुफ्त और सुरक्षित',
    aiAvailable: 'AI उपलब्ध',
    languages: 'भाषाएं',
    emergency: 'आपातकाल - 108',
  },
  categories: {
    title: 'अपनी स्वास्थ्य श्रेणी चुनें',
    subtitle: 'आपकी विशिष्ट आवश्यकताओं के अनुरूप व्यक्तिगत स्वास्थ्य मार्गदर्शन',
    exploreServices: 'सेवाएं देखें',
    male: {
      title: 'पुरुष स्वास्थ्य',
      subtitle: 'पूर्ण पुरुष कल्याण',
    },
    female: {
      title: 'महिला स्वास्थ्य',
      subtitle: 'पूर्ण महिला देखभाल',
    },
    baby: {
      title: 'शिशु देखभाल',
      subtitle: 'आपके बच्चे का स्वास्थ्य साथी',
    },
    mental: {
      title: 'मानसिक स्वास्थ्य',
      subtitle: 'मन और कल्याण सहायता',
    },
  },
  quickTools: {
    title: 'त्वरित पहुंच उपकरण',
    subtitle: 'आपकी उंगलियों पर सब कुछ',
    govtSchemes: 'सरकारी योजनाएं',
    govtSchemesSubtitle: 'मुफ्त स्वास्थ्य लाभ',
    healthTips: 'स्वास्थ्य टिप्स',
    healthTipsSubtitle: 'दैनिक वेलनेस सलाह',
    reminders: 'रिमाइंडर',
    remindersSubtitle: 'दवा अलर्ट',
    healthTools: 'स्वास्थ्य उपकरण',
    healthToolsSubtitle: 'BMI और ट्रैकर्स',
  },
  prescription: {
    title: 'AI प्रिस्क्रिप्शन स्कैनर',
    subtitle: 'त्वरित दवा विवरण के लिए अपना प्रिस्क्रिप्शन अपलोड करें',
    uploadBtn: 'प्रिस्क्रिप्शन अपलोड करें',
    scanBtn: 'अभी स्कैन करें',
    analyzing: 'विश्लेषण हो रहा है...',
    dragDrop: 'अपलोड करने के लिए खींचें और छोड़ें या क्लिक करें',
    supportedFormats: 'JPG, PNG, PDF समर्थित',
  },
  nearbyStores: {
    title: 'पास की फार्मेसी',
    subtitle: 'वास्तविक समय में अपने आसपास मेडिकल स्टोर खोजें',
    searchPlaceholder: 'फार्मेसी खोजें...',
    enableLocation: 'लोकेशन सक्षम करें',
    locationRequired: 'पास की फार्मेसी खोजने के लिए लोकेशन एक्सेस आवश्यक है',
    noPharmacies: 'कोई फार्मेसी नहीं मिली',
    tryExpanding: 'अपनी खोज बढ़ाएं या परिणाम रिफ्रेश करें',
  },
  healthTips: {
    title: 'स्वास्थ्य टिप्स',
    subtitle: 'स्वस्थ जीवनशैली के लिए दैनिक टिप्स',
    searchPlaceholder: 'स्वास्थ्य टिप्स खोजें...',
    tipsFound: 'स्वास्थ्य टिप्स मिलीं',
    noTipsFound: 'आपकी खोज से मेल खाती कोई टिप्स नहीं मिलीं',
    startChat: 'स्वास्थ्य चैट शुरू करें',
  },
  govtSchemes: {
    title: 'सरकारी स्वास्थ्य योजनाएं',
    subtitle: 'आपके लिए उपलब्ध मुफ्त स्वास्थ्य लाभ खोजें',
    searchPlaceholder: 'योजनाएं खोजें...',
    schemesAvailable: 'योजनाएं उपलब्ध',
    eligibility: 'पात्रता',
    benefits: 'लाभ',
    learnMore: 'और जानें',
  },
  reminders: {
    title: 'दवा रिमाइंडर',
    subtitle: 'कभी अपनी दवा न भूलें',
    addReminder: 'रिमाइंडर जोड़ें',
    medicineName: 'दवा का नाम',
    time: 'समय',
    frequency: 'आवृत्ति',
    daily: 'दैनिक',
    weekly: 'साप्ताहिक',
    noReminders: 'कोई रिमाइंडर सेट नहीं',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
  },
  healthTools: {
    title: 'स्वास्थ्य उपकरण',
    subtitle: 'अपने स्वास्थ्य मेट्रिक्स ट्रैक और कैलकुलेट करें',
    bmiCalculator: 'BMI कैलकुलेटर',
    bmiSubtitle: 'अपना बॉडी मास इंडेक्स कैलकुलेट करें',
    heartRate: 'हृदय गति',
    heartRateSubtitle: 'अपनी हृदय गति मॉनिटर करें',
    waterIntake: 'पानी का सेवन',
    waterIntakeSubtitle: 'दैनिक पानी की खपत ट्रैक करें',
    sleepTracker: 'नींद ट्रैकर',
    sleepTrackerSubtitle: 'अपनी नींद पैटर्न मॉनिटर करें',
    calculate: 'कैलकुलेट करें',
    height: 'ऊंचाई (सेमी)',
    weight: 'वजन (किग्रा)',
    age: 'उम्र',
    yourBmi: 'आपका BMI',
    underweight: 'कम वजन',
    normal: 'सामान्य',
    overweight: 'अधिक वजन',
    obese: 'मोटापा',
  },
  services: {
    title: 'स्वास्थ्य सेवाएं',
    subtitle: 'हमारी व्यापक स्वास्थ्य सेवाएं देखें',
    allCategories: 'सभी श्रेणियां',
    tips: 'टिप्स',
    schemes: 'संबंधित योजनाएं',
  },
  chat: {
    title: 'AI स्वास्थ्य सहायक',
    subtitle: 'स्वास्थ्य के बारे में कुछ भी पूछें',
    placeholder: 'अपना स्वास्थ्य प्रश्न लिखें...',
    welcome: 'नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?',
    typing: 'टाइप हो रहा है...',
    send: 'भेजें',
  },
  location: {
    title: 'लोकेशन एक्सेस सक्षम करें',
    subtitle: 'पास की फार्मेसी खोजने के लिए हमें आपकी लोकेशन चाहिए',
    enableBtn: 'लोकेशन सक्षम करें',
    permissionDenied: 'लोकेशन अनुमति अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में इसे सक्षम करें।',
    unavailable: 'लोकेशन जानकारी उपलब्ध नहीं है।',
    timeout: 'लोकेशन अनुरोध का समय समाप्त। कृपया पुनः प्रयास करें।',
  },
  emergency: {
    title: 'आपातकाल',
    callNow: 'अभी कॉल करें',
    ambulance: 'एम्बुलेंस',
  },
};

const ta: Translations = {
  common: {
    backToHome: 'முகப்புக்குத் திரும்பு',
    search: 'தேடு',
    loading: 'ஏற்றுகிறது...',
    noResults: 'முடிவுகள் இல்லை',
    refresh: 'புதுப்பி',
    close: 'மூடு',
    save: 'சேமி',
    cancel: 'ரத்து',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    add: 'சேர்',
    viewMore: 'மேலும் காண்க',
    directions: 'வழிகள்',
    openNow: 'இப்போது திறந்துள்ளது',
    closed: 'மூடியது',
    hoursNA: 'நேரம் தெரியவில்லை',
    reviews: 'மதிப்புரைகள்',
    nearest: 'அருகில்',
    pharmaciesFound: 'மருந்தகங்கள் கண்டுபிடிக்கப்பட்டன',
    explore: 'ஆராய்க',
  },
  header: {
    home: 'முகப்பு',
    services: 'சேவைகள்',
    nearbyStores: 'அருகிலுள்ள கடைகள்',
    chat: 'அரட்டை',
    chooseLanguage: 'மொழியைத் தேர்ந்தெடு',
    aiChat: 'AI அரட்டை',
  },
  hero: {
    badge: 'உங்கள் AI-இயங்கும் சுகாதார துணை',
    title: 'நிரோக் கேர்',
    subtitle: 'AI-இயங்கும் மருந்துச்சீட்டு ஸ்கேன், தனிப்பயன் சுகாதார வழிகாட்டுதல், மற்றும் ஆரோக்கிய ஆதாரங்களுக்கு உடனடி அணுகல் — அனைத்தும் ஒரே இடத்தில்',
    getStarted: 'தொடங்கு',
    aiHealthChat: 'AI சுகாதார அரட்டை',
    freeSecure: 'இலவசம் & பாதுகாப்பானது',
    aiAvailable: 'AI கிடைக்கும்',
    languages: 'மொழிகள்',
    emergency: 'அவசரம் - 108',
  },
  categories: {
    title: 'உங்கள் சுகாதார வகையைத் தேர்ந்தெடுங்கள்',
    subtitle: 'உங்கள் குறிப்பிட்ட தேவைகளுக்கு ஏற்ற தனிப்பயன் சுகாதார வழிகாட்டுதல்',
    exploreServices: 'சேவைகளை ஆராய்க',
    male: {
      title: 'ஆண்கள் சுகாதாரம்',
      subtitle: 'முழுமையான ஆண் நலம்',
    },
    female: {
      title: 'பெண்கள் சுகாதாரம்',
      subtitle: 'முழுமையான பெண்கள் பராமரிப்பு',
    },
    baby: {
      title: 'குழந்தை பராமரிப்பு',
      subtitle: 'உங்கள் குழந்தையின் சுகாதார துணை',
    },
    mental: {
      title: 'மன சுகாதாரம்',
      subtitle: 'மனம் & நலம் ஆதரவு',
    },
  },
  quickTools: {
    title: 'விரைவு அணுகல் கருவிகள்',
    subtitle: 'உங்கள் விரல் நுனியில் அனைத்தும்',
    govtSchemes: 'அரசு திட்டங்கள்',
    govtSchemesSubtitle: 'இலவச சுகாதார பலன்கள்',
    healthTips: 'சுகாதார குறிப்புகள்',
    healthTipsSubtitle: 'தினசரி ஆரோக்கிய ஆலோசனை',
    reminders: 'நினைவூட்டல்கள்',
    remindersSubtitle: 'மருந்து அலர்ட்கள்',
    healthTools: 'சுகாதார கருவிகள்',
    healthToolsSubtitle: 'BMI & டிராக்கர்கள்',
  },
  prescription: {
    title: 'AI மருந்துச்சீட்டு ஸ்கேனர்',
    subtitle: 'உடனடி மருந்து விவரங்களுக்கு உங்கள் மருந்துச்சீட்டை பதிவேற்றுங்கள்',
    uploadBtn: 'மருந்துச்சீட்டை பதிவேற்று',
    scanBtn: 'இப்போது ஸ்கேன் செய்',
    analyzing: 'பகுப்பாய்வு செய்கிறது...',
    dragDrop: 'இழுத்து விடுங்கள் அல்லது பதிவேற்ற கிளிக் செய்யுங்கள்',
    supportedFormats: 'JPG, PNG, PDF ஆதரிக்கப்படுகிறது',
  },
  nearbyStores: {
    title: 'அருகிலுள்ள மருந்தகங்கள்',
    subtitle: 'நிகழ்நேரத்தில் உங்களைச் சுற்றி மருத்துவ கடைகளைக் கண்டறியுங்கள்',
    searchPlaceholder: 'மருந்தகங்களைத் தேடு...',
    enableLocation: 'இருப்பிடத்தை இயக்கு',
    locationRequired: 'அருகிலுள்ள மருந்தகங்களைக் கண்டறிய இருப்பிட அணுகல் தேவை',
    noPharmacies: 'மருந்தகங்கள் இல்லை',
    tryExpanding: 'உங்கள் தேடலை விரிவுபடுத்தவும் அல்லது முடிவுகளை புதுப்பிக்கவும்',
  },
  healthTips: {
    title: 'சுகாதார குறிப்புகள்',
    subtitle: 'ஆரோக்கியமான வாழ்க்கைக்கான தினசரி குறிப்புகள்',
    searchPlaceholder: 'சுகாதார குறிப்புகளைத் தேடு...',
    tipsFound: 'சுகாதார குறிப்புகள் கண்டுபிடிக்கப்பட்டன',
    noTipsFound: 'உங்கள் தேடலுக்கு பொருந்தும் குறிப்புகள் இல்லை',
    startChat: 'சுகாதார அரட்டையைத் தொடங்கு',
  },
  govtSchemes: {
    title: 'அரசு சுகாதார திட்டங்கள்',
    subtitle: 'உங்களுக்குக் கிடைக்கும் இலவச சுகாதார பலன்களைக் கண்டறியுங்கள்',
    searchPlaceholder: 'திட்டங்களைத் தேடு...',
    schemesAvailable: 'திட்டங்கள் கிடைக்கின்றன',
    eligibility: 'தகுதி',
    benefits: 'பலன்கள்',
    learnMore: 'மேலும் அறிக',
  },
  reminders: {
    title: 'மருந்து நினைவூட்டல்கள்',
    subtitle: 'உங்கள் மருந்தை ஒருபோதும் தவறவிடாதீர்கள்',
    addReminder: 'நினைவூட்டல் சேர்',
    medicineName: 'மருந்து பெயர்',
    time: 'நேரம்',
    frequency: 'அதிர்வெண்',
    daily: 'தினசரி',
    weekly: 'வாராந்திர',
    noReminders: 'நினைவூட்டல்கள் அமைக்கப்படவில்லை',
    active: 'செயலில்',
    inactive: 'செயலற்ற',
  },
  healthTools: {
    title: 'சுகாதார கருவிகள்',
    subtitle: 'உங்கள் சுகாதார அளவீடுகளை கண்காணித்து கணக்கிடுங்கள்',
    bmiCalculator: 'BMI கால்குலேட்டர்',
    bmiSubtitle: 'உங்கள் உடல் நிறை குறியீட்டைக் கணக்கிடுங்கள்',
    heartRate: 'இதய துடிப்பு',
    heartRateSubtitle: 'உங்கள் இதய துடிப்பைக் கண்காணிக்கவும்',
    waterIntake: 'நீர் உட்கொள்ளல்',
    waterIntakeSubtitle: 'தினசரி நீர் நுகர்வைக் கண்காணிக்கவும்',
    sleepTracker: 'தூக்க டிராக்கர்',
    sleepTrackerSubtitle: 'உங்கள் தூக்க முறைகளைக் கண்காணிக்கவும்',
    calculate: 'கணக்கிடு',
    height: 'உயரம் (செமீ)',
    weight: 'எடை (கிலோ)',
    age: 'வயது',
    yourBmi: 'உங்கள் BMI',
    underweight: 'எடை குறைவு',
    normal: 'சாதாரண',
    overweight: 'அதிக எடை',
    obese: 'உடல் பருமன்',
  },
  services: {
    title: 'சுகாதார சேவைகள்',
    subtitle: 'எங்கள் விரிவான சுகாதார சேவைகளை ஆராயுங்கள்',
    allCategories: 'அனைத்து வகைகள்',
    tips: 'குறிப்புகள்',
    schemes: 'தொடர்புடைய திட்டங்கள்',
  },
  chat: {
    title: 'AI சுகாதார உதவியாளர்',
    subtitle: 'சுகாதாரம் பற்றி எதையும் கேளுங்கள்',
    placeholder: 'உங்கள் சுகாதார கேள்வியை தட்டச்சு செய்யுங்கள்...',
    welcome: 'வணக்கம்! நான் உங்கள் AI சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    typing: 'தட்டச்சு செய்கிறது...',
    send: 'அனுப்பு',
  },
  location: {
    title: 'இருப்பிட அணுகலை இயக்கு',
    subtitle: 'அருகிலுள்ள மருந்தகங்களைக் கண்டறிய உங்கள் இருப்பிடம் தேவை',
    enableBtn: 'இருப்பிடத்தை இயக்கு',
    permissionDenied: 'இருப்பிட அனுமதி மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்புகளில் இயக்கவும்.',
    unavailable: 'இருப்பிட தகவல் கிடைக்கவில்லை.',
    timeout: 'இருப்பிட கோரிக்கை காலாவதியானது. மீண்டும் முயற்சிக்கவும்.',
  },
  emergency: {
    title: 'அவசரம்',
    callNow: 'இப்போது அழை',
    ambulance: 'ஆம்புலன்ஸ்',
  },
};

const te: Translations = {
  common: {
    backToHome: 'హోమ్‌కు తిరిగి వెళ్ళు',
    search: 'శోధించు',
    loading: 'లోడ్ అవుతోంది...',
    noResults: 'ఫలితాలు కనుగొనబడలేదు',
    refresh: 'రిఫ్రెష్',
    close: 'మూసివేయి',
    save: 'సేవ్ చేయి',
    cancel: 'రద్దు చేయి',
    delete: 'తొలగించు',
    edit: 'సవరించు',
    add: 'జోడించు',
    viewMore: 'మరింత చూడండి',
    directions: 'దిశలు',
    openNow: 'ఇప్పుడు తెరిచి ఉంది',
    closed: 'మూసివేయబడింది',
    hoursNA: 'సమయం తెలియదు',
    reviews: 'సమీక్షలు',
    nearest: 'సమీపంలో',
    pharmaciesFound: 'మీ సమీపంలో ఫార్మసీలు కనుగొనబడ్డాయి',
    explore: 'అన్వేషించు',
  },
  header: {
    home: 'హోమ్',
    services: 'సేవలు',
    nearbyStores: 'సమీప దుకాణాలు',
    chat: 'చాట్',
    chooseLanguage: 'భాష ఎంచుకోండి',
    aiChat: 'AI చాట్',
  },
  hero: {
    badge: 'మీ AI-ఆధారిత ఆరోగ్య సహచరుడు',
    title: 'నిరోగ్ కేర్',
    subtitle: 'AI-ఆధారిత ప్రిస్క్రిప్షన్ స్కానింగ్, వ్యక్తిగత ఆరోగ్య మార్గదర్శకత్వం, మరియు ఆరోగ్య వనరులకు తక్షణ ప్రాప్యత — అన్నీ ఒకే చోట',
    getStarted: 'ప్రారంభించండి',
    aiHealthChat: 'AI ఆరోగ్య చాట్',
    freeSecure: 'ఉచితం & సురక్షితం',
    aiAvailable: 'AI అందుబాటులో ఉంది',
    languages: 'భాషలు',
    emergency: 'ఎమర్జెన్సీ - 108',
  },
  categories: {
    title: 'మీ ఆరోగ్య వర్గాన్ని ఎంచుకోండి',
    subtitle: 'మీ నిర్దిష్ట అవసరాలకు అనుగుణంగా వ్యక్తిగత ఆరోగ్య మార్గదర్శకత్వం',
    exploreServices: 'సేవలను అన్వేషించండి',
    male: {
      title: 'పురుషుల ఆరోగ్యం',
      subtitle: 'సంపూర్ణ పురుష సంక్షేమం',
    },
    female: {
      title: 'మహిళల ఆరోగ్యం',
      subtitle: 'సంపూర్ణ మహిళా సంరక్షణ',
    },
    baby: {
      title: 'శిశు సంరక్షణ',
      subtitle: 'మీ బిడ్డ ఆరోగ్య భాగస్వామి',
    },
    mental: {
      title: 'మానసిక ఆరోగ్యం',
      subtitle: 'మనస్సు & సంక్షేమ మద్దతు',
    },
  },
  quickTools: {
    title: 'త్వరిత ప్రాప్యత సాధనాలు',
    subtitle: 'మీ వేలికొనల్లో అన్నీ',
    govtSchemes: 'ప్రభుత్వ పథకాలు',
    govtSchemesSubtitle: 'ఉచిత ఆరోగ్య ప్రయోజనాలు',
    healthTips: 'ఆరోగ్య చిట్కాలు',
    healthTipsSubtitle: 'రోజువారీ ఆరోగ్య సలహా',
    reminders: 'రిమైండర్లు',
    remindersSubtitle: 'మందుల అలర్ట్‌లు',
    healthTools: 'ఆరోగ్య సాధనాలు',
    healthToolsSubtitle: 'BMI & ట్రాకర్లు',
  },
  prescription: {
    title: 'AI ప్రిస్క్రిప్షన్ స్కానర్',
    subtitle: 'తక్షణ మందుల వివరాల కోసం మీ ప్రిస్క్రిప్షన్‌ను అప్‌లోడ్ చేయండి',
    uploadBtn: 'ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి',
    scanBtn: 'ఇప్పుడు స్కాన్ చేయండి',
    analyzing: 'విశ్లేషిస్తోంది...',
    dragDrop: 'లాగి వదలండి లేదా అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి',
    supportedFormats: 'JPG, PNG, PDF మద్దతు ఉంది',
  },
  nearbyStores: {
    title: 'సమీప ఫార్మసీలు',
    subtitle: 'మీ చుట్టూ ఉన్న మెడికల్ స్టోర్లను నిజ సమయంలో కనుగొనండి',
    searchPlaceholder: 'ఫార్మసీలను శోధించండి...',
    enableLocation: 'లొకేషన్ ఎనేబుల్ చేయండి',
    locationRequired: 'సమీప ఫార్మసీలను కనుగొనడానికి లొకేషన్ యాక్సెస్ అవసరం',
    noPharmacies: 'ఫార్మసీలు కనుగొనబడలేదు',
    tryExpanding: 'మీ శోధనను విస్తరించండి లేదా ఫలితాలను రిఫ్రెష్ చేయండి',
  },
  healthTips: {
    title: 'ఆరోగ్య చిట్కాలు',
    subtitle: 'ఆరోగ్యకరమైన జీవనశైలి కోసం రోజువారీ చిట్కాలు',
    searchPlaceholder: 'ఆరోగ్య చిట్కాలను శోధించండి...',
    tipsFound: 'ఆరోగ్య చిట్కాలు కనుగొనబడ్డాయి',
    noTipsFound: 'మీ శోధనకు సరిపోయే చిట్కాలు లేవు',
    startChat: 'ఆరోగ్య చాట్ ప్రారంభించండి',
  },
  govtSchemes: {
    title: 'ప్రభుత్వ ఆరోగ్య పథకాలు',
    subtitle: 'మీకు అందుబాటులో ఉన్న ఉచిత ఆరోగ్య ప్రయోజనాలను కనుగొనండి',
    searchPlaceholder: 'పథకాలను శోధించండి...',
    schemesAvailable: 'పథకాలు అందుబాటులో ఉన్నాయి',
    eligibility: 'అర్హత',
    benefits: 'ప్రయోజనాలు',
    learnMore: 'మరింత తెలుసుకోండి',
  },
  reminders: {
    title: 'మందుల రిమైండర్లు',
    subtitle: 'మీ మందులను ఎప్పుడూ మిస్ కావద్దు',
    addReminder: 'రిమైండర్ జోడించు',
    medicineName: 'మందు పేరు',
    time: 'సమయం',
    frequency: 'ఫ్రీక్వెన్సీ',
    daily: 'రోజువారీ',
    weekly: 'వారంవారీ',
    noReminders: 'రిమైండర్లు సెట్ చేయబడలేదు',
    active: 'యాక్టివ్',
    inactive: 'ఇన్‌యాక్టివ్',
  },
  healthTools: {
    title: 'ఆరోగ్య సాధనాలు',
    subtitle: 'మీ ఆరోగ్య కొలతలను ట్రాక్ చేసి లెక్కించండి',
    bmiCalculator: 'BMI కాలిక్యులేటర్',
    bmiSubtitle: 'మీ బాడీ మాస్ ఇండెక్స్‌ను లెక్కించండి',
    heartRate: 'హార్ట్ రేట్',
    heartRateSubtitle: 'మీ హార్ట్ రేట్‌ను మానిటర్ చేయండి',
    waterIntake: 'నీటి తీసుకోలు',
    waterIntakeSubtitle: 'రోజువారీ నీటి వినియోగాన్ని ట్రాక్ చేయండి',
    sleepTracker: 'నిద్ర ట్రాకర్',
    sleepTrackerSubtitle: 'మీ నిద్ర నమూనాలను మానిటర్ చేయండి',
    calculate: 'లెక్కించు',
    height: 'ఎత్తు (సెం.మీ)',
    weight: 'బరువు (కిలో)',
    age: 'వయస్సు',
    yourBmi: 'మీ BMI',
    underweight: 'తక్కువ బరువు',
    normal: 'సాధారణ',
    overweight: 'అధిక బరువు',
    obese: 'ఊబకాయం',
  },
  services: {
    title: 'ఆరోగ్య సేవలు',
    subtitle: 'మా సమగ్ర ఆరోగ్య సేవలను అన్వేషించండి',
    allCategories: 'అన్ని వర్గాలు',
    tips: 'చిట్కాలు',
    schemes: 'సంబంధిత పథకాలు',
  },
  chat: {
    title: 'AI ఆరోగ్య సహాయకుడు',
    subtitle: 'ఆరోగ్యం గురించి ఏదైనా అడగండి',
    placeholder: 'మీ ఆరోగ్య ప్రశ్నను టైప్ చేయండి...',
    welcome: 'నమస్కారం! నేను మీ AI ఆరోగ్య సహాయకుడిని. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?',
    typing: 'టైప్ చేస్తోంది...',
    send: 'పంపు',
  },
  location: {
    title: 'లొకేషన్ యాక్సెస్ ఎనేబుల్ చేయండి',
    subtitle: 'సమీప ఫార్మసీలను కనుగొనడానికి మీ లొకేషన్ అవసరం',
    enableBtn: 'లొకేషన్ ఎనేబుల్ చేయండి',
    permissionDenied: 'లొకేషన్ అనుమతి నిరాకరించబడింది. దయచేసి మీ బ్రౌజర్ సెట్టింగ్‌లలో ఎనేబుల్ చేయండి.',
    unavailable: 'లొకేషన్ సమాచారం అందుబాటులో లేదు.',
    timeout: 'లొకేషన్ అభ్యర్థన సమయం ముగిసింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
  },
  emergency: {
    title: 'ఎమర్జెన్సీ',
    callNow: 'ఇప్పుడు కాల్ చేయండి',
    ambulance: 'అంబులెన్స్',
  },
};

const bn: Translations = {
  common: {
    backToHome: 'হোমে ফিরে যান',
    search: 'খুঁজুন',
    loading: 'লোড হচ্ছে...',
    noResults: 'কোনো ফলাফল পাওয়া যায়নি',
    refresh: 'রিফ্রেশ করুন',
    close: 'বন্ধ করুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    delete: 'মুছে ফেলুন',
    edit: 'সম্পাদনা করুন',
    add: 'যোগ করুন',
    viewMore: 'আরও দেখুন',
    directions: 'দিকনির্দেশ',
    openNow: 'এখন খোলা',
    closed: 'বন্ধ',
    hoursNA: 'সময় পাওয়া যায়নি',
    reviews: 'রিভিউ',
    nearest: 'নিকটতম',
    pharmaciesFound: 'ফার্মেসি পাওয়া গেছে',
    explore: 'অন্বেষণ করুন',
  },
  header: {
    home: 'হোম',
    services: 'সেবা',
    nearbyStores: 'কাছের দোকান',
    chat: 'চ্যাট',
    chooseLanguage: 'ভাষা নির্বাচন করুন',
    aiChat: 'AI চ্যাট',
  },
  hero: {
    badge: 'আপনার AI-চালিত স্বাস্থ্য সঙ্গী',
    title: 'নিরোগ কেয়ার',
    subtitle: 'AI-চালিত প্রেসক্রিপশন স্ক্যানিং, ব্যক্তিগত স্বাস্থ্য নির্দেশনা, এবং সুস্থতা সংস্থানগুলিতে তাৎক্ষণিক অ্যাক্সেস — সব এক জায়গায়',
    getStarted: 'শুরু করুন',
    aiHealthChat: 'AI স্বাস্থ্য চ্যাট',
    freeSecure: 'বিনামূল্যে ও সুরক্ষিত',
    aiAvailable: 'AI উপলব্ধ',
    languages: 'ভাষা',
    emergency: 'জরুরি - 108',
  },
  categories: {
    title: 'আপনার স্বাস্থ্য বিভাগ নির্বাচন করুন',
    subtitle: 'আপনার নির্দিষ্ট প্রয়োজনে ব্যক্তিগত স্বাস্থ্য নির্দেশনা',
    exploreServices: 'সেবা অন্বেষণ করুন',
    male: {
      title: 'পুরুষদের স্বাস্থ্য',
      subtitle: 'সম্পূর্ণ পুরুষ কল্যাণ',
    },
    female: {
      title: 'মহিলাদের স্বাস্থ্য',
      subtitle: 'সম্পূর্ণ মহিলা যত্ন',
    },
    baby: {
      title: 'শিশু যত্ন',
      subtitle: 'আপনার সন্তানের স্বাস্থ্য সঙ্গী',
    },
    mental: {
      title: 'মানসিক স্বাস্থ্য',
      subtitle: 'মন ও সুস্থতা সমর্থন',
    },
  },
  quickTools: {
    title: 'দ্রুত অ্যাক্সেস টুলস',
    subtitle: 'আপনার আঙুলের ডগায় সবকিছু',
    govtSchemes: 'সরকারি প্রকল্প',
    govtSchemesSubtitle: 'বিনামূল্যে স্বাস্থ্য সুবিধা',
    healthTips: 'স্বাস্থ্য টিপস',
    healthTipsSubtitle: 'দৈনিক সুস্থতা পরামর্শ',
    reminders: 'রিমাইন্ডার',
    remindersSubtitle: 'ওষুধ সতর্কতা',
    healthTools: 'স্বাস্থ্য টুলস',
    healthToolsSubtitle: 'BMI ও ট্র্যাকার',
  },
  prescription: {
    title: 'AI প্রেসক্রিপশন স্ক্যানার',
    subtitle: 'তাৎক্ষণিক ওষুধের বিবরণের জন্য আপনার প্রেসক্রিপশন আপলোড করুন',
    uploadBtn: 'প্রেসক্রিপশন আপলোড করুন',
    scanBtn: 'এখনই স্ক্যান করুন',
    analyzing: 'বিশ্লেষণ করা হচ্ছে...',
    dragDrop: 'টেনে আনুন বা আপলোড করতে ক্লিক করুন',
    supportedFormats: 'JPG, PNG, PDF সমর্থিত',
  },
  nearbyStores: {
    title: 'কাছের ফার্মেসি',
    subtitle: 'রিয়েল-টাইমে আপনার আশেপাশে মেডিকেল স্টোর খুঁজুন',
    searchPlaceholder: 'ফার্মেসি খুঁজুন...',
    enableLocation: 'লোকেশন সক্রিয় করুন',
    locationRequired: 'কাছের ফার্মেসি খুঁজতে লোকেশন অ্যাক্সেস প্রয়োজন',
    noPharmacies: 'কোনো ফার্মেসি পাওয়া যায়নি',
    tryExpanding: 'আপনার সার্চ প্রসারিত করুন বা রিফ্রেশ করুন',
  },
  healthTips: {
    title: 'স্বাস্থ্য টিপস',
    subtitle: 'স্বাস্থ্যকর জীবনযাপনের জন্য দৈনিক টিপস',
    searchPlaceholder: 'স্বাস্থ্য টিপস খুঁজুন...',
    tipsFound: 'স্বাস্থ্য টিপস পাওয়া গেছে',
    noTipsFound: 'আপনার সার্চের সাথে মিলে এমন কোনো টিপস নেই',
    startChat: 'স্বাস্থ্য চ্যাট শুরু করুন',
  },
  govtSchemes: {
    title: 'সরকারি স্বাস্থ্য প্রকল্প',
    subtitle: 'আপনার জন্য উপলব্ধ বিনামূল্যে স্বাস্থ্য সুবিধা আবিষ্কার করুন',
    searchPlaceholder: 'প্রকল্প খুঁজুন...',
    schemesAvailable: 'প্রকল্প উপলব্ধ',
    eligibility: 'যোগ্যতা',
    benefits: 'সুবিধা',
    learnMore: 'আরও জানুন',
  },
  reminders: {
    title: 'ওষুধ রিমাইন্ডার',
    subtitle: 'আপনার ওষুধ কখনও মিস করবেন না',
    addReminder: 'রিমাইন্ডার যোগ করুন',
    medicineName: 'ওষুধের নাম',
    time: 'সময়',
    frequency: 'ফ্রিকোয়েন্সি',
    daily: 'দৈনিক',
    weekly: 'সাপ্তাহিক',
    noReminders: 'কোনো রিমাইন্ডার সেট করা হয়নি',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
  },
  healthTools: {
    title: 'স্বাস্থ্য টুলস',
    subtitle: 'আপনার স্বাস্থ্য মেট্রিক্স ট্র্যাক ও গণনা করুন',
    bmiCalculator: 'BMI ক্যালকুলেটর',
    bmiSubtitle: 'আপনার বডি মাস ইনডেক্স গণনা করুন',
    heartRate: 'হার্ট রেট',
    heartRateSubtitle: 'আপনার হার্ট রেট মনিটর করুন',
    waterIntake: 'পানি গ্রহণ',
    waterIntakeSubtitle: 'দৈনিক পানি খরচ ট্র্যাক করুন',
    sleepTracker: 'ঘুম ট্র্যাকার',
    sleepTrackerSubtitle: 'আপনার ঘুমের প্যাটার্ন মনিটর করুন',
    calculate: 'গণনা করুন',
    height: 'উচ্চতা (সেমি)',
    weight: 'ওজন (কেজি)',
    age: 'বয়স',
    yourBmi: 'আপনার BMI',
    underweight: 'কম ওজন',
    normal: 'স্বাভাবিক',
    overweight: 'অতিরিক্ত ওজন',
    obese: 'স্থূলতা',
  },
  services: {
    title: 'স্বাস্থ্য সেবা',
    subtitle: 'আমাদের ব্যাপক স্বাস্থ্য সেবা অন্বেষণ করুন',
    allCategories: 'সব বিভাগ',
    tips: 'টিপস',
    schemes: 'সম্পর্কিত প্রকল্প',
  },
  chat: {
    title: 'AI স্বাস্থ্য সহায়ক',
    subtitle: 'স্বাস্থ্য সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন',
    placeholder: 'আপনার স্বাস্থ্য প্রশ্ন টাইপ করুন...',
    welcome: 'নমস্কার! আমি আপনার AI স্বাস্থ্য সহায়ক। আজ আমি কীভাবে সাহায্য করতে পারি?',
    typing: 'টাইপ করছে...',
    send: 'পাঠান',
  },
  location: {
    title: 'লোকেশন অ্যাক্সেস সক্রিয় করুন',
    subtitle: 'কাছের ফার্মেসি খুঁজতে আপনার লোকেশন প্রয়োজন',
    enableBtn: 'লোকেশন সক্রিয় করুন',
    permissionDenied: 'লোকেশন অনুমতি প্রত্যাখ্যান করা হয়েছে। অনুগ্রহ করে ব্রাউজার সেটিংসে সক্রিয় করুন।',
    unavailable: 'লোকেশন তথ্য অনুপলব্ধ।',
    timeout: 'লোকেশন অনুরোধ সময়সীমা অতিক্রম করেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
  },
  emergency: {
    title: 'জরুরি',
    callNow: 'এখনই কল করুন',
    ambulance: 'অ্যাম্বুলেন্স',
  },
};

const mr: Translations = {
  common: {
    backToHome: 'होमवर परत जा',
    search: 'शोधा',
    loading: 'लोड होत आहे...',
    noResults: 'कोणतेही परिणाम सापडले नाहीत',
    refresh: 'रिफ्रेश करा',
    close: 'बंद करा',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    delete: 'हटवा',
    edit: 'संपादित करा',
    add: 'जोडा',
    viewMore: 'अधिक पहा',
    directions: 'दिशा',
    openNow: 'आत्ता उघडे आहे',
    closed: 'बंद आहे',
    hoursNA: 'वेळ उपलब्ध नाही',
    reviews: 'पुनरावलोकने',
    nearest: 'जवळचे',
    pharmaciesFound: 'फार्मसी सापडल्या',
    explore: 'शोधा',
  },
  header: {
    home: 'होम',
    services: 'सेवा',
    nearbyStores: 'जवळची दुकाने',
    chat: 'चॅट',
    chooseLanguage: 'भाषा निवडा',
    aiChat: 'AI चॅट',
  },
  hero: {
    badge: 'तुमचा AI-चालित आरोग्य साथीदार',
    title: 'निरोग केअर',
    subtitle: 'AI-चालित प्रिस्क्रिप्शन स्कॅनिंग, वैयक्तिक आरोग्य मार्गदर्शन, आणि निरोगी संसाधनांमध्ये त्वरित प्रवेश — सर्व एकाच ठिकाणी',
    getStarted: 'सुरू करा',
    aiHealthChat: 'AI आरोग्य चॅट',
    freeSecure: 'मोफत आणि सुरक्षित',
    aiAvailable: 'AI उपलब्ध',
    languages: 'भाषा',
    emergency: 'आणीबाणी - 108',
  },
  categories: {
    title: 'तुमची आरोग्य श्रेणी निवडा',
    subtitle: 'तुमच्या विशिष्ट गरजांनुसार वैयक्तिक आरोग्य मार्गदर्शन',
    exploreServices: 'सेवा शोधा',
    male: {
      title: 'पुरुष आरोग्य',
      subtitle: 'संपूर्ण पुरुष कल्याण',
    },
    female: {
      title: 'महिला आरोग्य',
      subtitle: 'संपूर्ण महिला काळजी',
    },
    baby: {
      title: 'बाळ काळजी',
      subtitle: 'तुमच्या मुलाचा आरोग्य साथीदार',
    },
    mental: {
      title: 'मानसिक आरोग्य',
      subtitle: 'मन आणि कल्याण समर्थन',
    },
  },
  quickTools: {
    title: 'त्वरित प्रवेश साधने',
    subtitle: 'तुमच्या बोटांच्या टोकावर सर्वकाही',
    govtSchemes: 'सरकारी योजना',
    govtSchemesSubtitle: 'मोफत आरोग्य लाभ',
    healthTips: 'आरोग्य टिप्स',
    healthTipsSubtitle: 'दैनंदिन निरोगीपणा सल्ला',
    reminders: 'रिमाइंडर्स',
    remindersSubtitle: 'औषध अलर्ट',
    healthTools: 'आरोग्य साधने',
    healthToolsSubtitle: 'BMI आणि ट्रॅकर्स',
  },
  prescription: {
    title: 'AI प्रिस्क्रिप्शन स्कॅनर',
    subtitle: 'त्वरित औषध तपशीलांसाठी तुमचे प्रिस्क्रिप्शन अपलोड करा',
    uploadBtn: 'प्रिस्क्रिप्शन अपलोड करा',
    scanBtn: 'आता स्कॅन करा',
    analyzing: 'विश्लेषण होत आहे...',
    dragDrop: 'ड्रॅग आणि ड्रॉप करा किंवा अपलोड करण्यासाठी क्लिक करा',
    supportedFormats: 'JPG, PNG, PDF समर्थित',
  },
  nearbyStores: {
    title: 'जवळच्या फार्मसी',
    subtitle: 'तुमच्या आसपासची मेडिकल स्टोअर्स रिअल-टाइममध्ये शोधा',
    searchPlaceholder: 'फार्मसी शोधा...',
    enableLocation: 'लोकेशन सक्षम करा',
    locationRequired: 'जवळच्या फार्मसी शोधण्यासाठी लोकेशन ऍक्सेस आवश्यक आहे',
    noPharmacies: 'फार्मसी सापडल्या नाहीत',
    tryExpanding: 'तुमची शोध वाढवा किंवा निकाल रिफ्रेश करा',
  },
  healthTips: {
    title: 'आरोग्य टिप्स',
    subtitle: 'निरोगी जीवनशैलीसाठी दैनंदिन टिप्स',
    searchPlaceholder: 'आरोग्य टिप्स शोधा...',
    tipsFound: 'आरोग्य टिप्स सापडल्या',
    noTipsFound: 'तुमच्या शोधाशी जुळणाऱ्या टिप्स नाहीत',
    startChat: 'आरोग्य चॅट सुरू करा',
  },
  govtSchemes: {
    title: 'सरकारी आरोग्य योजना',
    subtitle: 'तुमच्यासाठी उपलब्ध मोफत आरोग्य लाभ शोधा',
    searchPlaceholder: 'योजना शोधा...',
    schemesAvailable: 'योजना उपलब्ध',
    eligibility: 'पात्रता',
    benefits: 'लाभ',
    learnMore: 'अधिक जाणून घ्या',
  },
  reminders: {
    title: 'औषध रिमाइंडर्स',
    subtitle: 'तुमचे औषध कधीही चुकवू नका',
    addReminder: 'रिमाइंडर जोडा',
    medicineName: 'औषधाचे नाव',
    time: 'वेळ',
    frequency: 'वारंवारता',
    daily: 'दैनंदिन',
    weekly: 'साप्ताहिक',
    noReminders: 'रिमाइंडर्स सेट केलेले नाहीत',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
  },
  healthTools: {
    title: 'आरोग्य साधने',
    subtitle: 'तुमचे आरोग्य मेट्रिक्स ट्रॅक आणि गणना करा',
    bmiCalculator: 'BMI कॅल्क्युलेटर',
    bmiSubtitle: 'तुमचा बॉडी मास इंडेक्स मोजा',
    heartRate: 'हृदय गती',
    heartRateSubtitle: 'तुमची हृदय गती मॉनिटर करा',
    waterIntake: 'पाणी सेवन',
    waterIntakeSubtitle: 'दैनंदिन पाणी वापर ट्रॅक करा',
    sleepTracker: 'झोप ट्रॅकर',
    sleepTrackerSubtitle: 'तुमची झोपेची पद्धत मॉनिटर करा',
    calculate: 'मोजा',
    height: 'उंची (सेमी)',
    weight: 'वजन (किलो)',
    age: 'वय',
    yourBmi: 'तुमचा BMI',
    underweight: 'कमी वजन',
    normal: 'सामान्य',
    overweight: 'जास्त वजन',
    obese: 'लठ्ठपणा',
  },
  services: {
    title: 'आरोग्य सेवा',
    subtitle: 'आमच्या सर्वसमावेशक आरोग्य सेवा शोधा',
    allCategories: 'सर्व श्रेण्या',
    tips: 'टिप्स',
    schemes: 'संबंधित योजना',
  },
  chat: {
    title: 'AI आरोग्य सहाय्यक',
    subtitle: 'आरोग्याबद्दल काहीही विचारा',
    placeholder: 'तुमचा आरोग्य प्रश्न टाइप करा...',
    welcome: 'नमस्कार! मी तुमचा AI आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?',
    typing: 'टाइप करत आहे...',
    send: 'पाठवा',
  },
  location: {
    title: 'लोकेशन ऍक्सेस सक्षम करा',
    subtitle: 'जवळच्या फार्मसी शोधण्यासाठी आम्हाला तुमचे लोकेशन आवश्यक आहे',
    enableBtn: 'लोकेशन सक्षम करा',
    permissionDenied: 'लोकेशन परवानगी नाकारली. कृपया ब्राउझर सेटिंग्जमध्ये सक्षम करा.',
    unavailable: 'लोकेशन माहिती उपलब्ध नाही.',
    timeout: 'लोकेशन विनंती कालबाह्य झाली. कृपया पुन्हा प्रयत्न करा.',
  },
  emergency: {
    title: 'आणीबाणी',
    callNow: 'आता कॉल करा',
    ambulance: 'रुग्णवाहिका',
  },
};

const as: Translations = {
  common: {
    backToHome: 'ঘৰলৈ উভতি যাওক',
    search: 'সন্ধান কৰক',
    loading: 'লোড হৈ আছে...',
    noResults: 'কোনো ফলাফল পোৱা নগ’ল',
    refresh: 'ৰিফ্ৰেছ কৰক',
    close: 'বন্ধ কৰক',
    save: 'সংৰক্ষণ কৰক',
    cancel: 'বাতিল কৰক',
    delete: 'মচি পেলাওক',
    edit: 'সম্পাদনা কৰক',
    add: 'যোগ কৰক',
    viewMore: 'অধিক চাওক',
    directions: 'দিশনিৰ্দেশনা',
    openNow: 'এতিয়া খোলা আছে',
    closed: 'বন্ধ',
    hoursNA: 'সময় উপলব্ধ নহয়',
    reviews: 'সমীক্ষা',
    nearest: 'আটাইতকৈ ওচৰৰ',
    pharmaciesFound: 'টা ফাৰ্মাচী আপোনাৰ ওচৰত পোৱা গৈছে',
    explore: 'অন্বেষণ কৰক',
  },
  header: {
    home: 'হোম',
    services: 'সেৱাসমূহ',
    nearbyStores: 'ওচৰৰ ফাৰ্মাচী',
    chat: 'এআই চ্যাট',
    chooseLanguage: 'ভাষা বাছনি কৰক',
    aiChat: 'এআই স্বাস্থ্য সহায়ক',
  },
  hero: {
    badge: 'আপোনাৰ এআই স্বাস্থ্য সংগী',
    title: 'নিৰোগ কেয়াৰ',
    subtitle: 'এআই প্ৰেছক্ৰিপশ্যন স্কেনিং, ব্যক্তিগত স্বাস্থ্য পৰামৰ্শ আৰু জৰুৰীকালীন স্বাস্থ্য সুবিধা — সকলো একে ঠাইতে',
    getStarted: 'আৰম্ভ কৰক',
    aiHealthChat: 'এআই স্বাস্থ্য চ্যাট',
    freeSecure: 'বিনামূলীয়া আৰু সুৰক্ষিত',
    aiAvailable: '২৪/৭ এআই উপলব্ধ',
    languages: 'ভাষা',
    emergency: 'জৰুৰীকালীন - ১০৮',
  },
  categories: {
    title: 'আপোনাৰ স্বাস্থ্য বিভাগ বাছনি কৰক',
    subtitle: 'আপোনাৰ প্ৰয়োজন অনুসৰি বিশেষ স্বাস্থ্য পৰামৰ্শ',
    exploreServices: 'সেৱাসমূহ চাওক',
    male: {
      title: 'পুৰুষৰ স্বাস্থ্য',
      subtitle: 'সম্পূৰ্ণ পুৰুষৰ স্বাস্থ্য যতন',
    },
    female: {
      title: 'মহিলাৰ স্বাস্থ্য',
      subtitle: 'মহিলাৰ বিশেষ স্বাস্থ্য যতন',
    },
    baby: {
      title: 'শিশুৰ যতন',
      subtitle: 'নৱজাতক আৰু শিশুৰ স্বাস্থ্য',
    },
    mental: {
      title: 'মানসিক স্বাস্থ্য',
      subtitle: 'মানসিক শান্তি আৰু সুস্থতা',
    },
  },
  quickTools: {
    title: 'দ্ৰুত স্বাস্থ্য সঁজুলি',
    subtitle: 'দৈনন্দিন জীৱনৰ বাবে প্ৰয়োজনীয় স্বাস্থ্য সুবিধাসমূহ',
    govtSchemes: 'চৰকাৰী আঁচনি',
    govtSchemesSubtitle: 'বিনামূলীয়া স্বাস্থ্য সুবিধাসমূহ',
    healthTips: 'স্বাস্থ্য টিপছ',
    healthTipsSubtitle: 'দৈনন্দিন সুস্থতাৰ পৰামৰ্শ',
    reminders: 'ঔষধৰ ৰিমাইণ্ডাৰ',
    remindersSubtitle: 'সময়মতে ঔষধ খাওক',
    healthTools: 'স্বাস্থ্য কেলকুলেটৰ',
    healthToolsSubtitle: 'বিএমআই, পানী আৰু টোপনি ট্ৰেকাৰ',
  },
  prescription: {
    title: 'এআই প্ৰেছক্ৰিপশ্যন স্কেনাৰ',
    subtitle: 'ঔষধৰ সবিশেষ জানিবলৈ আপোনাৰ ডাক্তৰৰ প্ৰেছক্ৰিপশ্যন আপলোড কৰক',
    uploadBtn: 'প্ৰেছক্ৰিপশ্যন আপলোড কৰক',
    scanBtn: 'এতিয়াই স্কেন কৰক',
    analyzing: 'পৰীক্ষা কৰি থকা হৈছে...',
    dragDrop: 'ফটো ইয়াত ড্ৰেগ কৰক বা আপলোড কৰিবলৈ ক্লিক কৰক',
    supportedFormats: 'JPG, PNG, WEBP সমৰ্থিত',
  },
  nearbyStores: {
    title: 'ওচৰৰ ফাৰ্মাচীসমূহ',
    subtitle: 'আপোনাৰ ওচৰৰ ঔষধৰ দোকান আৰু জন ঔষধি কেন্দ্ৰ বিচাৰক',
    searchPlaceholder: 'ফাৰ্মাচী বিচাৰক...',
    enableLocation: 'লোকেশ্যন অন কৰক',
    locationRequired: 'ওচৰৰ ফাৰ্মাচী বিচাৰিবলৈ লোকেশ্যনৰ অনুমতি প্ৰয়োজন',
    noPharmacies: 'কোনো ফাৰ্মাচী পোৱা নগ’ল',
    tryExpanding: 'অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক',
  },
  healthTips: {
    title: 'স্বাস্থ্য পৰামৰ্শ',
    subtitle: 'সুস্থ জীৱনশৈলীৰ বাবে দৈনন্দিন দিহা-পৰামৰ্শ',
    searchPlaceholder: 'স্বাস্থ্য টিপছ বিচাৰক...',
    tipsFound: 'টা স্বাস্থ্য টিপছ পোৱা গৈছে',
    noTipsFound: 'কোনো ফলাফল পোৱা নগ’ল',
    startChat: 'স্বাস্থ্য চ্যাট আৰম্ভ কৰক',
  },
  govtSchemes: {
    title: 'চৰকাৰী স্বাস্থ্য আঁচনি',
    subtitle: 'আপোনাৰ বাবে উপলব্ধ বিনামূলীয়া চৰকাৰী স্বাস্থ্য সুবিধাসমূহ জানক',
    searchPlaceholder: 'আঁচনি বিচাৰক...',
    schemesAvailable: 'খন আঁচনি উপলব্ধ',
    eligibility: 'যোগ্যতা',
    benefits: 'সুবিধাসমূহ',
    learnMore: 'অধিক জানক',
  },
  reminders: {
    title: 'ঔষধৰ ৰিমাইণ্ডাৰ',
    subtitle: 'আপোনাৰ ঔষধ খোৱাৰ সময় কেতিয়াও নাপাহৰিব',
    addReminder: 'ৰিমাইণ্ডাৰ যোগ কৰক',
    medicineName: 'ঔষধৰ নাম',
    time: 'সময়',
    frequency: 'পুনৰাবৃত্তি',
    daily: 'দৈনিক',
    weekly: 'সাপ্তাহিক',
    noReminders: 'কোনো ৰিমাইণ্ডাৰ ছেট কৰা হোৱা নাই',
    active: 'সক্ৰিয়',
    inactive: 'নিষ্ক্ৰিয়',
  },
  healthTools: {
    title: 'স্বাস্থ্য সঁজুলিসমূহ',
    subtitle: 'আপোনাৰ স্বাস্থ্যৰ মাপকাঠীসমূহ গণনা আৰু নিৰীক্ষণ কৰক',
    bmiCalculator: 'বিএমআই (BMI) কেলকুলেটৰ',
    bmiSubtitle: 'আপোনাৰ শৰীৰৰ ওজনৰ সূচক গণনা কৰক',
    heartRate: 'হৃদস্পন্দন',
    heartRateSubtitle: 'আপোনাৰ হৃদস্পন্দন নিৰীক্ষণ কৰক',
    waterIntake: 'পানী গ্ৰহণ',
    waterIntakeSubtitle: 'দৈনিক পানী খোৱাৰ হিচাপ ৰাখক',
    sleepTracker: 'টোপনি ট্ৰেকাৰ',
    sleepTrackerSubtitle: 'আপোনাৰ টোপনিৰ অভ্যাস নিৰীক্ষণ কৰক',
    calculate: 'গণনা কৰক',
    height: 'উচ্চতা (ছে.মি.)',
    weight: 'ওজন (কেজি)',
    age: 'বয়স',
    yourBmi: 'আপোনাৰ বিএমআই',
    underweight: 'কম ওজন',
    normal: 'স্বাভাৱিক',
    overweight: 'অধিক ওজন',
    obese: 'মেদবহুলতা',
  },
  services: {
    title: 'স্বাস্থ্য সেৱাসমূহ',
    subtitle: 'আমাৰ সম্পূৰ্ণ স্বাস্থ্য সেৱা আৰু পৰামৰ্শসমূহ চাওক',
    allCategories: 'সকলো বিভাগ',
    tips: 'পৰামৰ্শ',
    schemes: 'চৰকাৰী আঁচনি',
  },
  chat: {
    title: 'এআই স্বাস্থ্য সহায়ক',
    subtitle: 'স্বাস্থ্য সম্পৰ্কে যিকোনো প্ৰশ্ন সোধক',
    placeholder: 'আপোনাৰ স্বাস্থ্য সম্পৰ্কীয় প্ৰশ্ন ইয়াত লিখক...',
    welcome: 'নমস্কাৰ! মই আপোনাৰ এআই স্বাস্থ্য সহায়ক। আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
    typing: 'লিখি আছে...',
    send: 'পঠিয়াওক',
  },
  location: {
    title: 'লোকেশ্যন অন কৰক',
    subtitle: 'ওচৰৰ ফাৰ্মাচী বিচাৰিবলৈ আমাক আপোনাৰ লোকেশ্যনৰ প্ৰয়োজন',
    enableBtn: 'লোকেশ্যন অন কৰক',
    permissionDenied: 'লোকেশ্যনৰ অনুমতি নাকচ কৰা হৈছে। ব্ৰাউজাৰ ছেটিংছত অন কৰক।',
    unavailable: 'লোকেশ্যনৰ তথ্য উপলব্ধ নহয়।',
    timeout: 'লোকেশ্যনৰ সময় উকলি গৈছে। পুনৰ চেষ্টা কৰক।',
  },
  emergency: {
    title: 'জৰুৰীকালীন সেবা',
    callNow: 'এতিয়াই ফোন কৰক',
    ambulance: 'এম্বুলেন্স',
  },
};

const kn: Translations = {
  common: {
    backToHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    search: 'ಹುಡುಕಿ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    noResults: 'ফಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    refresh: 'ರಿಫ್ರೆಶ್',
    close: 'ಮುಚ್ಚಿ',
    save: 'ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    delete: 'ಅಳಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    add: 'ಸೇರಿಸಿ',
    viewMore: 'ಮತ್ತಷ್ಟು ನೋಡಿ',
    directions: 'ದಿಕ್ಕುಗಳು',
    openNow: 'ಈಗ ತೆರೆದಿದೆ',
    closed: 'ಮುಚ್ಚಲಾಗಿದೆ',
    hoursNA: 'ಸಮಯ ಲಭ್ಯವಿಲ್ಲ',
    reviews: 'ವಿಮರ್ಶೆಗಳು',
    nearest: 'ಹತ್ತಿರದ',
    pharmaciesFound: 'ಫಾರ್ಮಸಿಗಳು ನಿಮ್ಮ ಹತ್ತಿರ ಕಂಡುಬಂದಿವೆ',
    explore: 'ಅನ್ವೇಷಿಸಿ',
  },
  header: {
    home: 'ಮುಖಪುಟ',
    services: 'ಸೇವೆಗಳು',
    nearbyStores: 'ಹತ್ತಿರದ ಫಾರ್ಮಸಿ',
    chat: 'AI ಚಾಟ್',
    chooseLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    aiChat: 'AI ಆರೋಗ್ಯ ಚಾಟ್',
  },
  hero: {
    badge: 'ನಿಮ್ಮ AI ಆಧಾರಿತ ಆರೋಗ್ಯ ಸಂಗಾತಿ',
    title: 'ನಿರೋಗ್ ಕೇರ್',
    subtitle: 'AI ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸ್ಕ್ಯಾನಿಂಗ್, ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ತುರ್ತು ಸೇವೆಗಳು — ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    aiHealthChat: 'AI ಆರೋಗ್ಯ ಚಾಟ್',
    freeSecure: 'ಉಚಿತ ಮತ್ತು ಸುರಕ್ಷಿತ',
    aiAvailable: '24/7 AI ಲಭ್ಯವಿದೆ',
    languages: 'ಭಾಷೆಗಳು',
    emergency: 'ತುರ್ತು ಕರೆ - 108',
  },
  categories: {
    title: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ವಿಭಾಗವನ್ನು ಆರಿಸಿ',
    subtitle: 'ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ತಕ್ಕಂತೆ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ',
    exploreServices: 'ಸೇವೆಗಳನ್ನು ನೋಡಿ',
    male: {
      title: 'ಪುರುಷರ ಆರೋಗ್ಯ',
      subtitle: 'ಸಂಪೂರ್ಣ ಪುರುಷರ ಆರೋಗ್ಯ ರಕ್ಷಣೆ',
    },
    female: {
      title: 'ಮಹಿಳೆಯರ ಆರೋಗ್ಯ',
      subtitle: 'ಮಹಿಳೆಯರ ವಿಶೇಷ ಆರೋಗ್ಯ ರಕ್ಷಣೆ',
    },
    baby: {
      title: 'ಶಿಶು ಆರೈಕೆ',
      subtitle: 'ಮಕ್ಕಳ ಆರೋಗ್ಯ ಮತ್ತು ಪೋಷಣೆ',
    },
    mental: {
      title: 'ಮಾನಸಿಕ ಆರೋಗ್ಯ',
      subtitle: 'ಮಾನಸಿಕ ಶಾಂತಿ ಮತ್ತು ಯೋಗಕ್ಷೇಮ',
    },
  },
  quickTools: {
    title: 'ತ್ವರಿತ ಆರೋಗ್ಯ ಸಾಧನಗಳು',
    subtitle: 'ನಿಮ್ಮ ದೈನಂದಿನ ಆರೋಗ್ಯಕ್ಕಾಗಿ ಪ್ರಮುಖ ಸಾಧನಗಳು',
    govtSchemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    govtSchemesSubtitle: 'ಉಚಿತ ಆರೋಗ್ಯ ಸೌಲಭ್ಯಗಳು',
    healthTips: 'ಆರೋಗ್ಯ ಸಲಹೆಗಳು',
    healthTipsSubtitle: 'ದೈನಂದಿನ ಆರೋಗ್ಯ ಮಾಹಿತಿ',
    reminders: 'ಔಷಧಿ ಜ್ಞಾಪನೆಗಳು',
    remindersSubtitle: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಿ',
    healthTools: 'ಆರೋಗ್ಯ ಸಾಧನಗಳು',
    healthToolsSubtitle: 'BMI ಮತ್ತು ಆರೋಗ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
  },
  prescription: {
    title: 'AI ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸ್ಕ್ಯಾನರ್',
    subtitle: 'ಔಷಧಿಗಳ ಮಾಹಿತಿಗಾಗಿ ನಿಮ್ಮ ವೈದ್ಯರ ಚೀಟಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    uploadBtn: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    scanBtn: 'ಈಗ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    analyzing: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    dragDrop: 'ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    supportedFormats: 'JPG, PNG, WEBP ಬೆಂಬಲಿತವಾಗಿದೆ',
  },
  nearbyStores: {
    title: 'ಹತ್ತಿರದ ಫಾರ್ಮಸಿಗಳು',
    subtitle: 'ನಿಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಮೆಡಿಕಲ್ ಸ್ಟೋರ್‌ಗಳನ್ನು ಹುಡುಕಿ',
    searchPlaceholder: 'ಫಾರ್ಮಸಿ ಹುಡುಕಿ...',
    enableLocation: 'ಲೊಕೇಶನ್ ಆನ್ ಮಾಡಿ',
    locationRequired: 'ಹತ್ತಿರದ ಫಾರ್ಮಸಿಗಳನ್ನು ಹುಡುಕಲು ಲೊಕೇಶನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ',
    noPharmacies: 'ಯಾವುದೇ ಫಾರ್ಮಸಿ ಕಂಡುಬಂದಿಲ್ಲ',
    tryExpanding: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
  },
  healthTips: {
    title: 'ಆರೋಗ್ಯ ಸಲಹೆಗಳು',
    subtitle: 'ಆರೋಗ್ಯಕರ ಜೀವನಶೈಲಿಗಾಗಿ ದೈನಂದಿನ ಸಲಹೆಗಳು',
    searchPlaceholder: 'ಸಲಹೆಗಳನ್ನು ಹುಡುಕಿ...',
    tipsFound: 'ಆರೋಗ್ಯ ಸಲಹೆಗಳು ಕಂಡುಬಂದಿವೆ',
    noTipsFound: 'ಯಾವುದೇ ಸಲಹೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    startChat: 'ಆರೋಗ್ಯ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ',
  },
  govtSchemes: {
    title: 'ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ಯೋಜನೆಗಳು',
    subtitle: 'ನಿಮಗಾಗಿ ಲಭ್ಯವಿರುವ ಉಚಿತ ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ಯೋಜನೆಗಳು',
    searchPlaceholder: 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ...',
    schemesAvailable: 'ಯೋಜನೆಗಳು ಲಭ್ಯವಿವೆ',
    eligibility: 'ಅರ್ಹತೆ',
    benefits: 'ಪ್ರಯೋಜನಗಳು',
    learnMore: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
  },
  reminders: {
    title: 'ಔಷಧಿ ಜ್ಞಾಪನೆಗಳು',
    subtitle: 'ನಿಮ್ಮ ಔಷಧಿಯನ್ನು ಎಂದಿಗೂ ಮರೆಯಬೇಡಿ',
    addReminder: 'ಜ್ಞಾಪನೆ ಸೇರಿಸಿ',
    medicineName: 'ಔಷಧಿಯ ಹೆಸರು',
    time: 'ಸಮಯ',
    frequency: 'ಆವರ್ತನ',
    daily: 'ಪ್ರತಿದಿನ',
    weekly: 'ವಾರಕ್ಕೊಮ್ಮೆ',
    noReminders: 'ಯಾವುದೇ ಜ್ಞಾಪನೆಗಳನ್ನು ಹೊಂದಿಸಲಾಗಿಲ್ಲ',
    active: 'ಸಕ್ರಿಯ',
    inactive: 'ನಿಷ್ಕ್ರಿಯ',
  },
  healthTools: {
    title: 'ಆರೋಗ್ಯ ಸಾಧನಗಳು',
    subtitle: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾನದಂಡಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ',
    bmiCalculator: 'BMI ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    bmiSubtitle: 'ನಿಮ್ಮ ದೇಹದ ತೂಕದ ಸೂಚ್ಯಂಕ ತಿಳಿಯಿರಿ',
    heartRate: 'ಹೃದಯ ಬಡಿತ',
    heartRateSubtitle: 'ನಿಮ್ಮ ಹೃದಯ ಬಡಿತವನ್ನು ಪರಿಶೀಲಿಸಿ',
    waterIntake: 'ನೀರಿನ ಸೇವನೆ',
    waterIntakeSubtitle: 'ದೈನಂದಿನ ನೀರಿನ ಸೇವನೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    sleepTracker: 'ನಿದ್ರೆ ಟ್ರ್ಯಾಕರ್',
    sleepTrackerSubtitle: 'ನಿಮ್ಮ ನಿದ್ರೆಯ ಸಮಯವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    calculate: 'ಲೆಕ್ಕಹಾಕಿ',
    height: 'ಎತ್ತರ (ಸೆಂ.ಮೀ)',
    weight: 'ತೂಕ (ಕೆ.ಜಿ)',
    age: 'ವಯಸ್ಸು',
    yourBmi: 'ನಿಮ್ಮ BMI',
    underweight: 'ಕಡಿಮೆ ತೂಕ',
    normal: 'ಸಾಮಾನ್ಯ',
    overweight: 'অಧಿಕ ತೂಕ',
    obese: 'ಬೊಜ್ಜು',
  },
  services: {
    title: 'ಆರೋಗ್ಯ ಸೇವೆಗಳು',
    subtitle: 'ನಮ್ಮ ಸಮಗ್ರ ಆರೋಗ್ಯ ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    allCategories: 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು',
    tips: 'ಸಲಹೆಗಳು',
    schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
  },
  chat: {
    title: 'AI ಆರೋಗ್ಯ ಸಹಾಯಕ',
    subtitle: 'ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ',
    placeholder: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...',
    welcome: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    typing: 'ಟೈಪ್ ಮಾಡುತ್ತಿದೆ...',
    send: 'ಕಳುಹಿಸಿ',
  },
  location: {
    title: 'ಲೊಕೇಶನ್ ಆನ್ ಮಾಡಿ',
    subtitle: 'ಹತ್ತಿರದ ಫಾರ್ಮಸಿಗಳನ್ನು ಹುಡುಕಲು ಲೊಕೇಶನ್ ಅಗತ್ಯವಿದೆ',
    enableBtn: 'ಲೊಕೇಶನ್ ಆನ್ ಮಾಡಿ',
    permissionDenied: 'ಲೊಕೇಶನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.',
    unavailable: 'ಲೊಕೇಶನ್ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.',
    timeout: 'ಸಮಯ ಮೀರಿದೆ, ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
  emergency: {
    title: 'ತುರ್ತು ಸೇವೆ',
    callNow: 'ಈಗ ಕರೆ ಮಾಡಿ',
    ambulance: 'ಆಂಬ್ಯುಲೆನ್ಸ್',
  },
};

const gu: Translations = {
  common: {
    backToHome: 'હોમ પર પાછા જાઓ',
    search: 'શોધો',
    loading: 'લોડ થઈ રહ્યું છે...',
    noResults: 'કોઈ પરિણામ મળ્યું નથી',
    refresh: 'રિફ્રેશ કરો',
    close: 'બંધ કરો',
    save: 'સેવ કરો',
    cancel: 'રદ કરો',
    delete: 'કાઢી નાખો',
    edit: 'ફેરફાર કરો',
    add: 'ઉમેરો',
    viewMore: 'વધુ જુઓ',
    directions: 'દિશાઓ',
    openNow: 'અત્યારે ખુલ્લું છે',
    closed: 'બંધ',
    hoursNA: 'સમય ઉપલબ્ધ નથી',
    reviews: 'રિવ્યુ',
    nearest: 'સૌથી નજીક',
    pharmaciesFound: 'ફાર્મસી તમારી નજીક મળી',
    explore: 'અન્વેષણ કરો',
  },
  header: {
    home: 'હોમ',
    services: 'સેવાઓ',
    nearbyStores: 'નજીકના મેડિકલ સ્ટોર',
    chat: 'AI ચેટ',
    chooseLanguage: 'ભાષા પસંદ કરો',
    aiChat: 'AI હેલ્થ ચેટ',
  },
  hero: {
    badge: 'તમારો AI આધારિત આરોગ્ય સાથી',
    title: 'નિરોગ કેર',
    subtitle: 'AI પ્રિસ્ક્રિપ્શન સ્કેનિંગ, વ્યક્તિગત આરોગ્ય માર્ગદર્શન અને તાત્કાલિક આરોગ્ય સુવિધાઓ — બધું એક જ જગ્યાએ',
    getStarted: 'શરૂ કરો',
    aiHealthChat: 'AI હેલ્થ ચેટ',
    freeSecure: 'મફત અને સુરક્ષિત',
    aiAvailable: '24/7 AI ઉપલબ્ધ',
    languages: 'ભાષાઓ',
    emergency: 'ઇમરજન્સી - 108',
  },
  categories: {
    title: 'તમારી આરોગ્ય શ્રેણી પસંદ કરો',
    subtitle: 'તમારી જરૂરિયાતો અનુસાર વ્યક્તિગત આરોગ્ય માર્ગદર્શન',
    exploreServices: 'સેવાઓ જુઓ',
    male: {
      title: 'પુરુષોનું આરોગ્ય',
      subtitle: 'સંપૂર્ણ પુરુષ સ્વાસ્થ્ય સંભાળ',
    },
    female: {
      title: 'મહિલાઓનું આરોગ્ય',
      subtitle: 'મહિલાઓ માટે વિશેષ આરોગ્ય સંભાળ',
    },
    baby: {
      title: 'શિશુ સંભાળ',
      subtitle: 'બાળકોનું આરોગ્ય અને પોષણ',
    },
    mental: {
      title: 'માનસિક આરોગ્ય',
      subtitle: 'માનસિક શાંતિ અને સુખાકારી',
    },
  },
  quickTools: {
    title: 'ઝડપી આરોગ્ય સાધનો',
    subtitle: 'તમારા દૈનિક સ્વાસ્થ્ય માટે ઉપયોગી સાધનો',
    govtSchemes: 'સરકારી યોજનાઓ',
    govtSchemesSubtitle: 'મફત આરોગ્ય લાભો',
    healthTips: 'આરોગ્ય ટિપ્સ',
    healthTipsSubtitle: 'દૈનિક સ્વાસ્થ્ય માહિતી',
    reminders: 'દવા રિમાઇન્ડર',
    remindersSubtitle: 'સમયસર દવા લો',
    healthTools: 'હેલ્થ ટૂલ્સ',
    healthToolsSubtitle: 'BMI અને હેલ્થ કેલ્ક્યુલેટર',
  },
  prescription: {
    title: 'AI પ્રિસ્ક્રિપ્શન સ્કેનર',
    subtitle: 'દવાઓની માહિતી માટે તમારું પ્રિસ્ક્રિપ્શન અપલોડ કરો',
    uploadBtn: 'પ્રિસ્ક્રિપ્શન અપલોડ કરો',
    scanBtn: 'અત્યારે સ્કેન કરો',
    analyzing: 'તપાસ થઈ રહી છે...',
    dragDrop: 'ડ્રેગ અને ડ્રોપ કરો અથવા અપલોડ કરવા ક્લિક કરો',
    supportedFormats: 'JPG, PNG, WEBP સપોર્ટેડ',
  },
  nearbyStores: {
    title: 'નજીકની ફાર્મસીઓ',
    subtitle: 'તમારી આસપાસના મેડિકલ સ્ટોર્સ શોધો',
    searchPlaceholder: 'ફાર્મસી શોધો...',
    enableLocation: 'લોકેશન ચાલુ કરો',
    locationRequired: 'નજીકની ફાર્મસી શોધવા માટે લોકેશન પરવાનગી જરૂરી છે',
    noPharmacies: 'કોઈ ફાર્મસી મળી નથી',
    tryExpanding: 'કૃપા કરીને ફરી પ્રયાસ કરો',
  },
  healthTips: {
    title: 'આરોગ્ય ટિપ્સ',
    subtitle: 'તંદુરસ્ત જીવનશૈલી માટે દૈનિક ટિપ્સ',
    searchPlaceholder: 'ટિપ્સ શોધો...',
    tipsFound: 'આરોગ્ય ટિપ્સ મળી',
    noTipsFound: 'કોઈ ટિપ્સ મળી નથી',
    startChat: 'હેલ્થ ચેટ શરૂ કરો',
  },
  govtSchemes: {
    title: 'સરકારી આરોગ્ય યોજનાઓ',
    subtitle: 'તમારા માટે ઉપલબ્ધ મફત સરકારી આરોગ્ય લાભો જાણો',
    searchPlaceholder: 'યોજના શોધો...',
    schemesAvailable: 'યોજનાઓ ઉપલબ્ધ',
    eligibility: 'પાત્રતા',
    benefits: 'લાભો',
    learnMore: 'વધુ જાણો',
  },
  reminders: {
    title: 'દવા રિમાઇન્ડર',
    subtitle: 'તમારી દવા લેવાનું ક્યારેય ભૂલશો નહીં',
    addReminder: 'રિમાઇન્ડર ઉમેરો',
    medicineName: 'દવાનું નામ',
    time: 'સમય',
    frequency: 'વારંવારતા',
    daily: 'દરરોજ',
    weekly: 'અઠવાડિયે',
    noReminders: 'કોઈ રિમાઇન્ડર સેટ નથી',
    active: 'સક્રિય',
    inactive: 'નિષ્ક્રિય',
  },
  healthTools: {
    title: 'હેલ્થ ટૂલ્સ',
    subtitle: 'તમારા આરોગ્ય માપદંડોની ગણતરી કરો',
    bmiCalculator: 'BMI કેલ્ક્યુલેટર',
    bmiSubtitle: 'તમારો બોડી માસ ઇન્ડેક્સ જાણો',
    heartRate: 'હૃદયના ધબકારા',
    heartRateSubtitle: 'તમારા ધબકારા તપાસો',
    waterIntake: 'પાણીનું સેવન',
    waterIntakeSubtitle: 'દૈનિક પાણી પીવાનો હિસાબ રાખો',
    sleepTracker: 'ઊંઘ ટ્રેકર',
    sleepTrackerSubtitle: 'તમારી ઊંઘની પેટર્ન ટ્રેક કરો',
    calculate: 'ગણતરી કરો',
    height: 'ઊંચાઈ (સે.મી.)',
    weight: 'વજન (કિ.ગ્રા.)',
    age: 'ઉંમર',
    yourBmi: 'તમારો BMI',
    underweight: 'ઓછું વજન',
    normal: 'સામાન્ય',
    overweight: 'વધુ વજન',
    obese: 'મેદસ્વીપણું',
  },
  services: {
    title: 'આરોગ્ય સેવાઓ',
    subtitle: 'અમારી સંપૂર્ણ આરોગ્ય સેવાઓ જુઓ',
    allCategories: 'બધી શ્રેણીઓ',
    tips: 'ટિપ્સ',
    schemes: 'સરકારી યોજનાઓ',
  },
  chat: {
    title: 'AI આરોગ્ય સહાયક',
    subtitle: 'આરોગ્ય વિશે કંઈપણ પૂછો',
    placeholder: 'તમારો આરોગ્ય પ્રશ્ન અહીં લખો...',
    welcome: 'નમસ્તે! હું તમારો AI આરોગ્ય સહાયક છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?',
    typing: 'ટાઇપ થઈ રહ્યું છે...',
    send: 'મોકલો',
  },
  location: {
    title: 'લોકેશન ચાલુ કરો',
    subtitle: 'નજીકની ફાર્મસી શોધવા માટે લોકેશન જરૂરી છે',
    enableBtn: 'લોકેશન ચાલુ કરો',
    permissionDenied: 'લોકેશન પરવાનગી નકારવામાં આવી છે.',
    unavailable: 'લોકેશન માહિતી ઉપલબ્ધ નથી.',
    timeout: 'સમય સમાપ્ત થયો, ફરી પ્રયાસ કરો.',
  },
  emergency: {
    title: 'ઇમરજન્સી',
    callNow: 'અત્યારે કોલ કરો',
    ambulance: 'એમ્બ્યુલન્સ',
  },
};

export const translations: Record<LanguageCode, Translations> = {
  en,
  hi,
  as,
  ta,
  te,
  bn,
  mr,
  kn,
  gu,
};

export function getLanguageCode(languageName: string): LanguageCode {
  if (!languageName) return 'en';
  const normalized = languageName.trim();
  const mapping: Record<string, LanguageCode> = {
    'English': 'en',
    'en': 'en',
    'en-IN': 'en',
    'Hindi': 'hi',
    'हिंदी': 'hi',
    'hi': 'hi',
    'Assamese': 'as',
    'অসমীয়া': 'as',
    'as': 'as',
    'Tamil': 'ta',
    'தமிழ்': 'ta',
    'ta': 'ta',
    'Telugu': 'te',
    'తెలుగు': 'te',
    'te': 'te',
    'Bengali': 'bn',
    'বাংলা': 'bn',
    'bn': 'bn',
    'Marathi': 'mr',
    'मराठी': 'mr',
    'mr': 'mr',
    'Kannada': 'kn',
    'ಕನ್ನಡ': 'kn',
    'kn': 'kn',
    'Gujarati': 'gu',
    'ગુજરાતી': 'gu',
    'gu': 'gu',
  };
  return mapping[normalized] || 'en';
}
