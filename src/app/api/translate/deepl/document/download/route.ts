// src/app/api/translate/deepl/document/download/route.ts

import { fetchWithTimeout, sanitizeFilename, assertAllowedOrigin } from "@/lib/security/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    assertAllowedOrigin(req, ["http://localhost:", "https://ubahin.app", "https://www.ubahin.app"]);

    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "DEEPL_API_KEY is missing" }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("document_id");
    const key = searchParams.get("document_key");
    const rawName = searchParams.get("name") || "translated";
    if (!id || !key) {
      return new Response(JSON.stringify({ error: "document_id and document_key are required" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(`https://api.deepl.com/v2/document/${encodeURIComponent(id)}/result`);
    url.searchParams.set("document_key", key);

    const res = await fetchWithTimeout(url.toString(), {
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
    }, 60000);

    if (!res.ok || !res.body) {
      const ct = res.headers.get("content-type") || "";
      const isJson = ct.toLowerCase().includes("application/json");
      const payload = isJson ? await res.json() : await res.text();
      const msg = isJson ? (payload?.message ?? payload?.error ?? "DeepL error") : String(payload).slice(0, 400);
      return new Response(JSON.stringify({ error: msg, detail: payload }), {
        status: res.status, headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const safe = sanitizeFilename(rawName);
    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safe}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });

    return new Response(res.body, { status: 200, headers });
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal error", detail: message }), {
      status, headers: { "Content-Type": "application/json" },
    });
  }
}
