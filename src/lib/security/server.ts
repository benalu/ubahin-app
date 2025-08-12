import { DEEPL_DOC_EXTS, DEEPL_DOC_MIMES } from "@/lib/constants/translateDocs";

/** Allow only specific origins (prefix match supports localhost:xxxx). */
export function assertAllowedOrigin(req: Request, allowed: string[]): void {
  const origin = req.headers.get("origin") || "";
  if (!origin) return; // server-to-server ok
  const ok = allowed.some((o) => origin.startsWith(o));
  if (!ok) {
    const err: Error & { status?: number } = new Error("Forbidden origin");
    err.status = 403;
    throw err;
  }
}

/** fetch dengan timeout (abort). */
export function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

/** Sanitasi nama file untuk header Content-Disposition. */
export function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\- ]+/g, "_").slice(0, 128);
}

// gunakan subset DeepL (DRY dgn frontend)
const ALLOWED_EXT = new Set<string>(DEEPL_DOC_EXTS);
export const ALLOWED_MIME = new Set<string>([...DEEPL_DOC_MIMES, "application/octet-stream"]);

/** Validasi ukuran & tipe file: utamakan ekstensi (DeepL docs), fallback ke MIME umum. */
export function assertFileSafe(file: File, maxMB = 25) {
  if (file.size > maxMB * 1024 * 1024) {
    const err: Error & { status?: number } = new Error("File too large");
    err.status = 413;
    throw err;
  }

  const ext = (file.name.split(".").pop() || "").toLowerCase();

  if (ALLOWED_EXT.has(ext)) return;

  const t = (file.type || "").toLowerCase();
  if (t && [...ALLOWED_MIME].some((m) => t === m || t.startsWith(m))) return;

  const err: Error & { status?: number } = new Error("Unsupported file type");
  err.status = 415;
  throw err;
}

/** Batasi panjang text di server untuk cegah abuse. */
export function assertTextLimit(text: string, maxChars = 5000) {
  if (text.length > maxChars + 100) {
    const err: Error & { status?: number } = new Error("Text too long");
    err.status = 413;
    throw err;
  }
}
