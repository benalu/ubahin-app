// src/features/translate/hooks/useLanguageSelector.ts

import { useMemo, useCallback } from "react";
import { buildSourceOptions, buildTargetOptions } from "@/lib/constants/lang";
import { useSortedLanguages, getColumnLayout } from "@/utils/languageSorting";
import { 
  dedupByCode, 
  buildLanguageMap, 
  getFilteredOptions,
  normalizeDisplayValue 
} from "../utils/languageUtils";
import type { LanguageOption, LanguageMode } from "../types/languageSelector";

/**
 * Hook for managing language options
 */
export function useLanguageOptions() {
  const sourceOptions = useMemo(() => buildSourceOptions(), []);
  const targetOptions = useMemo(() => buildTargetOptions(), []);
  
  return { sourceOptions, targetOptions };
}

/**
 * Hook for mobile detection
 */
export function useIsMobile(): boolean {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 640;
  }, []);
}

/**
 * Hook for processed language options with sorting and layout
 */
export function useProcessedLanguages(
  options: LanguageOption[],
  mode: LanguageMode
) {
  const isMobile = useIsMobile();
  
  const processedData = useMemo(() => {
    // Deduplicate and build map
    const safeOptions = dedupByCode(options);
    const languageMap = buildLanguageMap(safeOptions, mode);
    const filteredOptions = getFilteredOptions(languageMap, mode);
    
    return {
      languageMap,
      filteredOptions,
      safeOptions
    };
  }, [options, mode]);
  
  // Sort languages and get layout
  const sortedLanguages = useSortedLanguages(processedData.filteredOptions, isMobile);
  const layout = useMemo(() => 
    getColumnLayout(sortedLanguages.length, isMobile), 
    [sortedLanguages.length, isMobile]
  );
  
  return {
    ...processedData,
    sortedLanguages,
    layout,
    isMobile
  };
}

/**
 * Hook for language swap functionality
 */
export function useLanguageSwap(
  sourceLang: string,
  targetLang: string,
  onSourceChange: (value: string) => void,
  onTargetChange: (value: string) => void,
  disableSwap?: boolean
) {
  const handleSwap = useCallback(() => {
    if (disableSwap) return;
    
    onSourceChange(targetLang);
    onTargetChange(sourceLang);
  }, [disableSwap, sourceLang, targetLang, onSourceChange, onTargetChange]);
  
  return { handleSwap };
}

/**
 * Hook for display value normalization
 */
export function useDisplayValue(value: string, mode: LanguageMode): string {
  return useMemo(() => 
    normalizeDisplayValue(value, mode), 
    [value, mode]
  );
}