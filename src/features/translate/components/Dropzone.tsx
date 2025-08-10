"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { ThinFile } from "@/features/translate/types";
import { getFileIcon } from "@/features/translate/utils/fileIcon";

type Props = {
  files: ThinFile[];
  onAddFiles: (fileList: FileList) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  onTranslate?: () => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
};

export default function Dropzone({
  files,
  onAddFiles,
  onRemoveFile,
  onClearAll,
  onTranslate,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
  multiple = true,
  className = "",
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length) {
        onAddFiles(e.target.files);
        // reset supaya memilih file yang sama 2x tetap men-trigger change
        e.currentTarget.value = "";
      }
    },
    [onAddFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        onAddFiles(e.dataTransfer.files);
      }
    },
    [onAddFiles]
  );

  return (
    <div className={`border-2 border-dashed border-gray-200 rounded-xl ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={onInputChange}
        className="hidden"
      />

      {/* Drop Area */}
      <div
        role="button"
        onClick={handleBrowse}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`cursor-pointer p-12 text-center transition-all select-none ${
          isDragging ? "border-blue-400 bg-blue-50" : "hover:bg-gray-50"
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-xl font-medium text-gray-700 mb-2">
          Choose files or drag here
        </p>
        <p className="text-gray-500">PDF, Word, PowerPoint, Excel up to 25MB</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4 space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 bg-white p-3 rounded-lg"
              >
                <span className="text-2xl">{getFileIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB • Ready to translate
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClearAll}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
                <button
                  onClick={onTranslate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={!onTranslate}
                >
                  Translate files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
