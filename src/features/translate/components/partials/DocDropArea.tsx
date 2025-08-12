// src/features/translate/components/partials/DocDropArea.tsx
"use client";

import { Upload } from "lucide-react";
import type { RefObject, MutableRefObject, Ref } from "react";

type InputRef = RefObject<HTMLInputElement> | MutableRefObject<HTMLInputElement | null>;

type Props = {
  accept: string;
  fileInputRef: InputRef; // ⬅️ terima kedua tipe
  isDragging: boolean;
  onFilesSelected: (files: FileList) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
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
    <div className="border-2 border-dashed border-gray-200 rounded-xl">
      <input
        // Cast ke Ref<HTMLInputElement> supaya cocok dengan prop 'ref'
        ref={fileInputRef as unknown as Ref<HTMLInputElement>}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`cursor-pointer p-12 text-center transition-all ${
          isDragging ? "border-blue-400 bg-blue-50" : "hover:bg-gray-50"
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-xl font-medium text-gray-700 mb-2">
          Choose files or drag here
        </p>
        <p className="text-gray-500">
          Supported: DOC/DOCX, PPTX, XLSX, PDF, HTML/HTM, TXT, XLF/XLIFF 2.1, SRT • up to 25MB
        </p>
      </div>
    </div>
  );
}
