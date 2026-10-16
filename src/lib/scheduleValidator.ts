import { ScheduleEvent, Classroom, ScheduleConflictResult, ScheduleConflictType } from '@/types';

export interface ScheduleClashResult extends ScheduleConflictResult {
  hasClash: boolean;
}

/**
 * Validates whether a proposed schedule event collides with any existing events or room capacity.
 * Detects:
 * 1. Invalid time range (endTime <= startTime).
 * 2. Capacity Overflow: student count exceeds room capacity.
 * 3. Tutor Conflict: same tutor double-booked during overlapping time on the same day.
 * 4. Room Clash: same physical room double-booked during overlapping time on the same day (excluding online rooms).
 */
export function validateSmartScheduleConflict(
  newEvent: {
    dayOfWeek: number;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    tutorId?: string;
    room?: string;
    id?: string;
    dateStr?: string;
    studentCount?: number;
    studentIds?: string[];
    studentNames?: string[];
    roomCapacity?: number;
  },
  existingEvents: ScheduleEvent[],
  classrooms?: Classroom[]
): ScheduleClashResult {
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const newStart = parseTimeToMinutes(newEvent.startTime);
  const newEnd = parseTimeToMinutes(newEvent.endTime);

  // 1. Check Invalid Time Range
  if (newEnd <= newStart) {
    return {
      hasConflict: true,
      hasClash: true,
      type: 'invalid_time',
      message: 'Thời gian kết thúc ca học phải sau thời gian bắt đầu!',
    };
  }

  // 2. Check Room Capacity Overflow
  const studentCount =
    newEvent.studentCount !== undefined
      ? newEvent.studentCount
      : newEvent.studentIds && newEvent.studentIds.length > 0
      ? newEvent.studentIds.length
      : newEvent.studentNames && newEvent.studentNames.length > 0
      ? newEvent.studentNames.length
      : 0;

  let effectiveCapacity = newEvent.roomCapacity;
  if (effectiveCapacity === undefined && newEvent.room && classrooms && classrooms.length > 0) {
    const matchedRoom = classrooms.find(
      (c) =>
        c.name.trim().toLowerCase() === newEvent.room?.trim().toLowerCase() ||
        c.id.toLowerCase() === newEvent.room?.toLowerCase()
    );
    if (matchedRoom) {
      effectiveCapacity = matchedRoom.capacity;
    }
  }

  if (effectiveCapacity !== undefined && effectiveCapacity > 0 && studentCount > effectiveCapacity) {
    return {
      hasConflict: true,
      hasClash: true,
      type: 'capacity',
      roomCapacity: effectiveCapacity,
      studentCount,
      message: `Quá tải sĩ số phòng học: ${newEvent.room || 'Phòng học'} chỉ có sức chứa tối đa ${effectiveCapacity} học sinh, nhưng lớp đang có ${studentCount} học sinh đăng ký!`,
    };
  }

  // 3. Check Room Maintenance Status
  if (newEvent.room && classrooms && classrooms.length > 0) {
    const matchedRoom = classrooms.find(
      (c) =>
        c.name.trim().toLowerCase() === newEvent.room?.trim().toLowerCase() ||
        c.id.toLowerCase() === newEvent.room?.toLowerCase()
    );
    if (matchedRoom && matchedRoom.status === 'maintenance') {
      return {
        hasConflict: true,
        hasClash: true,
        type: 'room_maintenance',
        message: `Phòng học đang bảo trì: ${matchedRoom.name} hiện đang trong trạng thái bảo trì/sửa chữa thiết bị, không thể xếp ca học mới!`,
      };
    }
  }

  // Helper to determine if a room is online
  const isOnlineRoom = (roomName?: string): boolean => {
    if (!roomName) return false;
    const lower = roomName.toLowerCase();
    if (lower.includes('online') || lower.includes('google meet') || lower.includes('zoom')) {
      return true;
    }
    if (classrooms && classrooms.length > 0) {
      const c = classrooms.find(
        (cr) => cr.name.trim().toLowerCase() === lower || cr.id.toLowerCase() === lower
      );
      if (c && c.type === 'online') return true;
    }
    return false;
  };

  // 3. Check Overlaps with Existing Events
  for (const ev of existingEvents) {
    // Skip comparing against self when updating
    if (newEvent.id && ev.id === newEvent.id) {
      continue;
    }

    // Must be same explicit dateStr when both provided, or fallback to same day of week
    const isSameDay = (newEvent.dateStr && ev.dateStr)
      ? newEvent.dateStr === ev.dateStr
      : ev.dayOfWeek === newEvent.dayOfWeek;

    if (!isSameDay) {
      continue;
    }

    const evStart = parseTimeToMinutes(ev.startTime);
    const evEnd = parseTimeToMinutes(ev.endTime);

    // Overlap condition: max(start1, start2) < min(end1, end2)
    const isOverlap = Math.max(newStart, evStart) < Math.min(newEnd, evEnd);

    if (isOverlap) {
      // 3.1 Check Tutor Double-Booking
      if (newEvent.tutorId && ev.tutorId === newEvent.tutorId) {
        return {
          hasConflict: true,
          hasClash: true,
          type: 'tutor',
          conflictingEvent: ev,
          message: `Trùng lịch giảng viên: ${ev.tutorName || 'Giảng viên'} đã có ca dạy "${ev.title}" (${ev.startTime} - ${ev.endTime}) vào cùng khung giờ!`,
        };
      }

      // 3.2 Check Physical Room Collision
      if (
        newEvent.room &&
        ev.room &&
        !isOnlineRoom(newEvent.room) &&
        !isOnlineRoom(ev.room) &&
        newEvent.room.trim().toLowerCase() === ev.room.trim().toLowerCase()
      ) {
        return {
          hasConflict: true,
          hasClash: true,
          type: 'room',
          conflictingEvent: ev,
          message: `Trùng phòng học: ${ev.room} đang được xếp lớp "${ev.title}" (${ev.startTime} - ${ev.endTime})!`,
        };
      }
    }
  }

  return {
    hasConflict: false,
    hasClash: false,
  };
}

/**
 * 100% Backward Compatible wrapper for validateSmartScheduleConflict
 */
export function validateScheduleClash(
  newEvent: {
    dayOfWeek: number;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    tutorId?: string;
    room?: string;
    id?: string;
    dateStr?: string;
    studentCount?: number;
    studentIds?: string[];
    studentNames?: string[];
    roomCapacity?: number;
  },
  existingEvents: ScheduleEvent[],
  classrooms?: Classroom[]
): ScheduleClashResult {
  return validateSmartScheduleConflict(newEvent, existingEvents, classrooms);
}
