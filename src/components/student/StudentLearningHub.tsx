'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Video,
  Clock,
  BookOpen,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  MessageSquare,
  Star,
  ExternalLink,
  Target,
  ArrowRight,
  TrendingUp,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { Student, ScheduleEvent, HomeworkAssignment, HomeworkSubmission, CourseResource, Quiz, QuizSubmission } from '@/types';
import { cn, getSubjectColor } from '@/lib/utils';
import { mockQuizzes } from '@/data/mockQuizzes';
import { useToast } from '../shared/ToastNotification';

interface StudentLearningHubProps {
  student: Student;
  events: ScheduleEvent[];
  homeworkList: HomeworkAssignment[];
  submissionsList: HomeworkSubmission[];
  resources: CourseResource[];
  quizzes?: Quiz[];
  quizSubmissions?: QuizSubmission[];
  onOpenQuiz?: (quiz: Quiz) => void;
  onNavigateTab: (tab: string, entityId?: string) => void;
  onOpenOnlineClass?: (event?: ScheduleEvent) => void;
}

const MOTIVATIONAL_QUOTES = [
  { text: 'Kỷ luật hôm nay là thành công rực rỡ ngày mai!', author: 'EduConnect Motivation' },
  { text: 'Mỗi bài toán khó giải xong là một bước vững chắc tới cánh cổng Đại học mơ ước.', author: 'Thầy Trần Huy Hoàng' },
  { text: 'Học tập không phải là lấp đầy một chiếc bình, mà là thắp lên một ngọn lửa.', author: 'William Butler Yeats' },
  { text: 'Hãy kiên trì từng ngày, điểm 9+ là phần thưởng cho những nỗ lực không ngừng nghỉ!', author: 'Cô Vũ Thu Hương' },
];

export const StudentLearningHub: React.FC<StudentLearningHubProps> = ({
  student,
  events,
  homeworkList,
  submissionsList,
  resources,
  quizzes = mockQuizzes,
  quizSubmissions = [],
  onOpenQuiz,
  onNavigateTab,
  onOpenOnlineClass,
}) => {
  const { showToast } = useToast();
  // Current time state for greeting & countdown
  const [now, setNow] = useState<Date>(new Date());
  const [targetExam, setTargetExam] = useState<'thpt' | 'dgnl_hn' | 'dgnl_hcm' | 'ielts'>('thpt');
  const [streakFrozen, setStreakFrozen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return { text: 'Chào buổi sáng', icon: '☀️', mood: 'Chúc bạn một ngày học tập hứng khởi và tràn đầy năng lượng!' };
    if (hour < 18) return { text: 'Chào buổi chiều', icon: '🌤️', mood: 'Hãy giữ vững tinh thần tập trung và bứt phá mục tiêu hôm nay nhé!' };
    return { text: 'Chào buổi tối', icon: '🌙', mood: 'Tối nay cùng hoàn thành bài tập và ôn luyện kiến thức thật tốt nhé!' };
  }, [now]);

  // Random quote of the day
  const dailyQuote = useMemo(() => {
    const day = now.getDate() % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[day];
  }, [now]);

  // Exam configuration with 4 flexible target options
  const examConfig = useMemo(() => {
    switch (targetExam) {
      case 'dgnl_hn':
        return {
          key: 'dgnl_hn',
          title: 'Kỳ Thi ĐGNL ĐHQG Hà Nội (HSA)',
          targetScore: '110+ / 150',
          date: new Date('2027-04-10T07:30:00'),
        };
      case 'dgnl_hcm':
        return {
          key: 'dgnl_hcm',
          title: 'Kỳ Thi ĐGNL ĐHQG TP.HCM (V-SAT)',
          targetScore: '1,050+ / 1,200',
          date: new Date('2027-03-28T07:30:00'),
        };
      case 'ielts':
        return {
          key: 'ielts',
          title: 'IELTS Academic 7.5+',
          targetScore: 'Band 7.5+ Overall',
          date: new Date('2026-12-15T08:00:00'),
        };
      case 'thpt':
      default:
        return {
          key: 'thpt',
          title: 'Kỳ Thi THPT Quốc Gia',
          targetScore: '9.0+ / 10',
          date: new Date('2027-06-25T07:30:00'),
        };
    }
  }, [targetExam]);

  const countdown = useMemo(() => {
    const diff = examConfig.date.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [now, examConfig.date]);

  // Visual weekly streak definition dynamically calculated based on current day
  const weeklyStreakDays = useMemo(() => {
    const currentDayIdx = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const baseDays = [
      { label: 'T2', name: 'Thứ Hai' },
      { label: 'T3', name: 'Thứ Ba' },
      { label: 'T4', name: 'Thứ Tư' },
      { label: 'T5', name: 'Thứ Năm' },
      { label: 'T6', name: 'Thứ Sáu' },
      { label: 'T7', name: 'Thứ Bảy' },
      { label: 'CN', name: 'Chủ Nhật' },
    ];
    return baseDays.map((d, idx) => ({
      ...d,
      status: idx < currentDayIdx ? 'completed' : idx === currentDayIdx ? 'today' : 'upcoming',
    }));
  }, [now]);

  const handleToggleStreakFreeze = () => {
    setStreakFrozen(!streakFrozen);
    showToast(
      !streakFrozen
        ? 'Đã kích hoạt BẢO LƯU CHUỖI! Chuỗi học tập 7 ngày của bạn được bảo vệ 24h.'
        : 'Đã hủy bảo lưu chuỗi học tập.',
      'info'
    );
  };

  // Find next upcoming class
  const upcomingEvent = useMemo(() => {
    return events.find((ev) => ev.status === 'confirmed') || events[0];
  }, [events]);

  // My submissions & pending homework
  const mySubmissions = useMemo(() => {
    return submissionsList.filter((s) => s.studentId === student.id);
  }, [submissionsList, student.id]);

  const pendingHomework = useMemo(() => {
    return homeworkList.filter((hw) => {
      const sub = mySubmissions.find((s) => s.homeworkId === hw.id);
      return !sub || sub.status === 'not_submitted';
    });
  }, [homeworkList, mySubmissions]);

  const recentGraded = useMemo(() => {
    return mySubmissions
      .filter((s) => s.status === 'graded')
      .slice(0, 2);
  }, [mySubmissions]);

  // Badges collection
  const badges = [
    {
      id: 'b-1',
      title: 'Chiến Binh Chuyên Cần',
      desc: 'Học liên tục 7 ngày đúng giờ',
      icon: Flame,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      unlocked: true,
    },
    {
      id: 'b-2',
      title: 'Thợ Săn Điểm 10',
      desc: 'Đạt điểm tối đa bài trắc nghiệm Toán',
      icon: Star,
      color: 'from-yellow-400 to-amber-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      unlocked: true,
    },
    {
      id: 'b-3',
      title: 'Thần Tốc Nộp Bài',
      desc: 'Nộp bài trước hạn chót 12 giờ',
      icon: Clock,
      color: 'from-indigo-400 to-purple-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      unlocked: true,
    },
    {
      id: 'b-4',
      title: 'Mọt Sách Chăm Chỉ',
      desc: 'Xem 100% video bài giảng ghi hình',
      icon: BookOpen,
      color: 'from-emerald-400 to-teal-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      unlocked: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* SECTION 1: HERO GREETING & STUDY STREAK BANNER                  */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft relative overflow-hidden">
        {/* Glow decorative spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/15 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                Góc Học Tập Thông Minh
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
                Chuỗi học: 7 ngày liên tiếp
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {greeting.text}, {student.name.split(' ').slice(-1)[0]}! {greeting.icon}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {greeting.mood}
            </p>

            {/* Daily Quote Box */}
            <div className="pt-2">
              <blockquote className="text-xs text-amber-200/90 italic bg-white/5 border-l-2 border-amber-400 pl-3 py-1 rounded-r-xl max-w-xl">
                &ldquo;{dailyQuote.text}&rdquo;
                <span className="block text-[10px] text-slate-400 not-italic font-semibold mt-0.5">
                  — {dailyQuote.author}
                </span>
              </blockquote>
            </div>
          </div>

          {/* Exam Countdown Box with Target Switcher */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-lg text-center shrink-0 min-w-[300px]">
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Đếm Ngược Mục Tiêu</span>
              </div>
              <span className="text-[10px] text-slate-300 font-semibold">{examConfig.title}</span>
            </div>

            {/* Exam Target Switcher Tabs (4 Exams) */}
            <div className="grid grid-cols-2 gap-1 bg-slate-900/60 p-1 rounded-xl mb-3 border border-white/10">
              <button
                type="button"
                onClick={() => setTargetExam('thpt')}
                className={cn(
                  'py-1 text-[10px] font-bold rounded-lg transition-all',
                  targetExam === 'thpt' ? 'bg-amber-400 text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white'
                )}
              >
                THPT Quốc Gia
              </button>
              <button
                type="button"
                onClick={() => setTargetExam('dgnl_hn')}
                className={cn(
                  'py-1 text-[10px] font-bold rounded-lg transition-all',
                  targetExam === 'dgnl_hn' ? 'bg-amber-400 text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white'
                )}
              >
                ĐGNL Hà Nội
              </button>
              <button
                type="button"
                onClick={() => setTargetExam('dgnl_hcm')}
                className={cn(
                  'py-1 text-[10px] font-bold rounded-lg transition-all',
                  targetExam === 'dgnl_hcm' ? 'bg-amber-400 text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white'
                )}
              >
                ĐGNL TP.HCM
              </button>
              <button
                type="button"
                onClick={() => setTargetExam('ielts')}
                className={cn(
                  'py-1 text-[10px] font-bold rounded-lg transition-all',
                  targetExam === 'ielts' ? 'bg-amber-400 text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white'
                )}
              >
                IELTS 7.5+
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center my-3">
              <div className="bg-slate-900/70 p-2 rounded-xl border border-white/10">
                <span className="text-xl font-black text-white block">{countdown.days}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Ngày</span>
              </div>
              <div className="bg-slate-900/70 p-2 rounded-xl border border-white/10">
                <span className="text-xl font-black text-amber-300 block">{countdown.hours}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Giờ</span>
              </div>
              <div className="bg-slate-900/70 p-2 rounded-xl border border-white/10">
                <span className="text-xl font-black text-white block">{countdown.minutes}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Phút</span>
              </div>
              <div className="bg-slate-900/70 p-2 rounded-xl border border-white/10">
                <span className="text-xl font-black text-emerald-400 block">{countdown.seconds}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Giây</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300">
              Mục tiêu điểm số: <strong className="text-amber-300 font-black">{examConfig.targetScore}</strong>
            </p>
          </div>
        </div>

        {/* Visual Weekly Streak (Dải 7 ngày T2 -> CN với Flame phát sáng & Nút bảo lưu chuỗi) */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Flame className="w-5 h-5 fill-orange-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Dải Tuần Chuyên Cần</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[10px] font-bold">
                  7 ngày liên tiếp
                </span>
                {streakFrozen && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Đã bảo lưu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Duy trì học tập mỗi ngày để nhận huy hiệu và thăng hạng học viên
              </p>
            </div>
          </div>

          {/* 7 Days Visual Matrix Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {weeklyStreakDays.map((d, idx) => {
              const isDone = d.status === 'completed';
              const isToday = d.status === 'today';
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400">{d.label}</span>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm',
                      isDone
                        ? 'bg-emerald-500/90 text-white border border-emerald-400 ring-2 ring-emerald-500/20'
                        : isToday
                        ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 animate-pulse'
                        : 'bg-white/10 text-slate-400 border border-white/10'
                    )}
                    title={`${d.name}: ${isDone ? 'Đã học' : isToday ? 'Hôm nay' : 'Sắp tới'}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    ) : isToday ? (
                      <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
                    ) : (
                      <span className="text-[10px]">•</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Streak Freeze Action Button */}
            <button
              type="button"
              onClick={handleToggleStreakFreeze}
              className={cn(
                'ml-2 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95',
                streakFrozen
                  ? 'bg-sky-500 text-white shadow-sky-500/20 ring-2 ring-sky-300'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              )}
              title="Bảo lưu chuỗi ngày nếu có việc bận"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{streakFrozen ? 'Đang bảo lưu' : 'Bảo lưu chuỗi'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">Buổi học tuần này</span>
            <span className="text-xl font-black text-white mt-1 block">5 buổi</span>
            <span className="text-[10px] text-emerald-400 font-medium">100% chuyên cần</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">Bài tập hoàn thành</span>
            <span className="text-xl font-black text-white mt-1 block">
              {mySubmissions.length} / {homeworkList.length}
            </span>
            <span className="text-[10px] text-amber-300 font-medium">
              {pendingHomework.length > 0 ? `Còn ${pendingHomework.length} bài cần nộp` : 'Đã nộp đầy đủ'}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">Điểm trung bình</span>
            <span className="text-xl font-black text-amber-300 mt-1 block">9.2 / 10</span>
            <span className="text-[10px] text-emerald-400 font-medium">Xếp loại: Xuất sắc</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-slate-300 block">Huy hiệu đạt được</span>
            <span className="text-xl font-black text-white mt-1 block">4 / 4 🏆</span>
            <span className="text-[10px] text-purple-300 font-medium">Hạng Vàng Cấp 2</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1.5: GAMIFIED QUIZ ENGINE & WEEKLY SCHEDULE PREVIEW    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Quiz Recommended Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-indigo-900/50 shadow-soft flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  Đề Thi Thử Đề Xuất Hôm Nay
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/15">
                  Toán 12 • 45 phút
                </span>
              </div>
              <span className="text-xs text-amber-300 font-bold">15 Câu trắc nghiệm chuẩn Bloom</span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight">
              {quizzes && quizzes[0] ? quizzes[0].title : 'Khảo sát chất lượng Toán 12 - Tích phân & Khối đa diện'}
            </h3>
            <p className="text-xs text-indigo-200/80 mt-1.5 line-clamp-2 leading-relaxed">
              {quizzes && quizzes[0]
                ? quizzes[0].description
                : 'Đề thi trắc nghiệm chuẩn hóa 15 câu phân bố 4 cấp độ Bloom: Nhận biết, Thông hiểu, Vận dụng và Vận dụng cao. Có đồng hồ đếm ngược 45 phút và tự động phân tích lỗ hổng kiến thức.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-indigo-900/50 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">Thời lượng thi</span>
                <span className="font-bold text-white mt-0.5 block">45 phút</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">Số lượng câu</span>
                <span className="font-bold text-white mt-0.5 block">15 câu hỏi</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">Điểm đạt tiêu chuẩn</span>
                <span className="font-bold text-amber-300 mt-0.5 block">5.0 / 10 điểm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">Đã nộp bài</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">
                  {quizSubmissions.length} lượt thi
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 pt-4 border-t border-indigo-900/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-indigo-200/90 font-medium">
              Tự động tính điểm tức thời & phân tích lỗ hổng kiến thức chi tiết
            </span>
            <button
              type="button"
              onClick={() => {
                const target = (quizzes && quizzes[0]) || mockQuizzes[0];
                if (onOpenQuiz) {
                  onOpenQuiz(target);
                } else {
                  onNavigateTab('homework');
                }
              }}
              className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Bắt Đầu Làm Bài Thi Thử</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Glow bubbles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Weekly Schedule Quick Preview Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Thời Khóa Biểu Tuần Nhanh</h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {events.length} ca học
              </span>
            </div>

            <div className="space-y-2 mt-3 max-h-[190px] overflow-y-auto pr-1">
              {events.slice(0, 3).map((ev) => {
                const colors = getSubjectColor(ev.subject);
                const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
                return (
                  <div
                    key={ev.id}
                    className={cn('p-2.5 rounded-xl border text-xs flex items-center justify-between', colors.bg, colors.border)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-800 border">
                          {dayNames[ev.dayOfWeek - 1]}
                        </span>
                        <span className="font-bold text-slate-900 truncate block text-[11px]">{ev.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {ev.startTime} - {ev.endTime} • {ev.room}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('student-schedule')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Xem chi tiết thời khóa biểu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: NEXT LIVE CLASS & URGENT HOMEWORK                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Live Class (Takes 2 cols on desktop) */}
        {upcomingEvent && (
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Ca Học Trực Tuyến Sắp Diễn Ra
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Thứ {upcomingEvent.dayOfWeek + 1} • {upcomingEvent.startTime} - {upcomingEvent.endTime}
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {upcomingEvent.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={upcomingEvent.tutorAvatar}
                        alt={upcomingEvent.tutorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      {upcomingEvent.tutorName}
                    </span>
                    <span>•</span>
                    <span>{upcomingEvent.room}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenOnlineClass) onOpenOnlineClass(upcomingEvent);
                      else onNavigateTab('online-room');
                    }}
                    className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-700 hover:to-black text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all group"
                  >
                    <Video className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>Mở Lớp Học Ảo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={upcomingEvent.onlineMeetingUrl || 'https://meet.google.com/edu-math-12a'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    title="Mở Google Meet liên kết với lớp học này"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Vào Google Meet</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Preparation checklist */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Chuẩn bị trước giờ học:</strong> Vui lòng chuẩn bị sẵn tài liệu Chuyên đề số 4, máy tính bỏ túi Casio và kiểm tra Micro/Camera để tương tác trực tiếp với thầy cô.
              </div>
            </div>
          </div>
        )}

        {/* Quick To-Do & Deadlines Alert */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Bài Tập Cần Nộp Gấp
              </h3>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {pendingHomework.length} bài
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-2">
              {pendingHomework.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Tuyệt vời! Bạn đã hoàn thành hết bài tập.</p>
                  <p className="text-[10px] text-slate-400">Không có bài tập nào tồn đọng hôm nay.</p>
                </div>
              ) : (
                pendingHomework.slice(0, 2).map((hw) => (
                  <div key={hw.id} className="pt-2.5 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <h4 className="font-bold text-slate-900 truncate max-w-[180px]">{hw.title}</h4>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        Hạn: {hw.dueDate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{hw.sessionTitle}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('homework')}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Mở danh sách bài tập đầy đủ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 3: RECENT GRADED RESULTS & BADGES SHOWCASE             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Graded Assignments with Teacher Remarks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Điểm Số & Lời Phê Của Thầy Cô</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('homework')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentGraded.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Chưa có bài tập nào được chấm điểm gần đây.
              </div>
            ) : (
              recentGraded.map((sub) => {
                const hw = homeworkList.find((h) => h.id === sub.homeworkId);
                return (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{hw?.title || 'Bài tập rèn luyện'}</h4>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{sub.score || 9.5} / 10</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                        <Smile className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lời phê của Thầy Cô:</span>
                      </div>
                      <p className="italic text-slate-600 leading-relaxed">
                        &ldquo;{sub.tutorFeedback || 'Bài làm rất tốt, cách trình bày mạch lạc và logic. Tiếp tục phát huy nhé em!'}&rdquo;
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Badges & Achievements Grid */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <h3 className="font-bold text-slate-900 text-sm">Huy Hiệu & Thành Tích Học Tập</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              4 Huy hiệu mở khóa
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all hover:scale-[1.02] flex items-start gap-3",
                    b.bgColor,
                    b.borderColor
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm bg-gradient-to-br", b.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{b.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{b.desc}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600">
                      ✓ Đã mở khóa
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 4: QUICK SHORTCUTS & RESOURCES                         */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Lối Tắt Học Tập Nhanh</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('student-schedule')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900">Thời Khóa Biểu</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Lịch học 7 ngày trong tuần</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('learning-resources')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 hover:border-amber-200 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900">Kho Tài Liệu & Video</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">PDF đề thi & Ghi hình Meet</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('messages')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-200 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900">Hỏi Bài Thầy Cô</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Hộp thư trao đổi 1:1 trực tiếp</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('courses')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200/70 hover:border-purple-200 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900">Đăng Ký Khóa Mới</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Quy trình 4 bước chuẩn</p>
          </button>
        </div>
      </div>
    </div>
  );
};
