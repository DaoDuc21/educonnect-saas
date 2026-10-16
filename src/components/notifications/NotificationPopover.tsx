'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  BookOpen,
  WalletCards,
  CalendarDays,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { AppNotification, UserRole } from '@/types';
import { cn } from '@/lib/utils';

export interface NotificationPopoverProps {
  notifications?: AppNotification[];
  currentRole: UserRole;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
  onNavigateTab?: (targetTab: string, entityId?: string) => void;
  className?: string;
}

export function getNotificationTypeConfig(type: AppNotification['type']) {
  switch (type) {
    case 'homework':
      return {
        icon: BookOpen,
        label: 'Bài tập',
        iconBg: 'bg-violet-100 text-violet-700',
        badge: 'bg-violet-50 text-violet-700 border-violet-200',
        dot: 'bg-violet-500',
      };
    case 'tuition':
      return {
        icon: WalletCards,
        label: 'Học phí',
        iconBg: 'bg-emerald-100 text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'schedule':
      return {
        icon: CalendarDays,
        label: 'Lịch học',
        iconBg: 'bg-sky-100 text-sky-700',
        badge: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'registration':
      return {
        icon: UserCheck,
        label: 'Đăng ký',
        iconBg: 'bg-amber-100 text-amber-800',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        label: 'Cảnh báo',
        iconBg: 'bg-rose-100 text-rose-700',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'success':
      return {
        icon: CheckCircle2,
        label: 'Thành công',
        iconBg: 'bg-teal-100 text-teal-700',
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
      };
    case 'info':
    default:
      return {
        icon: Info,
        label: 'Thông tin',
        iconBg: 'bg-blue-100 text-blue-700',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
  }
}

export function formatNotificationTime(timestamp: string, createdAt?: string): string {
  if (
    timestamp.includes('trước') ||
    timestamp.includes('vừa') ||
    timestamp.includes('Vừa') ||
    timestamp.includes('Hôm nay') ||
    timestamp.includes('Hôm qua')
  ) {
    return timestamp;
  }

  const dateToParse = createdAt || timestamp;
  const parsed = Date.parse(dateToParse);
  if (isNaN(parsed)) return timestamp;

  const now = Date.now();
  const diffMs = now - parsed;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) {
    const d = new Date(parsed);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `Hôm qua ${hours}:${mins}`;
  }
  return new Date(parsed).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function NotificationPopover({
  notifications = [],
  currentRole,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  onSelectNotification,
  onNavigateTab,
  className,
}: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Role-filtered notifications
  const roleNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (Array.isArray(n.targetRole)) {
        return n.targetRole.includes(currentRole) || n.targetRole.includes('all' as any);
      }
      return n.targetRole === 'all' || n.targetRole === currentRole;
    });
  }, [notifications, currentRole]);

  // Unread count
  const unreadCount = useMemo(() => {
    return roleNotifications.filter((n) => !n.isRead).length;
  }, [roleNotifications]);

  // Filtered view items
  const displayedNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return roleNotifications.filter((n) => !n.isRead);
    }
    return roleNotifications;
  }, [roleNotifications, activeFilter]);

  // Dismiss listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = (item: AppNotification) => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
    if (onSelectNotification) {
      onSelectNotification(item);
    } else if (item.targetTab && onNavigateTab) {
      onNavigateTab(item.targetTab, item.entityId);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Bell Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition-all shadow-soft relative',
          isOpen && 'bg-slate-100 text-slate-900 border-slate-300 ring-2 ring-slate-900/10'
        )}
        title={unreadCount > 0 ? `Thông báo (${unreadCount} chưa đọc)` : 'Thông báo'}
        aria-label={`Trung tâm thông báo, ${unreadCount} thông báo chưa đọc`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm pointer-events-none animate-in zoom-in-75"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Danh sách thông báo"
          className="absolute right-0 mt-2 w-[380px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-float border border-slate-200/80 z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[540px] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Bar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    {unreadCount} mới
                  </span>
                )}
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={unreadCount === 0}
                  onClick={onMarkAllAsRead}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 border border-transparent hover:border-slate-200"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Đã đọc tất cả</span>
                </button>

                <button
                  type="button"
                  disabled={roleNotifications.length === 0}
                  onClick={onClearAllNotifications}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Xóa tất cả thông báo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-2.5 bg-slate-200/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                <span>Tất cả</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {roleNotifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={cn(
                  'flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                  activeFilter === 'unread'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                <span>Chưa đọc</span>
                {unreadCount > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                    {unreadCount}
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                    0
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px]">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                {activeFilter === 'unread' ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Đã đọc tất cả thông báo!</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      Không còn thông báo chưa đọc nào trong phân hệ này.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('all')}
                      className="mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Xem tất cả thông báo
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <BellOff className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Không có thông báo mới</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      Bạn đã cập nhật tất cả hoạt động và sự kiện mới nhất từ trung tâm.
                    </p>
                  </>
                )}
              </div>
            ) : (
              displayedNotifications.map((item) => {
                const config = getNotificationTypeConfig(item.type);
                const TypeIcon = config.icon;
                const formattedTime = formatNotificationTime(item.timestamp, item.createdAt);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'p-3.5 transition-all cursor-pointer group flex items-start gap-3 relative',
                      !item.isRead
                        ? 'bg-sky-50/40 hover:bg-sky-50/70 border-l-4 border-l-indigo-500'
                        : 'bg-white hover:bg-slate-50/80 border-l-4 border-l-transparent'
                    )}
                  >
                    {/* Category Icon */}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                        config.iconBg
                      )}
                    >
                      <TypeIcon className="w-4 h-4" />
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
                              config.badge
                            )}
                          >
                            {config.label}
                          </span>
                          {!item.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formattedTime}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          'text-xs font-bold line-clamp-1 group-hover:text-slate-900',
                          !item.isRead ? 'text-slate-900' : 'text-slate-700'
                        )}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>

                      {item.targetTab && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                          <span>Mở chi tiết</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Action buttons (mark read, delete) */}
                    <div className="flex flex-col items-center gap-1 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(item.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(item.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa thông báo này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>EduConnect Realtime Notification Hub</span>
            <span className="capitalize">{currentRole}</span>
          </div>
        </div>
      )}
    </div>
  );
}
