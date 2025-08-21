// src/features/translate/components/TextTranslate.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LanguageSelector from "./partials/LanguageSelector";
import TextInputPanel from "./partials/TextInputPanel";
import TextOutputPanel from "./partials/TextOutputPanel";
import { useTextTranslate } from "../hooks/useTextTranslate";
import { LANGUAGES } from "@/features/translate/constants/languages";

type LangCode = string;

type Props = {
  sourceLang: LangCode;
  targetLang: LangCode;
  onSourceChange: (v: LangCode) => void;
  onTargetChange: (v: LangCode) => void;
  onSwap?: () => void;
};

const MAX_CHARS = 5000;

export default function TextTranslate({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}: Props) {
  const [copiedSide, setCopiedSide] = useState<"input" | "output" | null>(null);

  // Filter 'auto' di caller (Bar juga punya dedup sebagai guard kedua)
  const languages = useMemo(
    () => LANGUAGES.filter(l => l.value !== "auto").map(l => ({ code: l.value, label: l.label })),
    []
  );

  const { inputText, outputText, errorMsg, loading, handleTextInput, clearAll } =
    useTextTranslate({ sourceLang, targetLang, maxChars: MAX_CHARS });

  const copyToClipboard = useCallback(async (text: string, side: "input" | "output") => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 1800);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!outputText) return;
    const utter = new SpeechSynthesisUtterance(outputText);
    utter.lang = targetLang; // map ke "en-US" dsb bila perlu
    speechSynthesis.speak(utter);
  }, [outputText, targetLang]);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (onSwap) onSwap();
        else if (sourceLang !== "auto") {
          const s = sourceLang;
          onSourceChange(targetLang);
          onTargetChange(s);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSwap, onSourceChange, onTargetChange, sourceLang, targetLang]);

  return (
    <div className="space-y-6">
      <LanguageSelector
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        options={languages}
        disableSwap={sourceLang === "auto"}
      />

      <div className="grid gap-0 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 border border-gray-200 rounded-xl overflow-hidden">
        <TextInputPanel
          value={inputText}
          onChange={handleTextInput}
          onCopy={() => void copyToClipboard(inputText, "input")}
          onClear={clearAll}
          isCopied={copiedSide === "input"}
          charCount={charCount}
          maxChars={MAX_CHARS}
          isOverLimit={isOverLimit}
          stickyActionBar
        />

        <TextOutputPanel
          text={outputText}
          loading={loading}
          errorMsg={errorMsg}
          onCopy={() => void copyToClipboard(outputText, "output")}
          onSpeak={handleSpeak}
          isCopied={copiedSide === "output"}
          stickyActionBar
        />
      </div>
    </div>
  );
}
