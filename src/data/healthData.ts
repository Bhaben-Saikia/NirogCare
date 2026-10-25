import { Language, MedicalStore, HealthService, HealthTip, GovtScheme, Reminder, CategoryType } from '@/types/health';

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English (Indian)' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export const medicalStores: MedicalStore[] = [
  {
    id: 1,
    name: 'Apollo Pharmacy',
    distance: '0.5 km',
    address: 'Shop 12, Main Market Road, Near Bus Stand',
    phone: '+91 98765 43210',
    rating: 4.5,
    openNow: true,
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: 2,
    name: 'MedPlus Medical Store',
    distance: '1.2 km',
    address: 'Krishna Complex, Station Road',
    phone: '+91 98765 43211',
    rating: 4.3,
    openNow: true,
    lat: 19.08,
    lng: 72.88,
  },
  {
    id: 3,
    name: 'Jan Aushadhi Kendra',
    distance: '1.8 km',
    address: 'Government Hospital Complex',
    phone: '+91 98765 43212',
    rating: 4.7,
    openNow: false,
    lat: 19.085,
    lng: 72.885,
  },
];

export const servicesByCategory: Record<string, HealthService[]> = {
  male: [
    {
      id: 'male-hair',
      title: "Hair Fall & Baldness",
      subtitle: 'Expert guidance for hair health',
      description: 'Comprehensive information about hair loss, dandruff, and male pattern baldness treatments.',
      tips: [
        'Maintain a balanced diet rich in protein and iron',
        'Avoid excessive use of chemical hair products',
        'Consult a dermatologist if hair loss persists',
      ],
      schemes: ['Generic medicines through Jan Aushadhi Kendra', 'Govt district hospital dermatology OPD (low cost)'],
    },
    {
      id: 'male-hormone',
      title: 'Hormonal Health',
      subtitle: 'Testosterone & wellness',
      description: 'Understanding fatigue, weakness, and hormonal imbalances in men.',
      tips: ['Regular exercise and adequate sleep are essential', 'Reduce smoking and alcohol consumption', 'Get hormone tests from an endocrinologist if symptoms persist'],
      schemes: ['Govt labs offer hormone tests at subsidized rates'],
    },
    {
      id: 'male-fitness',
      title: 'Muscle & Fitness',
      subtitle: 'Build strength safely',
      description: 'Proper diet charts, gym plans, and avoiding overtraining.',
      tips: ['Consume 1-1.5g protein per kg body weight (consult a dietitian)', 'Avoid steroids - they have serious long-term side effects'],
      schemes: ['Khelo India & local sports schemes for youth fitness'],
    },
    {
      id: 'male-sexual',
      title: 'Sexual & Fertility Health',
      subtitle: 'Confidential guidance',
      description: 'Information about erectile health, fertility, and STD prevention.',
      tips: ['Avoid unverified online medications', 'Consult qualified doctors for any concerns'],
      schemes: ['NACO & govt sexual health clinics (free/low-cost)'],
    },
  ],
  female: [
    {
      id: 'female-wellness',
      title: 'Women Wellness',
      subtitle: 'Holistic health care',
      description: 'Bone health, anemia, thyroid, and common women health issues.',
      tips: ['Increase iron, calcium, and protein in your diet', 'Regular health checkups and Pap smear as advised by doctor'],
      schemes: ['Anaemia Mukt Bharat – free iron supplements', 'Free screenings at govt women health camps'],
    },
    {
      id: 'female-pregnancy',
      title: 'Pregnancy Tracker',
      subtitle: 'Week-by-week guidance',
      description: 'Information about mother and baby health, appointment reminders.',
      tips: ['Take folic acid, iron, and calcium tablets as prescribed', 'Regular ANC checkups are essential'],
      schemes: ['Janani Suraksha Yojana – delivery assistance', 'Pradhan Mantri Matru Vandana Yojana'],
    },
    {
      id: 'female-period',
      title: 'Period Tracker',
      subtitle: 'Cycle management',
      description: 'Track your menstrual cycle, irregularities, and manage discomfort.',
      tips: ['Track your cycle - consult doctor for sudden changes', 'Dont delay seeking help for excessive bleeding or pain'],
      schemes: ['School/college sanitary pad schemes in many states'],
    },
    {
      id: 'female-hormone',
      title: 'PCOS & Hormones',
      subtitle: 'Hormonal balance',
      description: 'Information about PCOS, weight management, and hormonal imbalances.',
      tips: ['Focus on regular exercise and weight management', 'Get blood sugar and hormone tests done'],
      schemes: ['Govt NCD clinics for PCOS/diabetes management'],
    },
  ],
  baby: [
    {
      id: 'baby-vaccine',
      title: 'Vaccination Tracker',
      subtitle: 'Never miss a vaccine',
      description: 'Complete list of mandatory vaccinations for 0-5 years with reminders.',
      tips: ['All vaccines are free at government hospitals/PHCs', 'Always keep the vaccination card safe'],
      schemes: ['Universal Immunization Programme – free vaccines'],
    },
    {
      id: 'baby-diet',
      title: 'Baby Diet & Growth',
      subtitle: 'Nutrition guidance',
      description: 'Age-appropriate nutrition, complementary feeding, and growth charts.',
      tips: ['Exclusive breastfeeding for first 6 months', 'Introduce solid foods gradually after 6 months'],
      schemes: ['ICDS / Anganwadi – free nutrition for mother & child'],
    },
    {
      id: 'baby-skin',
      title: 'Skin & Diaper Care',
      subtitle: 'Gentle care tips',
      description: 'Managing diaper rash, allergies, and baby skin problems.',
      tips: ['Change diapers regularly and keep skin dry', 'Use mild, baby-safe soaps'],
      schemes: ['Pediatric OPD at govt hospitals – low cost'],
    },
  ],
  mental: [
    {
      id: 'mental-stress',
      title: 'Stress & Anxiety',
      subtitle: 'Find your calm',
      description: 'Guide for managing anxiety, panic, and everyday stress.',
      tips: ['Practice deep breathing and meditation for 10-15 minutes daily', 'Reduce screen time and caffeine intake'],
      schemes: ['National Mental Health Programme – govt counselling centres'],
    },
    {
      id: 'mental-sleep',
      title: 'Sleep & Routine',
      subtitle: 'Better sleep habits',
      description: 'Managing insomnia and improving your body clock.',
      tips: ['Maintain consistent sleep and wake times', 'Avoid screens and mobile before bedtime'],
      schemes: ['Psychiatry OPD at district hospitals'],
    },
    {
      id: 'mental-depression',
      title: 'Low Mood & Depression',
      subtitle: 'You are not alone',
      description: 'Understanding persistent sadness and when to seek help.',
      tips: ['Seek clinical help if symptoms persist beyond 2 weeks', 'Talk openly with trusted friends or family'],
      schemes: ['iCall: 9152987821', 'Vandrevala Foundation: 1860-2662-345'],
    },
  ],
};

export const healthTips: HealthTip[] = [
  {
    id: 1,
    title: 'Stay Hydrated',
    subtitle: 'Water is life',
    content: 'Drink at least 8 glasses of water daily to keep your body functioning optimally and maintain energy levels.',
    icon: '💧',
    category: 'mental' as CategoryType,
  },
  {
    id: 2,
    title: 'Morning Walk',
    subtitle: '30 minutes daily',
    content: 'A simple 30-minute walk every morning can improve cardiovascular health, boost mood, and increase energy.',
    icon: '🚶',
    category: 'male' as CategoryType,
  },
  {
    id: 3,
    title: 'Balanced Diet',
    subtitle: 'Eat the rainbow',
    content: 'Include plenty of vegetables, fruits, whole grains, and lean proteins in your daily meals for optimal nutrition.',
    icon: '🥗',
    category: 'female' as CategoryType,
  },
  {
    id: 4,
    title: 'Quality Sleep',
    subtitle: '7-8 hours essential',
    content: 'Good sleep is crucial for mental clarity, immune function, and overall health. Maintain a regular sleep schedule.',
    icon: '😴',
    category: 'mental' as CategoryType,
  },
  {
    id: 5,
    title: 'Mental Wellness',
    subtitle: 'Mind matters',
    content: 'Practice mindfulness, meditation, or deep breathing daily. Your mental health is as important as physical health.',
    icon: '🧘',
    category: 'mental' as CategoryType,
  },
  {
    id: 6,
    title: 'Regular Checkups',
    subtitle: 'Prevention is key',
    content: 'Annual health checkups can detect problems early. Dont wait for symptoms - prevention saves lives.',
    icon: '🏥',
    category: 'baby' as CategoryType,
  },
];

export const govtSchemes: GovtScheme[] = [
  {
    id: 1,
    name: 'Ayushman Bharat',
    subtitle: 'PM-JAY Health Insurance',
    description: 'Indias flagship health insurance scheme providing ₹5 lakh coverage per family for secondary and tertiary care.',
    benefits: ['₹5 lakh annual coverage per family', 'Cashless treatment at empaneled hospitals', '1,350+ medical procedures covered', 'No age limit for enrollment'],
    eligibility: 'Families listed in SECC-2011 database',
  },
  {
    id: 2,
    name: 'Janani Suraksha Yojana',
    subtitle: 'Safe Motherhood Programme',
    description: 'Cash assistance for pregnant women to encourage institutional delivery and reduce maternal mortality.',
    benefits: ['₹1,400 cash assistance (Rural)', '₹1,000 cash assistance (Urban)', 'Free delivery at government hospitals', 'Free transport to hospital'],
    eligibility: 'BPL pregnant women aged 19+',
  },
  {
    id: 3,
    name: 'Jan Aushadhi Kendra',
    subtitle: 'Affordable Generic Medicines',
    description: 'Government initiative to provide quality generic medicines at 50-90% lower prices than branded alternatives.',
    benefits: ['50-90% cheaper than branded medicines', 'Quality assured by government', '1,800+ medicines available', 'Surgical items and medical devices'],
    eligibility: 'Available to all citizens',
  },
  {
    id: 4,
    name: 'Pradhan Mantri Matru Vandana Yojana',
    subtitle: 'Maternity Benefit Programme',
    description: 'Direct cash transfer to pregnant and lactating mothers for first living child to improve health and nutrition.',
    benefits: ['₹5,000 in three installments', 'Additional ₹1,000 if delivery at govt hospital', 'Promotes early registration of pregnancy', 'Encourages institutional delivery'],
    eligibility: 'First-time pregnant women aged 19+',
  },
];

export const defaultReminders: Reminder[] = [
  { id: '1', medicine: 'Paracetamol 500mg', time: '08:00', frequency: 'Daily', active: true, type: 'medication' },
  { id: '2', medicine: 'Vitamin D3', time: '09:00', frequency: 'Weekly', active: true, type: 'medication' },
  { id: '3', medicine: 'Iron Supplement', time: '14:00', frequency: 'Daily', active: false, type: 'medication' },
];

// Category info with professional Lucide icon component references
export const categoryInfo = {
  male: {
    title: "Men's Health",
    subtitle: 'Comprehensive male wellness',
    iconComponent: 'User',
    gradient: 'from-blue-500 to-blue-600'
  },
  female: {
    title: "Women's Health",
    subtitle: 'Complete women care',
    iconComponent: 'Users',
    gradient: 'from-pink-500 to-rose-500'
  },
  baby: {
    title: 'Baby Care',
    subtitle: 'Your childs health partner',
    iconComponent: 'Baby',
    gradient: 'from-purple-500 to-violet-500'
  },
  mental: {
    title: 'Mental Health',
    subtitle: 'Mind & wellness support',
    iconComponent: 'Brain',
    gradient: 'from-emerald-500 to-teal-500'
  },
};
