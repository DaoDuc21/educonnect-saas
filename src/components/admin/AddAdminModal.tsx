'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Phone, Building2, User, KeyRound, Check } from 'lucide-react';
import { AdminAccount, AdminRole } from '@/types';
import { useToast } from '../shared/ToastNotification';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (newAdmin: AdminAccount) => void;
}

export function AddAdminModal({ isOpen, onClose, onAddAdmin }: AddAdminModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('academic_coordinator');
  const [department, setDepartment] = useState('Phòng Đào Tạo & Học Vụ');

  if (!isOpen) return null;

  const roleDetails: Record<AdminRole, { title: string; desc: string; dept: string; perms: string[] }> = {
    super_admin: {
      title: 'Giám Đốc Trung Tâm (Super Admin)',
      dept: 'Ban Giám Đốc',
      desc: 'Toàn quyền 100% quản lý, tài chính, nhân sự và phân quyền hệ thống',
      perms: ['Toàn quyền Master Schedule', 'Toàn quyền Doanh thu & Học phí', 'Duyệt bảng lương gia sư', 'Quản lý tài khoản quản trị'],
    },
    academic_coordinator: {
      title: 'Trưởng Ban Học Vụ & Điều Phối',
      dept: 'Phòng Đào Tạo & Học Vụ',
      desc: 'Toàn quyền xếp lịch học, quản lý học sinh, điều phối ca dạy của gia sư',
      perms: ['Thêm/Sửa/Xóa lịch học', 'Ghi danh & xếp lớp học sinh', 'Chỉ xem báo cáo học phí (Read-only)', 'Không sửa doanh thu'],
    },
    admissions: {
      title: 'Chuyên Viên Tư Vấn & Tuyển Sinh',
      dept: 'Phòng Tuyển Sinh & CSKH',
      desc: 'Tiếp nhận học sinh mới, tư vấn lộ trình và gửi yêu cầu cấp tài khoản cho Admin',
      perms: ['Tiếp nhận & Quản lý học sinh tuyển sinh', 'Gửi yêu cầu Admin cấp tài khoản', 'Tra cứu lịch học & phòng trống', 'Xem thông tin đội ngũ gia sư'],
    },
  };

  const handleRoleSelect = (selectedRole: AdminRole) => {
    setRole(selectedRole);
    setDepartment(roleDetails[selectedRole].dept);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên và email!', 'warning');
      return;
    }

    const newAdmin: AdminAccount = {
      id: `adm-${Date.now()}`,
      name,
      email,
      phone: phone || '0912 000 111',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role,
      title: roleDetails[role].title,
      department,
      status: 'active',
      lastLogin: 'Chưa đăng nhập',
    };

    onAddAdmin(newAdmin);
    showToast(`Đã tạo tài khoản quản trị viên cho ${name} (${roleDetails[role].title})!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-300/20 text-amber-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Thêm Tài Khoản Quản Trị Viên</h3>
              <p className="text-xs text-slate-300">Phân quyền chi tiết theo vị trí công tác tại trung tâm</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Họ và tên nhân sự *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trần Thảo Linh"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Email công vụ *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: linh.tran@educonnect.vn"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0987 654 321"
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Phòng ban</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
              />
            </div>
          </div>

          {/* Select Admin Role */}
          <div>
            <label className="font-bold text-slate-700 block mb-2">
              Chọn vai trò & Cấp bậc quản trị (Admin Role) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(roleDetails) as AdminRole[]).map((r) => {
                const info = roleDetails[r];
                const isSelected = role === r;
                return (
                  <div
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{info.title.split('(')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                    </div>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {info.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permission preview */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
            <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
              Quyền hạn áp dụng cho {roleDetails[role].title}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-700">
              {roleDetails[role].perms.map((p, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
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
              Khởi tạo tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
