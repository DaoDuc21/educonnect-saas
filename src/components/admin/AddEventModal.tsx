'use client';

import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, MapPin, User, BookOpen, Video, Sparkles, AlertTriangle, Users, Building2 } from 'lucide-react';
import { ScheduleEvent, SubjectType, Tutor, Classroom } from '@/types';
import { useToast } from '../shared/ToastNotification';
import { validateScheduleClash, validateSmartScheduleConflict } from '@/lib/scheduleValidator';
import { mockClassrooms } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (newEvent: ScheduleEvent) => void;
  tutors?: Tutor[];
  existingEvents?: ScheduleEvent[];
  classrooms?: Classroom[];
}

export function AddEventModal({
  isOpen,
  onClose,
  onAddEvent,
  tutors = [],
  existingEvents = [],
  classrooms = mockClassrooms,
}: AddEventModalProps) {
  const { showToast } = useToast();

  const availableClassrooms = classrooms && classrooms.length > 0 ? classrooms : mockClassrooms;

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('math');
  const [dayOfWeek, setDayOfWeek] = useState<number>(2); // Thứ 3
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:00');
  const [tutorId, setTutorId] = useState('tut-1');
  const [room, setRoom] = useState(availableClassrooms[0]?.name || 'Phòng A101 (Offline)');
  const [studentCount, setStudentCount] = useState<number>(2);
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState('https://meet.google.com/edu-math-12a');

  const selectedClassroom = useMemo(() => {
    return availableClassrooms.find((c) => c.name === room || c.id === room) || availableClassrooms[0];
  }, [availableClassrooms, room]);

  const generateRandomMeet = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segment = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const code = `${segment(3)}-${segment(4)}-${segment(3)}`;
    const newUrl = `https://meet.google.com/${code}`;
    setOnlineMeetingUrl(newUrl);
    showToast(`Đã tạo link Google Meet mới: ${code}`, 'success');
  };

  const tutorMap: Record<string, { name: string; avatar: string }> = {
    'tut-1': {
      name: 'Thầy Trần Huy Hoàng',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    'tut-2': {
      name: 'Cô Nguyễn Thùy Linh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    'tut-3': {
      name: 'Thầy Lê Anh Quang',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    'tut-4': {
      name: 'Cô Mai Phương Thu',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  };

  const parseHour = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  const clashResult = useMemo(() => {
    return validateScheduleClash(
      {
        dayOfWeek,
        startTime,
        endTime,
        tutorId,
        room,
        studentCount,
        roomCapacity: selectedClassroom?.capacity,
      },
      existingEvents,
      availableClassrooms
    );
  }, [dayOfWeek, startTime, endTime, tutorId, room, studentCount, selectedClassroom, existingEvents, availableClassrooms]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tên buổi học!', 'warning');
      return;
    }

    if (clashResult.hasClash) {
      showToast(clashResult.message || 'Phát hiện xung đột lịch hoặc phòng học!', 'warning');
      return;
    }

    const startH = parseHour(startTime);
    const endH = parseHour(endTime);
    const duration = Math.max(endH - startH, 0.5);

    const dynamicTutor = tutors.find((t) => t.id === tutorId);
    const tutorName = dynamicTutor ? dynamicTutor.name : tutorMap[tutorId]?.name || 'Thầy Hoàng';
    const tutorAvatar = dynamicTutor
      ? dynamicTutor.avatar
      : tutorMap[tutorId]?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newEvent: ScheduleEvent = {
      id: `ev-${Date.now()}`,
      title,
      subject,
      dayOfWeek,
      dateStr: '2025-01-02',
      startTime,
      endTime,
      startHour: startH,
      durationHours: duration,
      tutorId,
      tutorName,
      tutorAvatar,
      room,
      roomCapacity: selectedClassroom?.capacity,
      status: 'confirmed',
      studentIds: Array.from({ length: studentCount }, (_, i) => `stu-${i + 1}`),
      studentNames:
        studentCount <= 2
          ? ['Nguyễn Minh Quân', 'Trần Gia Bảo'].slice(0, studentCount)
          : [`${studentCount} Học sinh đã đăng ký`],
      onlineMeetingUrl: onlineMeetingUrl.trim() || 'https://meet.google.com/edu-class-room',
    };

    onAddEvent(newEvent);
    showToast(`Đã thêm buổi học "${title}" thành công!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-float overflow-hidden border border-slate-200/80 flex flex-col animate-in zoom-in-95 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Xếp Lớp & Thêm Buổi Học Mới</h3>
              <p className="text-[11px] text-slate-400">Kiểm tra tự động trùng giờ gia sư, trùng phòng & sức chứa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container with smooth scroll */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Prominent Red Clash Alert Banner */}
          {clashResult.hasClash && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3 text-xs text-rose-900 shadow-sm animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold text-rose-950 text-sm">
                  {clashResult.type === 'tutor'
                    ? '⚠️ Xung Đột: Trùng Lịch Giảng Viên'
                    : clashResult.type === 'room'
                    ? '⚠️ Xung Đột: Trùng Phòng Học Vật Lý'
                    : clashResult.type === 'capacity'
                    ? '⚠️ Xung Đột: Quá Tải Sĩ Số Phòng Học'
                    : '⚠️ Xung Đột: Khung Giờ Không Hợp Lệ'}
                </strong>
                <p className="text-xs leading-relaxed text-rose-800 font-medium">{clashResult.message}</p>
                <div className="pt-1">
                  <span className="inline-block text-[11px] text-rose-700 font-semibold bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Hệ thống tạm khóa nút lưu. Vui lòng chọn phòng khác hoặc đổi khung giờ.
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Tên môn học / Chuyên đề *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Toán 12 - Giải Tích Vận Dụng Cao"
              className="w-full bg-[#F5F3EF] border border-slate-200/90 rounded-2xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Môn học</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectType)}
                className="w-full bg-[#F5F3EF] border border-slate-200/90 rounded-2xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="math">Toán & Tư duy Logic</option>
                <option value="literature">Ngữ Văn & Đọc Hiểu</option>
                <option value="english">Tiếng Anh & IELTS</option>
                <option value="science">Vật Lý & KHTN</option>
                <option value="art">Nghệ thuật & Đồ họa</option>
                <option value="other">Kỹ năng / Khác</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Thứ trong tuần</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full bg-[#F5F3EF] border border-slate-200/90 rounded-2xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value={1}>Thứ Hai (Thứ 2)</option>
                <option value={2}>Thứ Ba (Thứ 3)</option>
                <option value={3}>Thứ Tư (Thứ 4)</option>
                <option value={4}>Thứ Năm (Thứ 5)</option>
                <option value={5}>Thứ Sáu (Thứ 6)</option>
                <option value={6}>Thứ Bảy (Thứ 7)</option>
                <option value={7}>Chủ Nhật (CN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Giờ bắt đầu</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-slate-200/90 rounded-2xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Giờ kết thúc</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-slate-200/90 rounded-2xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Giảng viên / Gia sư</label>
              <select
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-slate-200/90 rounded-2xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                {tutors.length > 0 ? (
                  tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
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
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                <span>Phòng học</span>
                {selectedClassroom && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    Sức chứa: <strong>{selectedClassroom.capacity} HS</strong>
                  </span>
                )}
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-slate-200/90 rounded-2xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 truncate"
              >
                {availableClassrooms.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} — Tối đa {c.capacity} HS ({c.type === 'physical' ? 'Offline' : c.type === 'online' ? 'Online' : 'Lab'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Capacity Input and Classroom Details Badge */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Sĩ số học sinh dự kiến</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={studentCount}
                  onChange={(e) => setStudentCount(Math.max(1, Number(e.target.value)))}
                  className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-bold text-center focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <span className="text-slate-500 text-[11px]">
                  / tối đa {selectedClassroom?.capacity || 20} chỗ
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 flex flex-col justify-center space-y-0.5">
              <span className="font-semibold text-slate-800">
                Vị trí: {selectedClassroom?.location || 'Khu phòng học'}
              </span>
              <span className="text-slate-500 truncate">
                Trang thiết bị: {selectedClassroom?.facilities?.slice(0, 2).join(', ')}...
              </span>
            </div>
          </div>

          {/* Google Meet URL Configuration */}
          <div className="bg-[#F5F3EF]/60 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đường dẫn phòng học Google Meet</span>
              </label>
              <button
                type="button"
                onClick={generateRandomMeet}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Tạo link tự động</span>
              </button>
            </div>
            <input
              type="url"
              value={onlineMeetingUrl}
              onChange={(e) => setOnlineMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="text-[10px] text-slate-500">
              Giảng viên và học sinh có thể bấm 1-click để vào phòng học trực tuyến theo đường link này.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={Boolean(clashResult.hasClash)}
              className={cn(
                'px-6 py-2.5 rounded-full text-white font-bold shadow-soft transition-all',
                clashResult.hasClash
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-slate-900 hover:bg-black active:scale-95'
              )}
            >
              Lưu vào lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
