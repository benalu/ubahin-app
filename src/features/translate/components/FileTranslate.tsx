// src/features/translate/components/FileTranslate.tsx
"use client";

import { useRef } from "react";
import { LanguageSelector } from "@/features/translate/components/partials/language-selector";
import DocDropArea from "./partials/document/DocDropArea";
import DocFileList from "./partials/document/DocFileList";
import DocToolbar from "./partials/document/DocToolbar";
import { useFileTranslate } from "../hooks/useFileTranslate";
import { DEEPL_DOC_ACCEPT } from "@/lib/constants/translateDocs";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

type LangCode = string;

type Props = {
  sourceLang: LangCode;
  targetLang: LangCode;
  onSourceChange: (v: LangCode) => void;
  onTargetChange: (v: LangCode) => void;
};

export default function FileTranslate({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    jobs,
    working,
    isDragging,
    addFiles,
    onDragOver,
    onDragLeave,
    onDrop,
    removeFile,
    clearAll,
    translateAll,

    // dari hook (dipakai untuk disable button)
    remaining,
  } = useFileTranslate({ sourceLang, targetLang });

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-5">
      <div className="mx-auto w-[min(82vw,520px)] rounded-xl border border-gray-900 bg-white/90 overflow-hidden">
        <LanguageSelector
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSourceChange={onSourceChange}
          onTargetChange={onTargetChange}
          disableSwap={sourceLang === "auto"}
        />
      </div>

      {!hasFiles ? (
        // ——— Belum ada file: dropzone full width
        <section className="rounded-2xl bg-white p-0 min-h-[360px]">
          <DocDropArea
            accept={DEEPL_DOC_ACCEPT}
            fileInputRef={fileInputRef}
            isDragging={isDragging}
            onFilesSelected={addFiles}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
        </section>
      ) : (
        // ——— Ada file: mobile = jarak rapat, desktop = tetap lega
        <div className="flex flex-col gap-1 sm:gap-2 md:flex-row md:items-start md:gap-4">
          {/* Kiri (lebih besar), tinggi tidak ikut list */}
          <section className="rounded-2xl bg-white p-0 min-h-[320px] sm:min-h-[360px] md:flex-1">
            <DocDropArea
              accept={DEEPL_DOC_ACCEPT}
              fileInputRef={fileInputRef}
              isDragging={isDragging}
              onFilesSelected={addFiles}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          </section>

          {/* Kanan: File list + tombol Add */}
          <aside className="mt-0 md:mt-0 md:w-[420px] lg:w-[480px] xl:w-[490px] space-y-4 sm:space-y-4">
            <DocFileList
              files={files}
              jobs={jobs}
              onRemove={removeFile}
              maxHeight={420}
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={working || remaining === 0}
              className="w-full justify-center cursor-pointer rounded-xl border border-gray-900 bg-white"
              title={remaining === 0 ? "Batas file tercapai" : "Tambah Dokumen Lainnya"}
              aria-label="Tambah Dokumen Lainnya"
            >
              <Upload className="h-4 w-4 mr-3" aria-hidden="true" />
              {remaining === 0 ? "Batas file tercapai" : "Tambah Dokumen Lainnya"}
            </Button>
          </aside>
        </div>
      )}

      {/* Toolbar bawah */}
      <div className="sticky bottom-2 z-10">
        <DocToolbar
          onClearAll={clearAll}
          onTranslateAll={() => void translateAll()}
          working={working}
          count={files.length}
        />
      </div>
    </div>
  );
}
