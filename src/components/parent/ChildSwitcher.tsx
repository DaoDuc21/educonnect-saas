'use client';

import React, { useState } from 'react';
import {
  User,
  ChevronDown,
  Sparkles,
  Award,
  Flame,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  Printer,
} from 'lucide-react';
import { Student, AttendanceRecord } from '@/types';
import { cn } from '@/lib/utils';
import { StudentReportModal } from './StudentReportModal';
import { mockHabitProgressItems } from '@/data/mockData';

interface ChildSwitcherProps {
  childrenList: Student[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
  onViewReport?: () => void;
  attendanceRecords?: AttendanceRecord[];
}

export function ChildSwitcher({
  childrenList,
  selectedChildId,
  onSelectChild,
  onViewReport,
  attendanceRecords,
}: ChildSwitcherProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const currentChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  const getChildAttendanceRate = React.useCallback(
    (studentId: string) => {
      // Baseline fallback: Chuyên cần 98%
      if (!attendanceRecords || attendanceRecords.length === 0) return 98;
      const records = attendanceRecords.filter((r) => r.studentId === studentId);
      if (records.length === 0) return 98;
      const presentCount = records.filter((r) => r.status === 'present').length;
      return Math.round((presentCount / records.length) * 100);
    },
    [attendanceRecords]
  );

  const handleOpenReport = () => {
    if (onViewReport) {
      onViewReport();
    } else {
      setIsReportOpen(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Child Profile Information */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentChild.avatar}
              alt={currentChild.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
            />
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
              title="Đang hoạt động"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Hồ Sơ Học Sinh
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 text-[11px] font-bold">
                {currentChild.grade}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Chuyên cần {getChildAttendanceRate(currentChild.id)}%</span>
              </span>
              {currentChild.studyStreakDays && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100/70 text-rose-700 text-[11px] font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>{currentChild.studyStreakDays} ngày</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {currentChild.name}
            </h2>

            <p className="text-xs text-slate-500">
              Phụ huynh: <strong>{currentChild.parentName}</strong> ({currentChild.parentPhone})
            </p>
          </div>
        </div>

        {/* Action Button & Child Switcher Pills */}
        <div className="flex items-center gap-3 flex-wrap lg:justify-end">
          {/* Quick Academic Progress Report Trigger */}
          <button
            onClick={handleOpenReport}
            className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold flex items-center gap-2 transition-all shadow-sm group"
          >
            <Award className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>Sổ Học Bạ & Báo Cáo</span>
          </button>

          {/* Child Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-500 px-2 hidden sm:inline">Chuyển con:</span>
            {childrenList.map((child) => {
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  onClick={() => onSelectChild(child.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{child.name.split('(')[0].trim()}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-normal',
                      isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {child.grade.split(' ')[1] || child.grade} • {getChildAttendanceRate(child.id)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Embedded Student Report Modal */}
      <StudentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        child={currentChild}
        habits={mockHabitProgressItems}
      />
    </>
  );
}
