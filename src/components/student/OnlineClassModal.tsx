'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Share2,
  MessageSquare,
  Users,
  Hand,
  Sparkles,
  Smile,
  Radio,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Send,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../shared/ToastNotification';

interface OnlineClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classTitle?: string;
  tutorName?: string;
  meetUrl?: string;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  leftPercent: number;
}

export function OnlineClassModal({
  isOpen,
  onClose,
  classTitle = 'Toán 12 - Giải Tích Vận Dụng Cao (Trực Tuyến)',
  tutorName = 'Thầy Trần Huy Hoàng',
  meetUrl = 'https://meet.google.com/edu-math-12a',
}: OnlineClassModalProps) {
  const { showToast } = useToast();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activeView, setActiveView] = useState<'whiteboard' | 'slide' | 'roster'>('whiteboard');
  const [currentSlide, setCurrentSlide] = useState(12);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [chatLog, setChatLog] = useState([
    { sender: 'Thầy Hoàng', text: 'Chào Minh Quân, hôm nay chúng ta tiếp tục câu 45 đề thi thử nhé!', time: '14:02' },
    { sender: 'Gia Bảo', text: 'Thầy ơi câu này dùng phương pháp đổi biến hay từng phần ạ?', time: '14:03' },
  ]);

  // Clean up floating reactions
  useEffect(() => {
    if (reactions.length === 0) return;
    const timer = setTimeout(() => {
      setReactions((prev) => prev.slice(1));
    }, 2200);
    return () => clearTimeout(timer);
  }, [reactions]);

  if (!isOpen) return null;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setChatLog((prev) => [...prev, { sender: 'Minh Quân (Bạn)', text: chatMessage, time: timeStr }]);
    setChatMessage('');
  };

  const handleQuickChat = (text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setChatLog((prev) => [...prev, { sender: 'Minh Quân (Bạn)', text, time: timeStr }]);
  };

  const triggerReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      emoji,
      leftPercent: 20 + Math.random() * 60, // random between 20% and 80%
    };
    setReactions((prev) => [...prev, newReaction]);
    showToast(`Bạn đã thả biểu cảm: ${emoji}`, 'info');
  };

  const toggleHand = () => {
    setHandRaised(!handRaised);
    showToast(handRaised ? 'Đã hạ tay xuống' : 'Đã giơ tay xin phát biểu!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="bg-slate-950 text-white w-full max-w-5xl h-[88vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>REC</span>
              <span className="hidden sm:inline font-normal text-rose-300">• Ghi hình tự động Meet</span>
            </div>

            <div>
              <h3 className="font-bold text-sm tracking-wide text-white">{classTitle}</h3>
              <p className="text-[11px] text-slate-400">
                Chủ phòng: <strong className="text-amber-300">{tutorName}</strong> • Sĩ số: 4 thành viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Google Meet Link Button */}
            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => showToast('Đang kết nối vào phòng học Google Meet của lớp!', 'success')}
              className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all group shrink-0 ring-2 ring-emerald-400/40"
              title="Mở phòng Google Meet liên kết với lớp học"
            >
              <VideoIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Vào Google Meet</span>
              <ExternalLink className="w-3 h-3 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* View Mode Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveView('whiteboard')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeView === 'whiteboard' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Bảng viết
              </button>
              <button
                onClick={() => setActiveView('slide')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeView === 'slide' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Slide bài giảng
              </button>
              <button
                onClick={() => setActiveView('roster')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeView === 'roster' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Sĩ số (4)
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Area + Chat Sidebar */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Main Video Stream Container */}
          <div className="lg:col-span-2 p-4 flex flex-col justify-between relative bg-gradient-to-b from-slate-950 to-black overflow-hidden">
            {/* Floating Reactions Overlay */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {reactions.map((r) => (
                <div
                  key={r.id}
                  style={{
                    left: `${r.leftPercent}%`,
                    bottom: '80px',
                    animation: 'floatUpAndFade 2s ease-out forwards',
                  }}
                  className="absolute text-4xl select-none"
                >
                  {r.emoji}
                </div>
              ))}
            </div>

            {/* Main Stage View */}
            <div className="flex-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center">
              {activeView === 'whiteboard' && (
                <div className="text-center p-6 space-y-4 max-w-lg w-full">
                  {/* Google Meet Quick Connect Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-indigo-950 border border-emerald-500/40 shadow-xl flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <VideoIcon className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-bold text-white">Google Meet Lớp Học</span>
                        </div>
                        <p className="text-[10px] font-mono text-emerald-300 truncate">
                          {meetUrl}
                        </p>
                      </div>
                    </div>

                    <a
                      href={meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => showToast('Đang chuyển hướng sang Google Meet...', 'success')}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                    >
                      <span>Vào Meet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="w-14 h-14 rounded-2xl mx-auto bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-white">
                      Bảng Giảng Dạy Trực Tuyến & Công Thức
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Chuyên đề: Tích phân từng phần và ứng dụng tính thể tích
                    </p>
                  </div>
                  <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono text-emerald-400 shadow-inner">
                    <p className="text-amber-300 font-bold mb-1">{"// Đề bài câu 45:"}</p>
                    <p>{"∫ [0 → π/2] (sin x) / (sin x + cos x) dx = I"}</p>
                    <p className="text-slate-400 mt-2">{"// Phương pháp đổi biến số:"}</p>
                    <p className="text-cyan-300">{"Đặt t = π/2 - x => dt = -dx"}</p>
                    <p className="text-slate-300 mt-1">{"=> I + I = ∫ [0 → π/2] 1 dx = π/2 => I = π/4"}</p>
                  </div>
                </div>
              )}

              {activeView === 'slide' && (
                <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-slate-900">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      Slide Bài Giảng Chương 3: Nguyên Hàm & Tích Phân
                    </span>
                    <span>Trang {currentSlide} / 40</span>
                  </div>

                  <div className="my-auto text-center space-y-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                      Bài 2: Tính Chất Tích Phân Xác Định
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Định Lý Cơ Bản Về Tích Phân & Ứng Dụng Hình Học
                    </h3>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs text-slate-300 max-w-md mx-auto space-y-2">
                      <p>• Nếu f(x) liên tục trên đoạn [a, b] thì F(x) = ∫ f(t)dt là nguyên hàm của f(x).</p>
                      <p>• Diện tích hình phẳng giới hạn bởi đồ thị y = f(x), trục hoành và 2 đường x = a, x = b: S = ∫ |f(x)|dx.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
                      className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
                      disabled={currentSlide <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-400">Trang {currentSlide}</span>
                    <button
                      onClick={() => setCurrentSlide(Math.min(40, currentSlide + 1))}
                      className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
                      disabled={currentSlide >= 40}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeView === 'roster' && (
                <div className="w-full h-full p-6 bg-slate-900 flex flex-col justify-start">
                  <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Danh Sách Thành Viên Tham Gia (4)</span>
                  </h4>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                          alt="Tutor"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{tutorName} (Chủ trì)</p>
                          <span className="text-[10px] text-amber-400">Giảng viên phụ trách</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Đang trình bày
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                          MQ
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Trần Minh Quân (Bạn)</p>
                          <span className="text-[10px] text-slate-400">Học sinh lớp 12A1</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">Học viên</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-xs font-bold text-white">
                          GB
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Nguyễn Gia Bảo</p>
                          <span className="text-[10px] text-slate-400">Học sinh lớp 12A2</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">Học viên</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                          MA
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Lê Mai Anh</p>
                          <span className="text-[10px] text-slate-400">Học sinh lớp 12 chuyên Toán</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">Học viên</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tutor small Picture-in-Picture window */}
              {activeView !== 'roster' && (
                <div className="absolute top-4 right-4 w-32 h-24 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shadow-xl flex flex-col items-center justify-center z-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Tutor"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    <span className="text-[9px] text-white font-bold truncate">Thầy Hoàng</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Floating Interactive Emoji Reaction Bar */}
            <div className="pt-3 pb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
                <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Cảm xúc:</span>
                {[
                  { emoji: '👍', label: 'Like' },
                  { emoji: '❤️', label: 'Thả tim' },
                  { emoji: '👏', label: 'Vỗ tay' },
                  { emoji: '🔥', label: 'Nhiệt huyết' },
                  { emoji: '💡', label: 'Hiểu bài' },
                ].map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => triggerReaction(item.emoji)}
                    className="w-8 h-8 rounded-full hover:bg-slate-800 hover:scale-125 active:scale-95 transition-transform flex items-center justify-center text-lg"
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>

              {/* In-Call Meeting Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMicOn(!micOn)}
                  className={`p-2.5 rounded-full transition-all ${
                    micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                  }`}
                  title={micOn ? 'Tắt Mic' : 'Bật Mic'}
                >
                  {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setVideoOn(!videoOn)}
                  className={`p-2.5 rounded-full transition-all ${
                    videoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                  }`}
                  title={videoOn ? 'Tắt Camera' : 'Bật Camera'}
                >
                  {videoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleHand}
                  className={`p-2.5 rounded-full transition-all ${
                    handRaised ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/30' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  title={handRaised ? 'Hạ tay' : 'Giơ tay phát biểu'}
                >
                  <Hand className="w-4 h-4" />
                </button>

                <button
                  onClick={() => showToast('Đã bắt đầu chia sẻ màn hình bài làm của bạn!', 'info')}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white hidden sm:flex"
                  title="Chia sẻ màn hình"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                  title="Mở Google Meet trong tab mới"
                >
                  <VideoIcon className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Vào Google Meet</span>
                </a>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Rời phòng
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Chat & Questions Section */}
          <div className="border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/70 flex flex-col justify-between p-4 h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Thảo Luận Buổi Học</span>
              </div>
              <span className="text-[10px] text-slate-400">Trực tiếp</span>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 py-3 overflow-y-auto space-y-2.5 text-xs">
              {chatLog.map((chat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-[11px]">{chat.sender}</span>
                    <span className="text-[10px] text-slate-400">{chat.time}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">{chat.text}</p>
                </div>
              ))}
            </div>

            {/* Quick Chat Suggestions */}
            <div className="py-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Câu hỏi nhanh 1-chạm:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '💡 Em đã hiểu bài ạ',
                  '🙋‍♂️ Thầy giải thích lại nhé',
                  '📝 Cho em xin link tài liệu',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickChat(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors border border-slate-700/40"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Nhập câu hỏi hoặc phản hồi..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold text-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatUpAndFade {
          0% {
            transform: translateY(0px) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translateY(-80px) scale(1.3);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-160px) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
