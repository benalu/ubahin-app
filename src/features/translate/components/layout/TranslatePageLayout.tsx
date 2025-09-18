// src/features/translate/components/layout/TranslatePageLayout.tsx
import PerformanceMonitorGate from "@/features/admin/components/performance/PerformanceMonitorGate";
import AdminUsagePanelGate from "@/features/admin/components/AdminUsagePanelGate";
import { cookies } from "next/headers";
import { ReactNode } from "react";

// Configuration for admin panels - centralized and configurable
const ADMIN_CONFIG = {
  cookieName: "dev_monitor",
  cookieValue: "1",
  usagePanel: {
    provider: "deepl" as const,
    unitsLabel: "chars" as const,
    title: "DeepL Usage (Admin)",
  },
} as const;

type TranslatePageLayoutProps = {
  children: ReactNode;
  className?: string;
  enableAdmin?: boolean;
  adminConfig?: Partial<typeof ADMIN_CONFIG.usagePanel>;
};

/**
 * Shared layout for all translate pages with admin panels
 * Handles admin visibility logic and provides consistent structure
 */
export default async function TranslatePageLayout({ 
  children, 
  className = "min-h-screen bg-white",
  enableAdmin = true,
  adminConfig = {},
}: TranslatePageLayoutProps) {
  // Admin visibility logic - extracted to reusable function
  const { showAdmin, showAdminPanel } = await getAdminVisibility();
  
  // Merge admin config with defaults
  const finalAdminConfig = { ...ADMIN_CONFIG.usagePanel, ...adminConfig };

  return (
    <div className={className}>
      {children}
      
      {enableAdmin && showAdmin && <PerformanceMonitorGate />}
      
      {enableAdmin && showAdminPanel && (
        <AdminUsagePanelGate
          provider={finalAdminConfig.provider}
          unitsLabel={finalAdminConfig.unitsLabel}
          title={finalAdminConfig.title}
        />
      )}
    </div>
  );
}

/**
 * Extracted admin visibility logic - reusable and testable
 */
async function getAdminVisibility() {
  const isDev = process.env.NODE_ENV === "development";
  const cookieStore = await cookies();
  const hasCookie = cookieStore.get(ADMIN_CONFIG.cookieName)?.value === ADMIN_CONFIG.cookieValue;

  return {
    showAdmin: isDev || hasCookie,
    showAdminPanel: hasCookie,
    isDev,
    hasCookie,
  };
}

// Export for potential use in other components
export { getAdminVisibility, ADMIN_CONFIG };