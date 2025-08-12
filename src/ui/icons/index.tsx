// src/ui/icons/index.tsx
"use client";

import type { ComponentType, SVGProps } from "react";
import dynamic from "next/dynamic";

/** Tipe komponen SVG generik */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * — STRATEGI PEMUATAN —
 * - CORE ICONS: import statis (dipakai di header/tab/chevron supaya tidak “pop in”).
 * - NON-CORE: dynamic import supaya tidak membebani bundle utama.
 */

import {
  // core (di atas lipatan)
  Type as IcType,
  FileText as IcFileText,
  Sparkles as IcSparkles,
  ChevronDown as IcChevronDown,
  ArrowLeftRight as IcSwap,
} from "lucide-react";

// non-core (interaksi, muncul setelah user mengetik/klik)
const IcCopy = dynamic(() => import("lucide-react").then(m => m.Copy));
const IcCheck = dynamic(() => import("lucide-react").then(m => m.Check));
const IcRotateCcw = dynamic(() => import("lucide-react").then(m => m.RotateCcw));
const IcVolume2 = dynamic(() => import("lucide-react").then(m => m.Volume2));
const IcUpload = dynamic(() => import("lucide-react").then(m => m.Upload));
const IcX = dynamic(() => import("lucide-react").then(m => m.X));

/** Union nama icon kalau kamu mau akses via <Icon name="..." /> */
export type IconName =
  | "tabText"
  | "tabFile"
  | "tabWrite"
  | "chevronDown"
  | "swap"
  | "copy"
  | "check"
  | "rotate"
  | "speaker"
  | "upload"
  | "close";

/** Alias semantik: enak dipakai di seluruh app */
export const Icons = {
  // core
  tabText: IcType,
  tabFile: IcFileText,
  tabWrite: IcSparkles,
  chevronDown: IcChevronDown,
  swap: IcSwap,
  // non-core (dinamis)
  copy: IcCopy,
  check: IcCheck,
  rotate: IcRotateCcw,
  speaker: IcVolume2,
  upload: IcUpload,
  close: IcX,
} satisfies Record<IconName, IconComponent>;

/** Optional: komponen serbaguna kalau suka pattern <Icon name="copy" /> */
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  const Cmp = Icons[name];
  return <Cmp {...props} />;
}

/**
 * NANTI KALAU MAU PAKAI SVG CUSTOM:
 * - Impor komponen SVG custom kamu, lalu timpa entri Icons di sini.
 *   import CustomWrite from "@/features/translate/icons/CustomWrite";
 *   export const Icons = { ...Icons, tabWrite: CustomWrite };
 */
