'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  MessageCircle,
  Star,
  Sparkles,
  BookOpen,
  Calendar,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { HabitProgressItem, Student } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';
import { StudentReportModal } from './StudentReportModal';

interface ProgressFeedProps {
  child: Student;
  habits: HabitProgressItem[];
}

export function ProgressFeed({ child, habits }: ProgressFeedProps) {
  const { showToast } = useToast();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Personalized & Multimedia enriched habits per child
  const childHabits = useMemo(() => {
    if (child.id === 'stu-2') {
      return [
        {
          id: 'h-thu-1',
          courseTitle: 'Toán Tư Duy Tiểu Học & Olympic',
          tutorName: 'Thầy Trần Huy Hoàng',
          tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          completedSessions: 8,
          totalSessions: 12,
          homeworkScore: 9.8,
          attendanceStatus: 'present' as const,
          feedback: 'Bé Thư làm bài tập trực quan rất xuất sắc, tính nhẩm phân số nhanh và giải đúng 100% bài hình học.',
          latestDate: '24/09/2026',
          voiceNote: 'Nhận xét phát âm & tư duy của Thầy Hoàng (0:45)',
          homeworkPhoto: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80',
          badgeAward: 'Ngôi Sao Toán Học Tuần',
        },
        {
          id: 'h-thu-2',
          courseTitle: 'Tiếng Anh Thiếu Nhi Giao Tiếp (Cambridge Starters)',
          tutorName: 'Cô Vũ Thu Hương',
          tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          completedSessions: 7,
          totalSessions: 10,
          homeworkScore: 9.5,
          attendanceStatus: 'present' as const,
          feedback: 'Phát âm chuẩn ngữ điệu tự nhiên, phản xạ bài nghe xuất sắc và tự tin thuyết trình chủ đề My Family.',
          latestDate: '23/09/2026',
          voiceNote: 'Bản ghi âm phát âm 5 từ vựng của bé Thư (0:32)',
          homeworkPhoto: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=80',
          badgeAward: 'Hiệp Sĩ Phát Âm Chuẩn',
        },
      ];
    }

    return habits.map((item, idx) => ({
      ...item,
      voiceNote: idx % 2 === 0 ? `Nhận xét bài nộp từ ${item.tutorName} (0:45)` : undefined,
      homeworkPhoto: idx === 0 ? 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80' : undefined,
      badgeAward: idx === 0 ? 'Chiến Binh Chuyên Cần 100%' : idx === 1 ? 'Thần Tốc Hoàn Thành BTVN' : undefined,
    }));
  }, [child.id, habits]);

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white rounded-3xl p-5 px-6 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tiến Độ Học Tập & Báo Cáo Định Kỳ</span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Học kỳ 1
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Học viên: <strong className="text-slate-800">{child.name}</strong> • Khóa học đang theo dõi: {child.enrolledCourses.join(', ')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-soft hover:shadow-md transition-all self-start sm:self-auto shrink-0"
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Xuất Sổ Học Bạ Điện Tử</span>
        </button>
      </div>

      {/* Top Overview Cards (Be.run Gauge & Summary Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Course Completion Overall Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tiến Độ Học Tập Tổng Thể
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {child.overallProgress}%
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Xuất sắc
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Đã hoàn thành 18/24 buổi học kỳ 1
            </p>
          </div>

          {/* Slider-style Progress Bar matching Be.run "Weight Loss Plan 68%" */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 relative flex items-center">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-700"
                style={{ width: `${child.overallProgress}%` }}
              />
              <div
                className="absolute w-4 h-4 bg-white border-2 border-slate-900 rounded-full shadow-md"
                style={{ left: `calc(${child.overallProgress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
              <span>Bắt đầu</span>
              <span>Mục tiêu 100%</span>
            </div>
          </div>
        </div>

        {/* Circular Gauge / Habit Consistency Card (Be.run Style) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tỷ Lệ Chuyên Cần
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              98.5%
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Đúng giờ 100% • Không nghỉ buổi nào
            </p>
          </div>

          {/* Simulated Circular Arc Gauge from Be.run */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#E2E8F0"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#F59E0B"
                strokeWidth="6"
                strokeDasharray="200"
                strokeDashoffset="15"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800">
              A+
            </span>
          </div>
        </div>

        {/* Home Study Score Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Điểm Đánh Giá & BTVN
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-700 mt-2">
              9.4 / 10
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gia sư nhận xét: Tiếp thu rất nhạy bén
            </p>
          </div>
          <button
            onClick={() => showToast('Mở báo cáo học lực học kỳ chi tiết', 'info')}
            className="mt-3 text-xs font-bold text-slate-800 hover:text-black flex items-center gap-1"
          >
            <span>Xem phiếu liên lạc điện tử</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Habit / Progress Feed (Chuẩn "My Habits" từ Hình 2 Be.run) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Nhật Ký Học Tập & Tiến Độ Từng Buổi (Learning Feed)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật phản hồi thực tế từ gia sư sau mỗi tiết học
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F3EF] text-slate-700">
            Tuần 1 Tháng 9
          </span>
        </div>

        {/* Progress List matching Image 2 "My Habits" with Rich Multimedia */}
        <div className="divide-y divide-slate-100 mt-2">
          {childHabits.map((item) => (
            <div
              key={item.id}
              className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/50 px-3 rounded-2xl transition-colors"
            >
              {/* Tutor Avatar & Course Title & Feedback */}
              <div className="flex items-start gap-3.5 max-w-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.tutorAvatar}
                  alt={item.tutorName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5 shadow-sm"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {item.courseTitle}
                    </h4>
                    {item.badgeAward && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300 text-[10px] font-bold">
                        <Award className="w-3 h-3 text-amber-600" />
                        {item.badgeAward}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 font-medium block">
                    Gia sư: <strong className="text-slate-700">{item.tutorName}</strong> • Buổi học ngày {item.latestDate}
                  </span>

                  {/* Real tutor feedback */}
                  <p className="text-xs text-slate-700 bg-[#F5F3EF] p-2.5 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                    &ldquo;{item.feedback}&rdquo;
                  </p>

                  {/* Multimedia attachments: Voice Note & Homework Photo */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {item.voiceNote && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-950 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            if (playingAudioId === item.id) {
                              setPlayingAudioId(null);
                            } else {
                              setPlayingAudioId(item.id);
                              showToast(`Đang phát: "${item.voiceNote}"`, 'info');
                            }
                          }}
                          className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shadow-sm"
                          title="Nghe tin nhắn thoại"
                        >
                          {playingAudioId === item.id ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3 translate-x-0.5" />
                          )}
                        </button>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-[11px]">
                          {playingAudioId === item.id ? 'Đang phát nhận xét...' : item.voiceNote}
                        </span>
                      </div>
                    )}

                    {item.homeworkPhoto && (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.homeworkPhoto}
                          alt="Bài nộp học sinh"
                          onClick={() => setPreviewImage(item.homeworkPhoto || null)}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-all"
                          title="Bấm để xem ảnh bài nộp phóng to"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImage(item.homeworkPhoto || null)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Xem ảnh bài nộp</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Segmented Bar Indicators (Exact style from Be.run) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 gap-4">
                    <span>Số buổi đã học:</span>
                    <span className="font-bold text-slate-900">
                      {item.completedSessions}/{item.totalSessions}
                    </span>
                  </div>

                  {/* Segmented mini bars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.totalSessions }).map((_, i) => {
                      const isFilled = i < item.completedSessions;
                      return (
                        <span
                          key={i}
                          className={cn(
                            'w-2 h-5 rounded-full transition-all',
                            isFilled
                              ? 'bg-gradient-to-t from-rose-500 to-amber-400'
                              : 'bg-slate-200'
                          )}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Score badge & More button */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">BTVN</span>
                    <span className="text-sm font-black text-emerald-700">
                      {item.homeworkScore} / 10
                    </span>
                  </div>

                  <button
                    onClick={() => showToast(`Chi tiết nhận xét của ${item.tutorName}`, 'info')}
                    className="p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Homework Photo Modal Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Ảnh Chụp Bài Tập Về Nhà Của Con</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Bài tập phóng to"
              className="w-full h-auto max-h-[70vh] object-contain rounded-2xl border border-slate-100"
            />
          </div>
        </div>
      )}

      {/* Official Student Progress Report Modal */}
      <StudentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        child={child}
        habits={childHabits}
      />
    </div>
  );
}
