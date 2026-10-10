"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "../lib/i18n/translations";
const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {
  },
  t: (key) => key
});
function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookbridge_language");
      if (saved && (saved === "en" || saved === "ta" || saved === "hi")) {
        setLanguageState(saved);
      }
    } catch {
    }
  }, []);
  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("bookbridge_language", lang);
    } catch {
    }
  };
  const t = (key) => getTranslation(key, language);
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>;
}
function useLanguage() {
  return useContext(LanguageContext);
}
export {
  LanguageProvider,
  useLanguage
};
