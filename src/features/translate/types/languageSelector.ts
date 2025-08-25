// src/features/translate/types/languageSelector.ts

export interface LanguageOption {
  code: string;
  label: string;
}

export type LanguageMode = "source" | "target";

export interface LanguageLayout {
  columns: number;
  className: string;
}

export interface LangSelectProps {
  mode: LanguageMode;
  value: string;
  onChange: (value: string) => void;
  options: LanguageOption[];
  placeholder: string;
  openLabelForAuto?: string;
  highlightAutoWhenOpen?: boolean;
  openLabel?: string;
  highlightWhenOpen?: boolean;
}

export interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  disableSwap?: boolean;
}