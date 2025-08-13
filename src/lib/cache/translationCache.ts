// src/lib/cache/translationCache.ts

// -------------------- Generic LRU Cache --------------------
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // ms
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

export class LRUTranslationCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };

  constructor(maxSize = 1000, defaultTTL = 1000 * 60 * 30) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictLRU(): void {
    let oldestKey = "";
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
  }

  private cleanup(): void {
    const expiredKeys: string[] = [];
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) expiredKeys.push(key);
    }
    expiredKeys.forEach((key) => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  set(key: string, value: T, ttl?: number): void {
    // Cleanup expired entries periodically
    if (Math.random() < 0.01) this.cleanup(); // ~1%

    // Evict if at capacity
    if (this.cache.size >= this.maxSize) this.evictLRU();

    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl: ttl ?? this.defaultTTL,
      accessCount: 0,
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return undefined;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.value;
  }

  has(key: string): boolean {
    // NOTE: uses get() to respect TTL and update stats/LRU
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.size = this.cache.size;
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }
}

// -------------------- Translation-specific Layer --------------------

// Helper base64 aman di browser & node (sinkron)
function toBase64UTF8(input: string): string {
  // Normalisasi ke UTF-8 lalu encode base64
  if (typeof window === "undefined") {
    // Node (SSR)
    // eslint-disable-next-line n/no-deprecated-api
    return Buffer.from(input, "utf-8").toString("base64");
  }
  // Browser
  // encodeURIComponent -> unescape agar aman untuk btoa
  // (unescape dipakai khusus di sini agar karakter UTF-8 jadi byte sequence)
  // eslint-disable-next-line deprecation/deprecation
  return btoa(unescape(encodeURIComponent(input)));
}

export type DetectedLanguage = {
  code: string; // e.g. "en", "id"
  confidence: number; // 0..1
};

export class TranslationCache {
  // Cache untuk hasil terjemahan teks
  private textCache = new LRUTranslationCache<string>(1000, 1000 * 60 * 60); // 1 jam

  // Cache terkait bahasa (bisa bermacam-macam bentuk) -> gunakan unknown
  // Hindari `any`; akses lewat helper generic agar tetap typed saat mengambil/menyimpan.
  private languageCache = new LRUTranslationCache<unknown>(100, 1000 * 60 * 60 * 24); // 24 jam

  private generateTextKey(text: string, sourceLang: string, targetLang: string): string {
    // Buat key deterministik dari input (dipangkas agar tidak kepanjangan)
    const normalized = text.trim().toLowerCase();
    const base64 = toBase64UTF8(normalized).slice(0, 32);
    return `text:${sourceLang}:${targetLang}:${base64}`;
  }

  // ------ Text translation cache ------
  getCachedTranslation(text: string, sourceLang: string, targetLang: string): string | undefined {
    const key = this.generateTextKey(text, sourceLang, targetLang);
    return this.textCache.get(key);
  }

  setCachedTranslation(text: string, sourceLang: string, targetLang: string, translation: string): void {
    const key = this.generateTextKey(text, sourceLang, targetLang);
    this.textCache.set(key, translation);
  }

  // ------ Language-related generic helpers ------
  // Misal: simpan hasil deteksi bahasa per teks, atau daftar bahasa yang didukung, dsb.

  setLanguageData<T>(key: string, value: T, ttlMs?: number): void {
    this.languageCache.set(key, value as unknown, ttlMs);
  }

  getLanguageData<T>(key: string): T | undefined {
    return this.languageCache.get(key) as T | undefined;
  }

  // Convenience untuk deteksi bahasa (typed contoh)
  setDetectedLanguage(key: string, data: DetectedLanguage, ttlMs?: number): void {
    this.setLanguageData<DetectedLanguage>(`det:${key}`, data, ttlMs);
  }

  getDetectedLanguage(key: string): DetectedLanguage | undefined {
    return this.getLanguageData<DetectedLanguage>(`det:${key}`);
  }

  // ------ Stats ------
  getStats() {
    return {
      text: this.textCache.getStats(),
      textHitRate: this.textCache.getHitRate(),
      languages: this.languageCache.getStats(),
      languageHitRate: this.languageCache.getHitRate(),
    };
  }

  clearAll(): void {
    this.textCache.clear();
    // @ts-expect-error private method not exposed; gunakan clear publik
    this.languageCache.clear();
  }
}

export const translationCache = new TranslationCache();
