'use client';

import React, { useState } from 'react';
import { Clock, Check, Sparkles, AlertCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';

const DAYS = [
  { id: 1, name: 'Thứ Hai' },
  { id: 2, name: 'Thứ Ba' },
  { id: 3, name: 'Thứ Tư' },
  { id: 4, name: 'Thứ Năm' },
  { id: 5, name: 'Thứ Sáu' },
  { id: 6, name: 'Thứ Bảy' },
  { id: 7, name: 'Chủ Nhật' },
];

const TIME_SHIFTS = [
  { id: 'shift-1', label: '07:00 - 08:30', period: 'Sáng sớm' },
  { id: 'shift-2', label: '08:45 - 10:15', period: 'Giữa sáng' },
  { id: 'shift-3', label: '10:30 - 12:00', period: 'Trưa' },
  { id: 'shift-4', label: '13:30 - 15:00', period: 'Đầu chiều' },
  { id: 'shift-5', label: '15:15 - 16:45', period: 'Cuối chiều' },
  { id: 'shift-6', label: '18:00 - 19:30', period: 'Tối ca 1' },
  { id: 'shift-7', label: '19:45 - 21:15', period: 'Tối ca 2' },
];

interface AvailabilityPickerProps {
  initialSlots?: string[];
  onSaveAvailability?: (slots: string[]) => void;
}

export function AvailabilityPicker({
  initialSlots,
  onSaveAvailability,
}: AvailabilityPickerProps = {}) {
  const { showToast } = useToast();

  const defaultPreset = [
    '1-shift-1',
    '2-shift-1',
    '2-shift-2',
    '3-shift-6',
    '4-shift-1',
    '5-shift-6',
    '6-shift-4',
    '6-shift-5',
  ];

  // Selected availability key format: `${dayId}-${shiftId}`
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(() => {
    return new Set(initialSlots && initialSlots.length > 0 ? initialSlots : defaultPreset);
  });

  const toggleSlot = (dayId: number, shiftId: string) => {
    const key = `${dayId}-${shiftId}`;
    const next = new Set(selectedSlots);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedSlots(next);
  };

  const handleSelectQuickMorning = () => {
    const next = new Set(selectedSlots);
    [1, 2, 3, 4, 5].forEach((d) => {
      next.add(`${d}-shift-1`);
      next.add(`${d}-shift-2`);
      next.add(`${d}-shift-3`);
    });
    setSelectedSlots(next);
    showToast('Đã chọn nhanh các buổi sáng trong tuần (T2 - T6)', 'info');
  };

  const handleSelectQuickEvening = () => {
    const next = new Set(selectedSlots);
    [1, 2, 3, 4, 5].forEach((d) => {
      next.add(`${d}-shift-6`);
      next.add(`${d}-shift-7`);
    });
    setSelectedSlots(next);
    showToast('Đã chọn nhanh các ca tối trong tuần (18:00 - 21:15)', 'info');
  };

  const handleSelectQuickWeekend = () => {
    const next = new Set(selectedSlots);
    [6, 7].forEach((d) => {
      TIME_SHIFTS.forEach((shift) => {
        next.add(`${d}-${shift.id}`);
      });
    });
    setSelectedSlots(next);
    showToast('Đã chọn toàn bộ các ca cuối tuần (Thứ 7 & Chủ Nhật)', 'info');
  };

  const handleClear = () => {
    setSelectedSlots(new Set());
    showToast('Đã xóa tất cả khung giờ rảnh', 'info');
  };

  const handleSave = () => {
    const slotsArray = Array.from(selectedSlots);
    if (onSaveAvailability) {
      onSaveAvailability(slotsArray);
    }
    showToast(
      `Đã cập nhật ${selectedSlots.size} khung giờ rảnh (${selectedSlots.size * 1.5} giờ/tuần) lên hệ thống điều phối!`,
      'success'
    );
  };

  const totalTeachingHours = (selectedSlots.size * 1.5).toFixed(1);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Đăng Ký Khung Giờ Rảnh Nhận Lớp
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {selectedSlots.size} ca đã chọn
            </span>
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Tổng {totalTeachingHours} giờ rảnh/tuần
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Click trực tiếp vào các ô bên dưới để chọn các khung giờ bạn sẵn sàng nhận học sinh mới
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSelectQuickMorning}
            className="px-3 py-1.5 rounded-full bg-[#F5F3EF] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            + Ca sáng (T2-T6)
          </button>
          <button
            onClick={handleSelectQuickEvening}
            className="px-3 py-1.5 rounded-full bg-[#F5F3EF] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            + Ca tối (18h-21h)
          </button>
          <button
            onClick={handleSelectQuickWeekend}
            className="px-3 py-1.5 rounded-full bg-[#F5F3EF] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            + Cuối tuần (T7, CN)
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-full text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors"
          >
            Làm trống
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-soft transition-all"
          >
            <Save className="w-3.5 h-3.5 text-amber-300" />
            <span>Lưu lịch rảnh</span>
          </button>
        </div>
      </div>

      {/* Grid selector */}
      <div className="p-6 overflow-x-auto">
        <div className="min-w-[700px]">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-xs font-bold text-slate-400 text-left border-b border-slate-100">
                  Khung giờ
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day.id}
                    className="p-3 text-xs font-bold text-slate-700 border-b border-slate-100"
                  >
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TIME_SHIFTS.map((shift) => (
                <tr key={shift.id}>
                  <td className="p-2.5 text-left text-xs">
                    <span className="font-bold text-slate-800 block">{shift.label}</span>
                    <span className="text-[10px] text-slate-400 block">{shift.period}</span>
                  </td>
                  {DAYS.map((day) => {
                    const isSelected = selectedSlots.has(`${day.id}-${shift.id}`);
                    return (
                      <td key={day.id} className="p-1.5">
                        <button
                          type="button"
                          onClick={() => toggleSlot(day.id, shift.id)}
                          className={cn(
                            'w-full py-3 rounded-2xl text-xs font-semibold transition-all border flex items-center justify-center gap-1',
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50/70 hover:bg-slate-100 text-slate-400 border-dashed border-slate-200/80 hover:border-slate-300'
                          )}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Sẵn sàng</span>
                            </>
                          ) : (
                            <span className="text-[11px] opacity-60">Trống</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
