// src/features/translate/components/TranslateTextPage.tsx
"use client";

import { useState, useCallback } from "react";
import TextTranslate from "@/features/translate/components/TextTranslate";
import TranslateNavigation from "@/features/translate/components/layout/TranslateNavigation";
import type { LangCode } from "@/features/translate/constants/languages";

export default function TranslateTextPage() {
  const [sourceLang, setSourceLang] = useState<LangCode>("auto");
  const [targetLang, setTargetLang] = useState<LangCode>("en");

  const swapLanguages = useCallback(() => {
    if (sourceLang === "auto") return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }, [sourceLang, targetLang]);

  return (
    <>
      <TranslateNavigation />
      
      <div className="mx-auto max-w-5xl px-4 py-12">
        <TextTranslate
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSourceChange={setSourceLang}
          onTargetChange={setTargetLang}
          onSwap={swapLanguages}
        />
      </div>
    </>
  );
}