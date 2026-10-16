'use client';

import React, { useState, useMemo } from 'react';
import { DollarSign, Clock, Sparkles, ArrowRight, X, Calendar, Star, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';
import { exportToExcel, exportToCSV, ExportColumn } from '@/lib/exportUtils';
import { ScheduleEvent, AttendanceRecord } from '@/types';

interface RealtimeSalaryCardProps {
  tutorName?: string;
  monthlyEarnings?: number;
  completedHours?: number;
  hourlyRate?: number;
  rating?: number;
  events?: ScheduleEvent[];
  attendanceRecords?: AttendanceRecord[];
}

export function RealtimeSalaryCard({
  tutorName = 'Thầy Trần Huy Hoàng',
  monthlyEarnings: initialEarnings = 12850000,
  completedHours: initialHours = 36.5,
  hourlyRate = 350000,
  rating = 4.95,
  events,
  attendanceRecords,
}: RealtimeSalaryCardProps) {
  const { showToast } = useToast();
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Dynamic calculations based on events and rates
  const { completedHours, monthlyEarnings, teachingSessions } = useMemo(() => {
    const baseSessions = [
      { date: '01/09/2026', class: 'Toán 12 Vận Dụng Cao', hours: 1.5, rate: hourlyRate, room: 'Phòng A101' },
      { date: '02/09/2026', class: 'Toán 8 Bứt Phá', hours: 1.0, rate: hourlyRate, room: 'Phòng VIP 02' },
      { date: '03/09/2026', class: 'Toán Tư Duy Tiểu Học', hours: 1.5, rate: hourlyRate, room: 'Phòng STEM' },
      { date: '04/09/2026', class: 'Kiểm Tra Chuyên Đề Toán 12', hours: 1.5, rate: hourlyRate, room: 'Hội Trường 01' },
      { date: '06/09/2026', class: 'Toán 12 Luyện Đề Số 1', hours: 2.0, rate: hourlyRate, room: 'Online Meet' },
      { date: '08/09/2026', class: 'Toán 8 Hình Học Nâng Cao', hours: 1.5, rate: hourlyRate, room: 'Phòng A101' },
    ];

    if (events && events.length > 0) {
      const tutorEvents = events.filter((ev) => ev.tutorName?.toLowerCase().includes('hoàng') || ev.tutorName === tutorName);
      if (tutorEvents.length > 0) {
        const dynamicSessions = tutorEvents.map((ev, idx) => ({
          date: `0${(idx % 28) + 1}/09/2026`,
          class: ev.title,
          hours: ev.durationHours,
          rate: hourlyRate,
          room: ev.room,
        }));
        const totalH = dynamicSessions.reduce((acc, s) => acc + s.hours, 0) + 27.5;
        return {
          completedHours: totalH,
          monthlyEarnings: Math.round(totalH * hourlyRate),
          teachingSessions: dynamicSessions,
        };
      }
    }

    return {
      completedHours: initialHours,
      monthlyEarnings: initialEarnings,
      teachingSessions: baseSessions,
    };
  }, [events, tutorName, hourlyRate, initialHours, initialEarnings]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Analytics Card (Chuẩn Style Luxury Dark Indigo Dashboard với gradient blur glow và luminous metrics) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 relative overflow-hidden border border-indigo-900/40 shadow-xl flex flex-col justify-between min-h-[300px]">
          {/* Top Title & Capsule Info */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Bảng Phân Tích Thù Lao Real-Time (Trực Thời)</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {tutorName}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Kỳ chi trả: Tháng 09/2026 • Đơn giá cơ sở: <span className="text-amber-300 font-semibold">{formatVND(hourlyRate)}/giờ</span>
              </p>
            </div>

            <button
              onClick={() => setShowSlipModal(true)}
              className="px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition-all group"
            >
              <span>Xem chi tiết bảng kê</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Artistic Gradient Bubbles (Luminous metrics with glowing gradients) */}
          <div className="relative z-10 my-6 flex items-center gap-4 flex-wrap">
            {/* Yellow Glow Bubble */}
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex flex-col items-center justify-center text-center shadow-xl shadow-amber-500/30 p-3 ring-4 ring-amber-400/20">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Thu Nhập Tạm Tính</span>
              <span className="text-xl font-black text-slate-950 leading-tight mt-0.5">
                {(monthlyEarnings / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-800 font-bold">VNĐ</span>
            </div>

            {/* Indigo Charcoal Bubble (Hours) */}
            <div className="relative w-28 h-28 rounded-full bg-slate-900/90 border border-indigo-500/30 text-white flex flex-col items-center justify-center text-center shadow-xl -ml-4 z-10 p-2 backdrop-blur-sm">
              <span className="text-lg font-black text-amber-300 leading-none">
                {completedHours}h
              </span>
              <span className="text-[10px] text-slate-300 font-medium mt-1">
                Tiết đã dạy
              </span>
            </div>

            {/* Coral/Rose Bubble (Average session rating) */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex flex-col items-center justify-center text-center shadow-lg -ml-4 p-2 ring-2 ring-rose-400/30">
              <span className="text-base font-black text-white leading-none flex items-center gap-0.5">
                {rating} <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              </span>
              <span className="text-[10px] text-rose-100 font-bold mt-1">
                Hài lòng 99%
              </span>
            </div>
          </div>

          {/* Bottom legend indicators */}
          <div className="relative z-10 flex items-center gap-5 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-amber-400 shadow-sm" />
              <span>Thù lao trực tiếp ({formatVND(monthlyEarnings)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-rose-500 shadow-sm" />
              <span>Thưởng KPI & Chuyên cần</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-indigo-500 shadow-sm" />
              <span>Thời lượng tiết ({completedHours}h)</span>
            </div>
          </div>

          {/* Ambient Glow in background */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Calendar / Training Days Card (Dark Indigo Luxury) */}
        <div className="bg-slate-900/90 border border-indigo-900/40 text-white rounded-3xl p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-wide">
                Lịch Dạy Trong Tháng
              </h3>
              <span className="text-xs text-slate-400 font-medium">Tháng 09 ▾</span>
            </div>

            {/* Mini Calendar Dot Matrix matching Image 2 */}
            <div className="mt-4">
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 mb-2">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium">
                <span className="text-slate-600">31</span>
                {/* 1: Yellow active dot */}
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center shadow-glow text-[11px]">
                    1
                  </span>
                </div>
                {/* 2 */}
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px]">
                    2
                  </span>
                </div>
                {/* 3 */}
                <span className="text-slate-400 py-1">3</span>
                {/* 4 */}
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px]">
                    4
                  </span>
                </div>
                {/* 5: Active teaching day */}
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center shadow-glow text-[11px]">
                    5
                  </span>
                </div>
                {/* 6 */}
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px]">
                    6
                  </span>
                </div>
                {/* Row 2 */}
                <span className="text-slate-400 py-1">7</span>
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full ring-2 ring-amber-400 text-white font-bold flex items-center justify-center text-[11px]">
                    8
                  </span>
                </div>
                <span className="text-slate-400 py-1">9</span>
                <span className="text-slate-400 py-1">10</span>
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px]">
                    11
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">
                    12
                  </span>
                </div>
                <span className="text-slate-400 py-1">13</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Ngày có tiết
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full ring-1 ring-amber-400" /> Hôm nay
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" /> Hoàn thành
            </span>
          </div>
        </div>
      </div>

      {/* Dark Indigo Luxury Payslip Breakdown Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-indigo-900/50 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Bảng Kê Chi Tiết Tiết Dạy - Tháng 09/2026</h3>
                  <p className="text-xs text-indigo-200/70">Đối soát thù lao giảng dạy định kỳ trung tâm EduConnect</p>
                </div>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto border border-indigo-900/40 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-indigo-300 uppercase tracking-wider font-bold border-b border-indigo-900/40">
                  <tr>
                    <th className="py-2.5 px-3">Ngày dạy</th>
                    <th className="py-2.5 px-3">Lớp học</th>
                    <th className="py-2.5 px-3">Phòng</th>
                    <th className="py-2.5 px-3">Thời lượng</th>
                    <th className="py-2.5 px-3">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/40 font-medium text-slate-300">
                  {teachingSessions.map((session, idx) => (
                    <tr key={idx} className="hover:bg-indigo-950/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white">{session.date}</td>
                      <td className="py-2.5 px-3">{session.class}</td>
                      <td className="py-2.5 px-3 text-slate-400">{session.room}</td>
                      <td className="py-2.5 px-3">{session.hours} giờ</td>
                      <td className="py-2.5 px-3">{formatVND(session.rate)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                        {formatVND(session.hours * session.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900/90 font-bold text-white border-t border-indigo-900/50">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-xs uppercase tracking-wide">Tổng cộng tích lũy</td>
                    <td className="py-3 px-3 text-amber-300">{completedHours} giờ</td>
                    <td className="py-3 px-3 text-slate-400">-</td>
                    <td className="py-3 px-3 text-right text-base text-amber-300 font-black">
                      {formatVND(monthlyEarnings)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-indigo-300/80">Ngày đối soát dự kiến: 05/10/2026</span>
              <button
                onClick={() => {
                  const columns: ExportColumn<any>[] = [
                    { header: 'Ngày dạy', key: 'date' },
                    { header: 'Lớp học', key: 'class' },
                    { header: 'Phòng học', key: 'room' },
                    { header: 'Thời lượng', key: 'hours', formatter: (v) => `${v} giờ` },
                    { header: 'Đơn giá', key: 'rate', formatter: (v) => formatVND(v) },
                    { header: 'Thành tiền', key: (item) => formatVND(item.hours * item.rate) },
                  ];
                  exportToExcel(
                    `Bang_Ke_Thu_Lao_${tutorName.replace(/\s+/g, '_')}_T09_2026.xls`,
                    columns,
                    teachingSessions,
                    'Bảng Kê Tiết Dạy'
                  );
                  showToast('Đã xuất và tải xuống file Excel bảng kê tiết dạy thực tế!', 'success');
                  setShowSlipModal(false);
                }}
                className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                <span>Xuất file Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
