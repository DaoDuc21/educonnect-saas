'use client';

import React, { useState } from 'react';
import { Search, MessageSquare, Plus, ChevronRight, LogOut } from 'lucide-react';
import { UserRole, AdminRole, AuthUser, AppNotification, Conversation, ChatMessage } from '@/types';
import { useToast } from '../shared/ToastNotification';
import { NotificationPopover } from '../notifications/NotificationPopover';
import { ChatQuickModal } from '../chat/ChatQuickModal';

interface HeaderProps {
  currentRole: UserRole;
  activeTab: string;
  onOpenAddEventModal?: () => void;
  currentAdminRole?: AdminRole;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  // M2: Notification props
  notifications?: AppNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
  onNavigateTab?: (targetTab: string, entityId?: string) => void;
  // Messaging props
  conversations?: Conversation[];
  chatMessages?: ChatMessage[];
  onSendMessage?: (conversationId: string, content: string) => void;
}

export function Header({
  currentRole,
  activeTab,
  onOpenAddEventModal,
  currentAdminRole = 'super_admin',
  currentUser,
  onLogout,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDeleteNotification = () => {},
  onClearAllNotifications = () => {},
  onSelectNotification,
  onNavigateTab,
  conversations = [],
  chatMessages = [],
  onSendMessage = () => {},
}: HeaderProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const getBreadcrumb = () => {
    const roleMap: Record<UserRole, string> = {
      admin: 'Quản trị viên',
      tutor: 'Cổng Gia sư',
      student: 'Góc Học tập',
      parent: 'Cổng Phụ huynh',
    };

    const tabMap: Record<string, string> = {
      schedule: 'Lịch tổng quan',
      'courses-manager': 'Quản lý khóa học',
      'admissions-leads': 'Tuyển sinh & Cấp tài khoản',
      accounts: 'Quản lý tài khoản & Phân quyền',
      students: 'Quản lý học sinh',
      tuition: 'Học phí & Doanh thu',
      analytics: 'Báo cáo & Phân tích',
      tutors: 'Đội ngũ gia sư',
      settings: 'Cài đặt hệ thống',
      earnings: 'Bảng kê thu nhập',
      availability: 'Đăng ký lịch rảnh',
      attendance: 'Điểm danh lớp',
      'homework-management': 'Giao & Chấm bài tập',
      classes: 'Lớp phụ trách',
      'student-dashboard': 'Góc học tập thông minh',
      'student-schedule': 'Thời khóa biểu',
      homework: 'Bài tập về nhà',
      'online-room': 'Lớp học trực tuyến',
      courses: 'Đăng ký khóa học',
      'student-tuition': 'Thanh toán học phí',
      progress: 'Tiến độ học tập',
      'parent-tuition': 'Kiểm soát học phí',
      'schedule-view': 'Lịch học của con',
      messages: 'Hộp thư & Liên lạc trung tâm',
      'learning-resources': 'Kho tài liệu & Video',
    };

    return {
      root: 'EduConnect',
      role: roleMap[currentRole],
      page: tabMap[activeTab] || 'Tổng quan',
    };
  };

  const breadcrumb = getBreadcrumb();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Đang tìm kiếm cho: "${searchQuery}"`, 'info');
    }
  };

  return (
    <header className="h-16 px-8 bg-transparent flex items-center justify-between border-b border-slate-200/50 relative z-30">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
          {breadcrumb.root}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-medium text-slate-500 flex items-center gap-1.5">
          <span>{breadcrumb.role}</span>
          {currentRole === 'admin' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {currentAdminRole === 'super_admin'
                ? 'Chủ Trung Tâm'
                : currentAdminRole === 'academic_coordinator'
                ? 'Điều Phối Học Vụ'
                : 'Tư Vấn Tuyển Sinh'}
            </span>
          )}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-bold text-slate-800">
          {breadcrumb.page}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Capsule Search Bar (Be.run & Maham Style) */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm môn học, gia sư, học viên..."
            className="w-64 lg:w-80 bg-white border border-slate-200/80 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-soft transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 relative">
          {/* Notifications Popover */}
          <NotificationPopover
            notifications={notifications}
            currentRole={currentRole}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onDeleteNotification={onDeleteNotification}
            onClearAllNotifications={onClearAllNotifications}
            onSelectNotification={onSelectNotification}
            onNavigateTab={onNavigateTab}
          />

          {/* Messages */}
          <button
            onClick={() => setIsQuickChatOpen(true)}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition-colors shadow-soft relative"
            title="Tin nhắn & Liên lạc trung tâm"
          >
            <MessageSquare className="w-4 h-4" />
            {totalUnreadMessages > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center absolute -top-1 -right-1">
                {totalUnreadMessages}
              </span>
            )}
          </button>
        </div>

        {/* Quick Add Event (Only for roles with schedule editing rights) */}
        {currentRole === 'admin' && (currentAdminRole === 'super_admin' || currentAdminRole === 'academic_coordinator') && (
          <button
            onClick={onOpenAddEventModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-soft hover:shadow-md transition-all group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
            <span>+ Thêm Ca Học</span>
          </button>
        )}

        {/* User Pill & Logout Button */}
        {onLogout && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {currentUser && (
              <div className="hidden xl:flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-bold text-slate-800">{currentUser.name.split(' ')[0]}</span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Messaging Modal */}
      <ChatQuickModal
        isOpen={isQuickChatOpen}
        onClose={() => setIsQuickChatOpen(false)}
        conversations={conversations}
        messages={chatMessages}
        currentUser={currentUser || null}
        currentRole={currentRole}
        onSendMessage={onSendMessage}
        onOpenFullChat={(convId) => {
          if (onNavigateTab) {
            onNavigateTab('messages', convId);
          }
        }}
      />
    </header>
  );
}
