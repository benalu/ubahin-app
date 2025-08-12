// src/features/translate/components/partials/TextInputPanel.tsx
"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
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
};

export default function TextInputPanel({
  value,
  onChange,
  onCopy,
  onClear,
  isCopied,
  charCount,
  maxChars,
  isOverLimit,
}: Props) {
  return (
    <div className="relative">
      <div className="p-6 border-b border-gray-100 lg:border-b-0 lg:border-r">
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            autoResize(e.target);
          }}
          placeholder="Enter text"
          aria-label="Source text"
          className={`w-full resize-none border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-lg leading-relaxed min-h-[200px] ${
            isOverLimit ? "text-red-600" : ""
          }`}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Copy"
            aria-label="Copy source text"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Clear"
            aria-label="Clear"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <span
          className={`text-xs ${isOverLimit ? "text-red-600 font-medium" : "text-gray-500"}`}
        >
          {charCount.toLocaleString()} / {maxChars.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
