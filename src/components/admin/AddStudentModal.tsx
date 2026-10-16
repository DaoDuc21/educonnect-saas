'use client';

import React, { useState } from 'react';
import { X, UserPlus, Phone, BookOpen, GraduationCap, School } from 'lucide-react';
import { Student } from '@/types';
import { useToast } from '../shared/ToastNotification';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: Student) => void;
}

export function AddStudentModal({ isOpen, onClose, onAddStudent }: AddStudentModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Lớp 10 - THPT Kim Liên');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [initialCourse, setInitialCourse] = useState('Toán 10 Nâng Cao');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !parentName.trim()) {
      showToast('Vui lòng nhập họ tên học sinh và phụ huynh!', 'warning');
      return;
    }

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      grade,
      parentId: `par-${Date.now()}`,
      parentName,
      parentPhone: parentPhone || '0988 123 456',
      enrolledCourses: [initialCourse],
      overallProgress: 10,
      status: 'active',
      tuitionStatus: 'pending',
    };

    onAddStudent(newStudent);
    showToast(`Đã ghi danh và tạo tài khoản học tập cho em "${name}"!`, 'success');
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ghi Danh Học Sinh & Phụ Huynh Mới</h3>
              <p className="text-xs text-slate-300">Cấp tài khoản portal học viên và liên kết số điện thoại Zalo</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Họ và tên học sinh *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Gia Hưng"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Khối lớp & Trường</label>
              <input
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="VD: Lớp 9 - THCS Marie Curie"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Họ tên Phụ huynh liên kết *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="VD: Nguyễn Văn Tuấn"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Số điện thoại Phụ huynh *</label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0918 222 333"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Khóa học đăng ký ban đầu</label>
            <input
              type="text"
              value={initialCourse}
              onChange={(e) => setInitialCourse(e.target.value)}
              placeholder="VD: Toán 9 Bứt Phá & Vào 10"
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
            />
          </div>

          <div className="p-3 bg-[#F5F3EF] rounded-2xl text-[11px] text-slate-600 space-y-1 border border-slate-200/60">
            <p className="font-bold text-slate-800">Cơ chế đồng bộ tự động:</p>
            <p>• Tự động tạo tài khoản Học sinh trên app với mã <strong>HS-AUTO</strong></p>
            <p>• Phụ huynh nhận link theo dõi tiến độ và học phí qua Zalo / SMS</p>
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
              Lưu hồ sơ học sinh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
