// src/features/translate/components/FileTranslate.tsx
"use client";

import { useMemo, useRef } from "react";
import LanguageSelector from "./partials/LanguageSelector";
import DocDropArea from "./partials/document/DocDropArea";
import DocFileList from "./partials/document/DocFileList";
import DocToolbar from "./partials/document/DocToolbar";
import { useFileTranslate } from "../hooks/useFileTranslate";
import { DEEPL_DOC_ACCEPT } from "@/lib/constants/translateDocs";
import { LANGUAGES } from "@/features/translate/constants/languages";
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

  const languageOptions = useMemo(
    () =>
      LANGUAGES.filter((l) => l.value !== "auto").map((l) => ({
        code: l.value,
        label: l.label,
      })),
    []
  );

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
  } = useFileTranslate({ sourceLang, targetLang });

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-6">
      <LanguageSelector
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        options={languageOptions}
        disableSwap={sourceLang === "auto"}
      />

      {!hasFiles ? (
        /* ——— Belum ada file: dropzone full width */
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
        /* ——— Ada file: mobile = kolom rapat, desktop = row lega */
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-start md:gap-4">
          {/* Kiri (lebih besar), tinggi tidak ikut list */}
          <section className="rounded-2xl bg-white p-0 min-h-[360px] md:flex-1">
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

          {/* Kanan: File list dibatasi tinggi + tombol Add (tanpa mt-4 di mobile) */}
          <aside className="md:w-[420px] lg:w-[480px] xl:w-[520px] space-y-3">
            <DocFileList
              files={files}
              jobs={jobs}
              onRemove={removeFile}
              maxHeight={420}
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={working}
              className="w-full justify-center cursor-pointer"
              title="Tambah Dokumen Lainnya"
              aria-label="Tambah Dokumen Lainnya"
            >
              <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              Tambah Dokumen Lainnya
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
