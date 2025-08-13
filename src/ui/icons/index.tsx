// src/ui/icons/index.tsx
"use client";

import type { ComponentType, SVGProps } from "react";
import { lazy, Suspense } from "react";
import type * as LucideNS from "lucide-react"; // hanya buat tipe

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// Core icons
import {
  Type as IcType,
  FileText as IcFileText,
  Sparkles as IcSparkles,
  ChevronDown as IcChevronDown,
  ArrowLeftRight as IcSwap,
} from "lucide-react";

// Kunci tipe nama ikon yang valid
type LucideModule = typeof LucideNS;
type LucideIconName = keyof LucideModule;

// Helper lazy dengan fallback TERSERTIFIKASI adalah ComponentType
const createLazyIcon = (iconName: LucideIconName) =>
  lazy(async () => {
    const mod: LucideModule = await import("lucide-react");
    // Ambil komponen; kalau tidak ada -> fallback
    const C =
      (mod[iconName] as unknown as ComponentType<SVGProps<SVGSVGElement>> | undefined) ??
      IcFileText;
    return { default: C as ComponentType<SVGProps<SVGSVGElement>> };
  });

// Contoh pemakaian
const IcCopy = createLazyIcon("Copy");
const IcCheck = createLazyIcon("Check");
const IcRotateCcw = createLazyIcon("RotateCcw");
const IcVolume2 = createLazyIcon("Volume2");
const IcUpload = createLazyIcon("Upload");
const IcX = createLazyIcon("X");

// Wrapper Suspense
const LazyIcon = ({
  Component,
  fallback = <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />,
  ...props
}: {
  Component: ComponentType<SVGProps<SVGSVGElement>>;
  fallback?: React.ReactNode;
} & SVGProps<SVGSVGElement>) => (
  <Suspense fallback={fallback}>
    <Component {...props} />
  </Suspense>
);

export const Icons = {
  // Core
  tabText: IcType,
  tabFile: IcFileText,
  tabWrite: IcSparkles,
  chevronDown: IcChevronDown,
  swap: IcSwap,

  // Lazy
  copy: (props: SVGProps<SVGSVGElement>) => <LazyIcon Component={IcCopy} {...props} />,
  check: (props: SVGProps<SVGSVGElement>) => <LazyIcon Component={IcCheck} {...props} />,
  rotate: (props: SVGProps<SVGSVGElement>) => <LazyIcon Component={IcRotateCcw} {...props} />,
  speaker: (props: SVGProps<SVGSVGElement>) => <LazyIcon Component={IcVolume2} {...props} />,
  upload: (props: SVGProps<SVGSVGElement>) => <LazyIcon Component={IcUpload} {...props} />,
  close: (props: SVGProps<SVGSVGElement>) => <LazyIcon Component={IcX} {...props} />,
} as const;
