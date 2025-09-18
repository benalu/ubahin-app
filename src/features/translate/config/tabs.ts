// src/features/translate/config/tabs.ts
import { Icons } from "@/ui/icons";
import { ComponentType, SVGProps } from "react";

// Types for better structure
type SubLabelConfig = 
  | { type: 'static'; content: string }
  | { type: 'dynamic'; content: (count: number) => string };

// Icon component type - typically SVG icons with these props
type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { 
  className?: string; 
  size?: number | string;
}>;

type TabConfig = {
  key: string;
  slug: string | null;
  path: string;
  label: string;
  subLabel: SubLabelConfig;
  icon: IconComponent;
  title: string;
  description: string;
};

// Main configuration object
export const TABS = {
  teks: {
    key: "teks",
    slug: null,
    path: "/translate",
    label: "Menerjemahkan teks",
    subLabel: { 
      type: 'dynamic' as const, 
      content: (n: number) => `${n} bahasa` 
    },
    icon: Icons.tabText,
    title: "Ubahin – Translator Text",
    description: "Translate text with Easy and Accurate AI",
  },
  file: {
    key: "file",
    slug: "files",
    path: "/translate/files",
    label: "Menerjemahkan berkas",
    subLabel: { 
      type: 'static' as const, 
      content: ".pdf, .docx, .pptx" 
    },
    icon: Icons.tabFile,
    title: "Ubahin - Translator Files",
    description: "Translate PDF, DOCX, PPTX with formatting",
  },
  write: {
    key: "write",
    slug: "write",
    path: "/translate/write",
    label: "AI Write",
    subLabel: { 
      type: 'static' as const, 
      content: "Pengeditan AI" 
    },
    icon: Icons.tabWrite,
    title: "Ubahin - AI Write",
    description: "Enhance your writing with AI-powered assistance",
  },
} as const satisfies Record<string, TabConfig>;

// Derived types and constants - SSOT
export type TabKey = keyof typeof TABS;

// Dynamic derivation - no hardcoding
export const VALID_SLUGS = Object.values(TABS)
  .filter((tab): tab is typeof TABS[keyof typeof TABS] & { slug: string } => 
    tab.slug !== null
  )
  .map(tab => tab.slug);

export type ValidSlug = typeof VALID_SLUGS[number];

// Generated mappings
export const slugToTab = Object.fromEntries(
  Object.entries(TABS)
    .filter(([_, tab]) => tab.slug !== null)
    .map(([key, tab]) => [tab.slug, key as TabKey])
) as Record<ValidSlug, TabKey>;

export const tabToPath = Object.fromEntries(
  Object.entries(TABS).map(([key, tab]) => [key, tab.path])
) as Record<TabKey, string>;

export const metaByTab = Object.fromEntries(
  Object.entries(TABS).map(([key, tab]) => [
    key, 
    { title: tab.title, description: tab.description }
  ])
) as Record<TabKey, { title: string; description: string }>;

// Utility functions
export function isValidSlug(slug: string): slug is ValidSlug {
  return VALID_SLUGS.includes(slug as ValidSlug);
}

export function getSubLabel(
  tabKey: TabKey, 
  dynamicValue?: number
): string {
  const tab = TABS[tabKey];
  const subLabel = tab.subLabel;
  
  if (subLabel.type === 'static') {
    return subLabel.content;
  } else {
    if (dynamicValue === undefined) {
      throw new Error(`Dynamic sublabel for ${tabKey} requires a numeric value`);
    }
    return subLabel.content(dynamicValue);
  }
}

// Helper untuk mendapatkan navigation items
export function getNavigationItems(languageCount?: number) {
  return Object.values(TABS).map(tab => ({
    key: tab.key,
    path: tab.path,
    label: tab.label,
    subLabel: getSubLabel(tab.key as TabKey, languageCount),
    icon: tab.icon,
  }));
}