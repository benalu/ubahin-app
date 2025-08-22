// src/features/translate/components/partials/TextInputPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Check, Copy, Italic, RotateCcw, Strikethrough, Type, Underline } from "lucide-react";
import AccessibleProgress from "./text/AccessibleProgress";
import ActionBar from "./text/ActionBar";
import { autoResize } from "@/features/translate/utils/autoResize";
import { toSafeHtml, htmlToMarkers } from "./text/formatting";

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [formatState, setFormatState] = useState({ bold: false, italic: false, underline: false, strike: false });
  const hasContent = value.trim().length > 0;
  const percentage = Math.min((charCount / maxChars) * 100, 100);

  const progressColor = isOverLimit
    ? "bg-red-500"
    : percentage > 80
    ? "bg-amber-500"
    : "bg-blue-500";

  // Keep the contenteditable in sync when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    const safeHtml = toSafeHtml(value);
    if (editorRef.current.innerHTML !== safeHtml) {
      editorRef.current.innerHTML = safeHtml || "";
    }
  }, [value]);

  // Sync format active state with current selection
  useEffect(() => {
    const refresh = () => {
      const el = editorRef.current;
      if (!el) return;
      const sel = document.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setFormatState({ bold: false, italic: false, underline: false, strike: false });
        return;
      }
      const anchor = sel.anchorNode as Node | null;
      const isInside = anchor ? el.contains(anchor) : false;
      if (!isInside) {
        setFormatState({ bold: false, italic: false, underline: false, strike: false });
        return;
      }
      try {
        const bold = document.queryCommandState("bold");
        const italic = document.queryCommandState("italic");
        const underline = document.queryCommandState("underline");
        const strike = document.queryCommandState("strikeThrough");
        setFormatState({ bold, italic, underline, strike });
      } catch {
        // ignore
      }
    };

    const handleSelectionChange = () => refresh();
    document.addEventListener("selectionchange", handleSelectionChange);
    const el = editorRef.current;
    el?.addEventListener("keyup", refresh);
    el?.addEventListener("mouseup", refresh);
    // initial
    refresh();
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      el?.removeEventListener("keyup", refresh);
      el?.removeEventListener("mouseup", refresh);
    };
  }, []);

  return (
    <div className="relative">
      {/* Area input utama */}
      <div className="p-6 border-b border-gray-100 lg:border-b-0 lg:border-r">
        <div className="relative">
          {/* Hidden textarea for accessibility and fallback */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              autoResize(e.target);
            }}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />

          {/* Contenteditable editor */}
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-multiline
            aria-label="Teks sumber"
            data-placeholder="Ketik teks yang ingin diterjemahkan…"
            className={`min-h-[200px] w-full outline-none bg-transparent text-gray-900 text-lg leading-relaxed relative z-10 whitespace-pre-wrap ${
              isOverLimit ? "text-red-700" : ""
            }`}
            onInput={(e) => {
              const html = (e.currentTarget as HTMLDivElement).innerHTML;
              const markers = htmlToMarkers(html);
              onChange(markers);
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData?.getData("text/plain") ?? "";
              document.execCommand("insertText", false, text);
            }}
          />

          {/* Placeholder visual */}
          {!hasContent && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <SimpleEmptyState />
            </div>
          )}
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

            {/* Toolbar formatting - tampil hanya saat ada input */}
            {hasContent && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-[60vw] md:max-w-none">
                <button
                  onClick={() => {
                    document.execCommand("bold");
                  }}
                  className={`inline-flex items-center justify-center h-10 w-10 rounded transition-colors ${
                    formatState.bold ? "bg-gray-300" : "hover:bg-gray-200"
                  }`}
                  title="Bold"
                  aria-label="Bold"
                  aria-pressed={formatState.bold}
                >
                  <Bold className="h-4 w-4 text-gray-700" />
                </button>

                <button
                  onClick={() => {
                    document.execCommand("italic");
                  }}
                  className={`inline-flex items-center justify-center h-10 w-10 rounded transition-colors ${
                    formatState.italic ? "bg-gray-300" : "hover:bg-gray-200"
                  }`}
                  title="Italic"
                  aria-label="Italic"
                  aria-pressed={formatState.italic}
                >
                  <Italic className="h-4 w-4 text-gray-700" />
                </button>

                <button
                  onClick={() => {
                    document.execCommand("strikeThrough");
                  }}
                  className={`inline-flex items-center justify-center h-10 w-10 rounded transition-colors ${
                    formatState.strike ? "bg-gray-300" : "hover:bg-gray-200"
                  }`}
                  title="Strikethrough"
                  aria-label="Strikethrough"
                  aria-pressed={formatState.strike}
                >
                  <Strikethrough className="h-4 w-4 text-gray-700" />
                </button>

                <button
                  onClick={() => {
                    // execCommand does not have underline in some browsers; fallback to wrap selection
                    if (document.queryCommandSupported && document.queryCommandSupported("underline")) {
                      document.execCommand("underline");
                    } else if (window.getSelection) {
                      const sel = window.getSelection();
                      if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        const u = document.createElement("u");
                        range.surroundContents(u);
                      }
                    }
                  }}
                  className={`inline-flex items-center justify-center h-10 w-10 rounded transition-colors ${
                    formatState.underline ? "bg-gray-300" : "hover:bg-gray-200"
                  }`}
                  title="Underline"
                  aria-label="Underline"
                  aria-pressed={formatState.underline}
                >
                  <Underline className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            )}
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