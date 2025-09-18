import TranslateTextPage from "@/features/translate/components/pages/TranslateTextPage";
import TranslatePageLayout from "@/features/translate/components/layout/TranslatePageLayout";
import { generateTranslateMetadata } from "@/features/translate/utils/metadata";

// Auto-generated from TABS config - SSOT
export const metadata = generateTranslateMetadata("teks");

export default async function Page() {
  return (
    <TranslatePageLayout>
      <TranslateTextPage />
    </TranslatePageLayout>
  );
}