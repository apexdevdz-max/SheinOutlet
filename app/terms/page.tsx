"use client";

import { LegalPageLayout } from "@/components/LegalPageLayout";
import { useTranslation } from "@/lib/i18n/context";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout titleKey="footer.terms">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <div key={n}>
          <h2>{t(`legal.terms.${n}.title`)}</h2>
          <p>{t(`legal.terms.${n}.text`)}</p>
        </div>
      ))}
    </LegalPageLayout>
  );
}
