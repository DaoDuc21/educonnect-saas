'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  UserPlus,
  KeyRound,
  Check,
  Minus,
  Sparkles,
  Search,
  Phone,
  Mail,
  MoreHorizontal,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import { AdminAccount, AdminRole, Tutor, Student, RolePermission } from '@/types';
import { formatVND } from '@/lib/utils';
import { StatusBadge } from '../shared/Badge';
import { useToast } from '../shared/ToastNotification';
import { AddAdminModal } from './AddAdminModal';
import { AddTutorModal } from './AddTutorModal';
import { AddStudentModal } from './AddStudentModal';

interface AccountManagementHubProps {
  currentAdminRole: AdminRole;
  onAdminRoleChange: (role: AdminRole) => void;
  adminAccounts: AdminAccount[];
  onAddAdmin: (newAdmin: AdminAccount) => void;
  tutors: Tutor[];
  onAddTutor: (newTutor: Tutor) => void;
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  permissionsMatrix: RolePermission[];
}

export function AccountManagementHub({
  currentAdminRole,
  onAdminRoleChange,
  adminAccounts,
  onAddAdmin,
  tutors,
  onAddTutor,
  students,
  onAddStudent,
  permissionsMatrix,
}: AccountManagementHubProps) {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'admins' | 'tutors' | 'students'>('admins');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localMatrix, setLocalMatrix] = useState<RolePermission[]>(permissionsMatrix);

  React.useEffect(() => {
    setLocalMatrix(permissionsMatrix);
  }, [permissionsMatrix]);

  const handleTogglePermission = (
    permId: string,
    roleKey: 'super_admin' | 'academic_coordinator' | 'admissions'
  ) => {
    if (currentAdminRole !== 'super_admin') {
      showToast('Chỉ Super Admin mới có quyền điều chỉnh ma trận phân quyền!', 'warning');
      return;
    }
    setLocalMatrix((prev) =>
      prev.map((item) => {
        if (item.id === permId) {
          const updated = { ...item, [roleKey]: !item[roleKey] };
          return updated;
        }
        return item;
      })
    );
    showToast('Đã cập nhật trạng thái phân quyền hệ thống!', 'success');
  };

  const adminRolesList: { role: AdminRole; label: string; sub: string }[] = [
    { role: 'super_admin', label: 'Chủ Trung Tâm', sub: 'Full Quyền 100%' },
    { role: 'academic_coordinator', label: 'Điều Phối Học Vụ', sub: 'Toàn quyền Xếp lịch' },
    { role: 'admissions', label: 'Tư Vấn Tuyển Sinh', sub: 'Tuyển sinh & Cấp acc' },
  ];

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'academic_coordinator':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'admissions':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Role Status & RBAC Overview Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-900/50 text-white rounded-3xl p-6 shadow-soft relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Phân Quyền Quản Trị Hệ Thống (Admin RBAC)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-amber-300 text-[10px] font-bold border border-indigo-500/30">
                Phiên xác thực
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-1">
              Trung Tâm Quản Lý Tài Khoản & Ma Trận Phân Quyền
            </h2>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Hệ thống bảo mật 4 cấp bậc quản trị, tự động kích hoạt chính xác quyền hạn theo tài khoản đăng nhập.
            </p>
          </div>

          {/* Role Status Overview Badges (Interactive Persona Switcher) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {adminRolesList.map((item) => {
              const isCurrent = currentAdminRole === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => onAdminRoleChange(item.role)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer active:scale-95 ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                  title={`Chuyển thử nghiệm vai trò: ${item.label}`}
                >
                  <div className="flex items-center gap-1.5">
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                    <span className="block leading-tight">{item.label}</span>
                  </div>
                  <span className={`text-[9px] block ${isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                    {isCurrent ? '• Vai trò hiện tại' : item.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Account Management Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Sub-tabs */}
          <div className="flex bg-[#F5F3EF] p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('admins')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'admins' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Quản Trị Viên ({adminAccounts.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('tutors')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'tutors' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Giảng Viên & Gia Sư ({tutors.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('students')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'students' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Học Sinh & Phụ Huynh ({students.length})</span>
            </button>
          </div>

          {/* Action button corresponding to active sub tab */}
          <div>
            {activeSubTab === 'admins' && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full shadow-soft transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm Quản Trị Viên</span>
              </button>
            )}

            {activeSubTab === 'tutors' && (
              <button
                onClick={() => setIsTutorModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full shadow-soft transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm Giảng Viên Mới</span>
              </button>
            )}

            {activeSubTab === 'students' && (
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full shadow-soft transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Ghi Danh Học Sinh Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: ADMINS & PERMISSIONS MATRIX */}
        {activeSubTab === 'admins' && (
          <div className="p-6 space-y-8">
            {/* Admin Accounts Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-slate-900">
                  Danh Sách Nhân Sự Quản Trị Trung Tâm
                </h3>
                <span className="text-xs text-slate-500">
                  Phân chia trách nhiệm học vụ, tài chính và tuyển sinh
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Nhân sự</th>
                      <th className="py-3.5 px-4">Phòng ban</th>
                      <th className="py-3.5 px-4">Cấp bậc / Vai trò</th>
                      <th className="py-3.5 px-4">Đăng nhập cuối</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {adminAccounts.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={adm.avatar}
                              alt={adm.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{adm.name}</span>
                              <span className="text-[11px] text-slate-400">{adm.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {adm.department}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRoleBadge(
                              adm.role
                            )}`}
                          >
                            {adm.title.split('(')[0]}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          {adm.lastLogin}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Đang hoạt động
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => showToast(`Cấu hình tài khoản cho: ${adm.name}`, 'info')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RBAC PERMISSIONS MATRIX TABLE */}
            <div className="pt-4 border-t border-slate-100">
              <div className="mb-4">
                <h3 className="font-bold text-base text-slate-900">
                  Ma Trận Phân Quyền Chi Tiết (Role-Based Access Control Matrix)
                </h3>
                <p className="text-xs text-slate-500">
                  Quyền hạn tương ứng của 4 nhóm vai trò trên từng phân hệ phần mềm
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Phân Hệ & Quyền Hạn</th>
                      <th className="py-3.5 px-4 text-center">Super Admin</th>
                      <th className="py-3.5 px-4 text-center">Học Vụ</th>
                      <th className="py-3.5 px-4 text-center">Tuyển Sinh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {localMatrix.map((perm) => (
                      <tr key={perm.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{perm.label}</span>
                          <span className="text-[11px] text-slate-400">
                            {perm.module} • {perm.description}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(perm.id, 'super_admin')}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              perm.super_admin ? 'bg-emerald-500 shadow-sm' : 'bg-slate-300'
                            }`}
                            title={`Super Admin: Bật/tắt quyền ${perm.label}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                perm.super_admin ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(perm.id, 'academic_coordinator')}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              perm.academic_coordinator ? 'bg-sky-500 shadow-sm' : 'bg-slate-300'
                            }`}
                            title={`Học Vụ: Bật/tắt quyền ${perm.label}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                perm.academic_coordinator ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(perm.id, 'admissions')}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              perm.admissions ? 'bg-amber-500 shadow-sm' : 'bg-slate-300'
                            }`}
                            title={`Tuyển Sinh: Bật/tắt quyền ${perm.label}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                perm.admissions ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TUTORS MANAGEMENT */}
        {activeSubTab === 'tutors' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="p-5 rounded-2xl bg-[#F5F3EF]/60 border border-slate-200/80 hover:border-slate-300 transition-all flex items-start gap-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{tutor.name}</h4>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {tutor.rating} ★
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 block">
                      {tutor.subject}
                    </span>
                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {tutor.phone}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {tutor.email}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60 mt-2">
                      <span className="text-slate-500 font-medium">
                        Đơn giá: <strong className="text-slate-900">{formatVND(tutor.hourlyRate)}/h</strong>
                      </span>
                      <span className="font-bold text-slate-700">
                        {tutor.activeClassesCount} lớp phụ trách
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS MANAGEMENT */}
        {activeSubTab === 'students' && (
          <div className="p-6">
            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Học sinh</th>
                    <th className="py-3.5 px-4">Khối lớp</th>
                    <th className="py-3.5 px-4">Phụ huynh liên kết</th>
                    <th className="py-3.5 px-4">Khóa học</th>
                    <th className="py-3.5 px-4">Tiến độ</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{student.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Mã: {student.id.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{student.grade}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{student.parentName}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.parentPhone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">
                          {student.enrolledCourses[0] || 'Chưa xếp lớp'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-slate-900 h-full rounded-full"
                            style={{ width: `${student.overallProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {student.overallProgress}% hoàn thành
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={student.status === 'active' ? 'active' : 'suspended'}
                          label={student.status === 'active' ? 'Đang học' : 'Bảo lưu'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Account Creation Modals */}
      <AddAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAddAdmin={onAddAdmin}
      />

      <AddTutorModal
        isOpen={isTutorModalOpen}
        onClose={() => setIsTutorModalOpen(false)}
        onAddTutor={onAddTutor}
      />

      <AddStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onAddStudent={onAddStudent}
      />
    </div>
  );
}
