/**
 * EduConnect SaaS - Schedule Repository & Smart Conflict Detector
 * Location: src/lib/db/repositories/schedule.repository.ts
 * Uses PostgreSQL Indexes (idx_sched_room_date_time, idx_sched_tutor_date_time)
 */

import { query } from '../client';
import { cache } from '../redis';
import { ScheduleEvent, ScheduleConflictResult } from '@/types';

export class ScheduleRepository {
  public static async listByDateRange(startDate: string, endDate: string): Promise<ScheduleEvent[]> {
    const cacheKey = `schedule:range:${startDate}:${endDate}`;
    const cached = await cache.get<ScheduleEvent[]>(cacheKey);
    if (cached) return cached;

    const res = await query(`
      SELECT 
        id, title, subject, day_of_week as "dayOfWeek", date_str as "dateStr",
        start_time as "startTime", end_time as "endTime", start_hour as "startHour",
        duration_hours as "durationHours", tutor_id as "tutorId", tutor_name as "tutorName",
        tutor_avatar as "tutorAvatar", room, room_capacity as "roomCapacity",
        status, student_ids as "studentIds", student_names as "studentNames",
        online_meeting_url as "onlineMeetingUrl", document_url as "documentUrl",
        description
      FROM schedule_events
      WHERE date_str BETWEEN $1 AND $2
      ORDER BY date_str ASC, start_time ASC
    `, [startDate, endDate]);

    const events: ScheduleEvent[] = res.rows;
    await cache.set(cacheKey, events, 60); // 1 minute cache for schedules
    return events;
  }

  /**
   * Fast conflict detector leveraging indexed search
   * Sub-millisecond lookup for tutor or room collisions
   */
  public static async checkConflict(
    tutorId: string,
    room: string,
    dateStr: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ): Promise<ScheduleConflictResult> {
    // 1. Check Tutor double booking
    const tutorClashRes = await query(`
      SELECT id, title, room, tutor_name as "tutorName", start_time as "startTime", end_time as "endTime"
      FROM schedule_events
      WHERE tutor_id = $1
        AND date_str = $2
        AND id != COALESCE($3, '')
        AND status != 'cancelled'
        AND start_time < $4
        AND end_time > $5
      LIMIT 1
    `, [tutorId, dateStr, excludeEventId || '', endTime, startTime]);

    if (tutorClashRes.rowCount && tutorClashRes.rowCount > 0) {
      const clash = tutorClashRes.rows[0];
      return {
        hasConflict: true,
        type: 'tutor',
        message: `Gia sư ${clash.tutorName} đã có lịch dạy lớp "${clash.title}" (${clash.startTime} - ${clash.endTime}) vào ngày này!`,
      };
    }

    // 2. Check Physical Room double booking (online rooms like Google Meet are exempt)
    if (room && !room.toLowerCase().includes('online') && !room.toLowerCase().includes('meet')) {
      const roomClashRes = await query(`
        SELECT id, title, tutor_name as "tutorName", start_time as "startTime", end_time as "endTime"
        FROM schedule_events
        WHERE room = $1
          AND date_str = $2
          AND id != COALESCE($3, '')
          AND status != 'cancelled'
          AND start_time < $4
          AND end_time > $5
        LIMIT 1
      `, [room, dateStr, excludeEventId || '', endTime, startTime]);

      if (roomClashRes.rowCount && roomClashRes.rowCount > 0) {
        const clash = roomClashRes.rows[0];
        return {
          hasConflict: true,
          type: 'room',
          message: `Phòng ${room} đã được xếp cho lớp "${clash.title}" (${clash.startTime} - ${clash.endTime})!`,
        };
      }
    }

    return { hasConflict: false };
  }
}
