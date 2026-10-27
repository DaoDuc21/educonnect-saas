import { NextRequest, NextResponse } from 'next/server';
import { SyncEngine, SyncMutation } from '@/lib/db/sync';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sync?since=2026-10-25T00:00:00Z&tables=courses,schedule_events
 * Pull delta changes from server since client's last sync timestamp
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sinceTimestamp = searchParams.get('since') || undefined;
    const tablesParam = searchParams.get('tables');
    const tables = tablesParam ? tablesParam.split(',') : undefined;

    const response = await SyncEngine.pullChanges({
      sinceTimestamp,
      tables,
    });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync pull failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync
 * Push batch mutations from client with Optimistic Concurrency Control (OCC)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mutations: SyncMutation[] = Array.isArray(body.mutations) ? body.mutations : [];

    if (mutations.length === 0) {
      return NextResponse.json({ success: true, count: 0, conflicts: [] });
    }

    const result = await SyncEngine.pushBatch(mutations);

    return NextResponse.json({
      success: true,
      appliedCount: result.successCount,
      conflicts: result.conflicts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync push failed' },
      { status: 500 }
    );
  }
}
