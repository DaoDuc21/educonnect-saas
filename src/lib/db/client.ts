/**
 * EduConnect SaaS - PostgreSQL Database Connection Pool & Query Executor
 * Location: src/lib/db/client.ts
 * Requirements: Fast Querying (B-Tree/GIN, Connection Pooling) & High Synchronization
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgresql://${process.env.POSTGRES_USER || 'educonnect'}:${process.env.POSTGRES_PASSWORD || 'educonnect123'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'educonnect_db'}`;

    pool = new Pool({
      connectionString,
      max: 20, // Max clients in connection pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const clientPool = getDatabasePool();
  try {
    const res = await clientPool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 50) {
      console.log(`[DB Slow Query] ${duration}ms: ${text.slice(0, 80)}`);
    }
    return res;
  } catch (error: any) {
    console.error(`[DB Query Error]: ${error.message} - SQL: ${text.slice(0, 80)}`);
    throw error;
  }
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const clientPool = getDatabasePool();
  const client = await clientPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latencyMs: number;
  serverTime?: string;
  error?: string;
}> {
  const start = Date.now();
  try {
    const res = await query('SELECT NOW() as server_time');
    return {
      connected: true,
      latencyMs: Date.now() - start,
      serverTime: res.rows[0]?.server_time,
    };
  } catch (error: any) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error.message,
    };
  }
}
