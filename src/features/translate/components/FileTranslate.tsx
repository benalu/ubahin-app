// src/features/translate/components/FileTranslate.tsx
"use client";

import { useRef, type ComponentType } from "react";
import LanguageBar from "./partials/LanguageBar";
import DocDropArea from "./partials/DocDropArea";
import DocFileList from "./partials/DocFileList";
import { useFileTranslate } from "../hooks/useFileTranslate";
import { DEEPL_DOC_ACCEPT } from "@/lib/constants/translateDocs";

type LangCode = string;

type LanguageSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  exclude?: string[];
  className?: string;
};

type Props = {
  sourceLang: LangCode;
  targetLang: LangCode;
  onSourceChange: (v: LangCode) => void;
  onTargetChange: (v: LangCode) => void;
  LanguageSelector: ComponentType<LanguageSelectorProps>;
};

export default function FileTranslate({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  LanguageSelector,
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
  } = useFileTranslate({ sourceLang, targetLang });

  return (
    <div className="space-y-6">
      {/* Language Selection for Files */}
      <LanguageBar
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        onSwap={() => {
          /* file mode: swap tidak dipakai */
        }}
        LanguageSelector={LanguageSelector}
      />

      {/* File Upload Area */}
      <DocDropArea
        accept={DEEPL_DOC_ACCEPT}
        fileInputRef={fileInputRef}
        isDragging={isDragging}
        onFilesSelected={addFiles}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />

      {/* File List */}
      <DocFileList
        files={files}
        jobs={jobs}
        working={working}
        onRemove={removeFile}
        onClearAll={clearAll}
        onTranslateAll={() => void translateAll()}
      />
    </div>
  );
}
