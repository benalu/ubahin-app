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

export function getUsageStore(): UsageStore {
  if (storeSingleton) return storeSingleton;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const r = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    storeSingleton = {
      async incrBy(key, n) {
        return await r.incrby(key, n);
      },
      async getNumber(key) {
        const v = await r.get<number>(key);
        return Number(v ?? 0);
      },
      async set(key, value, ttlSec) {
        if (ttlSec) await r.set(key, value, { ex: ttlSec });
        else await r.set(key, value);
      },
      async get<T = Json>(key: string) {
        const v = await r.get<T>(key);
        return (v as T) ?? null;
      },
      async mget<T = Json>(...keys: string[]) {
        const arr = await r.mget<T[]>(...keys);
        return (arr as (T | null)[]) ?? [];
      },
    };
  } else {
    storeSingleton = new MemoryStore();
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[usage] Using in-memory store (no Redis configured)");
    }
  }
  return storeSingleton;
}
