export type LangCode = string;

export type Language = {
  label: string;
  value: LangCode;
  flag: string;
};

export const LANGUAGES: Language[] = [
  { label: "Detect language", value: "auto", flag: "🌐" },
  { label: "Indonesian", value: "id", flag: "🇮🇩" },
  { label: "English", value: "en", flag: "🇺🇸" },
  { label: "Korean", value: "ko", flag: "🇰🇷" },
  { label: "Japanese", value: "ja", flag: "🇯🇵" },
  { label: "French", value: "fr", flag: "🇫🇷" },
  { label: "German", value: "de", flag: "🇩🇪" },
  { label: "Spanish", value: "es", flag: "🇪🇸" },
  { label: "Arabic", value: "ar", flag: "🇸🇦" },
  { label: "Chinese", value: "zh", flag: "🇨🇳" },
  { label: "Portuguese", value: "pt", flag: "🇵🇹" },
  { label: "Russian", value: "ru", flag: "🇷🇺" },
];

/** Ambil metadata bahasa, fallback ke item pertama (Detect). */
export function getLangData(value: string): Language {
  return LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];
}
