// src/features/translate/components/partials/TextOutputPanel.tsx
"use client";

import { Check, Copy, Volume2 } from "lucide-react";

type Props = {
  text: string;
  loading: boolean;
  errorMsg: string | null;
  onCopy: () => void;
  onSpeak: () => void;
  isCopied: boolean;
};

export default function TextOutputPanel({
  text,
  loading,
  errorMsg,
  onCopy,
  onSpeak,
  isCopied,
}: Props) {
  return (
    <div className="relative bg-gray-50">
      <div className="p-6">
        <div
          className={`min-h-[200px] text-lg leading-relaxed ${
            !text && !loading ? "flex items-center justify-center" : ""
          }`}
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? (
            <p className="text-gray-500">Translating…</p>
          ) : text ? (
            <div className="text-gray-900 whitespace-pre-wrap">{text}</div>
          ) : errorMsg ? (
            <p className="text-red-600">{errorMsg}</p>
          ) : (
            <p className="text-gray-400">Translation</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 bg-gray-100 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            disabled={!text}
            className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Copy translation"
            aria-label="Copy translation"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={onSpeak}
            disabled={!text}
            className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Listen"
            aria-label="Listen"
          >
            <Volume2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {text ? `${text.length} characters` : ""}
        </span>
      </div>
    </div>
  );
}
