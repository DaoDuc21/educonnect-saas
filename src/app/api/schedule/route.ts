import { NextRequest, NextResponse } from 'next/server';
import { ScheduleRepository } from '@/lib/db/repositories/schedule.repository';
import { mockScheduleEvents } from '@/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const startDate = req.nextUrl.searchParams.get('startDate') || '2026-01-01';
    const endDate = req.nextUrl.searchParams.get('endDate') || '2026-12-31';

    let events;
    try {
      events = await ScheduleRepository.listByDateRange(startDate, endDate);
    } catch {
      // Fallback
      events = mockScheduleEvents;
    }

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedule/check-conflict
 * Fast conflict detection before saving or updating a session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tutorId, room, dateStr, startTime, endTime, excludeEventId } = body;

    if (!tutorId || !dateStr || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc (tutorId, dateStr, startTime, endTime)' },
        { status: 400 }
      );
    }

    const conflictResult = await ScheduleRepository.checkConflict(
      tutorId,
      room || '',
      dateStr,
      startTime,
      endTime,
      excludeEventId
    );

    return NextResponse.json({
      success: true,
      ...conflictResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
