'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Paperclip,
  Video,
  Phone,
  Check,
  CheckCheck,
  MoreVertical,
  Users,
  ShieldCheck,
  GraduationCap,
  User,
  Heart,
  Sparkles,
  ExternalLink,
  X,
  Clock,
  Pin,
  Smile,
  FileText,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { Conversation, ChatMessage, UserRole, AuthUser } from '@/types';
import { cn } from '@/lib/utils';

interface ChatHubProps {
  conversations: Conversation[];
  messages: ChatMessage[];
  currentUser: AuthUser | null;
  currentRole: UserRole;
  onSendMessage: (conversationId: string, content: string, attachmentUrl?: string, attachmentName?: string) => void;
  onCreateConversation?: (title: string, type: Conversation['type'], participantIds: string[]) => void;
  onMarkConversationAsRead: (conversationId: string) => void;
  onUpdateConversation?: (updated: Conversation) => void;
}

export const ChatHub: React.FC<ChatHubProps> = ({
  conversations,
  messages,
  currentUser,
  currentRole,
  onSendMessage,
  onCreateConversation,
  onMarkConversationAsRead,
  onUpdateConversation,
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    conversations[0]?.id || 'conv-support'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [inputText, setInputText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isNewConvOpen, setIsNewConvOpen] = useState(false);
  const [newConvTitle, setNewConvTitle] = useState('');
  const [newConvType, setNewConvType] = useState<Conversation['type']>('direct');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState('');

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Active conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId) || conversations[0];
  }, [conversations, selectedConversationId]);

  // Messages of the active conversation
  const currentMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages.filter((m) => m.conversationId === activeConversation.id);
  }, [messages, activeConversation]);

  // Safe vertical-only auto scroll inside message container without horizontal ancestor blowouts
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages]);

  // Mark as read when entering conversation
  useEffect(() => {
    if (activeConversation) {
      onMarkConversationAsRead(activeConversation.id);
    }
  }, [activeConversation?.id, onMarkConversationAsRead]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchType =
        filterType === 'all' ||
        (filterType === 'support' && c.type === 'support') ||
        (filterType === 'group' && c.type === 'group') ||
        (filterType === 'direct' && c.type === 'direct');

      const matchSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchType && matchSearch;
    });
  }, [conversations, filterType, searchQuery]);

  // Handle Send Message
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachmentUrl.trim()) return;

    if (activeConversation) {
      onSendMessage(
        activeConversation.id,
        inputText.trim(),
        attachmentUrl.trim() || undefined,
        attachmentName.trim() || undefined
      );
      setInputText('');
      setAttachmentUrl('');
      setAttachmentName('');
      setIsAttachOpen(false);
    }
  };

  const handleUpdateTicketStatus = (newStatus: 'open' | 'in_progress' | 'resolved') => {
    if (!activeConversation) return;
    const updated: Conversation = {
      ...activeConversation,
      ticketStatus: newStatus,
    };
    if (onUpdateConversation) {
      onUpdateConversation(updated);
    }
    const statusText = newStatus === 'resolved' ? 'Đã giải quyết xong' : newStatus === 'in_progress' ? 'Đang điều phối xử lý' : 'Đang chờ tiếp nhận';
    onSendMessage(
      activeConversation.id,
      `[Hệ thống] Trạng thái yêu cầu hỗ trợ đã được cập nhật: "${statusText}".`
    );
  };

  const handlePinAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !announcementInput.trim()) return;
    const updated: Conversation = {
      ...activeConversation,
      pinnedAnnouncement: {
        content: announcementInput.trim(),
        pinnedBy: currentUser?.name || 'Thầy Cô / Học Vụ',
        pinnedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    };
    if (onUpdateConversation) {
      onUpdateConversation(updated);
    }
    setIsPinModalOpen(false);
    setAnnouncementInput('');
  };

  const handleUnpinAnnouncement = () => {
    if (!activeConversation) return;
    const updated: Conversation = {
      ...activeConversation,
      pinnedAnnouncement: undefined,
    };
    if (onUpdateConversation) {
      onUpdateConversation(updated);
    }
  };

  const handleQuickSendMeet = () => {
    if (!activeConversation) return;
    const randomRoom = `meet-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}`;
    const meetUrl = `https://meet.google.com/${randomRoom}`;
    onSendMessage(
      activeConversation.id,
      `🎥 Phòng học Google Meet trực tuyến đã sẵn sàng: ${meetUrl}. Kính mời quý phụ huynh và các em học sinh tham gia lớp học ngay!`
    );
  };

  // Quick message templates based on role
  const quickTemplates = useMemo(() => {
    switch (currentRole) {
      case 'student':
        return [
          'Em chào thầy/cô, em muốn hỏi thêm về bài tập hôm nay ạ.',
          'Em xin phép vào lớp muộn 10 phút do kẹt xe ạ.',
          'Thầy/cô cho em xin link video ghi hình buổi học vừa rồi với ạ.',
        ];
      case 'tutor':
        return [
          'Thầy/cô đã đăng tải tài liệu ôn tập mới lên mục Thư viện nhé!',
          'Nhắc cả lớp hoàn thành bài tập về nhà trước 21h hôm nay.',
          'Buổi học hôm nay cả lớp tiếp thu bài rất tích cực, khen ngợi các em!',
        ];
      case 'parent':
        return [
          'Chào thầy cô, tôi muốn hỏi thăm tiến độ học tập tuần này của cháu.',
          'Gia đình xin phép cho cháu nghỉ học buổi tới vì có việc đột xuất.',
          'Tôi vừa hoàn tất đóng học phí kỳ này qua VietQR, trung tâm kiểm tra giúp.',
        ];
      case 'admin':
      default:
        return [
          'Trung tâm đã ghi nhận yêu cầu và xếp phòng học bù cho em nhé!',
          'Học vụ đã cập nhật lịch học mới trên hệ thống, bạn kiểm tra lại nhé.',
          'Thông báo: Lịch học tuần tới sẽ học trực tuyến qua Google Meet.',
        ];
    }
  }, [currentRole]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">Học Vụ</span>;
      case 'tutor':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">Giảng Viên</span>;
      case 'parent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">Phụ Huynh</span>;
      case 'student':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Học Viên</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden h-[calc(100vh-140px)] min-h-[560px] max-h-[780px] flex flex-col md:flex-row w-full max-w-full min-w-0">
      {/* ============================================================== */}
      {/* LEFT COLUMN: CONVERSATION LIST & CHANNELS                      */}
      {/* ============================================================== */}
      <div
        className={cn(
          "w-full md:w-72 lg:w-80 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/50 min-w-0 overflow-hidden h-full",
          showMobileChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
                <MessageSquare className="w-4 h-4 text-amber-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-base truncate">Hộp Thư & Liên Lạc</h3>
            </div>
            {onCreateConversation && (
              <button
                type="button"
                onClick={() => setIsNewConvOpen(true)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                title="Tạo hội thoại mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm người liên hệ, lớp học..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 border-none text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 min-w-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'support', label: 'Học vụ' },
              { id: 'group', label: 'Nhóm lớp' },
              { id: 'direct', label: 'Trực tiếp' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap shrink-0",
                  filterType === f.id
                    ? "bg-slate-900 text-white shadow-soft"
                    : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 min-w-0">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Không tìm thấy cuộc trò chuyện nào
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                    setShowMobileChat(true);
                  }}
                  className={cn(
                    "w-full p-3.5 text-left flex items-start gap-3 transition-colors relative min-w-0",
                    isSelected ? "bg-white border-l-4 border-slate-900 shadow-sm" : "hover:bg-slate-100/60"
                  )}
                >
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={conv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={conv.title}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                    />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {conv.title}
                      </h4>
                      {conv.lastMessageTime && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate leading-snug">
                      {conv.lastMessage || 'Bắt đầu cuộc trò chuyện mới'}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          {conv.type === 'support' ? 'Hỗ trợ' : conv.type === 'group' ? 'Lớp học' : 'Cá nhân'}
                        </span>
                        {conv.type === 'support' && (
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded text-[9px] font-bold",
                              conv.ticketStatus === 'resolved'
                                ? "bg-emerald-100 text-emerald-800"
                                : conv.ticketStatus === 'in_progress'
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            )}
                          >
                            {conv.ticketStatus === 'resolved'
                              ? 'Đã xử lý'
                              : conv.ticketStatus === 'in_progress'
                              ? 'Đang xử lý'
                              : 'Chờ tiếp nhận'}
                          </span>
                        )}
                      </div>
                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: ACTIVE CHAT THREAD                               */}
      {/* ============================================================== */}
      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col bg-white overflow-hidden h-full",
          !showMobileChat ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 px-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                  title="Quay lại danh sách hội thoại"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeConversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeConversation.title}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{activeConversation.title}</h3>
                    {activeConversation.isPinned && (
                      <Pin className="w-3 h-3 text-amber-500 fill-amber-400 rotate-45 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Đang hoạt động
                    </span>
                    <span>•</span>
                    <span className="truncate">{activeConversation.participants.length} thành viên tham gia</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Support Ticket Status Control */}
                {activeConversation.type === 'support' && (
                  <>
                    {currentRole === 'admin' ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 hidden sm:inline uppercase">Trạng thái:</span>
                        <select
                          value={activeConversation.ticketStatus || 'in_progress'}
                          onChange={(e) => handleUpdateTicketStatus(e.target.value as any)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="open">⏳ Chờ tiếp nhận</option>
                          <option value="in_progress">● Đang xử lý</option>
                          <option value="resolved">✓ Đã giải quyết</option>
                        </select>
                      </div>
                    ) : (
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold border",
                          activeConversation.ticketStatus === 'resolved'
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : activeConversation.ticketStatus === 'in_progress'
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {activeConversation.ticketStatus === 'resolved'
                          ? '✓ Đã giải quyết'
                          : activeConversation.ticketStatus === 'in_progress'
                          ? '● Đang xử lý'
                          : '⏳ Chờ tiếp nhận'}
                      </span>
                    )}
                  </>
                )}

                {/* Group Pin Announcement Button */}
                {activeConversation.type === 'group' && (currentRole === 'admin' || currentRole === 'tutor') && (
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors shrink-0"
                    title="Ghim thông báo lớp học"
                  >
                    <Pin className="w-3.5 h-3.5 rotate-45" />
                    <span className="hidden sm:inline">Ghim thông báo</span>
                  </button>
                )}

                {/* 1-Click Send Meet Link to Chat */}
                <button
                  type="button"
                  onClick={handleQuickSendMeet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
                  title="Tạo phòng Google Meet và gửi vào chat"
                >
                  <Video className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Gửi link Meet</span>
                </button>
              </div>
            </div>

            {/* Pinned Announcement Bar */}
            {activeConversation.pinnedAnnouncement && (
              <div className="bg-amber-50/95 border-b border-amber-200 px-4 py-2.5 flex items-start justify-between gap-3 text-xs text-amber-950 shrink-0 animate-in fade-in">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Pin className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0 mt-0.5 rotate-45" />
                  <div className="min-w-0">
                    <span className="font-bold text-[10px] text-amber-800 uppercase tracking-wider block">
                      Thông Báo Ghim • {activeConversation.pinnedAnnouncement.pinnedBy} ({activeConversation.pinnedAnnouncement.pinnedAt})
                    </span>
                    <p className="mt-0.5 text-xs text-slate-800 font-medium leading-relaxed break-words">
                      {activeConversation.pinnedAnnouncement.content}
                    </p>
                  </div>
                </div>
                {(currentRole === 'admin' || currentRole === 'tutor') && (
                  <button
                    type="button"
                    onClick={handleUnpinAnnouncement}
                    className="text-amber-700 hover:text-amber-900 text-[11px] font-bold underline shrink-0 hover:opacity-80"
                  >
                    Bỏ ghim
                  </button>
                )}
              </div>
            )}

            {/* Chat Message Stream */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 min-w-0">
              {/* Security Banner */}
              <div className="text-center py-2 px-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200/60 max-w-full text-center leading-normal">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Kênh liên lạc chính thức được mã hóa & giám sát chất lượng bởi Trung tâm EduConnect</span>
                </span>
              </div>

              {currentMessages.map((msg) => {
                const isMe =
                  (currentUser && msg.senderId === currentUser.id) ||
                  (currentUser && msg.senderRole === currentUser.role);

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]",
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                    />

                    <div className={cn("space-y-1", isMe ? "items-end text-right" : "items-start text-left")}>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-slate-800">{msg.senderName}</span>
                        {getRoleBadge(msg.senderRole)}
                        <span className="text-slate-400 text-[10px]">{msg.timestamp}</span>
                      </div>

                      <div
                        className={cn(
                          "p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm",
                          isMe
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Interactive Google Meet Room Card */}
                        {msg.content.includes('meet.google.com') && (
                          <div
                            className={cn(
                              "mt-2.5 p-3 rounded-xl border flex items-center justify-between gap-3",
                              isMe
                                ? "bg-slate-800/90 border-slate-700 text-slate-100"
                                : "bg-indigo-50/90 border-indigo-200 text-slate-900"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Video className="w-4 h-4 text-amber-300" />
                              </div>
                              <div className="min-w-0">
                                <span className={cn("text-xs font-bold block truncate", isMe ? "text-white" : "text-slate-900")}>
                                  Phòng Học Trực Tuyến Google Meet
                                </span>
                                <span className={cn("text-[10px] block truncate", isMe ? "text-slate-300" : "text-indigo-700 font-medium")}>
                                  Đang phát sóng • Bấm để vào lớp
                                </span>
                              </div>
                            </div>
                            <a
                              href={msg.content.match(/https?:\/\/meet\.google\.com\/[^\s]+/)?.[0] || 'https://meet.google.com'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-colors shadow-sm flex items-center gap-1"
                            >
                              <span>Vào lớp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Attachment Preview Card */}
                        {msg.attachmentUrl && (
                          <div
                            className={cn(
                              "mt-2.5 p-2 rounded-xl border flex items-center justify-between gap-2",
                              isMe
                                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-[11px] font-medium truncate">
                                {msg.attachmentName || 'Tài liệu đính kèm'}
                              </span>
                            </div>
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:text-white rounded-lg transition-colors shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Templates Bar */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto min-w-0 w-full shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Mẫu nhanh:
              </span>
              {quickTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(template)}
                  className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[11px] font-medium border border-slate-200/80 whitespace-nowrap shrink-0 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>

            {/* Attachment Input Overlay (if opened) */}
            {isAttachOpen && (
              <div className="p-3 bg-amber-50/70 border-t border-amber-200/60 flex items-center gap-2 animate-in fade-in min-w-0 w-full shrink-0">
                <Paperclip className="w-4 h-4 text-amber-600 shrink-0" />
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Tên tài liệu / đề thi..."
                  className="w-1/3 min-w-0 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs"
                />
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="Đường dẫn Google Drive / Slide / Meet..."
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsAttachOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0 min-w-0 w-full">
              <button
                type="button"
                onClick={() => setIsAttachOpen(!isAttachOpen)}
                className={cn(
                  "p-2.5 rounded-2xl transition-colors shrink-0",
                  isAttachOpen
                    ? "bg-amber-100 text-amber-800"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                )}
                title="Đính kèm tài liệu / liên kết"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập nội dung tin nhắn trao đổi (nhấn Enter để gửi)..."
                className="flex-1 min-w-0 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && !attachmentUrl.trim()}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all shadow-soft active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Chọn cuộc trò chuyện để bắt đầu</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Bạn có thể trao đổi với Ban Học Vụ, Giảng viên phụ trách lớp hoặc Phụ huynh học sinh.
            </p>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {isNewConvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Tạo Kênh Trao Đổi Mới</h3>
              <button
                type="button"
                onClick={() => setIsNewConvOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên kênh trao đổi</label>
                <input
                  type="text"
                  value={newConvTitle}
                  onChange={(e) => setNewConvTitle(e.target.value)}
                  placeholder="Ví dụ: Lớp Ôn Thi THPT Quốc Gia - Tổ Toán"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại hội thoại</label>
                <select
                  value={newConvType}
                  onChange={(e) => setNewConvType(e.target.value as Conversation['type'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <option value="direct">Trao đổi cá nhân 1:1</option>
                  <option value="group">Nhóm lớp học / Nhóm chuyên môn</option>
                  <option value="support">Kênh hỗ trợ học vụ</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsNewConvOpen(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newConvTitle.trim() && onCreateConversation) {
                    onCreateConversation(newConvTitle.trim(), newConvType, ['admin-1', 'stu-1']);
                    setIsNewConvOpen(false);
                    setNewConvTitle('');
                  }
                }}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-soft"
              >
                Tạo Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Announcement Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-float border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-500 rotate-45" />
                <h3 className="font-bold text-slate-900 text-sm">Ghim Thông Báo Quan Trọng</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePinAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung thông báo cần ghim cho cả lớp:
                </label>
                <textarea
                  rows={4}
                  required
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  placeholder="Ví dụ: Lịch thi thử THPT Quốc Gia tổ chức vào 8:00 sáng Chủ Nhật. Cả lớp ôn kỹ chuyên đề Oxyz và Tích phân nhé!"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-soft"
                >
                  Ghim Lên Đầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
