import { NextResponse } from "next/server";
import { assertAllowedOrigin, assertFileSafe, fetchWithTimeout } from "@/lib/security/server";

export const runtime = "nodejs";

const DEEPL_DOC_ENDPOINT = "https://api.deepl.com/v2/document";

function mapUiLangToDeepL(lang: string, kind: "source" | "target"): string | undefined {
  if (!lang || lang === "auto") return undefined;
  const lc = lang.toLowerCase();
  const table: Record<string, string> = {
    en: kind === "target" ? "EN-US" : "EN",
    pt: kind === "target" ? "PT-PT" : "PT",
    zh: kind === "target" ? "ZH-HANS" : "ZH",
    es: "ES", fr: "FR", de: "DE", ja: "JA", ko: "KO", ru: "RU", ar: "AR",
    id: "ID", it: "IT", nl: "NL", pl: "PL", tr: "TR", sv: "SV",
  };
  return table[lc] ?? lc.toUpperCase();
}

type UploadResponse = { document_id: string; document_key: string };

export async function POST(req: Request) {
  try {
    assertAllowedOrigin(req, ["http://localhost:", "https://ubahin.app", "https://www.ubahin.app"]);

    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "DEEPL_API_KEY is missing" }, { status: 500 });

    const form = await req.formData();
    const file = form.get("file");
    const targetLang = (form.get("targetLang") as string) || "";
    const sourceLang = (form.get("sourceLang") as string) || "";

    if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });
    assertFileSafe(file, 25);
    if (!targetLang) return NextResponse.json({ error: "targetLang is required" }, { status: 400 });

    const mappedTarget = mapUiLangToDeepL(targetLang, "target");
    if (!mappedTarget) return NextResponse.json({ error: "Unsupported/invalid target language" }, { status: 400 });
    const mappedSource = mapUiLangToDeepL(sourceLang, "source");

    const deeplForm = new FormData();
    deeplForm.set("file", file);
    deeplForm.set("target_lang", mappedTarget);
    if (mappedSource) deeplForm.set("source_lang", mappedSource);

    const res = await fetchWithTimeout(DEEPL_DOC_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
      body: deeplForm,
    }, 30000);

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.toLowerCase().includes("application/json");

    if (!res.ok) {
      const payload = isJson ? await res.json() : await res.text();
      const msg = isJson ? (payload?.message ?? payload?.error ?? "DeepL error") : String(payload).slice(0, 400);
      return NextResponse.json({ error: msg, detail: payload }, { status: res.status });
    }

    const data = (await res.json()) as UploadResponse;
    return NextResponse.json(data);
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal error", detail: message }, { status });
  }
}
