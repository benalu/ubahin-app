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

  constructor(maxSize = 1000, defaultTTL = 1000 * 60 * 60) {
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
    if (Math.random() < 0.01) this.cleanup(); // ~1%
    if (this.cache.size >= this.maxSize) this.evictLRU();

    const now = Date.now();
    this.cache.set(key, {
      value,
      timestamp: now,
      ttl: ttl ?? this.defaultTTL,
      accessCount: 0,
      lastAccessed: now,
    });
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

// Hash sinkron, cepat, dan stabil (53-bit) — cocok untuk key Map.
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  // gabung ke 53-bit number
  return (h2 & 0x1fffff) * 0x100000000 + (h1 >>> 0);
}

export type DetectedLanguage = {
  code: string;        // e.g. "en", "id"
  confidence: number;  // 0..1
};

export class TranslationCache {
  // 1 jam TTL untuk teks
  private textCache = new LRUTranslationCache<string>(1000, 1000 * 60 * 60);
  // 24 jam TTL untuk data bahasa
  private languageCache = new LRUTranslationCache<unknown>(100, 1000 * 60 * 60 * 24);

  // ⚠️ Prefix versi agar kunci lama tidak bentrok (dan otomatis "invalidated")
  private static KEY_VER = "v2";

  private generateTextKey(text: string, sourceLang: string, targetLang: string): string {
    // Simpan *seluruh* konten sebagai fingerprint hash + panjang,
    // jangan slice prefix base64 (bisa tabrakan!)
    const normalized = text.normalize("NFC");  // pertahankan case
    const length = normalized.length;
    const hash = cyrb53(normalized, 0).toString(36);
    return `${TranslationCache.KEY_VER}:${sourceLang}:${targetLang}:${length}:${hash}`;
  }

  // ------ Text translation cache ------
  getCachedTranslation(text: string, sourceLang: string, targetLang: string): string | undefined {
    return this.textCache.get(this.generateTextKey(text, sourceLang, targetLang));
  }

  setCachedTranslation(text: string, sourceLang: string, targetLang: string, translation: string): void {
    this.textCache.set(this.generateTextKey(text, sourceLang, targetLang), translation);
  }

  // ------ Language-related generic helpers ------
  setLanguageData<T>(key: string, value: T, ttlMs?: number): void {
    this.languageCache.set(key, value as unknown, ttlMs);
  }
  getLanguageData<T>(key: string): T | undefined {
    return this.languageCache.get(key) as T | undefined;
  }

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
    this.languageCache.clear();
  }
}

export const translationCache = new TranslationCache();
