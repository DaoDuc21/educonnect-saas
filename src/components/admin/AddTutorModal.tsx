'use client';

import React, { useState } from 'react';
import { X, GraduationCap, Mail, Phone, DollarSign, BookOpen, Star } from 'lucide-react';
import { Tutor } from '@/types';
import { useToast } from '../shared/ToastNotification';

interface AddTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTutor: (newTutor: Tutor) => void;
}

export function AddTutorModal({ isOpen, onClose, onAddTutor }: AddTutorModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Hóa học 10-11-12 & Luyện thi Đại học');
  const [hourlyRate, setHourlyRate] = useState(350000);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập họ tên giảng viên!', 'warning');
      return;
    }

    const newTutor: Tutor = {
      id: `tut-${Date.now()}`,
      name,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      subject,
      hourlyRate: Number(hourlyRate) || 350000,
      completedHoursThisMonth: 0,
      totalEarningsThisMonth: 0,
      rating: 5.0,
      activeClassesCount: 1,
      phone: phone || '0901 234 567',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@educonnect.vn`,
    };

    onAddTutor(newTutor);
    showToast(`Đã thêm giảng viên/gia sư "${name}" vào hệ thống trung tâm!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-300/20 text-amber-300 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Thêm Giảng Viên / Gia Sư Mới</h3>
              <p className="text-xs text-slate-300">Cấp tài khoản portal và phân công bộ môn giảng dạy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Họ và tên Giảng viên *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Thầy Đặng Văn Nam hoặc Cô Phạm Minh Anh"
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Bộ môn chuyên trách & Khối lớp</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: Hóa học 10-11-12 & Luyện thi ĐGNL"
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Đơn giá thù lao (VNĐ/giờ) *</label>
              <input
                type="number"
                step={10000}
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Email giảng viên</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="giaovien@educonnect.vn"
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
            />
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
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-semibold shadow-soft transition-all"
            >
              Thêm giảng viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
