'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  ExternalLink,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Conversation, ChatMessage, UserRole, AuthUser } from '@/types';
import { cn } from '@/lib/utils';

interface ChatQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  messages: ChatMessage[];
  currentUser: AuthUser | null;
  currentRole: UserRole;
  onSendMessage: (conversationId: string, content: string) => void;
  onOpenFullChat: (conversationId?: string) => void;
}

export const ChatQuickModal: React.FC<ChatQuickModalProps> = ({
  isOpen,
  onClose,
  conversations,
  messages,
  currentUser,
  currentRole,
  onSendMessage,
  onOpenFullChat,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || 'conv-support'
  );
  const [quickInput, setQuickInput] = useState('');

  if (!isOpen) return null;

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const activeMessages = activeConv
    ? messages.filter((m) => m.conversationId === activeConv.id).slice(-4)
    : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim() || !activeConv) return;
    onSendMessage(activeConv.id, quickInput.trim());
    setQuickInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-end sm:justify-end sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-in zoom-in-95 sm:slide-in-from-bottom-5">
        {/* Header */}
        <div className="p-4 px-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Tin Nhắn Trung Tâm</h4>
              <p className="text-[10px] text-slate-300">Phản hồi tức thì & Kết nối học vụ</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onOpenFullChat(activeConv?.id);
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
              title="Mở toàn màn hình"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Toàn màn hình</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation selector tabs */}
        <div className="p-2 px-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          {conversations.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedConvId(c.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedConvId === c.id
                  ? "bg-slate-900 text-white shadow-soft"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
              )}
            >
              <span className="truncate max-w-[120px]">{c.title}</span>
              {c.unreadCount && c.unreadCount > 0 ? (
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {c.unreadCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 text-xs">
          {activeMessages.map((m) => {
            const isMe =
              (currentUser && m.senderId === currentUser.id) ||
              (currentUser && m.senderRole === currentUser.role);

            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.senderAvatar}
                  alt={m.senderName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                />
                <div className={cn("space-y-0.5", isMe ? "text-right" : "text-left")}>
                  <div className="text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700">{m.senderName}</span> • {m.timestamp}
                  </div>
                  <div
                    className={cn(
                      "p-2.5 rounded-2xl leading-relaxed shadow-xs",
                      isMe
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Send Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Gửi tin nhắn nhanh..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white transition-all shadow-soft"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
