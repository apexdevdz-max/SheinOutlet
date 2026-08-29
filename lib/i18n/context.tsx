"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import fr from "./translations/fr";
import en from "./translations/en";
import ar from "./translations/ar";

export type Lang = "fr" | "en" | "ar";

const translations: Record<Lang, Record<string, string>> = { fr, en, ar };

export const LANG_LABELS: Record<Lang, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

const COOKIE_KEY = "preferred-lang";

interface I18nContextType {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  dir: "ltr",
  setLang: () => {},
  t: (key) => translations.fr[key] || key,
});

interface LanguageProviderProps {
  children: React.ReactNode;
  /** Language read from cookie on the server — drives the initial render. */
  initialLang: Lang;
}

export function LanguageProvider({ children, initialLang }: LanguageProviderProps) {
  // initialLang comes from the server (cookie) so SSR + first client render agree.
  const [lang, setLangState] = useState<Lang>(initialLang);

  // On mount: if no cookie was set yet, detect browser language and persist it
  useEffect(() => {
    const hasCookie = document.cookie.includes(`${COOKIE_KEY}=`);
    if (!hasCookie) {
      const raw = navigator.language?.toLowerCase() || "";
      const detected: Lang = raw.startsWith("ar") ? "ar" : raw.startsWith("en") ? "en" : "fr";
      if (detected !== initialLang) {
        setLangState(detected);
        setCookieAndDOM(detected);
      }
    }
  }, [initialLang]);

  // Keep DOM attributes in sync whenever lang changes
  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    setCookieAndDOM(newLang);
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>): string => {
      let text = translations[lang]?.[key] || translations.fr[key] || key;
      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Set the cookie (1 year) + update DOM — called on explicit user switch. */
function setCookieAndDOM(lang: Lang) {
  document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

export function useTranslation() {
  return useContext(I18nContext);
}
