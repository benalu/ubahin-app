// src/features/translate/components/partials/TextInputPanel.tsx
"use client";

import { Check, Copy, RotateCcw, Type } from "lucide-react";
import AccessibleProgress from "./text/AccessibleProgress";
import ActionBar from "./text/ActionBar";
import { autoResize } from "@/features/translate/utils/autoResize";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
  onClear: () => void;
  isCopied: boolean;
  charCount: number;
  maxChars: number;
  isOverLimit: boolean;
  stickyActionBar?: boolean; // optional: bikin action bar nempel di bawah
};

// Empty state sederhana
const SimpleEmptyState = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <Type className="h-12 w-12 text-gray-300 mb-3" />
    <p className="text-gray-400 text-center max-w-sm">
      Ketik atau tempel teks yang ingin diterjemahkan
    </p>
    <div className="mt-3 flex items-center gap-4 text-xs text-gray-300">
      <span>💡 Ctrl+V untuk paste</span>
      <span>⚡ Deteksi otomatis bahasa</span>
    </div>
  </div>
);

export default function TextInputPanel({
  value,
  onChange,
  onCopy,
  onClear,
  isCopied,
  charCount,
  maxChars,
  isOverLimit,
  stickyActionBar,
}: Props) {
  const hasContent = value.trim().length > 0;
  const percentage = Math.min((charCount / maxChars) * 100, 100);

  const progressColor = isOverLimit
    ? "bg-red-500"
    : percentage > 80
    ? "bg-amber-500"
    : "bg-blue-500";

  return (
    <div className="relative">
      {/* Area input utama */}
      <div className="p-6 border-b border-gray-100 lg:border-b-0 lg:border-r">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              autoResize(e.target);
            }}
            placeholder="Ketik teks yang ingin diterjemahkan…"
            aria-label="Teks sumber"
            aria-invalid={isOverLimit}
            aria-describedby={isOverLimit ? "charlimit-help" : undefined}
            className={`w-full resize-none border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-lg leading-relaxed min-h-[200px] relative z-10 ${
              isOverLimit ? "text-red-700" : ""
            }`}
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck
          />

          {!hasContent && <SimpleEmptyState />}
        </div>
      </div>

      {/* Action bar (reusable) */}
      <ActionBar
        sticky={stickyActionBar}
        className="bg-gray-50"
        left={
          <>
            {/* Tombol copy berukuran konsisten agar tidak geser saat state berubah */}
            <button
              onClick={onCopy}
              disabled={!hasContent}
              className="inline-flex items-center justify-center h-10 w-10 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Salin"
              aria-label="Salin teks sumber"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </button>

            <button
              onClick={onClear}
              disabled={!hasContent}
              className="inline-flex items-center justify-center h-10 w-10 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Hapus"
              aria-label="Hapus teks"
            >
              <RotateCcw className="h-4 w-4 text-gray-600" />
            </button>
          </>
        }
        right={
          <>
            {/* Progress karakter yang aksesibel */}
            <AccessibleProgress
              value={charCount}
              max={maxChars}
              label="Pemakaian karakter"
              barClassName={progressColor}
            />

            {/* Counter */}
            <span
              className={`text-xs ${
                isOverLimit ? "text-red-600 font-medium" : "text-gray-500"
              }`}
            >
              {charCount.toLocaleString("id")} /{" "}
              {maxChars.toLocaleString("id")}
            </span>
          </>
        }
      />

      {/* Banner over-limit + aksi potong cepat */}
      {isOverLimit && (
        <div
          id="charlimit-help"
          className="px-6 py-2 bg-red-50 border-t border-red-200"
        >
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01"
              />
            </svg>
            <span>
              Teks melebihi batas {maxChars.toLocaleString("id")} karakter
            </span>
            <button
              type="button"
              className="ml-2 underline hover:opacity-80"
              onClick={() => onChange(value.slice(0, maxChars))}
            >
              Potong ke batas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
