interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number; // ms since epoch
}

interface DedupStats {
  pendingCount: number;
  oldestRequestTimestamp?: number;
  oldestRequestAgeMs?: number;
}

export class RequestDeduplicator<T> {
  private pendingRequests = new Map<string, PendingRequest<T>>();
  private readonly maxAge: number;

  constructor(maxAge = 30_000) {
    this.maxAge = maxAge;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, req] of this.pendingRequests) {
      if (now - req.timestamp > this.maxAge) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Deduplicate concurrent requests with the same key.
   * Factory boleh sync/async. Error akan dipropagasi; entry dihapus pada settle.
   */
  async deduplicate(key: string, factory: () => Promise<T> | T): Promise<T> {
    if (Math.random() < 0.1) this.cleanup();

    const existing = this.pendingRequests.get(key);
    if (existing) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(`[dedupe] hit: ${key}`);
      }
      return existing.promise;
    }

    const promise = Promise.resolve().then(factory);

    this.pendingRequests.set(key, { promise, timestamp: Date.now() });

    promise.finally(() => {
      this.pendingRequests.delete(key);
    });

    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  has(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  get size(): number {
    return this.pendingRequests.size;
  }

  getStats(): DedupStats {
    if (this.pendingRequests.size === 0) {
      return { pendingCount: 0 };
    }
    let oldest = Number.POSITIVE_INFINITY;
    for (const { timestamp } of this.pendingRequests.values()) {
      if (timestamp < oldest) oldest = timestamp;
    }
    const now = Date.now();
    return {
      pendingCount: this.pendingRequests.size,
      oldestRequestTimestamp: oldest,
      oldestRequestAgeMs: now - oldest,
    };
  }
}

/** Untuk modul terjemahan, ketik hasil: string | null (null = aborted). */
export const translationDeduplicator = new RequestDeduplicator<string | null>();
