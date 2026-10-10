import React, { createContext, useContext, useState } from 'react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('krishisetu_lang');
      if (stored === 'en' || stored === 'ne') return stored;
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('krishisetu_lang', lang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  const t = (key: string, fallback?: string, params?: Record<string, string | number>): string => {
    const entry = TRANSLATIONS[key];
    let result = '';
    if (entry) {
      result = entry[language] || entry.en || fallback || key;
    } else {
      result = fallback || key;
    }

    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (k: string, fb?: string, params?: Record<string, string | number>) => {
        let res = fb || k;
        if (params && typeof res === 'string') {
          Object.entries(params).forEach(([pKey, pVal]) => {
            res = res.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
          });
        }
        return res;
      },
    };
  }
  return ctx;
};
