// src/app/(tools)/translate/files/page.tsx
import TranslateFilePage from "@/features/translate/components/pages/TranslateFilePage";
import TranslatePageLayout from "@/features/translate/components/layout/TranslatePageLayout";
import { generateTranslateMetadata } from "@/features/translate/utils/metadata";

export const metadata = generateTranslateMetadata("file");

export default async function FilesPage() {
  return (
    <TranslatePageLayout>
      <TranslateFilePage />
    </TranslatePageLayout>
  );
}