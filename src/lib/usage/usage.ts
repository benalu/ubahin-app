// src/lib/usage/usage.ts
import { getUsageStore } from "./store";

function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PREFIX = "usage";

const K = {
  dayUnits: (provider: string, day = ymd()) => `${PREFIX}:${provider}:units:day:${day}`,
  dayReqs: (provider: string, day = ymd()) => `${PREFIX}:${provider}:req:day:${day}`,
  totalUnits: (provider: string) => `${PREFIX}:${provider}:units:total`,
  totalReqs: (provider: string) => `${PREFIX}:${provider}:req:total`,
  configDailyLimit: (provider: string) => `${PREFIX}:${provider}:config:daily_limit`,
};

export type UsageSnapshot = {
  day: string;
  units: number; // contoh: chars untuk DeepL, credits/dsb untuk provider lain
  reqs: number;
};

export async function getDailyLimit(provider: string): Promise<number> {
  const store = getUsageStore();
  const conf = await store.getNumber(K.configDailyLimit(provider));
  if (conf > 0) return conf;
  // fallback khusus deepl agar kompatibel dengan env lama
  if (provider === "deepl") {
    const envDefault = Number(process.env.DEEPL_DAILY_CHAR_LIMIT ?? 0);
    return envDefault > 0 ? envDefault : 0;
  }
  return 0; // default: unlimited
}

export async function setDailyLimit(provider: string, limit: number): Promise<void> {
  const store = getUsageStore();
  await store.set(K.configDailyLimit(provider), limit);
}

export async function recordUsage(provider: string, units: number, ok: boolean): Promise<void> {
  const store = getUsageStore();
  const dayKeyUnits = K.dayUnits(provider);
  const dayKeyReqs = K.dayReqs(provider);
  await Promise.all([
    store.incrBy(dayKeyReqs, 1),
    store.incrBy(K.totalReqs(provider), 1),
    ok ? store.incrBy(dayKeyUnits, units) : Promise.resolve(0),
    ok ? store.incrBy(K.totalUnits(provider), units) : Promise.resolve(0),
  ]);
}

export async function getToday(provider: string): Promise<UsageSnapshot> {
  const store = getUsageStore();
  const day = ymd();
  const [units, reqs] = await Promise.all([
    store.getNumber(K.dayUnits(provider, day)),
    store.getNumber(K.dayReqs(provider, day)),
  ]);
  return { day, units, reqs };
}

export async function getLastNDays(provider: string, n = 7): Promise<UsageSnapshot[]> {
  const store = getUsageStore();
  const out: UsageSnapshot[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const day = ymd(d);
    const [units, reqs] = await Promise.all([
      store.getNumber(K.dayUnits(provider, day)),
      store.getNumber(K.dayReqs(provider, day)),
    ]);
    out.push({ day, units, reqs });
  }
  return out.reverse();
}

export async function willExceedDailyLimit(provider: string, incomingUnits: number): Promise<boolean> {
  const limit = await getDailyLimit(provider);
  if (limit <= 0) return false;
  const today = await getToday(provider);
  return today.units + incomingUnits > limit;
}

