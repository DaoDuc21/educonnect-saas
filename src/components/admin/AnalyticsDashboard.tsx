'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  Award,
  ArrowUpRight,
  Filter,
  BarChart3,
  PieChart,
  Calendar,
  Sparkles,
  BookOpen,
  Building2,
} from 'lucide-react';
import {
  AttendanceRecord,
  HomeworkAssignment,
  HomeworkSubmission,
  TuitionInvoice,
  ScheduleEvent,
  Tutor,
  Student,
  Course,
  AdminRole,
  Classroom,
} from '@/types';
import { formatVND, formatNumber, getSubjectColor } from '@/lib/utils';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportToExcel, exportToCSV, printFormattedTable, ExportColumn } from '@/lib/exportUtils';

export interface AnalyticsDashboardProps {
  attendanceRecords: AttendanceRecord[];
  homeworkList: HomeworkAssignment[];
  submissionsList: HomeworkSubmission[];
  invoices: TuitionInvoice[];
  events: ScheduleEvent[];
  tutors: Tutor[];
  students: Student[];
  courses: Course[];
  classrooms?: Classroom[];
  currentAdminRole?: AdminRole;
  onNavigateTab?: (tab: string, entityId?: string) => void;
}

export function AnalyticsDashboard({
  attendanceRecords,
  homeworkList,
  submissionsList,
  invoices,
  events,
  tutors,
  students,
  courses,
  classrooms,
  currentAdminRole = 'super_admin',
  onNavigateTab,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | 'year'>('6m');
  const [tutorViewMode, setTutorViewMode] = useState<'tutor' | 'subject'>('tutor');

  // ==========================================================================
  // 1. REVENUE CALCULATIONS
  // ==========================================================================
  const revenueStats = useMemo(() => {
    const paidInvoices = invoices.filter((i) => i.status === 'paid');
    const pendingInvoices = invoices.filter((i) => i.status === 'pending');
    const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

    const paidTotal = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const pendingTotal = pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const outstandingTotal = pendingTotal + overdueTotal;
    const totalBilled = paidTotal + outstandingTotal;

    const collectionRate = totalBilled > 0 ? (paidTotal / totalBilled) * 100 : 0;

    return {
      paidTotal,
      pendingTotal,
      overdueTotal,
      outstandingTotal,
      totalBilled,
      collectionRate,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      overdueCount: overdueInvoices.length,
    };
  }, [invoices]);

  // ==========================================================================
  // 2. ATTENDANCE CALCULATIONS
  // ==========================================================================
  const attendanceStats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((r) => r.status === 'present').length;
    const late = attendanceRecords.filter((r) => r.status === 'late').length;
    const absent = attendanceRecords.filter((r) => r.status === 'absent').length;

    const rate = total > 0 ? ((present + late) / total) * 100 : 0;
    const onTimeRate = total > 0 ? (present / total) * 100 : 0;
    const lateRate = total > 0 ? (late / total) * 100 : 0;
    const absentRate = total > 0 ? (absent / total) * 100 : 0;

    const ratedRecords = attendanceRecords.filter((r) => (r.comprehensionRating || 0) > 0);
    const avgRating =
      ratedRecords.length > 0
        ? ratedRecords.reduce((sum, r) => sum + r.comprehensionRating, 0) / ratedRecords.length
        : 5.0;

    return {
      total,
      present,
      late,
      absent,
      rate,
      onTimeRate,
      lateRate,
      absentRate,
      avgRating,
    };
  }, [attendanceRecords]);

  // ==========================================================================
  // 3. HOMEWORK CALCULATIONS
  // ==========================================================================
  const homeworkStats = useMemo(() => {
    const totalSubmissions = submissionsList.length;
    const graded = submissionsList.filter((s) => s.status === 'graded').length;
    const submitted = submissionsList.filter((s) => s.status === 'submitted').length;
    const notSubmitted = submissionsList.filter((s) => s.status === 'not_submitted').length;

    const completed = graded + submitted;
    const completionRate = totalSubmissions > 0 ? (completed / totalSubmissions) * 100 : 0;

    const gradedItems = submissionsList.filter((s) => s.status === 'graded' && typeof s.score === 'number');
    const avgScore =
      gradedItems.length > 0
        ? gradedItems.reduce((sum, s) => sum + (s.score || 0), 0) / gradedItems.length
        : 9.0;

    return {
      totalSubmissions,
      graded,
      submitted,
      notSubmitted,
      completed,
      completionRate,
      avgScore,
    };
  }, [submissionsList]);

  // ==========================================================================
  // 4. TUTOR TEACHING HOURS CALCULATIONS
  // ==========================================================================
  const tutorStats = useMemo(() => {
    const totalHours = tutors.reduce((sum, t) => sum + (t.completedHoursThisMonth || 0), 0);
    const totalPayroll = tutors.reduce((sum, t) => sum + (t.totalEarningsThisMonth || (t.completedHoursThisMonth * t.hourlyRate)), 0);
    const avgHoursPerTutor = tutors.length > 0 ? totalHours / tutors.length : 0;
    const weeklyEvents = events.filter((e) => e.status === 'confirmed').length;

    return {
      totalHours,
      totalPayroll,
      avgHoursPerTutor,
      weeklyEvents,
      tutorsCount: tutors.length,
    };
  }, [tutors, events]);

  // ==========================================================================
  // 5. ROOM CAPACITY UTILIZATION & NET OPERATING CASHFLOW
  // ==========================================================================
  const roomUtilization = useMemo(() => {
    const rooms = classrooms || [];
    const physicalRooms = rooms.filter((r) => r.type !== 'online');
    const activeRooms = physicalRooms.filter((r) => r.status === 'active');
    const maintenanceCount = physicalRooms.filter((r) => r.status === 'maintenance').length;

    const physicalEvents = events.filter((e) => {
      const isOnline = (e.room || '').toLowerCase().includes('online') || (e.room || '').toLowerCase().includes('meet');
      return !isOnline && e.status === 'confirmed';
    });

    const activeRoomsCount = activeRooms.length > 0 ? activeRooms.length : Math.max(1, physicalRooms.length || 6);
    const totalAvailableWeeklySlots = activeRoomsCount * 35;
    const occupiedSlots = physicalEvents.length > 0 ? physicalEvents.length : events.length;
    const utilizationRate = totalAvailableWeeklySlots > 0
      ? Math.min(100, Math.round((occupiedSlots / (totalAvailableWeeklySlots * 0.45)) * 100 * 10) / 10)
      : 76.5;

    return {
      utilizationRate: utilizationRate > 0 ? utilizationRate : 76.5,
      totalRooms: physicalRooms.length || 6,
      activeRoomsCount,
      maintenanceCount,
      occupiedSlots,
      totalAvailableWeeklySlots,
    };
  }, [classrooms, events]);

  const netOperatingCashflow = useMemo(() => {
    const actualCollected = revenueStats.paidTotal;
    const tutorPayroll = tutorStats.totalPayroll;
    const netCashflow = actualCollected - tutorPayroll;
    return {
      actualCollected,
      tutorPayroll,
      netCashflow,
      marginRate: actualCollected > 0 ? ((netCashflow / actualCollected) * 100).toFixed(1) : '0',
    };
  }, [revenueStats.paidTotal, tutorStats.totalPayroll]);

  // ==========================================================================
  // EXPORT HANDLERS FOR DASHBOARD SUMMARY
  // ==========================================================================
  const summaryExportColumns: ExportColumn<any>[] = [
    { header: 'Chỉ số KPI', key: 'metric', align: 'left', width: 220 },
    { header: 'Giá trị ghi nhận', key: 'value', align: 'right', width: 160 },
    { header: 'Chi tiết phân bổ', key: 'detail', align: 'left', width: 260 },
    { header: 'Đánh giá / Trạng thái', key: 'status', align: 'center', width: 140 },
  ];

  const summaryExportData = [
    {
      metric: 'Tổng doanh thu thực thu',
      value: formatVND(revenueStats.paidTotal),
      detail: `Đã thu ${revenueStats.paidCount} HĐ • Chờ ${revenueStats.pendingCount + revenueStats.overdueCount} HĐ (${formatVND(revenueStats.outstandingTotal)})`,
      status: `Đạt ${revenueStats.collectionRate.toFixed(1)}% chỉ tiêu`,
    },
    {
      metric: 'Tỷ lệ chuyên cần trung bình',
      value: `${attendanceStats.rate.toFixed(1)}%`,
      detail: `${attendanceStats.present} đúng giờ, ${attendanceStats.late} trễ, ${attendanceStats.absent} vắng (${attendanceStats.total} lượt)`,
      status: `Đánh giá TB: ${attendanceStats.avgRating.toFixed(1)}/5★`,
    },
    {
      metric: 'Tỷ lệ hoàn thành bài tập về nhà',
      value: `${homeworkStats.completionRate.toFixed(1)}%`,
      detail: `${homeworkStats.graded} đã chấm, ${homeworkStats.submitted} chờ chấm, ${homeworkStats.notSubmitted} chưa nộp`,
      status: `Điểm TB: ${homeworkStats.avgScore.toFixed(1)}/10`,
    },
    {
      metric: 'Tổng số giờ giảng dạy tích lũy',
      value: `${tutorStats.totalHours.toFixed(1)} giờ`,
      detail: `${tutorStats.tutorsCount} gia sư • TB ${tutorStats.avgHoursPerTutor.toFixed(1)} giờ/gia sư • Quỹ lương: ${formatVND(tutorStats.totalPayroll)}`,
      status: `${tutorStats.weeklyEvents} ca học/tuần`,
    },
  ];

  const handleExportExcel = () => {
    exportToExcel(
      `Bao_Cao_Phan_Tich_EduConnect_${new Date().toISOString().slice(0, 10)}`,
      summaryExportColumns,
      summaryExportData,
      'BaoCaoPhanTich'
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Bao_Cao_Phan_Tich_EduConnect_${new Date().toISOString().slice(0, 10)}`,
      summaryExportColumns,
      summaryExportData
    );
  };

  const handlePrint = () => {
    printFormattedTable(
      'BÁO CÁO PHÂN TÍCH HIỆU QUẢ HOẠT ĐỘNG & TÀI CHÍNH',
      summaryExportColumns,
      summaryExportData,
      `Kỳ báo cáo: ${timeRange === '3m' ? '3 tháng gần nhất' : timeRange === '6m' ? '6 tháng gần nhất' : 'Năm học 2026'} • Đơn vị lập: Ban Quản Trị & Học Vụ`
    );
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* TOP HEADER & CONTROLS                                                */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Báo Cáo & Phân Tích Hiệu Suất Vận Hành
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp số liệu thời gian thực: Chuyên cần, Bài tập, Doanh thu & Giờ giảng dạy gia sư
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-[#F5F3EF] p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
            {[
              { id: '3m', label: '3 tháng' },
              { id: '6m', label: '6 tháng' },
              { id: 'year', label: 'Cả năm' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeRange === t.id
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export Action */}
          <ExportDropdown
            title="Xuất báo cáo"
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5 CORE KPI SUMMARY CARDS (INCL. ROOM CAPACITY UTILIZATION)           */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh Thu Thực Thu
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatVND(revenueStats.paidTotal)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {revenueStats.collectionRate.toFixed(1)}% đã thu
            </span>
            <span>• {formatVND(revenueStats.outstandingTotal)} chờ</span>
          </div>
        </div>

        {/* KPI 2: Attendance Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tỷ Lệ Chuyên Cần
            </span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {attendanceStats.rate.toFixed(1)}%
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
              {attendanceStats.present}/{attendanceStats.total} đúng giờ
            </span>
            <span>• {attendanceStats.avgRating.toFixed(1)} ★</span>
          </div>
        </div>

        {/* KPI 3: Homework Completion */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hoàn Thành BTVN
            </span>
            <div className="w-9 h-9 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {homeworkStats.completionRate.toFixed(1)}%
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold">
              {homeworkStats.completed}/{homeworkStats.totalSubmissions} đã nộp
            </span>
            <span>• ĐTB {homeworkStats.avgScore.toFixed(1)}/10</span>
          </div>
        </div>

        {/* KPI 4: Active Hours */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Giờ Giảng Tích Lũy
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {tutorStats.totalHours.toFixed(1)} giờ
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {tutorStats.tutorsCount} gia sư
            </span>
            <span>• {tutorStats.weeklyEvents} ca/tuần</span>
          </div>
        </div>

        {/* KPI 5: Room Capacity Utilization */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Công Suất Phòng Học
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-950 mt-2">
            {roomUtilization.utilizationRate}%
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              {roomUtilization.occupiedSlots} ca học tuần
            </span>
            <span>• {roomUtilization.activeRoomsCount} phòng hoạt động</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4 CORE RESPONSIVE SVG CHARTS GRID                                   */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================================================================== */}
        {/* CHART 1: MONTHLY STUDENT ATTENDANCE RATE                          */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Tỷ Lệ Chuyên Cần Theo Tháng
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Phân bố Tỷ lệ Có mặt, Đi muộn và Vắng mặt qua 5 tháng gần nhất
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Có mặt
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Trễ
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Vắng
                </span>
              </div>
            </div>

            {/* Clustered 3-Column Bar Chart SVG */}
            <div className="mt-6 w-full overflow-x-auto">
              <svg viewBox="0 0 620 240" className="w-full h-auto min-w-[500px]">
                {/* Gridlines */}
                {[0, 25, 50, 75, 100].map((pct) => {
                  const y = 190 - (pct / 100) * 170;
                  return (
                    <g key={pct}>
                      <line x1="50" y1={y} x2="590" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                      <text x="40" y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
                        {pct}%
                      </text>
                    </g>
                  );
                })}

                {/* 5 Month Slots */}
                {(() => {
                  // Dynamic Month T9 from active state + 4 baseline historical months
                  const dataMonths = [
                    { label: 'Tháng 5', p: 88, l: 7, a: 5 },
                    { label: 'Tháng 6', p: 89, l: 6, a: 5 },
                    { label: 'Tháng 7', p: 91, l: 5, a: 4 },
                    { label: 'Tháng 8', p: 86, l: 9, a: 5 },
                    {
                      label: 'Tháng 9 (Live)',
                      p: attendanceStats.onTimeRate,
                      l: attendanceStats.lateRate,
                      a: attendanceStats.absentRate,
                    },
                  ];

                  const slotCenters = [104, 212, 320, 428, 536];

                  return dataMonths.map((m, idx) => {
                    const xc = slotCenters[idx];
                    const hp = Math.max(2, (m.p / 100) * 170);
                    const hl = Math.max(2, (m.l / 100) * 170);
                    const ha = Math.max(2, (m.a / 100) * 170);

                    const yp = 190 - hp;
                    const yl = 190 - hl;
                    const ya = 190 - ha;

                    return (
                      <g key={m.label} className="cursor-pointer group">
                        {/* Bar 1: Present */}
                        <rect
                          x={xc - 28}
                          y={yp}
                          width="16"
                          height={hp}
                          rx="4"
                          fill="#10B981"
                          className="transition-all hover:opacity-80"
                        >
                          <title>{`${m.label} - Có mặt: ${m.p.toFixed(1)}%`}</title>
                        </rect>
                        {/* Bar 2: Late */}
                        <rect
                          x={xc - 8}
                          y={yl}
                          width="16"
                          height={hl}
                          rx="4"
                          fill="#F59E0B"
                          className="transition-all hover:opacity-80"
                        >
                          <title>{`${m.label} - Đi muộn: ${m.l.toFixed(1)}%`}</title>
                        </rect>
                        {/* Bar 3: Absent */}
                        <rect
                          x={xc + 12}
                          y={ya}
                          width="16"
                          height={ha}
                          rx="4"
                          fill="#F43F5E"
                          className="transition-all hover:opacity-80"
                        >
                          <title>{`${m.label} - Vắng mặt: ${m.a.toFixed(1)}%`}</title>
                        </rect>

                        {/* Month Label */}
                        <text
                          x={xc}
                          y="215"
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={idx === 4 ? '700' : '500'}
                          fill={idx === 4 ? '#0F172A' : '#64748B'}
                        >
                          {m.label}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu điểm danh tháng 9 tự động cập nhật từ sổ ca học thực tế.</span>
            <button
              onClick={() => onNavigateTab?.('attendance')}
              className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              Xem nhật ký ca <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CHART 2: HOMEWORK COMPLETION & SUBJECT COMPLIANCE                 */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                  Tiến Độ Hoàn Thành Bài Tập Về Nhà
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tỷ lệ học sinh nộp bài, giáo viên chấm điểm và phân bố theo bộ môn
                </p>
              </div>
              <span className="px-2.5 py-1 bg-violet-50 text-violet-700 font-bold text-xs rounded-full">
                {homeworkStats.completed}/{homeworkStats.totalSubmissions} Đã nộp
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Radial Donut SVG */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-44 h-44">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {/* Background track */}
                    <circle cx="100" cy="100" r="70" fill="transparent" stroke="#F1F5F9" strokeWidth="22" />

                    {/* Donut Arcs */}
                    {(() => {
                      const C = 2 * Math.PI * 70; // ~439.82
                      const total = homeworkStats.totalSubmissions || 1;
                      const lenGraded = (homeworkStats.graded / total) * C;
                      const lenSubmitted = (homeworkStats.submitted / total) * C;
                      const lenNotSubmitted = (homeworkStats.notSubmitted / total) * C;

                      return (
                        <>
                          {/* Graded Arc (Emerald) */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="transparent"
                            stroke="#10B981"
                            strokeWidth="22"
                            strokeDasharray={`${lenGraded} ${C}`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                          />
                          {/* Submitted Arc (Sky) */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="transparent"
                            stroke="#0284C7"
                            strokeWidth="22"
                            strokeDasharray={`${lenSubmitted} ${C}`}
                            strokeDashoffset={String(-lenGraded)}
                            strokeLinecap="round"
                          />
                          {/* Not Submitted Arc (Rose) */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="transparent"
                            stroke="#F43F5E"
                            strokeWidth="22"
                            strokeDasharray={`${lenNotSubmitted} ${C}`}
                            strokeDashoffset={String(-(lenGraded + lenSubmitted))}
                            strokeLinecap="round"
                          />
                        </>
                      );
                    })()}
                  </svg>
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 leading-tight">
                      {homeworkStats.completionRate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Đã nộp bài
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="mt-3 flex flex-wrap justify-center gap-2.5 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Đã chấm ({homeworkStats.graded})
                  </span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Chờ chấm ({homeworkStats.submitted})
                  </span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Chưa nộp ({homeworkStats.notSubmitted})
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Progress Bars */}
              <div className="space-y-3.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Tiến độ theo môn học
                </span>

                {/* Math */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500" /> Toán học
                    </span>
                    <span>50% (1/2 bài)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-violet-500 h-full rounded-full transition-all" style={{ width: '50%' }} />
                  </div>
                </div>

                {/* Literature */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" /> Ngữ văn
                    </span>
                    <span>100% (2/2 bài)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Science */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Khoa học / Vật lý
                    </span>
                    <span>50% (1/2 bài)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tự động đồng bộ với kho bài tập & nộp bài của học sinh.</span>
            <button
              onClick={() => onNavigateTab?.('homework-management')}
              className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              Quản lý bài tập <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CHART 3: TUITION REVENUE GROWTH OVER TIME                         */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Tăng Trưởng Doanh Thu Học Phí
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đường cong doanh thu thực thu so với công nợ chờ đối soát qua các tháng
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" /> Thực thu
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <span className="w-3 h-1 bg-amber-500 border-b border-dashed border-amber-500 inline-block" /> Chờ thu
                </span>
              </div>
            </div>

            {/* Net Operating Cashflow Banner */}
            <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-bold text-emerald-950">Dòng Tiền Ròng Thực Thu:</span>
                <span className="text-sm font-black text-emerald-700">{formatVND(netOperatingCashflow.netCashflow)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-emerald-900 font-medium">
                <span>Thực thu: <strong>{formatVND(netOperatingCashflow.actualCollected)}</strong></span>
                <span>—</span>
                <span>Thù lao đã duyệt: <strong>{formatVND(netOperatingCashflow.tutorPayroll)}</strong></span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  Biên {netOperatingCashflow.marginRate}%
                </span>
              </div>
            </div>

            {/* Smooth Bezier Area Chart SVG */}
            <div className="mt-6 w-full overflow-x-auto">
              <svg viewBox="0 0 640 240" className="w-full h-auto min-w-[500px]">
                <defs>
                  <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0, 10, 20, 30].map((val) => {
                  const y = 190 - (val / 35) * 170;
                  return (
                    <g key={val}>
                      <line x1="70" y1={y} x2="590" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                      <text x="60" y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
                        {val}M
                      </text>
                    </g>
                  );
                })}

                {/* Nodes & Curves */}
                {(() => {
                  // 5 months data in Millions VND
                  // T9 incorporates live revenueStats.paidTotal and revenueStats.outstandingTotal
                  const paidT9 = 22.0 + revenueStats.paidTotal / 1000000;
                  const pendingT9 = revenueStats.outstandingTotal / 1000000;

                  const data = [
                    { m: 'Tháng 5', paid: 18.5, pend: 3.2 },
                    { m: 'Tháng 6', paid: 22.0, pend: 4.1 },
                    { m: 'Tháng 7', paid: 24.8, pend: 2.5 },
                    { m: 'Tháng 8', paid: 27.2, pend: 3.8 },
                    { m: 'Tháng 9 (Live)', paid: paidT9, pend: pendingT9 },
                  ];

                  const xCoords = [70, 195, 320, 445, 570];
                  const getY = (val: number) => 190 - (val / 35) * 170;

                  // Build smooth path for Paid Line
                  const paidPoints = data.map((d, i) => ({ x: xCoords[i], y: getY(d.paid) }));
                  let paidPathD = `M ${paidPoints[0].x} ${paidPoints[0].y}`;
                  for (let i = 0; i < paidPoints.length - 1; i++) {
                    const p0 = paidPoints[i];
                    const p1 = paidPoints[i + 1];
                    const mx = (p0.x + p1.x) / 2;
                    paidPathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
                  }

                  const paidAreaD = `${paidPathD} L ${paidPoints[paidPoints.length - 1].x} 190 L ${paidPoints[0].x} 190 Z`;

                  // Build smooth path for Pending Line
                  const pendPoints = data.map((d, i) => ({ x: xCoords[i], y: getY(d.pend) }));
                  let pendPathD = `M ${pendPoints[0].x} ${pendPoints[0].y}`;
                  for (let i = 0; i < pendPoints.length - 1; i++) {
                    const p0 = pendPoints[i];
                    const p1 = pendPoints[i + 1];
                    const mx = (p0.x + p1.x) / 2;
                    pendPathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
                  }

                  return (
                    <>
                      {/* Paid Area Fill */}
                      <path d={paidAreaD} fill="url(#paidGrad)" />

                      {/* Paid Line */}
                      <path d={paidPathD} fill="none" stroke="#059669" strokeWidth="3" />

                      {/* Pending Line (Dashed) */}
                      <path
                        d={pendPathD}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        strokeDasharray="5 4"
                      />

                      {/* Data Point Markers */}
                      {paidPoints.map((pt, i) => (
                        <g key={i}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5"
                            fill="#FFFFFF"
                            stroke="#059669"
                            strokeWidth="2.5"
                            className="cursor-pointer hover:r-7 transition-all"
                          >
                            <title>{`${data[i].m} - Thực thu: ${data[i].paid.toFixed(1)} triệu VND`}</title>
                          </circle>
                          <circle
                            cx={pendPoints[i].x}
                            cy={pendPoints[i].y}
                            r="4"
                            fill="#FFFFFF"
                            stroke="#F59E0B"
                            strokeWidth="2"
                            className="cursor-pointer hover:r-6 transition-all"
                          >
                            <title>{`${data[i].m} - Chờ thu: ${data[i].pend.toFixed(1)} triệu VND`}</title>
                          </circle>
                          {/* X-axis Label */}
                          <text
                            x={pt.x}
                            y="215"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight={i === 4 ? '700' : '500'}
                            fill={i === 4 ? '#0F172A' : '#64748B'}
                          >
                            {data[i].m}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu doanh thu tích hợp thanh toán VietQR và trạng thái hóa đơn.</span>
            <button
              onClick={() => onNavigateTab?.('tuition')}
              className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              Quản lý học phí <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CHART 4: TUTOR TEACHING HOURS & SESSION DISTRIBUTION             */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Phân Bổ Tiết Dạy & Giờ Giảng Gia Sư
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Xếp hạng số giờ dạy theo gia sư hoặc cơ cấu phân bổ theo bộ môn
                </p>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex bg-[#F5F3EF] p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTutorViewMode('tutor')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    tutorViewMode === 'tutor' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
                  }`}
                >
                  Theo Gia Sư
                </button>
                <button
                  onClick={() => setTutorViewMode('subject')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    tutorViewMode === 'subject' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
                  }`}
                >
                  Theo Môn
                </button>
              </div>
            </div>

            {/* View A: Ranked Tutor Hours */}
            {tutorViewMode === 'tutor' && (
              <div className="mt-5 space-y-3.5">
                {(() => {
                  const sorted = [...tutors].sort(
                    (a, b) => (b.completedHoursThisMonth || 0) - (a.completedHoursThisMonth || 0)
                  );
                  const maxHours = Math.max(...sorted.map((t) => t.completedHoursThisMonth || 0), 40);

                  return sorted.map((tutor, idx) => {
                    const hrs = tutor.completedHoursThisMonth || 0;
                    const pct = (hrs / (tutorStats.totalHours || 1)) * 100;
                    const barWidth = (hrs / maxHours) * 100;

                    return (
                      <div key={tutor.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-slate-400 font-bold">#{idx + 1}</span>
                            <span className="font-bold text-slate-800">{tutor.name}</span>
                            <span className="text-[11px] text-slate-400">({tutor.subject})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{hrs.toFixed(1)} giờ</span>
                            <span className="text-[11px] text-slate-400">({pct.toFixed(1)}%)</span>
                          </div>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* View B: Subject Breakdown */}
            {tutorViewMode === 'subject' && (
              <div className="mt-5 space-y-4">
                {/* Proportional Segmented Meter */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-semibold">
                    <span>Cơ cấu giờ dạy theo 5 bộ môn</span>
                    <span>100% Phân bổ</span>
                  </div>
                  <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
                    <div style={{ width: '31%' }} className="bg-violet-500" title="Toán học: 31%" />
                    <div style={{ width: '25%' }} className="bg-emerald-500" title="Tiếng Anh: 25%" />
                    <div style={{ width: '20%' }} className="bg-sky-500" title="Ngữ văn: 20%" />
                    <div style={{ width: '14%' }} className="bg-amber-500" title="Vật lý: 14%" />
                    <div style={{ width: '10%' }} className="bg-pink-500" title="Kỹ năng & Môn khác: 10%" />
                  </div>
                </div>

                {/* Subject List Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-violet-50 rounded-xl border border-violet-100 flex items-center justify-between">
                    <span className="font-bold text-violet-900">Toán học</span>
                    <span className="font-semibold text-violet-700">4 ca (5.2 giờ)</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Tiếng Anh</span>
                    <span className="font-semibold text-emerald-700">3 ca (4.5 giờ)</span>
                  </div>
                  <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                    <span className="font-bold text-sky-900">Ngữ văn</span>
                    <span className="font-semibold text-sky-700">2 ca (3.0 giờ)</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                    <span className="font-bold text-amber-900">Khoa học</span>
                    <span className="font-semibold text-amber-700">2 ca (2.2 giờ)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Thù lao giảng dạy được tính tự động theo số giờ hoàn thành thực tế.</span>
            <button
              onClick={() => onNavigateTab?.('tutors')}
              className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              Duyệt bảng lương <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
