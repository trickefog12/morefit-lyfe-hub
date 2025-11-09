import { createContext, useContext, useState, ReactNode } from "react";

type Language = "el" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  el: {
    home: "Αρχική",
    programs: "Προγράμματα",
    nutrition: "Διατροφή",
    signup: "Εγγραφή",
    hero_title: "Μεταμορφώσου με Δύναμη",
    hero_subtitle: "Εξατομικευμένα προγράμματα προπόνησης δύναμης και διατροφής που φέρνουν αποτελέσματα",
    hero_cta: "Ξεκίνα Τώρα",
    // Add more translations as needed
  },
  en: {
    home: "Home",
    programs: "Programs",
    nutrition: "Nutrition",
    signup: "Sign Up",
    hero_title: "Transform with Strength",
    hero_subtitle: "Personalized strength training and nutrition programs that deliver results",
    hero_cta: "Start Now",
    // Add more translations as needed
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("el");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "el" ? "en" : "el"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.el] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
