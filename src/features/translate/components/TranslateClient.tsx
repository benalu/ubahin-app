// src/features/translate/components/TranslateClient.tsx
"use client";

import { Suspense, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import {
  TextTranslate,
  TabNav,
  // WriteAssistant, // kalau mau non-lazy
} from "@/features/translate/components";
import type { LangCode } from "@/features/translate/constants/languages";
import { Icons } from "@/ui/icons";

const FileTranslate = dynamic(
  () => import("@/features/translate/components/FileTranslate"),
  { ssr: false, loading: () => <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" /> }
);

const WriteAssistantLazy = dynamic(
  () => import("@/features/translate/components/WriteAssistant"),
  { ssr: false, loading: () => <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" /> }
);

type TabKey = "teks" | "file" | "write";

export default function TranslateClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("teks");
  const [sourceLang, setSourceLang] = useState<LangCode>("auto");
  const [targetLang, setTargetLang] = useState<LangCode>("en");

  const swapLanguages = useCallback(() => {
    if (sourceLang === "auto") return; // proteksi swap
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }, [sourceLang, targetLang]);

  const tabs = [
    { key: "teks", icon: Icons.tabText, label: "Teks" },
    { key: "file", icon: Icons.tabFile, label: "Dokumen" },
    { key: "write", icon: Icons.tabWrite, label: "Writing" },
  ] as const;

  return (
    <>
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

      <div className="mx-auto max-w-5xl px-4 py-8">
        {activeTab === "teks" && (
          <TextTranslate
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={swapLanguages}
          />
        )}

        {activeTab === "file" && (
          <Suspense fallback={<div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />}>
            <FileTranslate
              sourceLang={sourceLang}
              targetLang={targetLang}
              onSourceChange={setSourceLang}
              onTargetChange={setTargetLang}
            />
          </Suspense>
        )}

        {activeTab === "write" && (
          <Suspense fallback={<div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />}>
            <WriteAssistantLazy />
            {/* atau pakai <WriteAssistant /> */}
          </Suspense>
        )}
      </div>
    </>
  );
}

