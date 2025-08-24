// src/features/translate/components/partials/LanguageSelector/index.tsx

"use client";

import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { normalizeUiCode, buildSourceOptions, buildTargetOptions } from "@/lib/constants/lang";
import LangSelect from "./parts/LangSelect";

type Props = {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (v: string) => void;
  onTargetChange: (v: string) => void;
  disableSwap?: boolean;
};

function LanguageSelector({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  disableSwap,
}: Props) {
  // prebuilt daftar (sudah konsisten dengan DeepL)
  const sourceOptions = useMemo(() => buildSourceOptions(), []);
  const targetOptions = useMemo(() => buildTargetOptions(), []);

  const handleSwap = useCallback(() => {
    if (disableSwap) return;
    const s = sourceLang;
    onSourceChange(targetLang);
    onTargetChange(s);
  }, [disableSwap, sourceLang, targetLang, onSourceChange, onTargetChange]);

  // jika user simpan base "en"/"pt", tampilkan varian default di UI
  const displayTargetValue = useMemo(() => {
    const v = targetLang.toLowerCase();
    if (v === "en") return "en-us";
    if (v === "pt") return "pt-br";
    return normalizeUiCode(targetLang, "target");
  }, [targetLang]);

  return (
    <div
      className="
        grid w-full items-center
        px-2 py-0.5 sm:py-1
        grid-cols-1 gap-1 sm:gap-1
        sm:grid-cols-[1fr_auto_1fr]
      "
    >
      {/* Source */}
      <div className="min-w-0 sm:justify-self-end">
        <LangSelect
          mode="source"
          value={sourceLang}
          onChange={onSourceChange}
          options={sourceOptions}
          placeholder="Deteksi bahasa"
          openLabelForAuto="Pilih bahasa"
          highlightAutoWhenOpen
        />
      </div>

      {/* Swap */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="swap"
          className="bg-white"
          onClick={handleSwap}
          disabled={disableSwap}
          title="Swap (Ctrl/Cmd+K)"
          aria-label="Tukar bahasa"
        >
          <ArrowLeftRight className="text-gray-700" />
        </Button>
      </div>

      {/* Target */}
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
}

export default memo(LanguageSelector);
