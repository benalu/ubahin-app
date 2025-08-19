// src/features/translate/components/partials/text/FormattedText.tsx
"use client";

import * as React from "react";

type Props = {
  text: string;
  className?: string;
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSafeHtml(input: string): string {
  if (!input) return "";

  // 1) Tandai segmen dengan placeholder aman
  let s = input;
  // Preserve existing tags by converting them to placeholders first
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/(strong|b)>/gi, "[STRONG]$2[/STRONG]");
  s = s.replace(/<(em|i)>([\s\S]*?)<\/(em|i)>/gi, "[EM]$2[/EM]");
  s = s.replace(/<(del|s|strike)>([\s\S]*?)<\/(del|s|strike)>/gi, "[DEL]$2[/DEL]");
  s = s.replace(/<u>([\s\S]+?)<\/u>/gi, "[U]$1[/U]");
  s = s.replace(/<br\s*\/?\s*>/gi, "[BR]");
  // Strikethrough ~~text~~
  s = s.replace(/~~([\s\S]+?)~~/g, "[DEL]$1[/DEL]");
  // Bold **text** (proses sebelum italic)
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, "[STRONG]$1[/STRONG]");
  // Italic *text*
  s = s.replace(/\*([\s\S]+?)\*/g, "[EM]$1[/EM]");

  // 2) Escape seluruh string agar aman
  s = escapeHtml(s);

  // 3) Kembalikan placeholder menjadi tag HTML yang diizinkan
  s = s
    .replace(/\[STRONG\]/g, "<strong>")
    .replace(/\[\/STRONG\]/g, "</strong>")
    .replace(/\[EM\]/g, "<em>")
    .replace(/\[\/EM\]/g, "</em>")
    .replace(/\[DEL\]/g, "<del>")
    .replace(/\[\/DEL\]/g, "</del>")
    .replace(/\[U\]/g, "<u>")
    .replace(/\[\/U\]/g, "</u>")
    .replace(/\[BR\]/g, "<br>");

  return s;
}

export default function FormattedText({ text, className }: Props) {
  const html = React.useMemo(() => toSafeHtml(text), [text]);
  return (
    <div
      className={className}
      // html sudah disanitasi via escapeHtml + whitelist tag placeholder
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

