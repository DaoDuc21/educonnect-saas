'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { ScheduleEvent } from '@/types';
import { cn, getSubjectColor } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';
import { OnlineClassModal } from './OnlineClassModal';

interface StudentTimetableProps {
  events: ScheduleEvent[];
  studentName?: string;
  studentId?: string;
}

export function StudentTimetable({
  events,
  studentName = 'Nguyễn Minh Quân',
  studentId,
}: StudentTimetableProps) {
  const { showToast } = useToast();
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [activeOnlineClass, setActiveOnlineClass] = useState<{ title: string; tutor: string; meetUrl?: string } | null>(null);
  const [dayFilter, setDayFilter] = useState<'all' | 'today' | number>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards');

  // Real-time Day of Week (1 = Monday ... 7 = Sunday)
  const currentDayOfWeek = React.useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  }, []);

  const dayLabels = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const todayLabel = dayLabels[currentDayOfWeek - 1];

  // Dynamic filter for student events without hardcoding
  const studentEvents = React.useMemo(() => {
    if (!events || events.length === 0) return [];
    const cleanTarget = (studentName || '').toLowerCase().trim();
    const filtered = events.filter((ev) => {
      if (studentId && ev.studentIds && ev.studentIds.includes(studentId)) {
        return true;
      }
      if (!ev.studentNames || ev.studentNames.length === 0) return true;
      if (!cleanTarget) return true;
      return ev.studentNames.some((name) => {
        const cleanName = name.toLowerCase().trim();
        return (
          cleanName.includes(cleanTarget) ||
          cleanTarget.includes(cleanName) ||
          cleanName.split(' ').slice(-1)[0] === cleanTarget.split(' ').slice(-1)[0]
        );
      });
    });
    return filtered.length > 0 ? filtered : events;
  }, [events, studentName, studentId]);

  const displayedEvents = React.useMemo(() => {
    if (dayFilter === 'all') return studentEvents;
    if (dayFilter === 'today') return studentEvents.filter((ev) => ev.dayOfWeek === currentDayOfWeek);
    return studentEvents.filter((ev) => ev.dayOfWeek === dayFilter);
  }, [dayFilter, studentEvents, currentDayOfWeek]);

  const handleJoinClass = (ev: ScheduleEvent) => {
    setActiveOnlineClass({
      title: ev.title,
      tutor: ev.tutorName,
      meetUrl: ev.onlineMeetingUrl || 'https://meet.google.com/edu-math-12a',
    });
    setOnlineModalOpen(true);
  };

  const handleViewDoc = (ev: ScheduleEvent) => {
    showToast(`Mở tài liệu: "${ev.title} - Chuyên đề & Bài tập"`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Modern Gradient Greeting Header for Students */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 rounded-3xl p-7 relative overflow-hidden border border-indigo-400/30 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Thời Khóa Biểu & Lịch Học Trực Tiếp
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
              Chào {studentName}!
            </h1>
            <p className="text-xs sm:text-sm font-medium text-indigo-100 mt-1.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Lớp Toán Thầy Hoàng sẽ bắt đầu sau 30 phút (07:00 tại Phòng A101 & Meet).</span>
            </p>
          </div>

          <button
            onClick={() =>
              handleJoinClass({
                id: 'quick-join',
                title: 'Toán 12 - Chuyên Đề Tích Phân & Giải Tích',
                tutorName: 'Thầy Trần Huy Hoàng',
              } as any)
            }
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-950 text-xs font-black flex items-center gap-2 shadow-md hover:shadow-xl transition-all self-start md:self-auto group"
          >
            <Video className="w-4 h-4 text-indigo-600" />
            <span>Vào phòng học Online ngay</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-indigo-600" />
          </button>
        </div>

        {/* Quick KPI stats in header with glassmorphism */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/20 text-white">
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-sm">
            <span className="text-[11px] font-medium text-sky-200 block">Tiết học tuần này</span>
            <span className="text-xl font-black text-white mt-0.5 block">5 buổi</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-sm">
            <span className="text-[11px] font-medium text-sky-200 block">Bài tập hoàn thành</span>
            <span className="text-xl font-black text-white mt-0.5 block">9/10 bài</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-sm">
            <span className="text-[11px] font-medium text-sky-200 block">Điểm trung bình</span>
            <span className="text-xl font-black text-amber-300 mt-0.5 block">9.2 / 10 ★</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-sm">
            <span className="text-[11px] font-medium text-sky-200 block">Chuyên cần</span>
            <span className="text-xl font-black text-emerald-300 mt-0.5 block">98%</span>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-sky-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-purple-400/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Personal Timetable Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Lịch Học Tuần Của Bạn
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách các buổi học được điều phối theo lộ trình cá nhân hóa
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-[#F5F3EF] p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all',
                  viewMode === 'cards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Dạng Thẻ
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Ma Trận Tuần
              </button>
            </div>

            {/* Day Filter Switcher */}
            <div className="flex flex-wrap bg-[#F5F3EF] p-1 rounded-2xl text-xs font-semibold gap-1">
              <button
                type="button"
                onClick={() => setDayFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-all',
                  dayFilter === 'all' ? 'bg-slate-900 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Cả tuần ({studentEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setDayFilter('today')}
                className={cn(
                  'px-3 py-1.5 rounded-xl transition-all',
                  dayFilter === 'today' ? 'bg-slate-900 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Hôm nay ({todayLabel})
              </button>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                const shortLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                const count = studentEvents.filter((ev) => ev.dayOfWeek === d).length;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDayFilter(d)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1',
                      dayFilter === d ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <span>{shortLabels[d - 1]}</span>
                    {count > 0 && (
                      <span className={cn('text-[9px] px-1 rounded-full', dayFilter === d ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* VIEW MODE 1: WEEKLY GRID MATRIX */}
        {viewMode === 'grid' && (
          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[850px] grid grid-cols-7 gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const dayName = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'][dayNum - 1];
                const dayEvs = studentEvents.filter((ev) => ev.dayOfWeek === dayNum);
                const isCurrentToday = dayNum === currentDayOfWeek;
                return (
                  <div
                    key={dayNum}
                    className={cn(
                      'rounded-2xl border p-3 flex flex-col space-y-2 min-h-[220px]',
                      isCurrentToday ? 'border-amber-300 bg-amber-50/30 ring-2 ring-amber-300/40' : 'border-slate-200/80 bg-slate-50/40'
                    )}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-current/10">
                      <span className={cn('text-xs font-bold', isCurrentToday ? 'text-amber-900' : 'text-slate-800')}>
                        {dayName}
                      </span>
                      {isCurrentToday ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">Hôm nay</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">{dayEvs.length} ca</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      {dayEvs.length === 0 ? (
                        <div className="h-full min-h-[140px] flex items-center justify-center text-center p-2 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400">
                          Nghỉ học
                        </div>
                      ) : (
                        dayEvs.map((ev) => {
                          const colors = getSubjectColor(ev.subject);
                          return (
                            <div
                              key={ev.id}
                              className={cn('p-2.5 rounded-xl border text-left shadow-sm space-y-1.5 transition-all hover:shadow', colors.bg, colors.border)}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold flex items-center gap-1 text-slate-700">
                                  <Clock className="w-3 h-3" />
                                  {ev.startTime}
                                </span>
                                <span className="text-[9px] text-slate-500 truncate max-w-[70px]">{ev.room}</span>
                              </div>
                              <h4 className="font-bold text-[11px] text-slate-900 line-clamp-2 leading-tight">
                                {ev.title}
                              </h4>
                              <p className="text-[10px] text-slate-600 truncate">{ev.tutorName}</p>
                              <button
                                type="button"
                                onClick={() => handleJoinClass(ev)}
                                className="w-full py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <Video className="w-3 h-3 text-amber-300" />
                                <span>Vào phòng</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: CARDS GRID */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {displayedEvents.map((ev) => {
            const colors = getSubjectColor(ev.subject);
            const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
            return (
              <div
                key={ev.id}
                className={cn(
                  'rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4',
                  colors.bg,
                  colors.border
                )}
              >
                <div>
                  {/* Top Badge & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-800 border border-current/10">
                      {dayLabels[ev.dayOfWeek - 1]}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.startTime} - {ev.endTime}
                    </span>
                  </div>

                  {/* Subject Title */}
                  <h3 className="font-bold text-base text-slate-900 mt-2.5 leading-snug">
                    {ev.title}
                  </h3>

                  {/* Tutor & Room */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">Gia sư:</span> {ev.tutorName}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ev.room}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: "Vào phòng học Online" & "Xem tài liệu buổi học" (PRD Requirement) */}
                <div className="pt-3 border-t border-current/10 flex items-center gap-2">
                  <button
                    onClick={() => handleJoinClass(ev)}
                    className="flex-1 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-300" />
                    <span>Vào phòng</span>
                  </button>

                  <button
                    onClick={() => handleViewDoc(ev)}
                    className="flex-1 py-2 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-current/20 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tài liệu</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Online Classroom Modal */}
      <OnlineClassModal
        isOpen={onlineModalOpen}
        onClose={() => setOnlineModalOpen(false)}
        classTitle={activeOnlineClass?.title}
        tutorName={activeOnlineClass?.tutor}
        meetUrl={activeOnlineClass?.meetUrl}
      />
    </div>
  );
}
