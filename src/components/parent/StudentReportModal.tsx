'use client';

import React from 'react';
import { X, Printer, Award, CheckCircle2, Star, Sparkles, BookOpen, User, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { Student, HabitProgressItem } from '@/types';
import { useToast } from '../shared/ToastNotification';

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Student;
  habits?: HabitProgressItem[];
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  child,
  habits = [],
}) => {
  const { showToast } = useToast();

  const avgScore = React.useMemo(() => {
    if (!habits || habits.length === 0) return '9.2';
    const sum = habits.reduce((acc, h) => acc + (h.homeworkScore || 9), 0);
    return (sum / habits.length).toFixed(1);
  }, [habits]);

  const totalSessionsCompleted = React.useMemo(() => {
    if (!habits || habits.length === 0) return { completed: 9, total: 12 };
    const completed = habits.reduce((acc, h) => acc + (h.completedSessions || 0), 0);
    const total = habits.reduce((acc, h) => acc + (h.totalSessions || 0), 0);
    return { completed: completed || 9, total: total || 12 };
  }, [habits]);

  const primaryTutor = React.useMemo(() => {
    return habits[0]?.tutorName
      ? `${habits[0].tutorName} (${habits[0].courseTitle.split('(')[0].trim()})`
      : 'Thầy Trần Huy Hoàng (Toán Chuyên)';
  }, [habits]);

  const attendanceRate = React.useMemo(() => {
    return (child as any).attendanceRate ? `${(child as any).attendanceRate}%` : '98.5%';
  }, [child]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 print:bg-white print:p-0 print:static print:inset-auto backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #printable-student-report {
            border: none !important;
            box-shadow: none !important;
            max-height: none !important;
            width: 100% !important;
          }
        }
      `}</style>
      <div
        id="printable-student-report"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-float overflow-hidden border border-slate-200 print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:m-0 print:p-0 flex flex-col my-auto animate-in zoom-in-95 max-h-[92vh] print:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">Sổ Học Bạ Điện Tử & Báo Cáo Tiến Độ</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Sổ / Lưu PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Academic Report Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed bg-white">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
              Hệ Thống Giáo Dục & Đào Tạo Trực Tuyến EduConnect
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">
              Phiếu Đánh Giá Năng Lực Học Tập Định Kỳ
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Học kỳ 1 - Niên khóa 2026 • Đợt đánh giá định kỳ 9/12 buổi
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={child.avatar}
                alt={child.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{child.name}</h3>
                <p className="text-xs text-slate-600 font-medium">{child.grade}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Phụ huynh: <strong>{child.parentName}</strong> ({child.parentPhone})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Tiến độ khóa học
              </span>
              <span className="text-2xl font-black text-indigo-700">{child.overallProgress}%</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full block mt-0.5">
                Hoàn thành tốt
              </span>
            </div>
          </div>

          {/* Academic Evaluation Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Kết Quả Học Tập & Chuyên Đề Đã Hoàn Thành</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Điểm Trung Bình</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{avgScore} / 10</span>
                <span className="text-[9px] text-emerald-600 font-semibold">Top 5% toàn khóa</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Tỷ Lệ Chuyên Cần</span>
                <span className="text-lg font-black text-emerald-700 mt-0.5 block">{attendanceRate}</span>
                <span className="text-[9px] text-slate-500">Đúng giờ 100%</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Bài Tập Về Nhà</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">
                  {totalSessionsCompleted.completed}/{totalSessionsCompleted.total} bài
                </span>
                <span className="text-[9px] text-indigo-600 font-semibold">Đầy đủ 100%</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Đánh Giá Tiếp Thu</span>
                <span className="text-lg font-black text-amber-500 mt-0.5 block flex items-center justify-center gap-0.5">
                  5.0 <Star className="w-3.5 h-3.5 fill-amber-400" />
                </span>
                <span className="text-[9px] text-slate-500">Rất tích cực</span>
              </div>
            </div>
          </div>

          {/* Habit Tracker & Soft Skills */}
          {habits.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Theo Dõi Nề Nếp & Thói Quen Học Tập Tự Giác</span>
              </h4>

              <div className="space-y-2">
                {habits.map((h) => (
                  <div key={h.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">{h.courseTitle}</span>
                      <span className="text-[10px] text-slate-500">Giảng viên: {h.tutorName} • Điểm BTVN: {h.homeworkScore}/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.round((h.completedSessions / (h.totalSessions || 1)) * 100))}%` }}
                        />
                      </div>
                      <span className="font-bold text-[11px] text-indigo-700 min-w-[50px] text-right">
                        {h.completedSessions}/{h.totalSessions} buổi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tutor & Academic Coordinator Comprehensive Feedback */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Nhận Xét Tổng Thể Của Giảng Viên Chủ Nhiệm
              </h4>
            </div>
            <p className="text-slate-700 italic text-xs leading-relaxed">
              &ldquo;Em {child.name} có tinh thần tự giác rất cao, tư duy nhạy bén trong các bài tập chuyên đề. Trong các buổi học, em luôn chủ động tương tác và hoàn thành tốt nhiệm vụ được giao. Đề nghị gia đình tiếp tục đồng hành để em phát huy tối đa năng lực!&rdquo;
            </p>
            <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500">
              <span>Giảng viên: <strong className="text-slate-800">{primaryTutor}</strong></span>
              <span>Đạt danh hiệu: <strong className="text-amber-600">Học Sinh Xuất Sắc Kỳ 1</strong></span>
            </div>
          </div>

          {/* Center Official Sign-off */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ý KIẾN PHỤ HUYNH
              </span>
              <p className="text-slate-400 italic text-[11px] mt-6">(Ký & ghi rõ họ tên)</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BAN ĐÀO TẠO & HỌC VỤ EDUCONNECT
              </span>
              <p className="font-bold text-slate-900 text-xs mt-1">Vũ Thu Hương</p>
              <span className="inline-block mt-1 text-[8px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">
                ✓ ĐÃ DUYỆT BÁO CÁO
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-soft"
          >
            Đóng sổ học bạ
          </button>
        </div>
      </div>
    </div>
  );
};
