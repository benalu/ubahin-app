// src/features/admin/components/AdminUsagePanelGate.tsx
"use client";

import dynamic from "next/dynamic";

const AdminUsagePanel = dynamic(
  () => import("./AdminUsagePanel"),
  { ssr: false, loading: () => null }
);

export default function AdminUsagePanelGate(
  props: { provider: string; unitsLabel?: string; title?: string }
) {
  return <AdminUsagePanel {...props} />;
}
