// src/features/translate/components/TranslateFilePage.tsx
"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import TranslateNavigation from "@/features/translate/components/layout/TranslateNavigation";
import type { LangCode } from "@/features/translate/constants/languages";

const FileTranslate = dynamic(() => import("@/features/translate/components/FileTranslate"), {
  ssr: false,
  loading: () => (
    <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
  ),
});

export default function TranslateFilePage() {
  const [sourceLang, setSourceLang] = useState<LangCode>("auto");
  const [targetLang, setTargetLang] = useState<LangCode>("en");

  return (
    <>
      <TranslateNavigation />
      
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Suspense fallback={
          <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
        }>
          <FileTranslate
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
          />
        </Suspense>
      </div>
    </>
  );
}