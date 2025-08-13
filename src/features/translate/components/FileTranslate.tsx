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
import { cn } from "@/lib/utils";

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
    () => LANGUAGES.filter(l => l.value !== "auto").map(l => ({ code: l.value, label: l.label })),
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

  // footer di panel kanan: Add files (hanya muncul saat ada file)
  const addMoreFooter = hasFiles ? (
    <Button
      variant="outline"
      onClick={() => fileInputRef.current?.click()}
      disabled={working}
      className={cn("w-full justify-center", !working && "cursor-pointer")}
      title="Tambah Dokumen Lainnya"
      aria-label="Tambah Dokumen Lainnya"
    >
      <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
      Tambah Dokumen Lainnya
    </Button>
  ) : null;

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

      <div className={hasFiles ? "grid gap-4 md:grid-cols-2" : "grid gap-4 grid-cols-1"}>
        {/* Left: Dropzone */}
        <section className="rounded-2xl  bg-white p-0 min-h-[360px]">
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

        {/* Right: File list + footer Add (only when has files) */}
        {hasFiles && (
          <aside className="rounded-2xl border bg-white p-0 min-h-[360px]">
            <DocFileList
              files={files}
              jobs={jobs}
              onRemove={removeFile}
              maxHeight={420}
              footer={addMoreFooter}
            />
          </aside>
        )}
      </div>

      {/* Toolbar bawah: hanya Clear & Translate */}
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
