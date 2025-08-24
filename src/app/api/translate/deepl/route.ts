// src/app/api/translate/deepl/route.ts

import { NextResponse } from "next/server";
import { assertAllowedOrigin, assertTextLimit, fetchWithTimeout } from "@/lib/security/server";
import { recordUsage, willExceedDailyLimit } from "@/lib/usage/usage";
import { normalizeUiCode, toDeepLCode } from "@/lib/constants/lang";

const PROVIDER = "deepl";
const DEEPL_ENDPOINT = "https://api.deepl.com/v2/translate";

type DeepLTranslateResponse = {
  translations: Array<{ detected_source_language?: string; text: string }>;
};
type RequestBody = { text: string | string[]; targetLang: string; sourceLang?: string };

export async function POST(req: Request) {
  let units = 0; // chars
  try {
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
    units = list.reduce((acc, t) => acc + (t?.length ?? 0), 0);

    if (await willExceedDailyLimit(PROVIDER, units)) {
      return NextResponse.json({ error: "Daily translation quota exceeded" }, { status: 429 });
    }

    const params = new URLSearchParams();
    for (const t of list) params.append("text", t);

    // Normalisasi UI → DeepL
    const uiTarget = normalizeUiCode(targetLang);
    const uiSource = normalizeUiCode(sourceLang ?? "");
    const mappedTarget = toDeepLCode(uiTarget, "target"); // ✅ ui dulu, lalu kind
    const mappedSource = uiSource === "auto" ? undefined : toDeepLCode(uiSource, "source");

    if (!mappedTarget) {
      return NextResponse.json({ error: "Unsupported/invalid target language" }, { status: 400 });
    }

    params.set("target_lang", mappedTarget);
    if (mappedSource) params.set("source_lang", mappedSource);

    // Jaga tag formatting (bold/italic/underline/strike)
    params.set("tag_handling", "xml");
    params.set("preserve_formatting", "1");

    const res = await fetchWithTimeout(
      DEEPL_ENDPOINT,
      {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
      15000
    );

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.toLowerCase().includes("application/json");

    if (!res.ok) {
      const payload = isJson ? await res.json() : await res.text();
      const msg = isJson ? (payload?.message ?? payload?.error ?? "DeepL error") : String(payload).slice(0, 400);
      await recordUsage(PROVIDER, units, false);
      return NextResponse.json({ error: msg, detail: payload }, { status: res.status });
    }

    const data: DeepLTranslateResponse = isJson
      ? ((await res.json()) as DeepLTranslateResponse)
      : { translations: [{ text: await res.text() }] };

    await recordUsage(PROVIDER, units, true);
    return NextResponse.json(data);
  } catch (err) {
    await recordUsage(PROVIDER, units, false);
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal error", detail: message }, { status });
  }
}



