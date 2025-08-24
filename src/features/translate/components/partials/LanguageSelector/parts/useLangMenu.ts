// src/features/translate/components/partials/LanguageSelector/parts/useLangMenu.ts
"use client";

import { useMemo } from "react";
import {
  normalizeUiCode,
  POPULAR_LIMIT,
  POPULAR_UI_ORDER,
  getDisplayLabelFor,
} from "@/lib/constants/lang";
import { useSortedLanguages, getColumnLayout } from "@/utils/languageSorting";
import type { Option } from "./LangSelect";

const lc = (s: string) => (s || "").toLowerCase();

function dedupByCode(list: Option[]) {
  const m = new Map<string, Option>();
  for (const o of list) {
    const key = lc(o.code);
    if (!m.has(key)) m.set(key, { ...o, code: key });
  }
  return Array.from(m.values());
}

function resolvePopularForMode(raw: string, all: Map<string, Option>, mode: "source" | "target") {
  const key = lc(raw);
  if (mode === "target") {
    if (key === "en") return all.get("en-us") ? "en-us" : (all.get("en-gb") ? "en-gb" : "en");
    if (key === "pt") return all.get("pt-br") ? "pt-br" : (all.get("pt-pt") ? "pt-pt" : "pt");
  }
  return normalizeUiCode(key, mode);
}

export function useLangMenu({
  mode,
  value,
  options,
}: {
  mode: "source" | "target";
  value: string;
  options: Option[];
}) {
  const safeOptions = useMemo(() => dedupByCode(options), [options]);

  // map normalized key -> option
  const byKey = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of safeOptions) {
      const k = normalizeUiCode(o.code, mode);
      if (!m.has(k)) m.set(k, { ...o, code: k });
    }
    return m;
  }, [safeOptions, mode]);

  // sembunyikan item tertentu pada TARGET:
  // - sembunyikan "en" (pakai en-us/en-gb)
  // - sembunyikan "pt-pt" (pakai pt-br + pt)
  const filteredKeys = useMemo(() => {
    const keys = Array.from(byKey.keys());
    if (mode === "target") {
      return keys.filter((k) => k !== "en" && k !== "pt-pt");
    }
    return keys;
  }, [byKey, mode]);

  // popular (maks POPULAR_LIMIT) — pastikan ada label fallback
  const popular = useMemo(() => {
    const dst: Option[] = [];
    for (const raw of POPULAR_UI_ORDER) {
      const key = resolvePopularForMode(raw, byKey, mode);
      if (!filteredKeys.includes(key)) continue;
      const hit = byKey.get(key);
      if (hit) dst.push({ ...hit, label: hit.label ?? getDisplayLabelFor(hit.code) });
      if (dst.length >= POPULAR_LIMIT) break;
    }
    return dst;
  }, [byKey, mode, filteredKeys]);

  const popularSet = useMemo(() => new Set(popular.map((o) => o.code)), [popular]);

  // sisanya → beri label agar bisa disortir oleh useSortedLanguages
  const rest = useSortedLanguages(
    filteredKeys
      .filter((k) => !popularSet.has(k))
      .map((k) => ({ code: k, label: getDisplayLabelFor(k) }))
  );

  const curValue = normalizeUiCode(value, mode);
  const isAuto = curValue === "auto";

  // mobile detection
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const layout = getColumnLayout(rest.length, isMobile);

  return {
    curValue,
    isAuto,
    isMobile,
    layoutClass: layout.className,
    popular,
    rest,
  };
}
