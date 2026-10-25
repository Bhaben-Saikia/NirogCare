/**
 * NirogCare - Translations System
 * Multi-language support for the entire app
 */

export type SupportedLanguage = 'English' | 'हिंदी' | 'অসমীয়া' | 'தமிழ்' | 'తెలుగు' | 'ಕನ್ನಡ' | 'मराठी' | 'বাংলা' | 'ગુજરાતી';

export interface Translations {
    // Common
    home: string;
    services: string;
    pharmacy: string;
    tips: string;
    schemes: string;
    dashboard: string;
    settings: string;
    chat: string;
    search: string;

    // Hero Section
    heroTitle: string;
    heroSubtitle: string;
    getStarted: string;
    talkToAI: string;

    // Features
    prescriptionScanner: string;
    aiPowered: string;
    uploadPrescription: string;
    analyzeWithAI: string;
    tryDemo: string;

    // Health Tools
    healthTools: string;
    bmiCalculator: string;
    waterTracker: string;
    stepCounter: string;
    sleepMonitor: string;
    heartRate: string;
    calorieTracker: string;
    meditation: string;
    eyeCare: string;

    // Reminders
    reminders: string;
    addReminder: string;
    medicineName: string;
    frequency: string;
    time: string;

    // Emergency
    emergency: string;
    callEmergency: string;

    // Chat
    askAnything: string;
    typeQuestion: string;

    // Common Actions
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    loading: string;

    // Status
    active: string;
    inactive: string;
    online: string;
    offline: string;
}

const translations: Record<SupportedLanguage, Translations> = {
    'English': {
        home: 'Home',
        services: 'Services',
        pharmacy: 'Pharmacy',
        tips: 'Tips',
        schemes: 'Schemes',
        dashboard: 'Dashboard',
        settings: 'Settings',
        chat: 'Chat',
        search: 'Search',

        heroTitle: 'Your AI Health Companion',
        heroSubtitle: 'Get instant health guidance, find pharmacies, and track your wellness journey',
        getStarted: 'Get Started Free',
        talkToAI: 'Talk to AI',

        prescriptionScanner: 'Prescription Scanner',
        aiPowered: 'AI-Powered',
        uploadPrescription: 'Upload your prescription and let AI extract medicine details',
        analyzeWithAI: 'Analyze with AI',
        tryDemo: 'Try Demo',

        healthTools: 'Health Tools',
        bmiCalculator: 'BMI Calculator',
        waterTracker: 'Water Tracker',
        stepCounter: 'Step Counter',
        sleepMonitor: 'Sleep Monitor',
        heartRate: 'Heart Rate',
        calorieTracker: 'Calorie Tracker',
        meditation: 'Meditation',
        eyeCare: 'Eye Care',

        reminders: 'Medicine Reminders',
        addReminder: 'Add Reminder',
        medicineName: 'Medicine Name',
        frequency: 'Frequency',
        time: 'Time',

        emergency: 'Emergency',
        callEmergency: 'Call Emergency',

        askAnything: 'Ask me anything about health...',
        typeQuestion: 'Type your health question...',

        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        loading: 'Loading...',

        active: 'Active',
        inactive: 'Inactive',
        online: 'Online',
        offline: 'Offline',
    },

    'हिंदी': {
        home: 'होम',
        services: 'सेवाएं',
        pharmacy: 'फार्मेसी',
        tips: 'सुझाव',
        schemes: 'योजनाएं',
        dashboard: 'डैशबोर्ड',
        settings: 'सेटिंग्स',
        chat: 'चैट',
        search: 'खोजें',

        heroTitle: 'आपका AI स्वास्थ्य साथी',
        heroSubtitle: 'तुरंत स्वास्थ्य मार्गदर्शन प्राप्त करें, फार्मेसी खोजें और अपनी सेहत को ट्रैक करें',
        getStarted: 'मुफ्त शुरू करें',
        talkToAI: 'AI से बात करें',

        prescriptionScanner: 'प्रिस्क्रिप्शन स्कैनर',
        aiPowered: 'AI द्वारा संचालित',
        uploadPrescription: 'अपना प्रिस्क्रिप्शन अपलोड करें और AI को दवा की जानकारी निकालने दें',
        analyzeWithAI: 'AI से विश्लेषण करें',
        tryDemo: 'डेमो देखें',

        healthTools: 'स्वास्थ्य उपकरण',
        bmiCalculator: 'BMI कैलकुलेटर',
        waterTracker: 'पानी ट्रैकर',
        stepCounter: 'कदम गिनती',
        sleepMonitor: 'नींद मॉनिटर',
        heartRate: 'हृदय गति',
        calorieTracker: 'कैलोरी ट्रैकर',
        meditation: 'ध्यान',
        eyeCare: 'आंखों की देखभाल',

        reminders: 'दवा रिमाइंडर',
        addReminder: 'रिमाइंडर जोड़ें',
        medicineName: 'दवा का नाम',
        frequency: 'आवृत्ति',
        time: 'समय',

        emergency: 'आपातकालीन',
        callEmergency: 'आपातकालीन कॉल करें',

        askAnything: 'स्वास्थ्य के बारे में कुछ भी पूछें...',
        typeQuestion: 'अपना स्वास्थ्य प्रश्न लिखें...',

        save: 'सहेजें',
        cancel: 'रद्द करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        close: 'बंद करें',
        back: 'वापस',
        next: 'आगे',
        submit: 'जमा करें',
        loading: 'लोड हो रहा है...',

        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
        online: 'ऑनलाइन',
        offline: 'ऑफलाइन',
    },

    'தமிழ்': {
        home: 'முகப்பு',
        services: 'சேவைகள்',
        pharmacy: 'மருந்தகம்',
        tips: 'குறிப்புகள்',
        schemes: 'திட்டங்கள்',
        dashboard: 'டாஷ்போர்டு',
        settings: 'அமைப்புகள்',
        chat: 'அரட்டை',
        search: 'தேடுக',

        heroTitle: 'உங்கள் AI சுகாதார துணை',
        heroSubtitle: 'உடனடி சுகாதார வழிகாட்டுதல்களைப் பெறுங்கள், மருந்தகங்களைக் கண்டறியுங்கள்',
        getStarted: 'இலவசமாக தொடங்கு',
        talkToAI: 'AI யுடன் பேசு',

        prescriptionScanner: 'மருந்து சீட்டு ஸ்கேனர்',
        aiPowered: 'AI இயக்கம்',
        uploadPrescription: 'உங்கள் மருந்து சீட்டை பதிவேற்றவும்',
        analyzeWithAI: 'AI மூலம் பகுப்பாய்வு',
        tryDemo: 'டெமோ பாருங்கள்',

        healthTools: 'சுகாதார கருவிகள்',
        bmiCalculator: 'BMI கால்குலேட்டர்',
        waterTracker: 'தண்ணீர் டிராக்கர்',
        stepCounter: 'அடி எண்ணி',
        sleepMonitor: 'தூக்க மானிட்டர்',
        heartRate: 'இதய துடிப்பு',
        calorieTracker: 'கலோரி டிராக்கர்',
        meditation: 'தியானம்',
        eyeCare: 'கண் பராமரிப்பு',

        reminders: 'மருந்து நினைவூட்டல்கள்',
        addReminder: 'நினைவூட்டல் சேர்',
        medicineName: 'மருந்து பெயர்',
        frequency: 'அதிர்வெண்',
        time: 'நேரம்',

        emergency: 'அவசரநிலை',
        callEmergency: 'அவசர அழைப்பு',

        askAnything: 'சுகாதாரம் பற்றி எதையும் கேளுங்கள்...',
        typeQuestion: 'உங்கள் கேள்வியை தட்டச்சு செய்யவும்...',

        save: 'சேமி',
        cancel: 'ரத்துசெய்',
        delete: 'அழி',
        edit: 'திருத்து',
        close: 'மூடு',
        back: 'பின்னால்',
        next: 'அடுத்து',
        submit: 'சமர்ப்பி',
        loading: 'ஏற்றுகிறது...',

        active: 'செயலில்',
        inactive: 'செயலற்ற',
        online: 'ஆன்லைன்',
        offline: 'ஆஃப்லைன்',
    },

    // Telugu
    'తెలుగు': {
        home: 'హోమ్',
        services: 'సేవలు',
        pharmacy: 'ఫార్మసీ',
        tips: 'చిట్కాలు',
        schemes: 'పథకాలు',
        dashboard: 'డాష్‌బోర్డ్',
        settings: 'సెట్టింగ్‌లు',
        chat: 'చాట్',
        search: 'వెతకండి',

        heroTitle: 'మీ AI ఆరోగ్య సహచరుడు',
        heroSubtitle: 'తక్షణ ఆరోగ్య మార్గదర్శకత్వం పొందండి, ఔషధ దుకాణాలను కనుగొనండి',
        getStarted: 'ఉచితంగా ప్రారంభించండి',
        talkToAI: 'AIతో మాట్లాడండి',

        prescriptionScanner: 'ప్రిస్క్రిప్షన్ స్కానర్',
        aiPowered: 'AI ఆధారిత',
        uploadPrescription: 'మీ ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి',
        analyzeWithAI: 'AIతో విశ్లేషించండి',
        tryDemo: 'డెమో చూడండి',

        healthTools: 'ఆరోగ్య సాధనాలు',
        bmiCalculator: 'BMI కాలిక్యులేటర్',
        waterTracker: 'నీటి ట్రాకర్',
        stepCounter: 'అడుగుల కౌంటర్',
        sleepMonitor: 'నిద్ర మానిటర్',
        heartRate: 'హృదయ స్పందన',
        calorieTracker: 'కేలరీ ట్రాకర్',
        meditation: 'ధ్యానం',
        eyeCare: 'కంటి సంరక్షణ',

        reminders: 'మందుల రిమైండర్లు',
        addReminder: 'రిమైండర్ జోడించండి',
        medicineName: 'మందు పేరు',
        frequency: 'ఫ్రీక్వెన్సీ',
        time: 'సమయం',

        emergency: 'అత్యవసర',
        callEmergency: 'అత్యవసర కాల్',

        askAnything: 'ఆరోగ్యం గురించి ఏదైనా అడగండి...',
        typeQuestion: 'మీ ప్రశ్న టైప్ చేయండి...',

        save: 'సేవ్',
        cancel: 'రద్దు',
        delete: 'తొలగించు',
        edit: 'సవరించు',
        close: 'మూసివేయి',
        back: 'వెనుకకు',
        next: 'తదుపరి',
        submit: 'సమర్పించు',
        loading: 'లోడ్ అవుతోంది...',

        active: 'క్రియాశీల',
        inactive: 'నిష్క్రియ',
        online: 'ఆన్‌లైన్',
        offline: 'ఆఫ్‌లైన్',
    },

    // Kannada
    'ಕನ್ನಡ': {
        home: 'ಮುಖಪುಟ',
        services: 'ಸೇವೆಗಳು',
        pharmacy: 'ಔಷಧಾಲಯ',
        tips: 'ಸಲಹೆಗಳು',
        schemes: 'ಯೋಜನೆಗಳು',
        dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        chat: 'ಚಾಟ್',
        search: 'ಹುಡುಕಿ',

        heroTitle: 'ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಂಗಾತಿ',
        heroSubtitle: 'ತ್ವರಿತ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
        getStarted: 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
        talkToAI: 'AIಯೊಂದಿಗೆ ಮಾತನಾಡಿ',

        prescriptionScanner: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸ್ಕ್ಯಾನರ್',
        aiPowered: 'AI ಚಾಲಿತ',
        uploadPrescription: 'ನಿಮ್ಮ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
        analyzeWithAI: 'AIನೊಂದಿಗೆ ವಿಶ್ಲೇಷಿಸಿ',
        tryDemo: 'ಡೆಮೋ ನೋಡಿ',

        healthTools: 'ಆರೋಗ್ಯ ಸಾಧನಗಳು',
        bmiCalculator: 'BMI ಕ್ಯಾಲ್ಕುಲೇಟರ್',
        waterTracker: 'ನೀರಿನ ಟ್ರ್ಯಾಕರ್',
        stepCounter: 'ಹೆಜ್ಜೆ ಎಣಿಕೆ',
        sleepMonitor: 'ನಿದ್ರೆ ಮಾನಿಟರ್',
        heartRate: 'ಹೃದಯ ಬಡಿತ',
        calorieTracker: 'ಕ್ಯಾಲೋರಿ ಟ್ರ್ಯಾಕರ್',
        meditation: 'ಧ್ಯಾನ',
        eyeCare: 'ಕಣ್ಣಿನ ಆರೈಕೆ',

        reminders: 'ಔಷಧಿ ಜ್ಞಾಪನೆಗಳು',
        addReminder: 'ಜ್ಞಾಪನೆ ಸೇರಿಸಿ',
        medicineName: 'ಔಷಧಿ ಹೆಸರು',
        frequency: 'ಆವರ್ತನ',
        time: 'ಸಮಯ',

        emergency: 'ತುರ್ತು',
        callEmergency: 'ತುರ್ತು ಕರೆ',

        askAnything: 'ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...',
        typeQuestion: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...',

        save: 'ಉಳಿಸಿ',
        cancel: 'ರದ್ದುಮಾಡಿ',
        delete: 'ಅಳಿಸಿ',
        edit: 'ಸಂಪಾದಿಸಿ',
        close: 'ಮುಚ್ಚಿ',
        back: 'ಹಿಂದೆ',
        next: 'ಮುಂದೆ',
        submit: 'ಸಲ್ಲಿಸಿ',
        loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',

        active: 'ಸಕ್ರಿಯ',
        inactive: 'ನಿಷ್ಕ್ರಿಯ',
        online: 'ಆನ್‌ಲೈನ್',
        offline: 'ಆಫ್‌ಲೈನ್',
    },

    // Marathi
    'मराठी': {
        home: 'मुख्यपृष्ठ',
        services: 'सेवा',
        pharmacy: 'औषधालय',
        tips: 'टिप्स',
        schemes: 'योजना',
        dashboard: 'डॅशबोर्ड',
        settings: 'सेटिंग्ज',
        chat: 'चॅट',
        search: 'शोधा',

        heroTitle: 'तुमचा AI आरोग्य साथी',
        heroSubtitle: 'त्वरित आरोग्य मार्गदर्शन मिळवा, औषधालये शोधा',
        getStarted: 'मोफत सुरू करा',
        talkToAI: 'AI शी बोला',

        prescriptionScanner: 'प्रिस्क्रिप्शन स्कॅनर',
        aiPowered: 'AI चालित',
        uploadPrescription: 'तुमचे प्रिस्क्रिप्शन अपलोड करा',
        analyzeWithAI: 'AI ने विश्लेषण करा',
        tryDemo: 'डेमो पहा',

        healthTools: 'आरोग्य साधने',
        bmiCalculator: 'BMI कॅल्क्युलेटर',
        waterTracker: 'पाणी ट्रॅकर',
        stepCounter: 'पाऊल गणक',
        sleepMonitor: 'झोप मॉनिटर',
        heartRate: 'हृदय गती',
        calorieTracker: 'कॅलरी ट्रॅकर',
        meditation: 'ध्यान',
        eyeCare: 'डोळ्यांची काळजी',

        reminders: 'औषध स्मरण',
        addReminder: 'स्मरण जोडा',
        medicineName: 'औषधाचे नाव',
        frequency: 'वारंवारता',
        time: 'वेळ',

        emergency: 'आणीबाणी',
        callEmergency: 'आणीबाणी कॉल',

        askAnything: 'आरोग्याबद्दल काहीही विचारा...',
        typeQuestion: 'तुमचा प्रश्न टाइप करा...',

        save: 'जतन करा',
        cancel: 'रद्द करा',
        delete: 'हटवा',
        edit: 'संपादित करा',
        close: 'बंद करा',
        back: 'मागे',
        next: 'पुढे',
        submit: 'सबमिट करा',
        loading: 'लोड होत आहे...',

        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
        online: 'ऑनलाइन',
        offline: 'ऑफलाइन',
    },

    // Bengali
    'বাংলা': {
        home: 'হোম',
        services: 'সেবা',
        pharmacy: 'ফার্মেসি',
        tips: 'টিপস',
        schemes: 'প্রকল্প',
        dashboard: 'ড্যাশবোর্ড',
        settings: 'সেটিংস',
        chat: 'চ্যাট',
        search: 'অনুসন্ধান',

        heroTitle: 'আপনার AI স্বাস্থ্য সহচর',
        heroSubtitle: 'তাৎক্ষণিক স্বাস্থ্য নির্দেশনা পান, ফার্মেসি খুঁজুন',
        getStarted: 'বিনামূল্যে শুরু করুন',
        talkToAI: 'AI এর সাথে কথা বলুন',

        prescriptionScanner: 'প্রেসক্রিপশন স্ক্যানার',
        aiPowered: 'AI চালিত',
        uploadPrescription: 'আপনার প্রেসক্রিপশন আপলোড করুন',
        analyzeWithAI: 'AI দিয়ে বিশ্লেষণ করুন',
        tryDemo: 'ডেমো দেখুন',

        healthTools: 'স্বাস্থ্য সরঞ্জাম',
        bmiCalculator: 'BMI ক্যালকুলেটর',
        waterTracker: 'জল ট্র্যাকার',
        stepCounter: 'পদক্ষেপ গণনা',
        sleepMonitor: 'ঘুম মনিটর',
        heartRate: 'হার্ট রেট',
        calorieTracker: 'ক্যালোরি ট্র্যাকার',
        meditation: 'ধ্যান',
        eyeCare: 'চোখের যত্ন',

        reminders: 'ওষুধ স্মরণ',
        addReminder: 'স্মরণ যোগ করুন',
        medicineName: 'ওষুধের নাম',
        frequency: 'ফ্রিকোয়েন্সি',
        time: 'সময়',

        emergency: 'জরুরি',
        callEmergency: 'জরুরি কল',

        askAnything: 'স্বাস্থ্য সম্পর্কে কিছু জিজ্ঞাসা করুন...',
        typeQuestion: 'আপনার প্রশ্ন টাইপ করুন...',

        save: 'সংরক্ষণ',
        cancel: 'বাতিল',
        delete: 'মুছুন',
        edit: 'সম্পাদনা',
        close: 'বন্ধ',
        back: 'পেছনে',
        next: 'পরবর্তী',
        submit: 'জমা দিন',
        loading: 'লোড হচ্ছে...',

        active: 'সক্রিয়',
        inactive: 'নিষ্ক্রিয়',
        online: 'অনলাইন',
        offline: 'অফলাইন',
    },

    // Gujarati
    'ગુજરાતી': {
        home: 'હોમ',
        services: 'સેવાઓ',
        pharmacy: 'ફાર્મસી',
        tips: 'ટિપ્સ',
        schemes: 'યોજનાઓ',
        dashboard: 'ડેશબોર્ડ',
        settings: 'સેટિંગ્સ',
        chat: 'ચેટ',
        search: 'શોધો',

        heroTitle: 'તમારો AI આરોગ્ય સાથી',
        heroSubtitle: 'તાત્કાલિક આરોગ્ય માર્ગદર્શન મેળવો, ફાર્મસી શોધો',
        getStarted: 'મફત શરૂ કરો',
        talkToAI: 'AI સાથે વાત કરો',

        prescriptionScanner: 'પ્રિસ્ક્રિપ્શન સ્કેનર',
        aiPowered: 'AI સંચાલિત',
        uploadPrescription: 'તમારું પ્રિસ્ક્રિપ્શન અપલોડ કરો',
        analyzeWithAI: 'AI સાથે વિશ્લેષણ કરો',
        tryDemo: 'ડેમો જુઓ',

        healthTools: 'આરોગ્ય સાધનો',
        bmiCalculator: 'BMI કેલ્ક્યુલેટર',
        waterTracker: 'પાણી ટ્રેકર',
        stepCounter: 'પગલાં ગણતરી',
        sleepMonitor: 'ઊંઘ મોનિટર',
        heartRate: 'હૃદય ગતિ',
        calorieTracker: 'કેલરી ટ્રેકર',
        meditation: 'ધ્યાન',
        eyeCare: 'આંખની સંભાળ',

        reminders: 'દવા રીમાઇન્ડર',
        addReminder: 'રીમાઇન્ડર ઉમેરો',
        medicineName: 'દવાનું નામ',
        frequency: 'આવર્તન',
        time: 'સમય',

        emergency: 'કટોકટી',
        callEmergency: 'કટોકટી કૉલ',

        askAnything: 'આરોગ્ય વિશે કંઈપણ પૂછો...',
        typeQuestion: 'તમારો પ્રશ્ન ટાઇપ કરો...',

        save: 'સાચવો',
        cancel: 'રદ કરો',
        delete: 'કાઢી નાખો',
        edit: 'સંપાદિત કરો',
        close: 'બંધ કરો',
        back: 'પાછળ',
        next: 'આગળ',
        submit: 'સબમિટ કરો',
        loading: 'લોડ થઈ રહ્યું છે...',

        active: 'સક્રિય',
        inactive: 'નિષ્ક્રિય',
        online: 'ઓનલાઈન',
        offline: 'ઓફલાઈન',
    },
    'অসমীয়া': {
        home: 'মুখ্য পৃষ্ঠা',
        services: 'সেৱাসমূহ',
        pharmacy: 'ফাৰ্মাচী',
        tips: 'স্বাস্থ্য পৰামৰ্শ',
        schemes: 'চৰকাৰী আঁচনি',
        dashboard: 'ডেশ্ববৰ্ড',
        settings: 'ছেটিংছ',
        chat: 'এআই সহায়ক',
        search: 'সন্ধান কৰক...',

        heroTitle: 'আপোনাৰ ব্যক্তিগত এআই স্বাস্থ্য সহযোগী',
        heroSubtitle: 'ভাৰতৰ বাবে আধুনিক স্বাস্থ্য সেৱা — প্রেস্ক্ৰিপশ্বন স্কেনিং, এআই পৰামৰ্শ আৰু ঔষধৰ সোঁৱৰণী',
        getStarted: 'আৰম্ভ কৰক',
        talkToAI: 'এআইৰ সৈতে কথা পাতক',

        prescriptionScanner: 'প্ৰেস্ক্ৰিপশ্বন স্কেনাৰ',
        aiPowered: 'এআই চালিত',
        uploadPrescription: 'প্ৰেস্ক্ৰিপশ্বন আপলোড কৰক',
        analyzeWithAI: 'এআইৰ দ্বাৰা বিশ্লেষণ কৰক',
        tryDemo: 'ডেমো চাওক',

        healthTools: 'স্বাস্থ্য সঁজুলি',
        bmiCalculator: 'BMI কেলকুলেটৰ',
        waterTracker: 'পানী অনুসৰণ',
        stepCounter: 'খোজ গণনা',
        sleepMonitor: 'টোপনি নিৰীক্ষণ',
        heartRate: 'হৃদস্পন্দন',
        calorieTracker: 'কেলৰী অনুসৰণ',
        meditation: 'ধ্যান',
        eyeCare: 'চকুৰ যত্ন',

        reminders: 'ঔষধ সোঁৱৰণী',
        addReminder: 'সোঁৱৰণী যোগ কৰক',
        medicineName: 'ঔষধৰ নাম',
        frequency: 'বাৰংবাৰতা',
        time: 'সময়',

        emergency: 'জৰুৰীকালীন',
        callEmergency: '১০৮ লৈ ফোন কৰক',

        askAnything: 'স্বাস্থ্যৰ বিষয়ে যিকোনো কথা সোধক...',
        typeQuestion: 'আপোনাৰ প্ৰশ্ন লিখক...',

        save: 'সংৰক্ষণ কৰক',
        cancel: 'বাতিল কৰক',
        delete: 'মচি পেলাওক',
        edit: 'সম্পাদনা কৰক',
        close: 'বন্ধ কৰক',
        back: 'উভতি যাওক',
        next: 'পৰৱৰ্তী',
        submit: 'দাখিল কৰক',
        loading: 'লোড হৈ আছে...',

        active: 'সক্ৰিয়',
        inactive: 'নিষ্ক্ৰিয়',
        online: 'অনলাইন',
        offline: 'অফলাইন',
    },
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: string): Translations {
    // Map common language names to our translation keys  
    const langMap: Record<string, SupportedLanguage> = {
        'english': 'English',
        'hindi': 'हिंदी',
        'हिंदी': 'हिंदी',
        'assamese': 'অসমীয়া',
        'অসমীয়া': 'অসমীয়া',
        'as': 'অসমীয়া',
        'tamil': 'தமிழ்',
        'தமிழ்': 'தமிழ்',
        'telugu': 'తెలుగు',
        'తెలుగు': 'తెలుగు',
        'kannada': 'ಕನ್ನಡ',
        'ಕನ್ನಡ': 'ಕನ್ನಡ',
        'marathi': 'मराठी',
        'मराठी': 'मराठी',
        'bengali': 'বাংলা',
        'বাংলা': 'বাংলা',
        'gujarati': 'ગુજરાતી',
        'ગુજરાતી': 'ગુજરાતી',
    };

    const normalizedLang = language.toLowerCase();
    const mappedLang = langMap[normalizedLang] || 'English';

    return translations[mappedLang] || translations['English'];
}

export default translations;
