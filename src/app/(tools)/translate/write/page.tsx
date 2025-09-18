// src/app/(tools)/translate/write/page.tsx
import TranslateWritePage from "@/features/translate/components/pages/TranslateWritePage";
import TranslatePageLayout from "@/features/translate/components/layout/TranslatePageLayout";
import { generateTranslateMetadata } from "@/features/translate/utils/metadata";

export const metadata = generateTranslateMetadata("write");

export default async function WritePage() {
  return (
    <TranslatePageLayout>
      <TranslateWritePage />
    </TranslatePageLayout>
  );
}