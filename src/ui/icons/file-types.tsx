// src/ui/icons/file-types.tsx
"use client";

import type { ComponentType, SVGProps } from "react";
import Image from "next/image";
import { FILE_CATEGORIES } from "@/utils/fileCategories";
import { FileText, Layout, Subtitles } from "lucide-react";
import { FILE_EXT_ICON } from "./fileExtIconMap";
import clsx from "clsx";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type Props = {
  fileName?: string;
  ext?: string;
  className?: string;
  overrides?: Record<string, IconComponent>;
  size?: number;        // untuk <Image> width/height default 20
  lazy?: boolean;       // default true
  decorative?: boolean; // kalau true → alt="" aria-hidden
  priority?: boolean;   // untuk above-the-fold images
};

function OptimizedIcon({
  src,
  className,
  size = 20,
  lazy = true,
  decorative = true,
  priority = false,
  label,
}: {
  src: string;
  className?: string;
  size?: number;
  lazy?: boolean;
  decorative?: boolean;
  priority?: boolean;
  label?: string;
}) {
  return (
    <Image
      src={src}
      width={size}
      height={size}
      priority={priority} // untuk critical images
      loading={priority ? undefined : (lazy ? "lazy" : "eager")}
      alt={decorative ? "" : (label || "file icon")}
      aria-hidden={decorative ? "true" : undefined}
      className={clsx("inline-block align-middle", className)}
      // Optimasi tambahan untuk ikon kecil
      quality={85} // reduce quality sedikit untuk file size lebih kecil
      unoptimized={false} // biarkan Next.js optimize
      draggable={false}
    />
  );
}

/** Utility: ambil komponen ikon React dari FILE_CATEGORIES / fallback lucide */
export function getSvgIconByExt(
  rawExt: string,
  overrides?: Record<string, IconComponent>
): IconComponent {
  const ext = rawExt.toLowerCase();
  if (overrides?.[ext]) return overrides[ext];

  for (const cat of Object.values(FILE_CATEGORIES)) {
    if (cat.exts.includes(ext) && cat.icon) {
      return cat.icon as IconComponent;
    }
  }

  const fallbackMap: Record<string, IconComponent> = {
    htm: Layout,
    html: Layout,
    xlf: FileText,
    xliff: FileText,
    srt: Subtitles,
  };
  if (fallbackMap[ext]) return fallbackMap[ext];
  return FileText;
}

/** Komponen: pilih ikon statis dari /public kalau ada, else fallback ke SVG React */
export default function FileTypeIcon({
  fileName,
  ext,
  className,
  overrides,
  size = 20,
  lazy = true,
  decorative = true,
  priority = false,
}: Props) {
  const pickedExt = (ext ?? (fileName?.split(".").pop() || "")).toLowerCase();

  // 1) Coba ikon statis (dengan Next.js Image optimization)
  const info = FILE_EXT_ICON[pickedExt];
  if (info) {
    return (
      <OptimizedIcon
        src={info.src}
        label={info.label}
        size={size}
        lazy={lazy}
        decorative={decorative}
        priority={priority}
        className={className}
      />
    );
  }

  // 2) Fallback ke ikon SVG React (lucide / FILE_CATEGORIES)
  const SvgIcon = getSvgIconByExt(pickedExt, overrides);
  return <SvgIcon className={className} aria-hidden="true" />;
}