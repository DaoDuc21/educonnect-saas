import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db/client';
import { cache } from '@/lib/db/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const cacheStatus = cache.getStatus();

  const isHealthy = dbHealth.connected;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        engine: 'PostgreSQL 16',
        connected: dbHealth.connected,
        latencyMs: dbHealth.latencyMs,
        serverTime: dbHealth.serverTime,
        error: dbHealth.error,
      },
      cache: {
        engine: cacheStatus.isRedisConnected ? 'Redis 7' : 'In-Memory Cache (Fallback)',
        connected: cacheStatus.isRedisConnected,
        cachedKeys: cacheStatus.memoryKeysCount,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
