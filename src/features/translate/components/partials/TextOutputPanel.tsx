// src/features/translate/components/partials/TextOutputPanel.tsx
"use client";

import { Check, Copy, Volume2 } from "lucide-react";
import ActionBar from "./text/ActionBar";
import FormattedText from "./text/FormattedText";

type Props = {
  text: string;
  loading: boolean;
  errorMsg: string | null;
  onCopy: () => void;
  onSpeak: () => void; // bisa dihubungkan ke useTTS().speak
  isCopied: boolean;
  stickyActionBar?: boolean;
};

function countWords(s: string) {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export default function TextOutputPanel({
  text,
  loading,
  errorMsg,
  onCopy,
  onSpeak,
  isCopied,
  stickyActionBar,
}: Props) {
  const hasText = !!text;

  return (
    <div className="relative bg-gray-50">
      <div className="p-6">
        <div
          className={`min-h-[200px] text-lg leading-relaxed ${
            !hasText && !loading && !errorMsg
              ? "flex items-center justify-center"
              : ""
          }`}
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? (
            // Skeleton sederhana
            <div aria-hidden className="animate-pulse space-y-3 w-full">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200 w-11/12"></div>
              <div className="h-4 rounded bg-gray-200 w-9/12"></div>
              <div className="h-4 rounded bg-gray-200 w-10/12"></div>
            </div>
          ) : hasText ? (
            <FormattedText text={text} className="text-gray-900 whitespace-pre-wrap" />
          ) : errorMsg ? (
            <p className="text-red-600">{errorMsg}</p>
          ) : (
            <p className="text-gray-500">Terjemahan</p>
          )}
        </div>
      </div>

      <ActionBar
        sticky={stickyActionBar}
        className="bg-gray-100"
        left={
          <>
            <button
              onClick={onCopy}
              disabled={!hasText}
              className="inline-flex items-center justify-center h-10 w-10 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Salin terjemahan"
              aria-label="Salin terjemahan"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </button>

            <button
              onClick={onSpeak}
              disabled={!hasText}
              className="inline-flex items-center justify-center h-10 w-10 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Dengarkan"
              aria-label="Dengarkan terjemahan"
            >
              <Volume2 className="h-4 w-4 text-gray-600" />
            </button>
          </>
        }
        right={
          hasText ? (
            <span className="text-xs text-gray-500">
              {text.length.toLocaleString("id")} karakter •{" "}
              {countWords(text).toLocaleString("id")} kata
            </span>
          ) : (
            <span className="text-xs text-gray-400">&nbsp;</span>
          )
        }
      />
    </div>
  );
}
