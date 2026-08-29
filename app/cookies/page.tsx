"use client";

import { LegalPageLayout } from "@/components/LegalPageLayout";
import { useTranslation } from "@/lib/i18n/context";

export default function CookiesPage() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout titleKey="footer.cookies">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n}>
          <h2>{t(`legal.cookies.${n}.title`)}</h2>
          <p>{t(`legal.cookies.${n}.text`)}</p>
        </div>
      ))}
    </LegalPageLayout>
  );
}
