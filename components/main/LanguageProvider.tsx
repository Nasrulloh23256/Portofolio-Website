"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "@/constants/translations";

type LanguageContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const storedLanguageKey = "portfolio-language";

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>("id");

    useEffect(() => {
        const stored = window.localStorage.getItem(storedLanguageKey);
        if (stored === "en" || stored === "id") {
            setLanguage(stored);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem(storedLanguageKey, language);
        document.documentElement.lang = language;
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((current) => (current === "en" ? "id" : "en"));
    };

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            toggleLanguage,
        }),
        [language]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};
