import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class PriceCacheService {
  private readonly logger = new Logger(PriceCacheService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtlMs: number;

  constructor() {
    this.defaultTtlMs = parseInt(process.env.PRICE_CACHE_TTL_MS || '300000', 10); // Default: 5 minutes
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const duration = ttlMs || this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + duration,
    });
  }

  invalidate(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}
