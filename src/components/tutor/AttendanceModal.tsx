'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Save,
  Users,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import { AttendanceRecord } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameTitle?: string;
  initialRecords: AttendanceRecord[];
  onSave?: (records: AttendanceRecord[]) => void;
  onOpenHomeworkModal?: () => void;
}

export function AttendanceModal({
  isOpen,
  onClose,
  classNameTitle = 'Lớp Toán 12 Nâng Cao - Buổi 08/09/2026',
  initialRecords,
  onSave,
  onOpenHomeworkModal,
}: AttendanceModalProps) {
  const { showToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);

  if (!isOpen) return null;

  const updateStatus = (index: number, status: 'present' | 'late' | 'absent') => {
    setRecords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], status };
      return next;
    });
  };

  const updateRemarks = (index: number, remarks: string) => {
    setRecords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], remarks };
      return next;
    });
  };

  const updateRating = (index: number, rating: number) => {
    setRecords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], comprehensionRating: rating };
      return next;
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(records);
    }
    showToast('Đã lưu dữ liệu điểm danh và gửi nhận xét đến phụ huynh học sinh!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-300/20 text-amber-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">{classNameTitle}</h3>
              <p className="text-xs text-slate-300">Điểm danh & Đánh giá chất lượng tiếp thu của từng học viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Roster List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {records.map((student, idx) => (
            <div
              key={student.id}
              className="p-4 rounded-2xl bg-[#F5F3EF]/60 border border-slate-200/70 hover:border-slate-300 transition-all space-y-3"
            >
              {/* Row 1: Student info & Attendance Radio pills */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={student.studentAvatar}
                    alt={student.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      {student.studentName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Mã HS: {student.studentId.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Status Radio Pills */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                  <button
                    type="button"
                    onClick={() => updateStatus(idx, 'present')}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all',
                      student.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Có mặt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(idx, 'late')}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all',
                      student.status === 'late'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Đi muộn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(idx, 'absent')}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all',
                      student.status === 'absent'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Vắng mặt</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Remarks & 5-Star Comprehension Rating */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Remarks Input */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={student.remarks}
                    onChange={(e) => updateRemarks(idx, e.target.value)}
                    placeholder="Nhập nhận xét buổi học (VD: Hiểu bài tốt, cần làm thêm bài tập...)"
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                {/* 5-Star Rating */}
                <div className="flex items-center justify-between md:justify-end gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400">Tiếp thu:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateRating(idx, star)}
                        className="text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={cn(
                            'w-4 h-4',
                            star <= student.comprehensionRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Dữ liệu sẽ tự động đồng bộ sang Nhật ký tiến độ của Phụ huynh
          </span>
          <div className="flex items-center gap-2.5">
            {onOpenHomeworkModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHomeworkModal();
                }}
                className="px-4 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>+ Giao bài tập về nhà</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-soft transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu & Đồng Bộ Điểm Danh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
