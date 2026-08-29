"use client";

import { LegalPageLayout } from "@/components/LegalPageLayout";
import { useTranslation } from "@/lib/i18n/context";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout titleKey="footer.privacy">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <div key={n}>
          <h2>{t(`legal.privacy.${n}.title`)}</h2>
          <p>{t(`legal.privacy.${n}.text`)}</p>
        </div>
      ))}
    </LegalPageLayout>
  );
}
