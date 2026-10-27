/**
 * EduConnect SaaS - High Synchronization Engine (Delta Sync & Optimistic Concurrency)
 * Location: src/lib/db/sync.ts
 * Requirements: High Synchronization & Future Scalability
 */

import { query, transaction } from './client';
import { cache } from './redis';

export interface SyncMutation {
  entityTable: string;
  entityId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  version: number;
  payload: Record<string, any>;
  clientId?: string;
}

export interface SyncPullRequest {
  sinceTimestamp?: string;
  clientId?: string;
  tables?: string[];
}

export interface SyncPullResponse {
  serverTimestamp: string;
  changes: {
    id: number;
    entityTable: string;
    entityId: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    version: number;
    payload: any;
    createdAt: string;
  }[];
}

export class SyncEngine {
  /**
   * Records a mutation in sync_changelog and invalidates relevant cache keys
   */
  public static async recordMutation(
    entityTable: string,
    entityId: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    version: number,
    payload: any,
    clientId?: string
  ): Promise<number> {
    const res = await query(
      `INSERT INTO sync_changelog (entity_table, entity_id, action, version, client_id, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [entityTable, entityId, action, version, clientId || 'system', JSON.stringify(payload)]
    );

    // Invalidate caches
    await cache.invalidatePattern(`${entityTable}:*`);

    return res.rows[0].id;
  }

  /**
   * Pull delta changes since a specific timestamp
   */
  public static async pullChanges(req: SyncPullRequest): Promise<SyncPullResponse> {
    const since = req.sinceTimestamp ? new Date(req.sinceTimestamp) : new Date(0);
    const tables = req.tables && req.tables.length > 0 ? req.tables : null;

    let sql = `
      SELECT id, entity_table, entity_id, action, version, payload, created_at
      FROM sync_changelog
      WHERE created_at > $1
    `;
    const params: any[] = [since];

    if (tables) {
      params.push(tables);
      sql += ` AND entity_table = ANY($2)`;
    }

    sql += ` ORDER BY created_at ASC LIMIT 1000`;

    const res = await query(sql, params);
    const nowRes = await query(`SELECT NOW() as ts`);

    return {
      serverTimestamp: nowRes.rows[0].ts,
      changes: res.rows.map((row) => ({
        id: row.id,
        entityTable: row.entity_table,
        entityId: row.entity_id,
        action: row.action,
        version: row.version,
        payload: row.payload,
        createdAt: row.created_at,
      })),
    };
  }

  /**
   * Push batched mutations from client with Optimistic Concurrency Control (OCC)
   */
  public static async pushBatch(mutations: SyncMutation[]): Promise<{
    successCount: number;
    conflicts: { entityTable: string; entityId: string; currentVersion: number }[];
  }> {
    const conflicts: { entityTable: string; entityId: string; currentVersion: number }[] = [];
    let successCount = 0;

    await transaction(async (client) => {
      for (const m of mutations) {
        // Safe check allowed tables
        const allowedTables = [
          'courses',
          'schedule_events',
          'attendance_records',
          'tuition_invoices',
          'homework_assignments',
          'homework_submissions',
          'quizzes',
          'quiz_submissions',
          'admissions_leads',
          'course_registrations',
          'app_notifications',
          'chat_messages',
        ];

        if (!allowedTables.includes(m.entityTable)) {
          continue;
        }

        if (m.action === 'UPDATE') {
          // Check version for Optimistic Locking
          const checkRes = await client.query(
            `SELECT version FROM ${m.entityTable} WHERE id = $1 FOR UPDATE`,
            [m.entityId]
          );

          if (checkRes.rowCount && checkRes.rows[0].version > m.version) {
            conflicts.push({
              entityTable: m.entityTable,
              entityId: m.entityId,
              currentVersion: checkRes.rows[0].version,
            });
            continue;
          }
        }

        // Apply mutation
        if (m.action === 'INSERT') {
          const keys = Object.keys(m.payload);
          const values = Object.values(m.payload);
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const colNames = keys.join(', ');

          await client.query(
            `INSERT INTO ${m.entityTable} (${colNames}) VALUES (${placeholders})
             ON CONFLICT (id) DO UPDATE SET updated_at = NOW()`,
            values
          );
        } else if (m.action === 'DELETE') {
          await client.query(`DELETE FROM ${m.entityTable} WHERE id = $1`, [m.entityId]);
        }

        // Record into changelog
        await client.query(
          `INSERT INTO sync_changelog (entity_table, entity_id, action, version, client_id, payload)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [m.entityTable, m.entityId, m.action, m.version + 1, m.clientId || 'client', JSON.stringify(m.payload)]
        );

        successCount++;
      }
    });

    return { successCount, conflicts };
  }
}
