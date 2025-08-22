// src/features/translate/components/partials/document/DocToolbar.tsx
"use client";

import { memo } from "react";
import DocActions from "./DocActions";
import FileTypeIcon from "@/ui/icons/file-types";
import { Info } from "lucide-react";

export interface DocToolbarProps {
  onClearAll: () => void;
  onTranslateAll: () => void;
  working: boolean;
  count: number;
}

function DocToolbarBase({
  onClearAll,
  onTranslateAll,
  working,
  count,
}: DocToolbarProps) {
  const iconSize = 32;

  return (
    <div className="flex items-center gap-3 bg-white/60 border rounded-2xl px-3 py-2
                    justify-end md:justify-between">
      {/* LEFT (desktop only): ikon tipe file + info */}
      <div className="hidden md:flex items-center gap-2">
        <FileTypeIcon ext="pdf" size={iconSize} decorative />
        <FileTypeIcon ext="docx" size={iconSize} decorative />
        <FileTypeIcon ext="pptx" size={iconSize} decorative />

        <button
          type="button"
          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full
                     border border-gray-300 text-gray-600 hover:bg-gray-100"
          title="Format yang didukung: .doc(x), .htm(l), .pdf, .pptx, .txt"
          aria-label="Info format dokumen yang didukung"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* RIGHT: aksi dokumen */}
      <DocActions
        onClearAll={onClearAll}
        onTranslateAll={onTranslateAll}
        working={working}
        count={count}
      />
    </div>
  );
}

export default memo(DocToolbarBase);
