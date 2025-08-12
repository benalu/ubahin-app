// src/features/translate/components/partials/LanguageBar.tsx
"use client";

import { ArrowLeftRight } from "lucide-react";
import type { ComponentType } from "react";

type LangCode = string;

type LanguageSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  exclude?: string[];
  className?: string;
};

type Props = {
  sourceLang: LangCode;
  targetLang: LangCode;
  onSourceChange: (v: LangCode) => void;
  onTargetChange: (v: LangCode) => void;
  onSwap: () => void;
  LanguageSelector: ComponentType<LanguageSelectorProps>;
};

export default function LanguageBar({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
  LanguageSelector,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-4">
      <LanguageSelector
        value={sourceLang}
        onChange={onSourceChange}
        className="flex-1 max-w-[200px]"
      />

      <button
        onClick={onSwap}
        disabled={sourceLang === "auto"}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Swap languages"
        aria-label="Swap languages"
      >
        <ArrowLeftRight className="h-5 w-5 text-gray-600" />
      </button>

      <LanguageSelector
        value={targetLang}
        onChange={onTargetChange}
        exclude={["auto"]}
        className="flex-1 max-w-[200px]"
      />
    </div>
  );
}
