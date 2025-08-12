// src/features/translate/components/TextTranslate.tsx
"use client";

import { useCallback, useState, type ComponentType } from "react";
import LanguageBar from "./partials/LanguageBar";
import TextInputPanel from "./partials/TextInputPanel";
import TextOutputPanel from "./partials/TextOutputPanel";
import { useTextTranslate } from "../hooks/useTextTranslate";

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

const MAX_CHARS = 5000;

export default function TextTranslate({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
  LanguageSelector,
}: Props) {
  const [copiedSide, setCopiedSide] = useState<"input" | "output" | null>(null);

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
    utter.lang = targetLang;
    speechSynthesis.speak(utter);
  }, [outputText, targetLang]);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="space-y-6">
      <LanguageBar
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        onSwap={onSwap}
        LanguageSelector={LanguageSelector}
      />

      <div className="grid gap-0 lg:grid-cols-2 border border-gray-200 rounded-xl overflow-hidden">
        <TextInputPanel
          value={inputText}
          onChange={handleTextInput}
          onCopy={() => void copyToClipboard(inputText, "input")}
          onClear={clearAll}
          isCopied={copiedSide === "input"}
          charCount={charCount}
          maxChars={MAX_CHARS}
          isOverLimit={isOverLimit}
        />

        <TextOutputPanel
          text={outputText}
          loading={loading}
          errorMsg={errorMsg}
          onCopy={() => void copyToClipboard(outputText, "output")}
          onSpeak={handleSpeak}
          isCopied={copiedSide === "output"}
        />
      </div>
    </div>
  );
}
