"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/context";
import { useRef } from "react";

/**
 * Forces French (LTR) in the admin panel.
 * On mount: saves the user's current lang choice and switches to "fr".
 * On unmount: restores the user's previous lang choice.
 * Also forces dir="ltr" on the <html> element while admin is active.
 */
export function AdminLangGuard({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useTranslation();
  const savedLang = useRef<Lang | null>(null);

  useEffect(() => {
    // Save the user's current language on mount
    if (savedLang.current === null) {
      savedLang.current = lang;
    }

    // Force French + LTR for admin
    if (lang !== "fr") {
      setLang("fr");
    }
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "fr";

    // Cleanup: restore user's language when leaving admin
    return () => {
      const restoreLang = savedLang.current || "fr";
      // We need to defer this so it doesn't conflict with unmount
      setTimeout(() => {
        // Only restore if we're actually leaving admin (not just re-rendering)
        if (!window.location.pathname.startsWith("/admin")) {
          document.documentElement.lang = restoreLang;
          document.documentElement.dir = restoreLang === "ar" ? "rtl" : "ltr";
        }
      }, 0);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Override dir on any lang change while in admin
  useEffect(() => {
    if (lang !== "fr") {
      setLang("fr");
    }
    document.documentElement.dir = "ltr";
  }, [lang, setLang]);

  return (
    <div dir="ltr" style={{ direction: "ltr", textAlign: "left" }}>
      {children}
    </div>
  );
}
