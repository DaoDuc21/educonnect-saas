/**
 * EduConnect SaaS - High-Performance Cache Layer (Redis with In-Memory Fallback)
 * Location: src/lib/db/redis.ts
 * Requirement: Fast Querying & High Synchronization
 */

import Redis from 'ioredis';

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { data: string; expiry: number }> = new Map();
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: () => null, // Do not spam reconnects if not available
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
      });

      this.redis.on('error', () => {
        this.isConnected = false;
      });

      // Attempt initial connection
      this.redis.connect().catch(() => {
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isConnected && this.redis) {
        const val = await this.redis.get(key);
        return val ? JSON.parse(val) : null;
      }
    } catch {
      // Fallback to in-memory cache
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return JSON.parse(item.data);
  }

  public async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      if (this.isConnected && this.redis) {
        await this.redis.setex(key, ttlSeconds, serialized);
        return;
      }
    } catch {
      // Fallback to in-memory cache
    }

    this.memoryCache.set(key, {
      data: serialized,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  public async del(key: string): Promise<void> {
    try {
      if (this.isConnected && this.redis) {
        await this.redis.del(key);
      }
    } catch {
      // Ignore
    }
    this.memoryCache.delete(key);
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.isConnected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch {
      // Ignore
    }

    // Invalidate in memory
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  public getStatus(): { isRedisConnected: boolean; memoryKeysCount: number } {
    return {
      isRedisConnected: this.isConnected,
      memoryKeysCount: this.memoryCache.size,
    };
  }
}

export const cache = new CacheService();
