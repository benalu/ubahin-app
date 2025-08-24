// src/features/translate/components/TranslateClient.tsx
"use client";

import { Suspense, useCallback, useState, ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  TextTranslate,
  TabNav,
} from "@/features/translate/components";
import type { LangCode } from "@/features/translate/constants/languages";
import { LANGUAGES } from "@/features/translate/constants/languages";
import { Icons } from "@/ui/icons";

/** Lazy parts */
const FileTranslate = dynamic(
  () => import("@/features/translate/components/FileTranslate"),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
    ),
  }
);

const WriteAssistantLazy = dynamic(
  () => import("@/features/translate/components/WriteAssistant"),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
    ),
  }
);

type TabKey = "teks" | "file" | "write";

/** Panel sederhana; tidak memaksakan ARIA pairing id karena TabNav membuat id unik. */
function Panel({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return <section hidden={!active} className={active ? "" : "hidden"}>{children}</section>;
}

export default function TranslateClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("teks");
  const [sourceLang, setSourceLang] = useState<LangCode>("auto");
  const [targetLang, setTargetLang] = useState<LangCode>("en");

  const swapLanguages = useCallback(() => {
    if (sourceLang === "auto") return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }, [sourceLang, targetLang]);

  // jumlah bahasa (tanpa 'auto')
  const langCount = LANGUAGES.filter(l => l.value !== "auto").length;

  const tabs = [
    {
      key: "teks",
      icon: Icons.tabText,
      label: "Menerjemahkan teks",
      subLabel: `${langCount} bahasa`,
    },
    {
      key: "file",
      icon: Icons.tabFile,
      label: "Menerjemahkan berkas",
      subLabel: ".pdf, .docx, .pptx",
    },
    {
      key: "write",
      icon: Icons.tabWrite,
      label: "DeepL Write",
      subLabel: "Pengeditan AI",
    },
  ] as const;

  return (
    <>
      {/* NAV */}
      <div className="mx-auto max-w-3xl px-8 pt-4">
        <TabNav
          tabs={tabs.map(t => ({
            key: t.key,
            label: t.label,
            subLabel: t.subLabel,
            icon: t.icon,
          }))}
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as TabKey)}
        />
      </div>

      {/* PANELS */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Panel active={activeTab === "teks"}>
          <TextTranslate
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={swapLanguages}
          />
        </Panel>

        <Panel active={activeTab === "file"}>
          <Suspense
            fallback={
              <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
            }
          >
            <FileTranslate
              sourceLang={sourceLang}
              targetLang={targetLang}
              onSourceChange={setSourceLang}
              onTargetChange={setTargetLang}
            />
          </Suspense>
        </Panel>

        <Panel active={activeTab === "write"}>
          <Suspense
            fallback={
              <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
            }
          >
            <WriteAssistantLazy />
          </Suspense>
        </Panel>
      </div>
    </>
  );
}
