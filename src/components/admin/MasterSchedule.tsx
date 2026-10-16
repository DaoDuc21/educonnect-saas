'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  MoreHorizontal,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Calendar as CalendarIcon,
  Video,
  FileText,
  Lock,
  ExternalLink,
  AlertTriangle,
  Building2,
  Users,
  Grid3X3,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  Wrench,
} from 'lucide-react';
import { ScheduleEvent, SubjectType, AdminRole, Tutor, Classroom, ScheduleConflictResult } from '@/types';
import { cn, getSubjectColor } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';
import { validateSmartScheduleConflict } from '@/lib/scheduleValidator';
import { mockClassrooms } from '@/data/mockData';

interface MasterScheduleProps {
  events: ScheduleEvent[];
  onOpenAddEvent: () => void;
  onSelectEvent?: (event: ScheduleEvent) => void;
  onUpdateEvent?: (updatedEvent: ScheduleEvent) => void;
  currentAdminRole?: AdminRole;
  tutors?: Tutor[];
  classrooms?: Classroom[];
  onToggleRoomStatus?: (roomId: string) => void;
}

type ViewMode = 'day' | 'week' | 'month' | 'room_matrix';

const DAYS_OF_WEEK = [
  { id: 1, label: 'T2 01', full: 'Thứ Hai, 01/01' },
  { id: 2, label: 'T3 02', full: 'Thứ Ba, 02/01', isCurrent: true },
  { id: 3, label: 'T4 03', full: 'Thứ Tư, 03/01' },
  { id: 4, label: 'T5 04', full: 'Thứ Năm, 04/01' },
  { id: 5, label: 'T6 05', full: 'Thứ Sáu, 05/01' },
  { id: 6, label: 'T7 06', full: 'Thứ Bảy, 06/01' },
  { id: 7, label: 'CN 07', full: 'Chủ Nhật, 07/01' },
];

const TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const MATRIX_TIME_SLOTS = [
  { id: 'm1', label: '07:00 - 08:30', startH: 7.0, endH: 8.5 },
  { id: 'm2', label: '08:30 - 10:00', startH: 8.5, endH: 10.0 },
  { id: 'm3', label: '10:00 - 11:30', startH: 10.0, endH: 11.5 },
  { id: 'm4', label: '13:30 - 15:00', startH: 13.5, endH: 15.0 },
  { id: 'm5', label: '15:00 - 16:30', startH: 15.0, endH: 16.5 },
  { id: 'm6', label: '18:00 - 19:30', startH: 18.0, endH: 19.5 },
  { id: 'm7', label: '19:30 - 21:00', startH: 19.5, endH: 21.0 },
];

const START_HOUR = 6;
const PIXELS_PER_HOUR = 90;

export function MasterSchedule({
  events,
  onOpenAddEvent,
  onSelectEvent,
  onUpdateEvent,
  currentAdminRole = 'super_admin',
  tutors = [],
  classrooms = mockClassrooms,
  onToggleRoomStatus,
}: MasterScheduleProps) {
  const { showToast } = useToast();

  const [internalRooms, setInternalRooms] = useState<Classroom[]>([]);

  const availableClassrooms = useMemo(() => {
    const base = classrooms && classrooms.length > 0 ? classrooms : mockClassrooms;
    return base.map((r) => {
      const overridden = internalRooms.find((ir) => ir.id === r.id);
      return overridden ? overridden : r;
    });
  }, [classrooms, internalRooms]);

  const handleToggleRoomStatus = (roomId: string) => {
    if (onToggleRoomStatus) {
      onToggleRoomStatus(roomId);
    }
    setInternalRooms((prev) => {
      const base = availableClassrooms.find((r) => r.id === roomId);
      if (!base) return prev;
      const nextStatus = base.status === 'maintenance' ? 'active' : 'maintenance';
      const existing = prev.filter((r) => r.id !== roomId);
      return [...existing, { ...base, status: nextStatus }];
    });
    showToast('Đã cập nhật trạng thái phòng học thành công!', 'success');
  };

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<number>(2); // Default Thứ Ba
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTutor, setSelectedTutor] = useState<string>('all');
  const [selectedEventModal, setSelectedEventModal] = useState<ScheduleEvent | null>(null);
  const [isEditingMeet, setIsEditingMeet] = useState(false);
  const [editedMeetUrl, setEditedMeetUrl] = useState('');

  const canEditSchedule = currentAdminRole === 'super_admin' || currentAdminRole === 'academic_coordinator';

  // Conflict detection across all events
  const conflictMap = useMemo(() => {
    const map = new Map<string, ScheduleConflictResult>();
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const otherEvents = events.filter((_, idx) => idx !== i);
      const res = validateSmartScheduleConflict(ev, otherEvents, availableClassrooms);
      if (res.hasConflict || res.hasClash) {
        map.set(ev.id, res);
      }
    }
    return map;
  }, [events, availableClassrooms]);

  const activeConflicts = useMemo(() => {
    return Array.from(conflictMap.entries()).map(([eventId, res]) => {
      const ev = events.find((e) => e.id === eventId);
      return { event: ev, result: res };
    }).filter((item) => item.event !== undefined);
  }, [conflictMap, events]);

  const handleOpenEventModal = (ev: ScheduleEvent) => {
    setSelectedEventModal(ev);
    setEditedMeetUrl(ev.onlineMeetingUrl || '');
    setIsEditingMeet(false);
    if (onSelectEvent) onSelectEvent(ev);
  };

  const handleSaveMeetUrl = () => {
    if (!selectedEventModal) return;
    const updated: ScheduleEvent = {
      ...selectedEventModal,
      onlineMeetingUrl: editedMeetUrl.trim() || 'https://meet.google.com/edu-class',
    };
    setSelectedEventModal(updated);
    if (onUpdateEvent) {
      onUpdateEvent(updated);
    }
    setIsEditingMeet(false);
    showToast('Đã lưu và cập nhật đường dẫn Google Meet cho buổi học!', 'success');
  };

  // Vietnamese subject categories
  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'math', label: 'Toán học' },
    { id: 'literature', label: 'Ngữ văn' },
    { id: 'science', label: 'Khoa học & Vật lý' },
    { id: 'english', label: 'Tiếng Anh' },
    { id: 'art', label: 'Nghệ thuật' },
  ];

  // Filter events by subject and tutor
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSubject = selectedSubject === 'all' || ev.subject === selectedSubject;
      const matchTutor = selectedTutor === 'all' || ev.tutorId === selectedTutor;
      return matchSubject && matchTutor;
    });
  }, [events, selectedSubject, selectedTutor]);

  // Current real-time indicator coordinate: 08:40 AM
  const currentTimeHour = 8.67;
  const currentTimeTop = (currentTimeHour - START_HOUR) * PIXELS_PER_HOUR;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col">
      {/* Red Warning Banner when resource conflicts detected */}
      {activeConflicts.length > 0 && (
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                  Cảnh Báo Xung Đột Tài Nguyên Lịch Học
                </h4>
                <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {activeConflicts.length} cảnh báo
                </span>
              </div>
              <p className="text-xs text-rose-800 font-medium mt-0.5">
                {activeConflicts[0]?.result.message}
                {activeConflicts.length > 1 && ` (+${activeConflicts.length - 1} sự cố khác cần giải quyết)`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (activeConflicts[0]?.event) {
                handleOpenEventModal(activeConflicts[0].event);
              }
            }}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-full text-xs font-bold transition-all shadow-soft shrink-0"
          >
            Xem & Xử lý xung đột
          </button>
        </div>
      )}

      {/* Top Navigation & 4-View Switcher Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 4-View Mode Switcher */}
          <div className="flex items-center bg-[#F5F3EF] p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                viewMode === 'day'
                  ? 'bg-slate-900 text-white shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Ngày</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                viewMode === 'week'
                  ? 'bg-slate-900 text-white shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Tuần</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                viewMode === 'month'
                  ? 'bg-slate-900 text-white shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tháng</span>
            </button>
            <button
              onClick={() => setViewMode('room_matrix')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                viewMode === 'room_matrix'
                  ? 'bg-slate-900 text-white shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Ma trận Phòng học</span>
            </button>
          </div>

          {/* Date Label & Prev/Next */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {viewMode === 'day'
                ? DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.full + ', 2025'
                : viewMode === 'month'
                ? 'Tháng 1, 2025'
                : viewMode === 'room_matrix'
                ? `Phòng học — ${DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.full}`
                : '01 - 07 Tháng 1, 2025'}
            </h2>
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 ml-1">
              <button
                onClick={() => {
                  if (viewMode === 'day' || viewMode === 'room_matrix') {
                    setSelectedDay((prev) => (prev > 1 ? prev - 1 : 7));
                  } else {
                    showToast('Đang xem dữ liệu lịch học kỳ', 'info');
                  }
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
                title="Lùi thời gian"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (viewMode === 'day' || viewMode === 'room_matrix') {
                    setSelectedDay((prev) => (prev < 7 ? prev + 1 : 1));
                  } else {
                    showToast('Đang xem dữ liệu lịch học kỳ', 'info');
                  }
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
                title="Tiến thời gian"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject Pills (Hidden in room_matrix mode to save space) */}
          {viewMode !== 'room_matrix' && (
            <div className="hidden xl:flex items-center gap-1 bg-[#F5F3EF] p-1 rounded-full border border-slate-200/80">
              {categories.map((cat) => {
                const isActive = selectedSubject === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubject(cat.id)}
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-full transition-all',
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    )}
                  >
                    {isActive && <span className="inline-block mr-1">✓</span>}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Day Selector for Room Matrix or Day View */}
          {(viewMode === 'room_matrix' || viewMode === 'day') && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-bold rounded-full transition-all',
                    selectedDay === d.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'
                  )}
                >
                  {d.label.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Tutor Selector */}
          <select
            value={selectedTutor}
            onChange={(e) => setSelectedTutor(e.target.value)}
            className="text-xs font-semibold bg-[#F5F3EF] border border-slate-200/80 rounded-full px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="all">Tất cả Giảng viên ({tutors.length || 4})</option>
            {tutors.length > 0 ? (
              tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            ) : (
              <>
                <option value="tut-1">Thầy Hoàng (Toán)</option>
                <option value="tut-2">Cô Linh (IELTS)</option>
                <option value="tut-3">Thầy Quang (Vật lý)</option>
                <option value="tut-4">Cô Thu (Ngữ Văn)</option>
              </>
            )}
          </select>

          {/* Filter button */}
          <button
            onClick={() => showToast('Đang áp dụng bộ lọc nâng cao theo Phòng học & Giảng viên', 'info')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full transition-colors shadow-soft"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Bộ lọc</span>
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
              {selectedSubject !== 'all' || selectedTutor !== 'all' ? '!' : '✓'}
            </span>
          </button>

          {/* + Add Event button */}
          {canEditSchedule ? (
            <button
              onClick={onOpenAddEvent}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full transition-all shadow-soft active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm lịch</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200 shadow-sm cursor-not-allowed"
              title="Tài khoản hiện tại chỉ có quyền xem thời khóa biểu"
            >
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Chỉ xem</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: WEEK VIEW (MODERN 7-DAY GRID WITH SHADOW-SOFT CARDS)               */}
      {/* ========================================================================= */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto select-none">
          <div className="min-w-[1000px]">
            {/* Days Header Row */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200/70 bg-white sticky top-0 z-20">
              <div className="p-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100 flex items-center justify-center">
                Giờ
              </div>
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.id}
                  className={cn(
                    'p-3 text-center text-xs font-bold border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center transition-colors',
                    day.isCurrent ? 'bg-slate-50/60' : 'text-slate-600'
                  )}
                >
                  {day.isCurrent ? (
                    <span className="bg-slate-900 text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-soft">
                      {day.label}
                    </span>
                  ) : (
                    <span className="text-slate-600 hover:text-slate-900 font-semibold">{day.label}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Time Rows & Event Canvas */}
            <div className="relative grid grid-cols-[80px_repeat(7,1fr)] bg-white">
              {/* Time Axis Column */}
              <div className="border-r border-slate-100 divide-y divide-slate-100/80 z-10 bg-white">
                {TIME_SLOTS.map((time) => (
                  <div
                    key={time}
                    style={{ height: `${PIXELS_PER_HOUR}px` }}
                    className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 tracking-wider"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* 7 Day Columns */}
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.id}
                  className={cn(
                    'relative border-r border-slate-100 last:border-r-0 divide-y divide-slate-100/60 min-h-full',
                    day.isCurrent ? 'bg-slate-50/20' : ''
                  )}
                >
                  {/* Horizontal Grid lines */}
                  {TIME_SLOTS.map((time) => (
                    <div
                      key={time}
                      style={{ height: `${PIXELS_PER_HOUR}px` }}
                      className="w-full hover:bg-slate-50/40 transition-colors"
                    />
                  ))}

                  {/* Day events mapped to absolute coordinates */}
                  {filteredEvents
                    .filter((ev) => ev.dayOfWeek === day.id)
                    .map((ev) => {
                      const topPx = (ev.startHour - START_HOUR) * PIXELS_PER_HOUR;
                      const heightPx = Math.max(ev.durationHours * PIXELS_PER_HOUR - 4, 52);
                      const colors = getSubjectColor(ev.subject);
                      const conflict = conflictMap.get(ev.id);

                      return (
                        <div
                          key={ev.id}
                          onClick={() => handleOpenEventModal(ev)}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            width: 'calc(100% - 10px)',
                            left: '5px',
                          }}
                          className={cn(
                            'absolute z-10 p-2.5 rounded-2xl border transition-all cursor-pointer shadow-soft hover:shadow-float hover:scale-[1.01] flex flex-col justify-between overflow-hidden',
                            conflict ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300' : cn(colors.bg, colors.border, colors.text)
                          )}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-xs leading-tight line-clamp-1">
                                {ev.title}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {conflict && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-extrabold flex items-center gap-0.5"
                                    title={conflict.message}
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Xung đột
                                  </span>
                                )}
                                {ev.onlineMeetingUrl && !conflict && (
                                  <span className="w-4 h-4 rounded-md bg-emerald-600/15 text-emerald-700 flex items-center justify-center" title="Phòng Google Meet">
                                    <Video className="w-2.5 h-2.5" />
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEventModal(ev);
                                  }}
                                  className="text-current opacity-60 hover:opacity-100 p-0.5"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <span className="text-[11px] font-medium opacity-80 block mt-0.5">
                              {ev.startTime} - {ev.endTime}
                            </span>
                          </div>

                          <div className="pt-1 border-t border-current/10 flex items-center justify-between gap-1 text-[11px]">
                            <span className="truncate opacity-90 font-medium">
                              {ev.tutorName} • {ev.room}
                            </span>
                            {ev.status === 'confirmed' && !conflict && (
                              <span className="bg-white/80 backdrop-blur-sm text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Đã xác nhận
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}

              {/* REAL-TIME HORIZONTAL INDICATOR 08:40 */}
              <div
                style={{ top: `${currentTimeTop}px` }}
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
              >
                <div className="bg-black text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-soft ml-14 pointer-events-auto">
                  08:40
                </div>
                <div className="h-[2px] bg-black/90 flex-1 relative shadow-xs" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DAY VIEW (HOURLY TIMELINE WITH EXPANDED SESSION CARDS)             */}
      {/* ========================================================================= */}
      {viewMode === 'day' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chi tiết Lịch Dạy & Phòng Học — {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.full}
              </h3>
              <p className="text-xs text-slate-500">
                Tổng cộng {filteredEvents.filter((e) => e.dayOfWeek === selectedDay).length} ca học trong ngày
              </p>
            </div>
            {canEditSchedule && (
              <button
                onClick={onOpenAddEvent}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-soft transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Xếp ca học hôm nay</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredEvents.filter((ev) => ev.dayOfWeek === selectedDay).length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200/70">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Chưa có ca học nào được xếp vào ngày này</p>
                <p className="text-xs text-slate-500 mt-1">Bấm nút "+ Xếp ca học hôm nay" để bắt đầu xếp lịch mới</p>
              </div>
            ) : (
              filteredEvents
                .filter((ev) => ev.dayOfWeek === selectedDay)
                .sort((a, b) => a.startHour - b.startHour)
                .map((ev) => {
                  const colors = getSubjectColor(ev.subject);
                  const conflict = conflictMap.get(ev.id);
                  const matchedClassroom = availableClassrooms.find((c) => c.name === ev.room);
                  const capacity = ev.roomCapacity || matchedClassroom?.capacity || 20;
                  const enrolledCount = ev.studentIds?.length || ev.studentNames?.length || 0;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => handleOpenEventModal(ev)}
                      className={cn(
                        'p-5 rounded-3xl border transition-all cursor-pointer shadow-soft hover:shadow-float flex flex-wrap items-center justify-between gap-4',
                        conflict
                          ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Time block */}
                        <div className="w-28 shrink-0 bg-slate-900 text-white rounded-2xl p-2.5 text-center flex flex-col justify-center">
                          <span className="text-xs font-bold">{ev.startTime}</span>
                          <span className="text-[10px] text-slate-400">đến</span>
                          <span className="text-xs font-bold text-amber-300">{ev.endTime}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">({ev.durationHours} giờ)</span>
                        </div>

                        {/* Class Info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('text-[11px] font-bold px-2.5 py-0.5 rounded-full border', colors.pill)}>
                              {colors.name}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                            {conflict && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {conflict.message}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {ev.tutorName}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {ev.room}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                              <Users className="w-3 h-3 text-slate-500" />
                              Sĩ số: <strong>{enrolledCount}/{capacity} học sinh</strong>
                            </span>
                          </div>

                          {ev.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 italic">{ev.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Right action badges */}
                      <div className="flex items-center gap-2">
                        {ev.onlineMeetingUrl && (
                          <a
                            href={ev.onlineMeetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Vào Meet</span>
                          </a>
                        )}
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã xác nhận
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: MONTH VIEW (FULL MONTH CALENDAR GRID WITH EVENT BADGES)           */}
      {/* ========================================================================= */}
      {viewMode === 'month' && (
        <div className="p-6">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Thứ 2</span>
            <span>Thứ 3</span>
            <span>Thứ 4</span>
            <span>Thứ 5</span>
            <span>Thứ 6</span>
            <span>Thứ 7</span>
            <span>Chủ Nhật</span>
          </div>

          {/* 35 Day Cells Grid for Jan 2025 (Day 1 is Wed, so 2 offset cells from Dec) */}
          <div className="grid grid-cols-7 gap-2">
            {/* Dec 30 & 31 padding cells */}
            <div className="h-28 rounded-2xl p-2 bg-slate-50/50 border border-slate-100 text-slate-300 text-xs font-bold">
              30/12
            </div>
            <div className="h-28 rounded-2xl p-2 bg-slate-50/50 border border-slate-100 text-slate-300 text-xs font-bold">
              31/12
            </div>

            {/* 31 Days of January */}
            {Array.from({ length: 31 }, (_, idx) => {
              const dayNum = idx + 1;
              // Day of week in Jan 2025: Day 1 is Wed (id: 3)
              const dayOfWeekId = ((idx + 2) % 7) + 1;
              const isToday = dayNum === 2; // Jan 2
              const dayEvents = filteredEvents.filter((ev) => ev.dayOfWeek === dayOfWeekId);

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setSelectedDay(dayOfWeekId);
                    setViewMode('day');
                  }}
                  className={cn(
                    'h-28 rounded-2xl p-2 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group hover:shadow-soft hover:border-slate-400',
                    isToday ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-200/60' : 'bg-white border-slate-200/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        isToday ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700'
                      )}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                        {dayEvents.length} ca
                      </span>
                    )}
                  </div>

                  {/* Micro event pills */}
                  <div className="space-y-1 overflow-hidden my-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const colors = getSubjectColor(ev.subject);
                      const conflict = conflictMap.get(ev.id);
                      return (
                        <div
                          key={ev.id}
                          className={cn(
                            'px-1.5 py-0.5 rounded-lg text-[10px] truncate font-medium flex items-center gap-1',
                            conflict ? 'bg-rose-100 text-rose-800 font-bold' : cn(colors.bg, colors.text)
                          )}
                          title={`${ev.title} (${ev.startTime} - ${ev.endTime})`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400 pl-1">
                        +{dayEvents.length - 2} ca nữa
                      </span>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-400 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem chi tiết →
                  </div>
                </div>
              );
            })}

            {/* Feb 1 & 2 trailing cells */}
            <div className="h-28 rounded-2xl p-2 bg-slate-50/50 border border-slate-100 text-slate-300 text-xs font-bold">
              01/02
            </div>
            <div className="h-28 rounded-2xl p-2 bg-slate-50/50 border border-slate-100 text-slate-300 text-xs font-bold">
              02/02
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ROOM GRID MATRIX (MA TRẬN PHÒNG HỌC & CÔNG SUẤT CHỐNG TRÙNG)      */}
      {/* ========================================================================= */}
      {viewMode === 'room_matrix' && (
        <div className="overflow-x-auto select-none p-6">
          <div className="min-w-[1100px]">
            {/* Header info */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>Ma Trận Điều Phối Phòng Học — {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.full}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Phát hiện trực quan các khung giờ trống và ngăn ngừa xếp trùng phòng học vật lý
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
                  Phòng đang trống
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-md bg-slate-900 text-white" />
                  Đang có lớp học
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <span className="w-3 h-3 rounded-md bg-rose-500" />
                  Quá tải sĩ số / Trùng phòng
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <span className="w-3 h-3 rounded-md bg-amber-400 border border-amber-500" />
                  Bảo trì thiết bị
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-soft bg-white">
              {/* Table Header: Time Slots on Horizontal Axis */}
              <div className="grid grid-cols-[220px_repeat(7,1fr)] bg-slate-900 text-white text-xs font-bold border-b border-slate-800">
                <div className="p-3.5 border-r border-slate-800 flex items-center justify-between">
                  <span>Phòng Học ({availableClassrooms.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sức chứa</span>
                </div>
                {MATRIX_TIME_SLOTS.map((slot) => (
                  <div key={slot.id} className="p-3 text-center border-r border-slate-800 last:border-r-0">
                    <span className="block text-xs">{slot.label}</span>
                  </div>
                ))}
              </div>

              {/* Table Rows: Rooms on Vertical Axis */}
              <div className="divide-y divide-slate-100">
                {availableClassrooms.map((roomItem) => (
                  <div
                    key={roomItem.id}
                    className="grid grid-cols-[220px_repeat(7,1fr)] hover:bg-slate-50/40 transition-colors"
                  >
                    {/* Room Info Left Header */}
                    <div className="p-3.5 border-r border-slate-100 bg-[#FBF9F5] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 line-clamp-1">
                            {roomItem.name}
                          </span>
                          {roomItem.status === 'maintenance' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
                              <Wrench className="w-2.5 h-2.5 text-amber-700" />
                              Bảo trì
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              roomItem.type === 'physical'
                                ? 'bg-sky-100 text-sky-800'
                                : roomItem.type === 'online'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            )}
                          >
                            {roomItem.type === 'physical'
                              ? 'Trực tiếp'
                              : roomItem.type === 'online'
                              ? 'Trực tuyến'
                              : 'Lab STEM'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Tối đa <strong>{roomItem.capacity} HS</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                          {roomItem.location}
                        </span>
                        {canEditSchedule && (
                          <button
                            type="button"
                            onClick={() => handleToggleRoomStatus(roomItem.id)}
                            className={cn(
                              'text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors',
                              roomItem.status === 'maintenance'
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                            )}
                            title={
                              roomItem.status === 'maintenance'
                                ? 'Chuyển sang hoạt động bình thường'
                                : 'Tạm dừng hoạt động để bảo trì'
                            }
                          >
                            {roomItem.status === 'maintenance' ? 'Kích hoạt' : 'Bảo trì'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 7 Time Slot Cells for this room */}
                    {MATRIX_TIME_SLOTS.map((slot) => {
                      // Find if an event is scheduled in this room on selectedDay and overlaps this slot
                      const occupiedEvent = filteredEvents.find((ev) => {
                        if (ev.dayOfWeek !== selectedDay) return false;
                        const matchRoom =
                          ev.room.trim().toLowerCase() === roomItem.name.trim().toLowerCase() ||
                          (roomItem.type === 'online' && ev.room.toLowerCase().includes('online'));
                        if (!matchRoom) return false;

                        const evStart = ev.startHour;
                        const evEnd = ev.startHour + ev.durationHours;
                        return Math.max(slot.startH, evStart) < Math.min(slot.endH, evEnd);
                      });

                      const conflict = occupiedEvent ? conflictMap.get(occupiedEvent.id) : undefined;
                      const enrolledCount = occupiedEvent
                        ? occupiedEvent.studentIds?.length || occupiedEvent.studentNames?.length || 2
                        : 0;
                      const isOverCapacity = enrolledCount > roomItem.capacity;

                      return (
                        <div
                          key={slot.id}
                          className="p-2 border-r border-slate-100 last:border-r-0 min-h-[96px] flex flex-col justify-between"
                        >
                          {roomItem.status === 'maintenance' ? (
                            <div className="h-full rounded-2xl border border-amber-200 bg-amber-50/70 p-2 flex flex-col items-center justify-center text-center relative overflow-hidden select-none">
                              <div
                                className="absolute inset-0 opacity-15 pointer-events-none"
                                style={{
                                  backgroundImage:
                                    'repeating-linear-gradient(45deg, #d97706, #d97706 6px, transparent 6px, transparent 12px)',
                                }}
                              />
                              <Wrench className="w-4 h-4 text-amber-600 mb-1 z-10" />
                              <span className="text-[11px] font-bold text-amber-900 z-10">Bảo trì</span>
                              <span className="text-[9px] text-amber-700 font-medium z-10">Tạm dừng xếp lịch</span>
                            </div>
                          ) : occupiedEvent ? (
                            // OCCUPIED SLOT CARD
                            <div
                              onClick={() => handleOpenEventModal(occupiedEvent)}
                              className={cn(
                                'h-full p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left shadow-soft hover:shadow-float',
                                conflict || isOverCapacity
                                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                                  : 'bg-slate-900 text-white border-slate-800'
                              )}
                            >
                              <div>
                                <span className={cn(
                                  'font-bold text-[11px] line-clamp-1',
                                  conflict || isOverCapacity ? 'text-rose-950' : 'text-white'
                                )}>
                                  {occupiedEvent.title}
                                </span>
                                <span className={cn(
                                  'text-[10px] block mt-0.5 truncate',
                                  conflict || isOverCapacity ? 'text-rose-800' : 'text-slate-300'
                                )}>
                                  {occupiedEvent.tutorName}
                                </span>
                              </div>

                              <div className="pt-1.5 border-t border-current/10 flex items-center justify-between text-[10px]">
                                <span className={cn(
                                  'font-bold px-1.5 py-0.5 rounded-md',
                                  isOverCapacity
                                    ? 'bg-rose-600 text-white'
                                    : conflict
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white/20 text-white'
                                )}>
                                  {enrolledCount}/{roomItem.capacity} HS
                                </span>
                                {conflict ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                )}
                              </div>
                            </div>
                          ) : (
                            // EMPTY SLOT WITH "+ XẾP LỚP" ACTION
                            <div className="h-full rounded-2xl border border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50 transition-all p-2 flex flex-col items-center justify-center text-center group">
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mb-1">
                                Trống
                              </span>
                              {canEditSchedule && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAddEvent();
                                  }}
                                  className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 group-hover:underline flex items-center gap-0.5 transition-colors"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Xếp lớp</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE EVENT DETAIL MODAL (100% VIETNAMESE LOCALIZED)                 */}
      {/* ========================================================================= */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-float border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', getSubjectColor(selectedEventModal.subject).pill)}>
                  {getSubjectColor(selectedEventModal.subject).name}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">
                  {selectedEventModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Conflict Warning inside Modal */}
            {conflictMap.has(selectedEventModal.id) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Cảnh báo xung đột lịch học:</strong>
                  <span>{conflictMap.get(selectedEventModal.id)?.message}</span>
                </div>
              </div>
            )}

            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Thời gian: <strong>{selectedEventModal.startTime} - {selectedEventModal.endTime}</strong> ({DAYS_OF_WEEK.find((d) => d.id === selectedEventModal.dayOfWeek)?.full || `Thứ ${selectedEventModal.dayOfWeek + 1}`})</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Giảng viên phụ trách: <strong>{selectedEventModal.tutorName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Phòng học: <strong>{selectedEventModal.room}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>
                  Sĩ số: <strong>{selectedEventModal.studentIds?.length || selectedEventModal.studentNames?.length || 2}</strong>
                  {selectedEventModal.roomCapacity && ` / tối đa ${selectedEventModal.roomCapacity} chỗ`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Trạng thái: <strong className="text-emerald-700">Đã xác nhận</strong></span>
              </div>
            </div>

            {selectedEventModal.studentNames.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Danh sách học sinh ({selectedEventModal.studentNames.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEventModal.studentNames.map((name) => (
                    <span key={name} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Google Meet Link Management */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Phòng Học Google Meet</span>
                </div>
                {canEditSchedule && (
                  <button
                    type="button"
                    onClick={() => setIsEditingMeet(!isEditingMeet)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    {isEditingMeet ? 'Đóng' : 'Chỉnh sửa link'}
                  </button>
                )}
              </div>

              {isEditingMeet ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="url"
                    value={editedMeetUrl}
                    onChange={(e) => setEditedMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveMeetUrl}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                    >
                      Lưu link Google Meet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = 'abcdefghijklmnopqrstuvwxyz';
                        const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                        setEditedMeetUrl(`https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`);
                      }}
                      className="text-[10px] font-medium text-emerald-700 hover:underline"
                    >
                      + Tạo link ngẫu nhiên
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate font-mono text-[11px] max-w-[240px]">
                    {selectedEventModal.onlineMeetingUrl || 'Chưa thiết lập link Google Meet'}
                  </span>
                  {selectedEventModal.onlineMeetingUrl && (
                    <a
                      href={selectedEventModal.onlineMeetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 ml-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs"
                    >
                      <span>Vào Meet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {selectedEventModal.onlineMeetingUrl && (
                <a
                  href={selectedEventModal.onlineMeetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-soft"
                >
                  <Video className="w-3.5 h-3.5" />
                  Vào phòng Online
                </a>
              )}
              {selectedEventModal.documentUrl && (
                <button
                  onClick={() => showToast('Mở tài liệu bài giảng chuyên đề', 'info')}
                  className="flex-1 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Tài liệu học
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
