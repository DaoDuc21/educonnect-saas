'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  Coins,
  BookOpen,
  Users,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

export interface TuitionPlanSelection {
  subject: string;
  grade: string;
  format: string;
  frequency: number;
  cycle: string;
  totalSessions: number;
  originalPrice: number;
  discountRate: number;
  finalPrice: number;
  pricePerSession: number;
}

interface TuitionCalculatorProps {
  onSelectPlan?: (plan: TuitionPlanSelection) => void;
}

const SUBJECTS = [
  { id: 'math', name: 'Toán Học' },
  { id: 'literature', name: 'Ngữ Văn' },
  { id: 'english', name: 'Tiếng Anh (IELTS / Giao Tiếp)' },
  { id: 'physics', name: 'Vật Lý' },
  { id: 'chemistry', name: 'Hóa Học' },
  { id: 'biology', name: 'Sinh Học' },
];

const GRADES = [
  { id: 'grade-1', name: 'Lớp 1', level: 'primary', baseRate: 180000 },
  { id: 'grade-2', name: 'Lớp 2', level: 'primary', baseRate: 180000 },
  { id: 'grade-3', name: 'Lớp 3', level: 'primary', baseRate: 190000 },
  { id: 'grade-4', name: 'Lớp 4', level: 'primary', baseRate: 200000 },
  { id: 'grade-5', name: 'Lớp 5 (Chuyển cấp)', level: 'primary', baseRate: 220000 },
  { id: 'grade-6', name: 'Lớp 6', level: 'secondary', baseRate: 240000 },
  { id: 'grade-7', name: 'Lớp 7', level: 'secondary', baseRate: 250000 },
  { id: 'grade-8', name: 'Lớp 8', level: 'secondary', baseRate: 260000 },
  { id: 'grade-9', name: 'Lớp 9 (Luyện thi vào 10)', level: 'secondary', baseRate: 290000 },
  { id: 'grade-10', name: 'Lớp 10', level: 'high', baseRate: 310000 },
  { id: 'grade-11', name: 'Lớp 11', level: 'high', baseRate: 330000 },
  { id: 'grade-12', name: 'Lớp 12 & Ôn Thi ĐH', level: 'high', baseRate: 360000 },
];

const FORMATS = [
  { id: 'vip', name: 'Gia Sư 1:1 VIP Cá Nhân Hóa', multiplier: 1.8, badge: 'Hiệu quả cao nhất' },
  { id: 'small', name: 'Lớp Sĩ Số Vàng (4 - 6 HS)', multiplier: 1.15, badge: 'Tương tác nhóm' },
  { id: 'standard', name: 'Chuyên Đề Trọng Điểm (10 - 15 HS)', multiplier: 1.0, badge: 'Tiết kiệm chi phí' },
  { id: 'online', name: 'Lớp Trực Tuyến Live (Meet Interactive)', multiplier: 0.85, badge: 'Linh hoạt mọi nơi' },
];

const FREQUENCIES = [
  { sessionsPerWeek: 2, label: '2 buổi / tuần (8 buổi / tháng)' },
  { sessionsPerWeek: 3, label: '3 buổi / tuần (12 buổi / tháng)' },
  { sessionsPerWeek: 4, label: '4 buổi / tuần (16 buổi / tháng)' },
];

const CYCLES = [
  { id: 'month', name: 'Đóng theo tháng (1 tháng)', months: 1, discount: 0 },
  { id: 'quarter', name: 'Gói 1 Quý (3 tháng)', months: 3, discount: 0.1, badge: 'Tiết kiệm 10%' },
  { id: 'semester', name: 'Gói 1 Học kỳ (6 tháng)', months: 6, discount: 0.15, badge: 'Tiết kiệm 15%' },
  { id: 'year', name: 'Gói Trọn Niên Khóa (12 tháng)', months: 12, discount: 0.2, badge: 'Tiết kiệm 20%' },
];

export function TuitionCalculator({ onSelectPlan }: TuitionCalculatorProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('math');
  const [selectedGradeId, setSelectedGradeId] = useState('grade-10');
  const [selectedFormatId, setSelectedFormatId] = useState('small');
  const [selectedFrequency, setSelectedFrequency] = useState(2);
  const [selectedCycleId, setSelectedCycleId] = useState('quarter');

  const selectedSubject = SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0];
  const selectedGrade = GRADES.find((g) => g.id === selectedGradeId) || GRADES[9];
  const selectedFormat = FORMATS.find((f) => f.id === selectedFormatId) || FORMATS[1];
  const selectedCycle = CYCLES.find((c) => c.id === selectedCycleId) || CYCLES[1];

  const calculatedPlan: TuitionPlanSelection = useMemo(() => {
    const baseRate = selectedGrade.baseRate;
    const formatMultiplier = selectedFormat.multiplier;
    const sessionRate = Math.round(baseRate * formatMultiplier);

    const monthlySessions = selectedFrequency * 4;
    const totalSessions = monthlySessions * selectedCycle.months;

    const originalPrice = sessionRate * totalSessions;
    const discountRate = selectedCycle.discount;
    const discountAmount = Math.round(originalPrice * discountRate);
    const finalPrice = originalPrice - discountAmount;
    const pricePerSession = totalSessions > 0 ? Math.round(finalPrice / totalSessions) : sessionRate;

    return {
      subject: selectedSubject.name,
      grade: selectedGrade.name,
      format: selectedFormat.name,
      frequency: selectedFrequency,
      cycle: selectedCycle.name,
      totalSessions,
      originalPrice,
      discountRate,
      finalPrice,
      pricePerSession,
    };
  }, [selectedSubject, selectedGrade, selectedFormat, selectedFrequency, selectedCycle]);

  const handleApplyPlan = () => {
    if (onSelectPlan) {
      onSelectPlan(calculatedPlan);
    }
    const leadForm = document.getElementById('admissions-form');
    if (leadForm) {
      leadForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="tuition-calculator" className="py-16 bg-[#F5F3EF] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold mb-3 shadow-sm">
            <Calculator className="w-3.5 h-3.5 text-amber-300" />
            <span>Công Cụ Tra Cứu Học Phí Minh Bạch & Ưu Đãi 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Dự Toán Học Phí Cá Nhân Hóa
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Chọn môn học, khối lớp và hình thức học tập phù hợp để nhận báo giá học phí tức thời kèm chính sách học thử và ưu đãi đóng theo kỳ.
          </p>
        </div>

        {/* Interactive Calculator Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            {/* Step 1: Subject Selection */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>1. Chọn Môn Học</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUBJECTS.map((sub) => {
                  const isSelected = sub.id === selectedSubjectId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <span className="truncate block">{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Grade Selection */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>2. Chọn Khối Lớp</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {GRADES.map((g) => {
                  const isSelected = g.id === selectedGradeId;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGradeId(g.id)}
                      className={`py-2 px-2.5 rounded-2xl text-xs font-bold text-center transition-all border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <span className="truncate block text-[11px]">{g.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Format Selection */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>3. Hình Thức Học Tập</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FORMATS.map((fmt) => {
                  const isSelected = fmt.id === selectedFormatId;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormatId(fmt.id)}
                      className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950 font-black' : 'text-slate-800'}`}>
                          {fmt.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold inline-block">
                        {fmt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Frequency & Billing Cycle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              {/* Frequency */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Tần Suất Học / Tuần</span>
                </label>
                <div className="space-y-1.5">
                  {FREQUENCIES.map((freq) => {
                    const isSelected = freq.sessionsPerWeek === selectedFrequency;
                    return (
                      <button
                        key={freq.sessionsPerWeek}
                        type="button"
                        onClick={() => setSelectedFrequency(freq.sessionsPerWeek)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <span>{freq.label}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cycle */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-600" />
                  <span>Kỳ Đóng Học Phí</span>
                </label>
                <div className="space-y-1.5">
                  {CYCLES.map((cycle) => {
                    const isSelected = cycle.id === selectedCycleId;
                    return (
                      <button
                        key={cycle.id}
                        type="button"
                        onClick={() => setSelectedCycleId(cycle.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <span className="truncate">{cycle.name}</span>
                        {cycle.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {cycle.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Estimation Card (5 Cols) - Dark Indigo Luxury Style */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 border border-indigo-900/50 shadow-soft sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-indigo-900/50">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bảng Dự Toán Chi Tiết</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Ưu đãi kỳ mới
              </span>
            </div>

            {/* Selected Package Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-indigo-200/80">
                <span>Môn học & Khối:</span>
                <span className="font-bold text-white text-right">
                  {calculatedPlan.subject} • {calculatedPlan.grade}
                </span>
              </div>
              <div className="flex justify-between text-indigo-200/80">
                <span>Hình thức học:</span>
                <span className="font-bold text-white text-right">{calculatedPlan.format}</span>
              </div>
              <div className="flex justify-between text-indigo-200/80">
                <span>Tổng buổi học dự kiến:</span>
                <span className="font-bold text-white">
                  {calculatedPlan.totalSessions} buổi ({calculatedPlan.frequency} buổi/tuần)
                </span>
              </div>
              <div className="flex justify-between text-indigo-200/80">
                <span>Kỳ thanh toán:</span>
                <span className="font-bold text-amber-300">{calculatedPlan.cycle}</span>
              </div>
            </div>

            {/* Price Calculation Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Học phí niêm yết:</span>
                <span className="line-through text-slate-400">{formatVND(calculatedPlan.originalPrice)}</span>
              </div>

              {calculatedPlan.discountRate > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Ưu đãi gói {(calculatedPlan.discountRate * 100).toFixed(0)}%:</span>
                  </span>
                  <span>
                    - {formatVND(calculatedPlan.originalPrice * calculatedPlan.discountRate)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-300 uppercase block">
                    Học Phí Thực Thu
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ~ {formatVND(calculatedPlan.pricePerSession)} / buổi
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
                    {formatVND(calculatedPlan.finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Value Guarantees */}
            <div className="space-y-1.5 text-[11px] text-indigo-200/70 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Miễn phí 01 buổi kiểm tra đánh giá năng lực & học thử 1-1</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hoàn 100% học phí buổi chưa học nếu không hài lòng</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cung cấp tài liệu, đề thi và video xem lại trọn đời</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleApplyPlan}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95 group"
            >
              <span>Giữ Mức Học Phí Này & Đăng Ký Tư Vấn</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
