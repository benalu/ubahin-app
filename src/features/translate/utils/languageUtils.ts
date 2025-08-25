// src/features/translate/utils/languageUtils.ts

import { normalizeUiCode, getDisplayLabelFor } from "@/lib/constants/lang";
import type { LanguageOption, LanguageMode } from "../types/languageSelector";

/**
 * Convert string to lowercase safely
 */
export const toLower = (s: string): string => (s || "").toLowerCase();

/**
 * Remove duplicate options by code, keeping first occurrence
 */
export function dedupByCode(list: LanguageOption[]): LanguageOption[] {
  const seen = new Map<string, LanguageOption>();
  
  for (const option of list) {
    const key = toLower(option.code);
    if (!seen.has(key)) {
      seen.set(key, { ...option, code: key });
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Build a map of normalized codes to options
 */
export function buildLanguageMap(
  options: LanguageOption[], 
  mode: LanguageMode
): Map<string, LanguageOption> {
  const map = new Map<string, LanguageOption>();
  
  for (const option of options) {
    const normalizedCode = normalizeUiCode(option.code, mode);
    if (!map.has(normalizedCode)) {
      map.set(normalizedCode, { ...option, code: normalizedCode });
    }
  }
  
  return map;
}

/**
 * Get filtered options for dropdown (excludes 'auto' for target mode)
 */
export function getFilteredOptions(
  languageMap: Map<string, LanguageOption>,
  mode: LanguageMode
): LanguageOption[] {
  const allKeys = Array.from(languageMap.keys());
  const filteredKeys = mode === "target" 
    ? allKeys.filter(key => key !== "auto")
    : allKeys;
    
  return filteredKeys.map(key => languageMap.get(key)!);
}

/**
 * Normalize display value for target language
 */
export function normalizeDisplayValue(value: string, mode: LanguageMode): string {
  if (mode === "target") {
    const lowerValue = toLower(value);
    if (lowerValue === "en") return "en-us";
    if (lowerValue === "pt") return "pt-br";
  }
  
  return normalizeUiCode(value, mode);
}

/**
 * Get display label with fallback
 */
export function getDisplayLabel(
  code: string,
  isOpen: boolean,
  openLabel?: string,
  openLabelForAuto?: string
): string {
  const isAuto = code === "auto";
  const currentLabel = getDisplayLabelFor(code);
  
  if (isOpen) {
    if (isAuto && openLabelForAuto) return openLabelForAuto;
    if (openLabel) return openLabel;
  }
  
  return currentLabel;
}