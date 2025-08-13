// src/features/admin/components/AdminUsagePanel.tsx
"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";

type DeepLOfficial = { character_count?: number; character_limit?: number };

type AdminUsageResponse = {
  provider: string;
  today: { day: string; units: number; reqs: number };
  last7: Array<{ day: string; units: number; reqs: number }>;
  dailyLimit: number;
  official?: DeepLOfficial; // untuk deepl
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error("Unauthorized or error");
    return r.json() as Promise<AdminUsageResponse>;
  });

export default function AdminUsagePanel({
  provider,
  unitsLabel = "units",
  title = "API Usage (Admin)",
}: {
  provider: string;
  unitsLabel?: string; // contoh: "chars", "credits", "MB"
  title?: string;
}) {
  const { data, error, mutate } = useSWR(`/api/admin/usage/${provider}`, fetcher, {
    refreshInterval: 5000,
  });
  const [limit, setLimit] = useState<number | "">("");

  useEffect(() => {
    if (data?.dailyLimit != null) setLimit(data.dailyLimit);
  }, [data?.dailyLimit]);

  if (error || !data) return null;

  const { today, last7, official } = data;

  return (
    <div className="fixed bottom-16 left-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm z-40">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>

      <div className="text-xs text-gray-700 space-y-2">
        <div>
          <div className="font-medium">Today</div>
          <div>
            {unitsLabel}: {today.units.toLocaleString()}
          </div>
          <div>Reqs: {today.reqs.toLocaleString()}</div>
        </div>

        {Array.isArray(last7) && (
          <div>
            <div className="font-medium">Last 7 days</div>
            <div className="max-h-24 overflow-auto pr-1">
              {last7.map((d) => (
                <div key={d.day} className="flex justify-between">
                  <span>{d.day}</span>
                  <span>
                    {d.units.toLocaleString()} {unitsLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="font-medium">Daily Limit</div>
          <div className="flex gap-2 items-center">
            <input
              className="border rounded px-2 py-1 text-sm w-28"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0 = unlimited"
            />
            <button
              className="px-2 py-1 rounded bg-gray-900 text-white text-xs"
              onClick={async () => {
                await fetch(`/api/admin/usage/${provider}`, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ dailyLimit: limit === "" ? 0 : Number(limit) }),
                });
                mutate();
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Khusus DeepL: tampilkan angka resmi jika ada */}
        {official && data.provider === "deepl" && (
          <div>
            <div className="font-medium">DeepL Official</div>
            <div>Used: {Number((official as DeepLOfficial).character_count ?? 0).toLocaleString()}</div>
            <div>Limit: {Number((official as DeepLOfficial).character_limit ?? 0).toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
