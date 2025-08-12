// src/features/translate/components/TranslateClient.tsx
"use client";

import { useCallback, useState, Suspense } from "react";
import dynamic from "next/dynamic";

import {
  TextTranslate,
  LanguageSelector,
  TabNav,
  WriteAssistant, // <- optional fallback kalau mau non-dynamic
} from "@/features/translate/components";
import type { LangCode } from "@/features/translate/constants/languages";
import { Icons } from "@/ui/icons";

// ✅ Pisah tab berat
const FileTranslate = dynamic(
  () => import("@/features/translate/components/FileTranslate"),
  { ssr: false, loading: () => <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" /> }
);
const WriteAssistantLazy = dynamic(
  () => import("@/features/translate/components/WriteAssistant"),
  { ssr: false, loading: () => <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" /> }
);

type TabKey = "text" | "file" | "write";

export default function TranslateClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const [sourceLang, setSourceLang] = useState<LangCode>("auto");
  const [targetLang, setTargetLang] = useState<LangCode>("en");

  const swapLanguages = useCallback(() => {
    if (sourceLang !== "auto") {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
  }, [sourceLang, targetLang]);

  const tabs = [
    { key: "text", icon: Icons.tabText, label: "Text" },
    { key: "file", icon: Icons.tabFile, label: "Documents" },
    { key: "write", icon: Icons.tabWrite, label: "Writing" },
  ] as const;

  return (
    <>
      {/* Top nav (kecil & ringan) */}
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between py-4">
            <TabNav
              tabs={tabs.map(t => ({ key: t.key, label: t.label, icon: t.icon }))}
              activeKey={activeTab}
              onChange={(k) => setActiveTab(k as TabKey)}
            />
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {activeTab === "text" && (
          <TextTranslate
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={swapLanguages}
            LanguageSelector={LanguageSelector}
          />
        )}

        {activeTab === "file" && (
          <Suspense fallback={<div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />}>
            <FileTranslate
              sourceLang={sourceLang}
              targetLang={targetLang}
              onSourceChange={setSourceLang}
              onTargetChange={setTargetLang}
              LanguageSelector={LanguageSelector}
            />
          </Suspense>
        )}

        {activeTab === "write" && (
          <Suspense fallback={<div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />}>
            <WriteAssistantLazy />
            {/* atau pakai <WriteAssistant /> kalau nggak mau dynamic */}
          </Suspense>
        )}
      </div>
    </>
  );
}
