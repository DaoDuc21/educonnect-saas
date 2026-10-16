'use client';

import React from 'react';
import {
  CalendarDays,
  Users,
  GraduationCap,
  WalletCards,
  Clock,
  BookOpenCheck,
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Settings,
  LogOut,
  ShieldAlert,
  UserCheck,
  Video,
  Award,
  ChevronDown,
  ShieldCheck,
  Check,
  BookOpen,
  BarChart3,
  FolderOpen,
  MessageSquare,
  X,
} from 'lucide-react';
import { UserRole, AdminRole, AuthUser } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentAdminRole?: AdminRole;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  currentAdminRole = 'super_admin',
  currentUser,
  onLogout,
  isOpen = false,
  onClose = () => {},
}: SidebarProps) {
  // Role & Permissions details for display
  const getRolePermissionDetails = () => {
    if (currentRole === 'admin') {
      const adminMap: Record<
        AdminRole,
        { title: string; badge: string; badgeColor: string; description: string; permissions: string[] }
      > = {
        super_admin: {
          title: 'Super Admin',
          badge: 'Toàn quyền 100%',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          description: 'Quản trị điều hành, lịch học, nhân sự & tài chính',
          permissions: [
            'Toàn quyền Master Schedule & Xếp lịch',
            'Quản lý tài khoản & phân quyền RBAC',
            'Toàn quyền Học phí, Doanh thu & VietQR',
            'Bảng thù lao & duyệt lương gia sư',
          ],
        },
        academic_coordinator: {
          title: 'Điều Phối Học Vụ',
          badge: 'Xếp lịch & Học viên',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
          description: 'Chuyên trách điều phối ca dạy, xếp lớp & quản lý gia sư',
          permissions: [
            'Toàn quyền xếp lịch (+ Thêm Ca Học)',
            'Quản lý hồ sơ học sinh & xếp lớp',
            'Điều phối ca dạy của đội ngũ gia sư',
            'Xem đối soát học phí (Read-only)',
          ],
        },
        admissions: {
          title: 'Tư Vấn Tuyển Sinh',
          badge: 'Ghi danh & Tuyển sinh',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          description: 'Tư vấn ghi danh, quản lý học sinh tuyển sinh & gửi yêu cầu cấp tài khoản cho Admin',
          permissions: [
            'Tiếp nhận & Quản lý học sinh tuyển sinh',
            'Gửi yêu cầu Admin duyệt & cấp tài khoản',
            'Tra cứu lịch học & phòng còn trống',
            'Xem danh mục khóa học & đội ngũ gia sư',
          ],
        },
      };
      return adminMap[currentAdminRole] || adminMap.super_admin;
    }

    if (currentRole === 'tutor') {
      return {
        title: 'Giảng Viên / Gia Sư',
        badge: 'Cổng Giảng Dạy',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        description: 'Quản lý lịch dạy cá nhân, điểm danh và bảng kê thu nhập',
        permissions: [
          'Bảng kê thù lao & thu nhập trực thời',
          'Giao & Chấm bài tập về nhà sau buổi dạy',
          'Đăng ký lịch rảnh theo khung giờ tuần',
          'Điểm danh & Đánh giá 5★ từng buổi',
        ],
      };
    }

    if (currentRole === 'student') {
      return {
        title: 'Học Viên Chính Thức',
        badge: 'Góc Học Tập',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Thời khóa biểu học tập, phòng học online và tài liệu môn học',
        permissions: [
          'Thời khóa biểu cá nhân Maham 7 ngày',
          'Làm & Nộp bài tập về nhà trực tuyến',
          'Vào phòng học Online Google Meet 1-click',
          'Quét mã VietQR nộp học phí tự động',
        ],
      };
    }

    return {
      title: 'Phụ Huynh Học Sinh',
      badge: 'Cổng Phụ Huynh',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'Theo dõi tiến độ học tập của các con và đóng học phí trực tuyến',
      permissions: [
        'Chuyển đổi linh hoạt theo dõi nhiều con',
        'Báo cáo tiến độ phân đoạn 9/12 buổi',
        'Xem đánh giá & nhận xét thực tế gia sư',
        'Thanh toán học phí VietQR & Hóa đơn VAT',
      ],
    };
  };

  // Navigation items based strictly on role & permissions
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin': {
        const baseItems = [
          { id: 'schedule', label: 'Lịch tổng quan', icon: CalendarDays, badge: 'Tuần này' },
          { id: 'courses-manager', label: 'Quản lý khóa học', icon: BookOpenCheck, badge: 'Website' },
          { id: 'accounts', label: 'Quản lý tài khoản', icon: ShieldCheck, badge: 'RBAC' },
          { id: 'admissions-leads', label: 'Tuyển sinh & Cấp acc', icon: Users, badge: 'Phê duyệt' },
          { id: 'tutors', label: 'Gia sư & Duyệt lương', icon: GraduationCap, badge: 'Thù lao' },
          { id: 'students', label: 'Quản lý học sinh', icon: Users },
          { id: 'tuition', label: 'Học phí & Doanh thu', icon: WalletCards, badge: 'KPI' },
          { id: 'learning-resources', label: 'Kho tài liệu & Video', icon: FolderOpen, badge: 'Mới' },
          { id: 'messages', label: 'Tin nhắn & Liên lạc', icon: MessageSquare, badge: 'Chat' },
          { id: 'analytics', label: 'Báo cáo & Phân tích', icon: BarChart3, badge: 'Visual' },
          { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
        ];

        if (currentAdminRole === 'academic_coordinator') {
          return [
            { id: 'schedule', label: 'Lịch tổng quan', icon: CalendarDays, badge: 'Toàn quyền' },
            { id: 'courses-manager', label: 'Quản lý khóa học', icon: BookOpenCheck, badge: 'Website' },
            { id: 'students', label: 'Quản lý học sinh', icon: Users },
            { id: 'learning-resources', label: 'Kho tài liệu & Video', icon: FolderOpen, badge: 'Mới' },
            { id: 'messages', label: 'Tin nhắn & Liên lạc', icon: MessageSquare, badge: 'Chat' },
            { id: 'tutors', label: 'Danh sách gia sư', icon: GraduationCap },
            { id: 'tuition', label: 'Đối soát học phí', icon: WalletCards, badge: 'Read-only' },
            { id: 'analytics', label: 'Báo cáo & Phân tích', icon: BarChart3, badge: 'Visual' },
          ];
        }

        if (currentAdminRole === 'admissions') {
          return [
            { id: 'admissions-leads', label: 'Tuyển sinh & Ghi danh', icon: Users, badge: 'Tiếp nhận' },
            { id: 'messages', label: 'Tin nhắn & Liên lạc', icon: MessageSquare, badge: 'Chat' },
            { id: 'schedule', label: 'Tra cứu lịch trống', icon: CalendarDays, badge: 'Xem lịch' },
            { id: 'tutors', label: 'Đội ngũ gia sư', icon: GraduationCap },
          ];
        }

        return baseItems;
      }
      case 'tutor':
        return [
          { id: 'earnings', label: 'Thu nhập & Thống kê', icon: LayoutDashboard },
          { id: 'availability', label: 'Lịch & Giờ rảnh', icon: Clock, badge: 'Đăng ký' },
          { id: 'attendance', label: 'Điểm danh & Đánh giá', icon: CheckSquare, badge: 'Hôm nay' },
          { id: 'homework-management', label: 'Giao & Chấm bài tập', icon: BookOpen, badge: 'Mới' },
          { id: 'learning-resources', label: 'Kho Tài liệu', icon: FolderOpen, badge: 'Upload' },
          { id: 'messages', label: 'Hộp thư trao đổi', icon: MessageSquare, badge: 'Chat' },
          { id: 'classes', label: 'Lớp đang phụ trách', icon: BookOpenCheck },
        ];
      case 'student':
        return [
          { id: 'student-dashboard', label: 'Góc học tập', icon: LayoutDashboard, badge: 'Mới' },
          { id: 'student-schedule', label: 'Thời khóa biểu', icon: CalendarDays },
          { id: 'homework', label: 'Bài tập về nhà', icon: BookOpen, badge: 'Cần nộp' },
          { id: 'online-room', label: 'Phòng học Online', icon: Video, badge: 'Trực tiếp' },
          { id: 'courses', label: 'Đăng ký khóa học', icon: BookOpenCheck, badge: 'Mới' },
          { id: 'learning-resources', label: 'Tài liệu học tập', icon: FolderOpen, badge: 'Tải về' },
          { id: 'messages', label: 'Hộp thư trao đổi', icon: MessageSquare },
          { id: 'student-tuition', label: 'Học phí của tôi', icon: WalletCards },
        ];
      case 'parent':
        return [
          { id: 'progress', label: 'Tiến độ & Điểm danh', icon: Award, badge: 'Realtime' },
          { id: 'parent-tuition', label: 'Kiểm soát học phí', icon: FileText },
          { id: 'learning-resources', label: 'Tài liệu của con', icon: FolderOpen },
          { id: 'messages', label: 'Trao đổi với trung tâm', icon: MessageSquare },
          { id: 'schedule-view', label: 'Lịch học của con', icon: CalendarDays },
        ];
    }
  };

  // Profile data per role
  const getProfileData = () => {
    if (currentUser) {
      let badge = 'Thành viên';
      if (currentUser.role === 'admin') {
        badge = currentUser.adminRole === 'super_admin' ? 'Super Admin' :
                currentUser.adminRole === 'academic_coordinator' ? 'Học Vụ' : 'Tuyển Sinh';
      } else if (currentUser.role === 'tutor') {
        badge = 'Gia sư chính';
      } else if (currentUser.role === 'student') {
        badge = 'Học viên';
      } else if (currentUser.role === 'parent') {
        badge = 'Phụ huynh';
      }

      return {
        name: currentUser.name,
        roleTitle: currentUser.title,
        avatar: currentUser.avatar,
        roleBadge: badge,
      };
    }

    switch (currentRole) {
      case 'admin': {
        const adminProfiles: Record<AdminRole, { name: string; title: string; avatar: string; badge: string }> = {
          super_admin: {
            name: 'Phạm Hồng Đăng',
            title: 'Giám Đốc Trung Tâm',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            badge: 'Super Admin',
          },
          academic_coordinator: {
            name: 'Vũ Thu Hương',
            title: 'Trưởng Ban Học Vụ',
            avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
            badge: 'Điều Phối Học Vụ',
          },
          admissions: {
            name: 'Đỗ Minh Đức',
            title: 'Tư Vấn Tuyển Sinh',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            badge: 'Tư Vấn & CSKH',
          },
        };
        const currentProfile = adminProfiles[currentAdminRole] || adminProfiles.super_admin;
        return {
          name: currentProfile.name,
          roleTitle: currentProfile.title,
          avatar: currentProfile.avatar,
          roleBadge: currentProfile.badge,
        };
      }
      case 'tutor':
        return {
          name: 'Thầy Trần Huy Hoàng',
          roleTitle: 'Gia sư Chuyên Toán',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          roleBadge: 'Gia sư chính',
        };
      case 'student':
        return {
          name: 'Nguyễn Minh Quân',
          roleTitle: 'Học sinh Lớp 12',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          roleBadge: 'Học viên',
        };
      case 'parent':
        return {
          name: 'Chị Hoàng Thảo My',
          roleTitle: 'Phụ huynh Bé An & Thư',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          roleBadge: 'Phụ huynh',
        };
    }
  };

  const navItems = getNavItems();
  const profile = getProfileData();
  const permissionDetails = getRolePermissionDetails();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "w-72 md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-50 transition-transform duration-300 ease-in-out",
          // Mobile drawer positioning
          "fixed inset-y-0 left-0 md:static",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Top scrollable section */}
        <div className="p-5 pb-3 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                  EduConnect
                </span>
                <span className="text-[11px] font-medium text-slate-400 block tracking-wider uppercase">
                  Smart Tutoring Hub
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Active Role & Permissions Card (Replaces the role switcher selector) */}
        <div className="bg-[#F5F3EF] p-3 rounded-2xl border border-slate-200/80 mb-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Quyền Hạn Tài Khoản
              </span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang hoạt động
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs mb-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black text-slate-900 truncate">
                {permissionDetails.title}
              </span>
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0', permissionDetails.badgeColor)}>
                {permissionDetails.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              {permissionDetails.description}
            </p>
          </div>

          {/* Quick permissions checklist */}
          <div className="space-y-1 pt-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block px-0.5 mb-1">
              Phạm Vi Được Phép Truy Cập
            </span>
            {permissionDetails.permissions.map((perm, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-2.5 mb-2 block">
            Menu Chức Năng
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-transform group-hover:scale-110',
                        isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-100 text-amber-800 border border-amber-200/50'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-2.5 rounded-2xl bg-[#F5F3EF]/70 hover:bg-[#F5F3EF] border border-slate-200/60 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0 shadow-sm"
            />
            <div className="overflow-hidden">
              <span className="font-semibold text-xs text-slate-900 truncate block leading-tight">
                {profile.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate block">
                {profile.roleBadge}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onLogout && (
              <button
                onClick={onLogout}
                title="Đăng xuất khỏi hệ thống"
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  </>
);
}
