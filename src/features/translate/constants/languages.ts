// src/features/translate/constants/languages.ts
export type LangCode = string;

export type Language = {
  label: string;
  value: LangCode; // UI code (lowercase: 'en','pt','zh','auto', dst)
  flag: string;
};

/**
 * Daftar ringkas untuk UI (mengikuti DeepL).
 * Varian target EN/PT & label ZH ditangani via helper (getDisplayLabelFor / getFlagFor)
 * dan di backend via util toDeepLCode().
 */
export const LANGUAGES: Language[] = [
  { label: "Deteksi bahasa", value: "auto", flag: "🌐" },

  { label: "Bulgarian",  value: "bg", flag: "🇧🇬" },
  { label: "Chinese",    value: "zh", flag: "🇨🇳" }, // UI = 'zh' (DeepL target = ZH Simplified)
  { label: "Czech",      value: "cs", flag: "🇨🇿" },
  { label: "Danish",     value: "da", flag: "🇩🇰" },
  { label: "Dutch",      value: "nl", flag: "🇳🇱" },
  { label: "English",    value: "en", flag: "🇺🇸" }, // varian target via mapper (EN-US / EN-GB)
  { label: "Estonian",   value: "et", flag: "🇪🇪" },
  { label: "Finnish",    value: "fi", flag: "🇫🇮" },
  { label: "French",     value: "fr", flag: "🇫🇷" },
  { label: "German",     value: "de", flag: "🇩🇪" },
  { label: "Greek",      value: "el", flag: "🇬🇷" },
  { label: "Hungarian",  value: "hu", flag: "🇭🇺" },
  { label: "Indonesian", value: "id", flag: "🇮🇩" },
  { label: "Italian",    value: "it", flag: "🇮🇹" },
  { label: "Japanese",   value: "ja", flag: "🇯🇵" },
  { label: "Korean",     value: "ko", flag: "🇰🇷" },
  { label: "Latvian",    value: "lv", flag: "🇱🇻" },
  { label: "Lithuanian", value: "lt", flag: "🇱🇹" },
  { label: "Norwegian (Bokmål)", value: "nb", flag: "🇳🇴" },
  { label: "Polish",     value: "pl", flag: "🇵🇱" },
  { label: "Portuguese", value: "pt", flag: "🇵🇹" }, // varian target via mapper (PT-BR / PT-PT)
  { label: "Romanian",   value: "ro", flag: "🇷🇴" },
  { label: "Russian",    value: "ru", flag: "🇷🇺" },
  { label: "Slovak",     value: "sk", flag: "🇸🇰" },
  { label: "Slovenian",  value: "sl", flag: "🇸🇮" },
  { label: "Spanish",    value: "es", flag: "🇪🇸" },
  { label: "Swedish",    value: "sv", flag: "🇸🇪" },
  { label: "Turkish",    value: "tr", flag: "🇹🇷" },
  { label: "Ukrainian",  value: "uk", flag: "🇺🇦" },
];

/** Normalisasi kode untuk keperluan DISPLAY (collapse varian ke base) */
function normalizeForDisplay(value: string): string {
  const v = (value || "").toLowerCase();
  if (!v) return "auto";
  if (v === "no") return "nb";
  if (v === "en-us" || v === "en-gb") return "en";
  if (v === "pt-br" || v === "pt-pt") return "pt";
  if (v.startsWith("zh-")) return "zh";
  return v;
}

/** Ambil metadata bahasa berbasis base code; fallback ke item pertama (Deteksi). */
export function getLangData(value: string): Language {
  const base = normalizeForDisplay(value);
  return LANGUAGES.find((l) => l.value === base) || LANGUAGES[0];
}

/** Label yang paham varian (untuk target) */
export function getDisplayLabelFor(value: string): string {
  const v = (value || "").toLowerCase();
  if (v === "en-us") return "English (US)";
  if (v === "en-gb") return "English (UK)";
  if (v === "pt-br") return "Portuguese (Brazil)";
  if (v === "pt-pt") return "Portuguese (Portugal)";
  if (v === "zh" || v === "zh-cn" || v === "zh-hans" || v === "zh-tw" || v === "zh-hant") {
    return "Chinese (Simplified)";
  }
  return getLangData(v).label;
}

/** Flag yang paham varian (untuk target) */
export function getFlagFor(value: string): string {
  const v = (value || "").toLowerCase();
  if (v === "en-us") return "🇺🇸";
  if (v === "en-gb") return "🇬🇧";
  if (v === "pt-br") return "🇧🇷";
  if (v === "pt-pt") return "🇵🇹";
  if (v.startsWith("zh")) return "🇨🇳";
  return getLangData(v).flag || "🌐";
}

/**
 * (Opsional) generator opsi target yang menyisipkan varian EN/PT + label ZH yang jelas.
 * Bisa dipakai kalau mau bangun daftar target langsung dari LANGUAGES.
 */
export function buildTargetOptionsFromLanguages(base: Language[]) {
  const exists = new Set(base.map((b) => b.value.toLowerCase()));
  const out: { code: string; label: string }[] = [];

  for (const b of base) {
    const code = b.value.toLowerCase();
    if (code === "en") {
      if (!exists.has("en-us")) out.push({ code: "en-us", label: "English (US)" });
      if (!exists.has("en-gb")) out.push({ code: "en-gb", label: "English (UK)" });
      out.push({ code: "en", label: "English" });
      continue;
    }
    if (code === "pt") {
      if (!exists.has("pt-br")) out.push({ code: "pt-br", label: "Portuguese (Brazil)" });
      if (!exists.has("pt-pt")) out.push({ code: "pt-pt", label: "Portuguese (Portugal)" });
      out.push({ code: "pt", label: "Portuguese" });
      continue;
    }
    if (code === "zh") {
      out.push({ code: "zh", label: "Chinese (Simplified)" });
      continue;
    }
    out.push({ code, label: b.label });
  }

  // dedup by code
  const m = new Map<string, { code: string; label: string }>();
  for (const o of out) if (!m.has(o.code)) m.set(o.code, o);
  return Array.from(m.values());
}
