// src/features/translate/components/partials/language-selector/LanguageSelector.tsx

import { memo } from "react";
import LangSelect from "./LangSelect";
import SwapButton from "./SwapButton";
import { 
  useLanguageOptions, 
  useLanguageSwap, 
  useDisplayValue 
} from "@/features/translate/hooks/useLanguageSelector";
import type { LanguageSelectorProps } from "@/features/translate/types/languageSelector";

const LanguageSelector = memo(function LanguageSelector({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  disableSwap,
}: LanguageSelectorProps) {
  const { sourceOptions, targetOptions } = useLanguageOptions();
  const { handleSwap } = useLanguageSwap(
    sourceLang,
    targetLang,
    onSourceChange,
    onTargetChange,
    disableSwap
  );
  const displayTargetValue = useDisplayValue(targetLang, "target");

  return (
    <div
      className="
        grid w-full items-center
        px-2 py-0.5 sm:py-1
        grid-cols-1 gap-1 sm:gap-1
        sm:grid-cols-[1fr_auto_1fr]
      "
    >
      {/* Source Language Selector */}
      <div className="min-w-0 sm:justify-self-end">
        <LangSelect
          mode="source"
          value={sourceLang}
          onChange={onSourceChange}
          options={sourceOptions}
          placeholder="Deteksi Bahasa"
          openLabelForAuto="Pilih bahasa sumber"
          highlightAutoWhenOpen
        />
      </div>

      {/* Swap Button */}
      <SwapButton onSwap={handleSwap} disabled={disableSwap} />

      {/* Target Language Selector */}
      <div className="min-w-0 sm:justify-self-start">
        <LangSelect
          mode="target"
          value={displayTargetValue}
          onChange={onTargetChange}
          options={targetOptions}
          placeholder="Pilih bahasa"
          openLabel="Pilih bahasa sasaran"
          highlightWhenOpen
        />
      </div>
    </div>
  );
});

export default LanguageSelector;