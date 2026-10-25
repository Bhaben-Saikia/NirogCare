/**
 * NirogCare - App Context
 * Global state management with language persistence and translations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { CategoryType, ChatMessage, PrescriptionData } from '@/types/health';
import { getTranslations, Translations } from '@/lib/translations';

interface AppContextType {
  // Language
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  t: Translations; // Translations helper

  // Category
  selectedCategory: CategoryType | null;
  setSelectedCategory: (cat: CategoryType | null) => void;

  // Chat
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

  // Prescription
  prescriptionData: PrescriptionData | null;
  setPrescriptionData: (data: PrescriptionData | null) => void;

  // Image
  uploadedImage: string | null;
  setUploadedImage: (img: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage key for persisting language
const LANGUAGE_STORAGE_KEY = 'nirogcare_language';

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize language from localStorage or default to English
  const [selectedLanguage, setSelectedLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return saved || 'English';
    }
    return 'English';
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Get translations based on current language
  const t = useMemo(() => getTranslations(selectedLanguage), [selectedLanguage]);

  // Language setter with persistence
  const setSelectedLanguage = (lang: string) => {
    setSelectedLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }

    // Update document language attribute for accessibility
    document.documentElement.lang = getHtmlLangCode(lang);
  };

  // Set initial document language on mount
  useEffect(() => {
    document.documentElement.lang = getHtmlLangCode(selectedLanguage);
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        t,
        selectedCategory,
        setSelectedCategory,
        chatMessages,
        setChatMessages,
        prescriptionData,
        setPrescriptionData,
        uploadedImage,
        setUploadedImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Get HTML lang code from language name
 */
function getHtmlLangCode(language: string): string {
  const langMap: Record<string, string> = {
    'English': 'en',
    'हिंदी': 'hi',
    'Hindi': 'hi',
    'অসমীয়া': 'as',
    'Assamese': 'as',
    'தமிழ்': 'ta',
    'Tamil': 'ta',
    'తెలుగు': 'te',
    'Telugu': 'te',
    'ಕನ್ನಡ': 'kn',
    'Kannada': 'kn',
    'मराठी': 'mr',
    'Marathi': 'mr',
    'বাংলা': 'bn',
    'Bengali': 'bn',
    'ગુજરાતી': 'gu',
    'Gujarati': 'gu',
  };
  return langMap[language] || 'en';
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

/**
 * Hook to get current translations
 */
export function useTranslations() {
  const { t, selectedLanguage } = useAppContext();
  return { t, language: selectedLanguage };
}
