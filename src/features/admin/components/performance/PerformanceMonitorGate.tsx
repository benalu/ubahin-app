// src/features/translate/components/PerformanceMonitorGate.tsx
"use client";

import dynamic from "next/dynamic";

const PerformanceMonitor = dynamic(
  () => import("./PerformanceMonitor"),
  { ssr: false, loading: () => null }
);

export default function PerformanceMonitorGate() {
  return <PerformanceMonitor />;
}
