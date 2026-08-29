"use client";

import { useTranslation } from "@/lib/i18n/context";
import Link from "next/link";

interface LegalPageLayoutProps {
  titleKey: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ titleKey, children }: LegalPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-16">
      {/* Centered title banner */}
      <div className="bg-gray-50 border-b border-border py-10 mb-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-black text-text uppercase tracking-wide">
            {t(titleKey)}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-text-muted">
            <Link href="/" className="hover:text-primary transition-colors">
              {t("footer.home")}
            </Link>
            <span>/</span>
            <span className="text-text">{t(titleKey)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 prose prose-sm prose-gray prose-headings:font-bold prose-headings:text-text prose-p:text-text-light prose-p:leading-relaxed prose-li:text-text-light">
        {children}
      </article>
    </div>
  );
}
