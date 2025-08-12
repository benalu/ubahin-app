// src/app/api/translate/deepl/route.ts
import { NextResponse } from "next/server";
import { assertAllowedOrigin, assertTextLimit, fetchWithTimeout } from "@/lib/security/server";

const DEEPL_ENDPOINT = "https://api.deepl.com/v2/translate";

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

type DeepLTranslateResponse = {
  translations: Array<{ detected_source_language?: string; text: string }>;
};

type RequestBody = { text: string | string[]; targetLang: string; sourceLang?: string };

export async function POST(req: Request) {
  try {
    // sesuaikan origin produksi kamu
    assertAllowedOrigin(req, ["http://localhost:", "https://ubahin.app", "https://www.ubahin.app"]);

    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "DEEPL_API_KEY is missing" }, { status: 500 });

    const body = (await req.json()) as unknown as RequestBody;
    const { text, targetLang, sourceLang } = body || {};
    if (!text || !targetLang) {
      return NextResponse.json({ error: "text and targetLang are required" }, { status: 400 });
    }

    const list = Array.isArray(text) ? text : [text];
    for (const t of list) assertTextLimit(t);

    const params = new URLSearchParams();
    for (const t of list) params.append("text", t);

    const mappedTarget = mapUiLangToDeepL(targetLang, "target");
    if (!mappedTarget) return NextResponse.json({ error: "Unsupported/invalid target language" }, { status: 400 });
    params.set("target_lang", mappedTarget);

    const mappedSource = mapUiLangToDeepL(sourceLang ?? "", "source");
    if (mappedSource) params.set("source_lang", mappedSource);

    const res = await fetchWithTimeout(DEEPL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }, 15000);

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.toLowerCase().includes("application/json");

    if (!res.ok) {
      const payload = isJson ? await res.json() : await res.text();
      const msg = isJson ? (payload?.message ?? payload?.error ?? "DeepL error") : String(payload).slice(0, 400);
      return NextResponse.json({ error: msg, detail: payload }, { status: res.status });
    }

    const data: DeepLTranslateResponse = isJson
      ? ((await res.json()) as DeepLTranslateResponse)
      : { translations: [{ text: await res.text() }] };

    return NextResponse.json(data);
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal error", detail: message }, { status });
  }
}

