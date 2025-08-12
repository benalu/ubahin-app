// src/ui/icons/file-types.tsx
"use client";

import type { SVGProps, ComponentType } from "react";
import { FILE_CATEGORIES } from "@/utils/fileCategories";
import { FileText, Layout, Subtitles } from "lucide-react";
import type { IconComponent } from "@/ui/icons";

type Props = {
  /** salah satu wajib: fileName atau ext */
  fileName?: string;
  ext?: string;
  className?: string;
  /** override per-ext: { html: MyHtmlIcon } */
  overrides?: Record<string, ComponentType<SVGProps<SVGSVGElement>>>;
};

/** Utility: ambil komponen ikon dari ekstensi */
export function getFileIconByExt(
  rawExt: string,
  overrides?: Record<string, IconComponent>
): IconComponent {
  const ext = rawExt.toLowerCase();

  // 1) Overrides paling tinggi prioritas
  if (overrides?.[ext]) return overrides[ext];

  // 2) Cari di FILE_CATEGORIES (DRY dgn file-conversion)
  for (const cat of Object.values(FILE_CATEGORIES)) {
    if (cat.exts.includes(ext) && cat.icon) {
      return cat.icon as IconComponent;
    }
  }

  // 3) Fallback untuk tipe2 DeepL yg nggak ada di categories
  const fallbackMap: Record<string, IconComponent> = {
    htm: Layout,
    html: Layout,
    xlf: FileText,
    xliff: FileText,
    srt: Subtitles,
  };

  if (fallbackMap[ext]) return fallbackMap[ext];

  // 4) Fallback umum
  return FileText;
}

/** Komponen siap pakai: render ikon sesuai nama file / ext */
export default function FileTypeIcon({ fileName, ext, className, overrides }: Props) {
  const pickedExt =
    (ext ?? (fileName?.split(".").pop() || "")).toLowerCase();

  const Icon = getFileIconByExt(pickedExt, overrides);
  return <Icon className={className} />;
}
