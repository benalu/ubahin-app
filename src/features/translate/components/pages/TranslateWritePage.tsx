// src/features/translate/components/TranslateWritePage.tsx
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import TranslateNavigation from "@/features/translate/components/layout/TranslateNavigation";

const WriteAssistant = dynamic(() => import("@/features/translate/components/WriteAssistant"), {
  ssr: false,
  loading: () => (
    <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
  ),
});

export default function TranslateWritePage() {
  return (
    <>
      <TranslateNavigation />
      
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Suspense fallback={
          <div className="h-40 rounded-xl bg-gray-50 border border-gray-200 animate-pulse" />
        }>
          <WriteAssistant />
        </Suspense>
      </div>
    </>
  );
}