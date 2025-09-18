// src/lib/constants/lang.ts - SINGLE SOURCE OF TRUTH

import { sortLanguagesByName } from '@/utils/languageSorting';

/**
 * Util bersama untuk frontend & backend:
 * - Normalisasi UI code (SATU FUNGSI SAJA)
 * - Mapping UI → DeepL code
 * - Display helpers yang konsisten
 * - Sorting berdasarkan nama bahasa
 */


export const POPULAR_UI_CODES = new Set<string>([
  "en","id","es","fr","de","ja","ko","zh","pt","ru",
]);

export const POPULAR_UI_ORDER: string[] = ["id", "en", "ja", "ko"];
export const POPULAR_LIMIT = 4;


export const DEEPL_SOURCES = new Set<string>([
  "BG","CS","DA","DE","EL","EN","ES","ET","FI","FR","HU","ID","IT","JA","KO",
  "LT","LV","NB","NL","PL","PT","RO","RU","SK","SL","SV","TR","UK","ZH",
]);


export const DEEPL_TARGETS = new Set<string>([
  "BG","CS","DA","DE","EL",
  "EN-GB","EN-US",
  "ES","ET","FI","FR","HU","ID","IT","JA","KO",
  "LT","LV","NB","NL","PL",
  "PT-PT","PT-BR",
  "RO","RU","SK","SL","SV","TR","UK",
  "ZH" // DeepL: Simplified
]);


export const DEFAULT_EN_TARGET: "EN-GB" | "EN-US" = "EN-US";
export const DEFAULT_PT_TARGET: "PT-PT" | "PT-BR" = "PT-BR";

export function normalizeUiCode(input: string, mode: "source" | "target" | "display" = "display"): string {
  const v = (input || "").toLowerCase();
  if (!v) return "auto";
  if (v === "no") return "nb";
  
  
  if (v === "zh-cn" || v === "zh-hans" || v === "zh-tw" || v === "zh-hant" || v.startsWith("zh-")) {
    return "zh";
  }
  
  
  if (v === "en-us" || v === "en-gb") {
    return mode === "target" ? v : "en"; 
  }
  if (v === "pt-br" || v === "pt-pt") {
    return mode === "target" ? v : "pt";
  }
  
  return v;
}


export function getDisplayLabelFor(value: string): string {
  const v = normalizeUiCode(value, "display");
  const original = (value || "").toLowerCase();
  
  // Special cases for variants
  if (original === "en-us") return "Inggris (Amerika)";
  if (original === "en-gb") return "Inggris (Britania)";
  if (original === "pt-br") return "Portugis (Brasil)";
  if (original === "pt-pt") return "Portugis";
  
  
  const labels: Record<string, string> = {
    "auto": "Deteksi bahasa",
    "ar": "Arab",
    "bg": "Bulgaria", 
    "cs": "Ceko",
    "da": "Denmark",
    "de": "Jerman",
    "el": "Yunani",
    "en": "Inggris",
    "es": "Spanyol",
    "et": "Estonia",
    "fi": "Finlandia",
    "fr": "Prancis",
    "hu": "Hongaria",
    "id": "Indonesia",
    "it": "Italia",
    "ja": "Jepang",
    "ko": "Korea",
    "lv": "Latvia",
    "lt": "Lituania", 
    "nb": "Norwegia",
    "nl": "Belanda",
    "pl": "Polandia",
    "pt": "Portugis",
    "ro": "Romania",
    "ru": "Rusia",
    "sk": "Slovakia",
    "sl": "Slovenia", 
    "sv": "Swedia",
    "tr": "Turki",
    "uk": "Ukraina",
    "zh": "Mandarin",
    "vi": "Vietnam",
    "th": "Thai"
  };
  
  return labels[v] || value;
}


export function toDeepLCode(ui: string, kind: "source" | "target"): string | undefined {
  const code = normalizeUiCode(ui, kind);
  if (!code || code === "auto") return undefined;

  if (code === "en") return kind === "target" ? DEFAULT_EN_TARGET : "EN";
  if (code === "pt") return kind === "target" ? DEFAULT_PT_TARGET : "PT";
  if (code === "zh") return "ZH";
  
  // Handle preserved variants for target
  if (kind === "target") {
    if (code === "en-us") return "EN-US";
    if (code === "en-gb") return "EN-GB";
    if (code === "pt-br") return "PT-BR";
    if (code === "pt-pt") return "PT-PT";
  }

  return code.toUpperCase();
}

export function isSupportedByDeepL(mapped: string, kind: "source"|"target"): boolean {
  const up = mapped.toUpperCase();
  return kind === "source" ? DEEPL_SOURCES.has(up) : DEEPL_TARGETS.has(up);
}


export function buildTargetOptions(): { code: string; label: string }[] {
  const base = [
    "bg","cs","da","de","el","es","et","fi","fr","hu","id","it","ja","ko",
    "lv","lt","nb","nl","pl","ro","ru","sk","sl","sv","tr","uk","zh","vi","th"
  ];
  
  const options = base.map(code => ({
    code,
    label: getDisplayLabelFor(code)
  }));
  
  // Add English variants
  options.push(
    { code: "en-us", label: "Inggris (Amerika)" },
    { code: "en-gb", label: "Inggris (Britania)" }
  );
  
  // Add Portuguese variants  
  options.push(
    { code: "pt-br", label: "Portugis (Brasil)" },
    { code: "pt-pt", label: "Portugis" }
  );
  
  // ✅ Sort berdasarkan NAMA
  return sortLanguagesByName(options);
}

/**
 * ✅ Build source options dengan sorting berdasarkan nama
 */
export function buildSourceOptions(): { code: string; label: string }[] {
  const base = [
    "bg","cs","da","de","el","en","es","et","fi","fr","hu","id","it","ja","ko",
    "lv","lt","nb","nl","pl","pt","ro","ru","sk","sl","sv","tr","uk","zh","vi","th"
  ];
  
  const baseOptions = base.map(code => ({
    code,
    label: getDisplayLabelFor(code)
  }));
  
  // ✅ Sort base options berdasarkan NAMA
  const sortedBase = sortLanguagesByName(baseOptions);
  
  // Add "auto" at the beginning (tidak disort)
  return [
    { code: "auto", label: "Deteksi bahasa" },
    ...sortedBase
  ];
}