// src/features/translate/components/PerformanceMonitor.tsx
"use client";

import { useState, useEffect } from "react";
import { translationCache } from "@/lib/cache/translationCache";
import { translationDeduplicator } from "@/lib/performance/requestDeduplication";

// ---- Non‑standard DOM typings (Chrome-only) ----
type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";

interface NetworkInformation {
  effectiveType?: EffectiveConnectionType;
  downlink?: number; // Mbps
  rtt?: number; // ms
  saveData?: boolean;
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

declare global {
  // optional chaining-friendly navigator.connection
  interface Navigator {
    connection?: NetworkInformation;
  }
}

interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cacheStats: ReturnType<typeof translationCache.getStats>;
  deduplicationStats: ReturnType<typeof translationDeduplicator.getStats>;
  networkStats: {
    onlineStatus: boolean;
    effectiveType?: EffectiveConnectionType;
    downlink?: number;
  };
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const readMemory = () => {
      const mem = (performance as Performance & { memory?: PerformanceMemory }).memory;
      if (!mem) {
        return { used: 0, total: 0, percentage: 0 };
      }
      const usedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(mem.totalJSHeapSize / 1024 / 1024);
      const pct = mem.totalJSHeapSize > 0
        ? Math.round((mem.usedJSHeapSize / mem.totalJSHeapSize) * 100)
        : 0;
      return { used: usedMB, total: totalMB, percentage: pct };
    };

    const readNetwork = () => {
      const conn = navigator.connection;
      return {
        onlineStatus: navigator.onLine,
        effectiveType: conn?.effectiveType,
        downlink: conn?.downlink,
      };
    };

    const updateMetrics = () => {
      setMetrics({
        memoryUsage: readMemory(),
        cacheStats: translationCache.getStats(),
        deduplicationStats: translationDeduplicator.getStats(),
        networkStats: readNetwork(),
      });
    };

    // initial read
    updateMetrics();

    // periodic polling (lightweight)
    const interval = setInterval(updateMetrics, 2000);

    // react to online/offline + connection changes
    const handleOnline = () => updateMetrics();
    const handleOffline = () => updateMetrics();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const conn = navigator.connection;
    const handleConnChange: EventListener = () => updateMetrics();
    conn?.addEventListener?.("change", handleConnChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      conn?.removeEventListener?.("change", handleConnChange);
    };
  }, []);

  if (process.env.NODE_ENV !== "development" || !metrics) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible((v) => !v)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm z-40">
          <h3 className="font-semibold text-gray-900 mb-3">Performance Monitor</h3>

          {/* Memory Usage */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Memory Usage</span>
              <span>
                {metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                style={{ width: `${metrics.memoryUsage.percentage}%` }}
              />
            </div>
          </div>

          {/* Cache Performance */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Cache Performance</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Text Hit Rate:</span>
                <span>{Math.round(metrics.cacheStats.textHitRate * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Size:</span>
                <span>{metrics.cacheStats.text.size} items</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hits:</span>
                <span>{metrics.cacheStats.text.hits}</span>
              </div>
            </div>
          </div>

          {/* Network Stats */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Network</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={metrics.networkStats.onlineStatus ? "text-green-600" : "text-red-600"}>
                  {metrics.networkStats.onlineStatus ? "Online" : "Offline"}
                </span>
              </div>
              {metrics.networkStats.effectiveType && (
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span>{metrics.networkStats.effectiveType}</span>
                </div>
              )}
              {typeof metrics.networkStats.downlink === "number" && (
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span>{metrics.networkStats.downlink} Mbps</span>
                </div>
              )}
            </div>
          </div>

          {/* Request Deduplication */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Request Deduplication</h4>
            <div className="text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Pending:</span>
                <span>{metrics.deduplicationStats.pendingCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
