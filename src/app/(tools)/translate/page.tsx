// src/app/(tools)/translate/page.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Type,
  FileText,
  Sparkles,
} from "lucide-react";

import Dropzone from "@/features/translate/components/Dropzone";
import LanguageSelector from "@/features/translate/components/partials/LanguageSelector";
import TextPanel from "@/features/translate/components/partials/TextPanel";
import OutputPanel from "@/features/translate/components/partials/OutputPanel";

import { LANGUAGES, getLangData } from "@/features/translate/constants/languages";
import { autoResize } from "@/features/translate/utils/autoResize";
import type { LangCode, TabKey, ThinFile } from "@/features/translate/types";

const MAX_CHARS = 5000;

export default function ModernTranslator() {
  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const [sourceLang, setSourceLang] = useState<LangCode>("auto");
  const [targetLang, setTargetLang] = useState<LangCode>("en");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [files, setFiles] = useState<ThinFile[]>([]);
  const [copiedSide, setCopiedSide] = useState<"input" | "output" | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const swapLanguages = useCallback(() => {
    if (sourceLang !== "auto") {
      const newSource = targetLang;
      const newTarget = sourceLang;
      setSourceLang(newSource);
      setTargetLang(newTarget);

      // Swap text content
      const temp = inputText;
      setInputText(outputText);
      setOutputText(temp);
    }
  }, [sourceLang, targetLang, inputText, outputText]);

  const copyToClipboard = useCallback(
    async (text: string, side: "input" | "output") => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopiedSide(side);
        setTimeout(() => setCopiedSide(null), 1800);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    },
    []
  );

  const handleTextInput = useCallback(
    (value: string) => {
      const truncated = value.slice(0, MAX_CHARS + 100);
      setInputText(truncated);

      // Simulate translation
      setTimeout(() => {
        if (truncated.trim()) {
          setOutputText(`[${getLangData(targetLang).label}] ${truncated}`);
        } else {
          setOutputText("");
        }
      }, 350);
    },
    [targetLang]
  );

  const handleSpeak = useCallback(() => {
    if (!outputText) return;
    const utterance = new SpeechSynthesisUtterance(outputText);
    // Catatan: mapping lang -> BCP-47 voice code perlu disesuaikan di implementasi final
    utterance.lang = targetLang;
    speechSynthesis.speak(utterance);
  }, [outputText, targetLang]);

  // File handlers (tetap di parent)
  const handleFileUpload = useCallback((fileList: FileList) => {
    const newFiles: ThinFile[] = Array.from(fileList).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const clearAll = useCallback(() => {
    setInputText("");
    setOutputText("");
    setFiles([]);
  }, []);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav Tabs */}
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              {[
                { key: "text" as TabKey, icon: Type, label: "Text" },
                { key: "file" as TabKey, icon: FileText, label: "Documents" },
                { key: "write" as TabKey, icon: Sparkles, label: "Writing" },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                    activeTab === key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* TEXT MODE */}
        {activeTab === "text" && (
          <div className="space-y-6">
            {/* Language bar */}
            <div className="flex items-center justify-center gap-4">
              <LanguageSelector
                value={sourceLang}
                onChange={setSourceLang}
                className="flex-1 max-w-[200px]"
              />

              <button
                onClick={swapLanguages}
                disabled={sourceLang === "auto"}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Swap languages"
              >
                <ArrowLeftRight className="h-5 w-5 text-gray-600" />
              </button>

              <LanguageSelector
                value={targetLang}
                onChange={setTargetLang}
                exclude={["auto"]}
                className="flex-1 max-w-[200px]"
              />
            </div>

            {/* Panels */}
            <div className="grid gap-0 lg:grid-cols-2 border border-gray-200 rounded-xl overflow-hidden">
              <TextPanel
                ref={inputRef}
                value={inputText}
                placeholder="Enter text"
                onChange={(v, el) => {
                  handleTextInput(v);
                  if (el) autoResize(el);
                }}
                onCopy={() => copyToClipboard(inputText, "input")}
                onClear={clearAll}
                charCount={charCount}
                maxChars={MAX_CHARS}
                isOverLimit={isOverLimit}
              />

              <OutputPanel
                text={outputText}
                onCopy={() => copyToClipboard(outputText, "output")}
                onSpeak={handleSpeak}
                length={outputText.length}
                isCopied={copiedSide === "output"}
              />
            </div>
          </div>
        )}

        {/* FILE MODE */}
        {activeTab === "file" && (
          <div className="space-y-6">
            {/* Language Selection for Files */}
            <div className="flex items-center justify-center gap-4">
              <LanguageSelector
                value={sourceLang}
                onChange={setSourceLang}
                className="flex-1 max-w-[200px]"
              />

              <ArrowLeftRight className="h-5 w-5 text-gray-400" />

              <LanguageSelector
                value={targetLang}
                onChange={setTargetLang}
                exclude={["auto"]}
                className="flex-1 max-w-[200px]"
              />
            </div>

            {/* Modular Dropzone */}
            <Dropzone
              files={files}
              onAddFiles={handleFileUpload}
              onRemoveFile={(index) =>
                setFiles((prev) => prev.filter((_, i) => i !== index))
              }
              onClearAll={() => setFiles([])}
              onTranslate={() => {
                // TODO: sambungkan ke flow translate dokumenmu
                console.log("Translate these files:", files);
              }}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              multiple
            />
          </div>
        )}

        {/* WRITING MODE (placeholder) */}
        {activeTab === "write" && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                AI Writing Assistant
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enhance your writing with AI-powered tools for grammar, style, and translation assistance.
              </p>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Coming soon with advanced features</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
