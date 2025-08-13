// src/app/api/admin/usage/[provider]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLastNDays, getToday, getDailyLimit, setDailyLimit } from "@/lib/usage/usage";

const COOKIE_NAME = "dev_monitor"; // cookie admin yg kita set via /api/dev-monitor

function assertAdmin(req: NextRequest) {
  // DEV: bypass untuk memudahkan
  const c = req.cookies.get(COOKIE_NAME)?.value;
  if (c !== "1") throw new Error("Unauthorized");
}

type ProviderParams = { provider: string };

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<ProviderParams> }
) {
  try {
    assertAdmin(req);

    const { provider } = await ctx.params; // ⬅️ WAJIB await
    const p = (provider || "").toLowerCase();

    let official: unknown;
    if (p === "deepl") {
      const apiKey = process.env.DEEPL_API_KEY;
      if (apiKey) {
        try {
          const r = await fetch("https://api.deepl.com/v2/usage", {
            headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
            cache: "no-store",
          });
          if (r.ok) official = await r.json();
        } catch {
          // biarkan official undefined kalau gagal
        }
      }
    }
    // TODO: if (p === "cloudconvert") { fetch official usage-nya di sini }

    const [today, last7, dailyLimit] = await Promise.all([
      getToday(p),
      getLastNDays(p, 7),
      getDailyLimit(p),
    ]);

    return NextResponse.json({ provider: p, today, last7, dailyLimit, official });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<ProviderParams> }
) {
  try {
    assertAdmin(req);

    const { provider } = await ctx.params; // ⬅️ WAJIB await
    const p = (provider || "").toLowerCase();

    const body = await req.json().catch(() => ({}));
    const limit = Number(body?.dailyLimit);
    if (!Number.isFinite(limit) || limit < 0) {
      return NextResponse.json({ error: "Invalid dailyLimit" }, { status: 400 });
    }

    await setDailyLimit(p, limit);
    return NextResponse.json({ ok: true, dailyLimit: limit });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
