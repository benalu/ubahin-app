// src/features/translate/components/partials/DocDropArea.tsx
"use client";

import { Upload } from "lucide-react";
import type { RefObject, MutableRefObject, Ref } from "react";

type InputRef =
  | RefObject<HTMLInputElement>
  | MutableRefObject<HTMLInputElement | null>;

type Props = {
  accept: string;
  fileInputRef: InputRef;
  isDragging: boolean;
  onFilesSelected: (files: FileList) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
};

export default function DocDropArea({
  accept,
  fileInputRef,
  isDragging,
  onFilesSelected,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) {
  return (
    <div
      className={[
        "relative rounded-xl overflow-hidden",
        "border-1", // ketebalan tetap (agar layout tidak berubah)
        isDragging ? "border-transparent" : "border-black", // ⬅️ sembunyikan border saat drag
      ].join(" ")}
    >
      <input
        ref={fileInputRef as unknown as Ref<HTMLInputElement>}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        className="hidden"
      />

      {/* Overlay highlight (border dashed biru + tint) */}
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-xl",
          "transition-opacity duration-150",
          isDragging ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-blue-50/70" />
        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-blue-600" />
      </div>

      {/* Konten clickable */}
      <div
        role="button"
        tabIndex={0}
        aria-dropeffect="copy"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "relative z-10 w-full min-h-[360px]",
          "flex flex-col items-center justify-center",
          "p-12 text-center transition-colors",
          isDragging ? "cursor-copy" : "hover:bg-gray-50 cursor-pointer",
        ].join(" ")}
      >
        <Upload
          className={[
            "mx-auto mb-4 h-12 w-12",
            isDragging ? "text-blue-600" : "text-gray-400",
          ].join(" ")}
        />
        <p className="mb-2 text-xl font-medium text-gray-700">
          {isDragging
            ? "Lepas file di sini untuk mengunggah"
            : "Seret File ke sini atau klik untuk memilih"}
        </p>
        <p className="text-gray-500">
          Kami mendukung .doc(x), .htm(l), .pdf, .pptx, dan .txt
        </p>
      </div>
    </div>
  );
}
