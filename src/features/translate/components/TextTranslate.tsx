// src/features/translate/components/TextTranslate.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LanguageSelector } from "@/features/translate/components/partials/language-selector";
import TextInputPanel from "./partials/TextInputPanel";
import TextOutputPanel from "./partials/TextOutputPanel";
import { useTextTranslate } from "../hooks/useTextTranslate";

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

  const {
    inputText,
    outputText,
    errorMsg,
    loading,
    handleTextInput,
    clearAll,
  } = useTextTranslate({ sourceLang, targetLang, maxChars: MAX_CHARS });

  const copyToClipboard = useCallback(async (text: string, side: "input" | "output") => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 1800);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!outputText) return;
    const utter = new SpeechSynthesisUtterance(outputText);
    // Catatan: kalau mau presisi, map targetLang -> BCP-47 (mis. en-us, pt-br) sebelum set.
    utter.lang = targetLang;
    speechSynthesis.speak(utter);
  }, [outputText, targetLang]);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Shortcut: Ctrl/Cmd + K untuk swap
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
    <div className="w-full">
      {/* CARD: LanguageSelector + Panels menyatu */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
        {/* Header Language Selector */}
        <div className="border-b border-gray-200 bg-white">
          <LanguageSelector
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={onSourceChange}
            onTargetChange={onTargetChange}
            disableSwap={sourceLang === "auto"}
          />
        </div>

        {/* Konten: Input | Output (stack di mobile, berdampingan di desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y divide-gray-100 lg:divide-y-0 lg:divide-x">
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
    </div>
  );
}
