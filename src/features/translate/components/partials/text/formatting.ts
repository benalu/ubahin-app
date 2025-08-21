// src/features/translate/components/partials/text/formatting.ts
"use client";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function toSafeHtml(input: string): string {
  if (!input) return "";

  // 1) Placeholder wrapping
  let s = input;
  s = s.replace(/~~([\s\S]+?)~~/g, "[DEL]$1[/DEL]");
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, "[STRONG]$1[/STRONG]");
  s = s.replace(/\*([\s\S]+?)\*/g, "[EM]$1[/EM]");
  s = s.replace(/<u>([\s\S]+?)<\/u>/gi, "[U]$1[/U]");

  // 2) Escape HTML
  s = escapeHtml(s);

  // 3) Convert placeholders back to allowed tags
  s = s
    .replace(/\[STRONG\]/g, "<strong>")
    .replace(/\[\/STRONG\]/g, "</strong>")
    .replace(/\[EM\]/g, "<em>")
    .replace(/\[\/EM\]/g, "</em>")
    .replace(/\[DEL\]/g, "<del>")
    .replace(/\[\/DEL\]/g, "</del>")
    .replace(/\[U\]/g, "<u>")
    .replace(/\[\/U\]/g, "</u>");

  // Normalize newlines to <br>
  s = s.replace(/\r?\n/g, "<br>");

  return s;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// Convert a subset of HTML produced by contenteditable into our marker text
export function htmlToMarkers(html: string): string {
  if (!html) return "";
  let s = html;

  // Normalize block-level elements to newlines
  s = s.replace(/\s*<(div|p)[^>]*>\s*/gi, "");
  s = s.replace(/<\/(div|p)>\s*/gi, "\n");

  // <br> to newline
  s = s.replace(/<br\s*\/?\s*>/gi, "\n");

  // Convert formatting tags to markers
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/(strong|b)>/gi, (_, _t1, inner) => `**${inner}**`);
  s = s.replace(/<(em|i)>([\s\S]*?)<\/(em|i)>/gi, (_, _t1, inner) => `*${inner}*`);
  s = s.replace(/<(del|s|strike)>([\s\S]*?)<\/(del|s|strike)>/gi, (_, _t1, inner) => `~~${inner}~~`);
  s = s.replace(/<u>([\s\S]*?)<\/u>/gi, (_, inner) => `<u>${inner}</u>`);

  // Remove any other tags but keep text
  s = s.replace(/<[^>]+>/g, "");

  // Decode entities
  s = decodeEntities(s);

  // Normalize multiple newlines
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

// Convert our marker syntax into simple XML/HTML tags for translation providers
export function markersToXml(input: string): string {
  if (!input) return "";
  let s = input;
  // Normalize line breaks to <br/>
  s = s.replace(/\r?\n/g, "<br/>");
  // Convert markers to tags
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([\s\S]+?)\*/g, "<em>$1</em>");
  s = s.replace(/__([\s\S]+?)__/g, "<strong>$1</strong>");
  s = s.replace(/_([\s\S]+?)_/g, "<em>$1</em>");
  s = s.replace(/~~([\s\S]+?)~~/g, "<del>$1</del>");
  // Preserve underline marker as tag
  // If user literally typed <u>...</u> keep it
  return s;
}

