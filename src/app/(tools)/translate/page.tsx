// src/app/(tools)/translate/page.tsx
import TranslateClient from "@/features/translate/components/TranslateClient";
import PerformanceMonitorGate from "@/features/admin/components/performance/PerformanceMonitorGate";
import AdminUsagePanelGate from "@/features/admin/components/AdminUsagePanelGate";
import { cookies } from "next/headers";

export default async function Page() {
  const isDev = process.env.NODE_ENV === "development";
  const cookieStore = await cookies(); // Next 14.2+/15 async
  const hasCookie = cookieStore.get("dev_monitor")?.value === "1";

  // Dev -> ON; Prod -> butuh cookie admin
  const showAdmin = isDev || hasCookie;
  const showAdminPanel = hasCookie; 

  return (
    <div className="min-h-screen bg-white">
      <TranslateClient />
      {showAdmin && <PerformanceMonitorGate />}
      {showAdminPanel && (
        <AdminUsagePanelGate
          provider="deepl"
          unitsLabel="chars"
          title="DeepL Usage (Admin)"
        />
      )}
    </div>
  );
}
