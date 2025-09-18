// src/features/translate/utils/metadata.ts
import { Metadata } from "next";
import { TABS, TabKey } from "@/features/translate/config/tabs";

/**
 * Generate metadata for translate pages from centralized config
 * Ensures consistency and single source of truth
 */
export function generateTranslateMetadata(tabKey: TabKey): Metadata {
  const tab = TABS[tabKey];
  
  return {
    title: tab.title,
    description: tab.description,
    // Add more SEO fields as needed
    openGraph: {
      title: tab.title,
      description: tab.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: tab.title,
      description: tab.description,
    },
  };
}

/**
 * Fallback metadata for pages without specific config
 */
export const DEFAULT_TRANSLATE_METADATA: Metadata = {
  title: "Translator - Using Alternative",
  description: "Translate text and documents with advanced AI technology",
};