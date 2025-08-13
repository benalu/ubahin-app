// src/app/api/translate/deepl/document/status/route.ts
import { NextResponse } from "next/server";
import { assertAllowedOrigin, fetchWithTimeout } from "@/lib/security/server";

export const runtime = "nodejs";

type StatusResponse = {
  document_id: string;
  status: "queued" | "translating" | "done" | "error";
  seconds_remaining?: number;
  billed_characters?: number;
  error_message?: string;
};

export async function GET(req: Request) {
  try {
    assertAllowedOrigin(req, ["http://localhost:", "https://ubahin.app", "https://www.ubahin.app"]);

    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "DEEPL_API_KEY is missing" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("document_id");
    const key = searchParams.get("document_key");
    if (!id || !key) return NextResponse.json({ error: "document_id and document_key are required" }, { status: 400 });

    const url = new URL(`https://api.deepl.com/v2/document/${encodeURIComponent(id)}`);
    url.searchParams.set("document_key", key);

    const res = await fetchWithTimeout(url.toString(), {
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
    }, 15000);

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.toLowerCase().includes("application/json");

    if (!res.ok) {
      const payload = isJson ? await res.json() : await res.text();
      const msg = isJson ? (payload?.message ?? payload?.error ?? "DeepL error") : String(payload).slice(0, 400);
      return NextResponse.json({ error: msg, detail: payload }, { status: res.status });
    }

    const data = (await res.json()) as StatusResponse;
    return NextResponse.json(data);
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal error", detail: message }, { status });
  }
}
