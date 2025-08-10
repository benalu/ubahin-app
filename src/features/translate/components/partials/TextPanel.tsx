"use client";

import { forwardRef } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";

type Props = {
  value: string;
  placeholder?: string;
  onChange: (value: string, element?: HTMLTextAreaElement) => void;
  onCopy: () => void;
  onClear: () => void;
  charCount: number;
  maxChars: number;
  isOverLimit?: boolean;
};

const TextPanel = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      value,
      placeholder = "Enter text",
      onChange,
      onCopy,
      onClear,
      charCount,
      maxChars,
      isOverLimit = false,
    },
    ref
  ) => {
    // Catatan: status "copied" di-panel input mengikuti strategi parent (opsional).
    // Agar sederhana, tombol copy selalu ikon Copy kecuali kamu kirim state khusus.

    return (
      <div className="relative">
        <div className="p-6 border-b border-gray-100 lg:border-b-0 lg:border-r">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value, e.currentTarget)}
            placeholder={placeholder}
            className={`w-full resize-none border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-lg leading-relaxed min-h-[200px] ${
              isOverLimit ? "text-red-600" : ""
            }`}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Copy"
            >
              {/* biar konsisten tampil icon Copy (kalau mau ada state copied, kirim via props) */}
              <Copy className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={onClear}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Clear"
            >
              <RotateCcw className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <span
            className={`text-xs ${
              isOverLimit ? "text-red-600 font-medium" : "text-gray-500"
            }`}
          >
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
);

TextPanel.displayName = "TextPanel";
export default TextPanel;
