import assert from 'node:assert/strict';
import { validateSmartScheduleConflict } from '../src/lib/scheduleValidator.ts';
import { mockClassrooms, mockScheduleEvents } from '../src/data/mockData.ts';

console.log('Testing empirical behavior of validateSmartScheduleConflict with different dates...');

const session1 = {
  id: 'ev-reg-1-1',
  title: 'Khóa Toán - Buổi 1',
  dayOfWeek: 2,
  dateStr: '2026-09-15',
  startTime: '19:30',
  endTime: '21:00',
  tutorId: 'tut-1',
  room: 'Phòng A101 (Offline)',
};

const session3 = {
  id: 'ev-reg-1-3',
  title: 'Khóa Toán - Buổi 3',
  dayOfWeek: 2,
  dateStr: '2026-09-22',
  startTime: '19:30',
  endTime: '21:00',
  tutorId: 'tut-1',
  room: 'Phòng A101 (Offline)',
};

const res = validateSmartScheduleConflict(session3, [session1], mockClassrooms);
console.log('Result for Sept 15 vs Sept 22 (both Tuesday):', res);
