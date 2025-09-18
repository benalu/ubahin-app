// src/lib/usage/store.ts
import { Redis } from "@upstash/redis";

type JsonPrimitive = string | number | boolean | null;
type Json = JsonPrimitive | Json[] | { [k: string]: Json };

export interface UsageStore {
  incrBy(key: string, n: number): Promise<number>;
  getNumber(key: string): Promise<number>;
  set(key: string, value: Json, ttlSec?: number): Promise<void>;
  get<T = Json>(key: string): Promise<T | null>;
  mget<T = Json>(...keys: string[]): Promise<(T | null)[]>;
}

class MemoryStore implements UsageStore {
  private m = new Map<string, { v: Json; exp?: number }>();

  async incrBy(key: string, n: number): Promise<number> {
    const cur = Number((await this.getNumber(key)) || 0);
    const next = cur + n;
    this.m.set(key, { v: next });
    return next;
  }

  async getNumber(key: string): Promise<number> {
    const v = await this.get(key);
    return typeof v === "number" ? v : Number(v ?? 0);
  }

  async set(key: string, value: Json, ttlSec?: number): Promise<void> {
    const exp = ttlSec ? Date.now() + ttlSec * 1000 : undefined;
    this.m.set(key, { v: value, exp });
  }

  async get<T = Json>(key: string): Promise<T | null> {
    const e = this.m.get(key);
    if (!e) return null;
    if (e.exp && e.exp < Date.now()) {
      this.m.delete(key);
      return null;
    }
    return e.v as T;
  }

  async mget<T = Json>(...keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((k) => this.get<T>(k)));
  }
}

let storeSingleton: UsageStore | null = null;

// ---------- helpers ----------
const TIMEOUT_MS: number = Number(process.env.UPSTASH_TIMEOUT_MS ?? 800);

function withTimeout<T>(p: Promise<T>, ms: number = TIMEOUT_MS, label: string = "op"): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`UPSTASH_TIMEOUT:${label}`)), ms)
    ),
  ]);
}

function stringifyError(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function logDev(message: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
}

/**
 * Global toggle:
 * - USE_UPSTASH=false   -> pakai MemoryStore walau env Upstash ada.
 * - default (true)      -> jika URL & TOKEN ada, pakai Upstash; jika tidak, fallback ke MemoryStore.
 * Tiap operasi dibungkus timeout + fallback agar tidak memblokir request utama.
 */
export function getUsageStore(): UsageStore {
  if (storeSingleton) return storeSingleton;

  const useUpstashFlag = (process.env.USE_UPSTASH ?? "true") !== "false";
  const hasRedisEnv =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

  const localFallback = new MemoryStore();

  if (useUpstashFlag && hasRedisEnv) {
    const retries = Math.max(0, Number(process.env.UPSTASH_RETRIES ?? 3));

    const r = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      // Jika versi @upstash/redis kamu belum expose type untuk retry/backoff di ctor,
      // cast ke unknown agar tetap typesafe tanpa any.
      retry: {
        retries,
        backoff: (i: number): number => Math.min(200 * 2 ** i, 1000), // 200ms, 400ms, 800ms, max 1000ms
      },
    } as unknown as ConstructorParameters<typeof Redis>[0]);

    storeSingleton = {
      async incrBy(key, n) {
        try {
          return await withTimeout(r.incrby(key, n), TIMEOUT_MS, "incrBy");
        } catch (e: unknown) {
          logDev("[usage] incrBy fell back to MemoryStore:", stringifyError(e));
          return localFallback.incrBy(key, n);
        }
      },

      async getNumber(key) {
        try {
          const v = await withTimeout(r.get<number>(key), TIMEOUT_MS, "getNumber");
          return Number(v ?? 0);
        } catch (e: unknown) {
          logDev("[usage] getNumber fell back to MemoryStore:", stringifyError(e));
          return localFallback.getNumber(key);
        }
      },

      async set(key, value, ttlSec) {
        try {
          if (ttlSec) {
            await withTimeout(r.set(key, value, { ex: ttlSec }), TIMEOUT_MS, "set");
          } else {
            await withTimeout(r.set(key, value), TIMEOUT_MS, "set");
          }
        } catch (e: unknown) {
          logDev("[usage] set fell back to MemoryStore:", stringifyError(e));
          await localFallback.set(key, value, ttlSec);
        }
      },

      async get<T = Json>(key: string) {
        try {
          const v = await withTimeout(r.get<T>(key), TIMEOUT_MS, "get");
          return (v as T) ?? null;
        } catch (e: unknown) {
          logDev("[usage] get fell back to MemoryStore:", stringifyError(e));
          return localFallback.get<T>(key);
        }
      },

      async mget<T = Json>(...keys: string[]) {
        try {
          const arr = (await withTimeout(r.mget(...keys), TIMEOUT_MS, "mget")) as (T | null)[];
          return arr ?? [];
        } catch (e: unknown) {
          logDev("[usage] mget fell back to MemoryStore:", stringifyError(e));
          return localFallback.mget<T>(...keys);
        }
      },
    };

    logDev("[usage] Using Upstash Redis store (with timeout + fallback)");
  } else {
    storeSingleton = localFallback;
    const reason = useUpstashFlag ? "no Redis configured" : "Upstash disabled via USE_UPSTASH=false";
    logDev(`[usage] Using in-memory store (${reason})`);
  }

  return storeSingleton;
}
