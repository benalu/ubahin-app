import type { LangCode } from "@/features/translate/types/index";

export const LANGUAGES: { label: string; value: LangCode; flag: string }[] = [
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

export function getLangData(value: string) {
  return LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];
}
