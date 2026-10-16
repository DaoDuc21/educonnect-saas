'use client';

import React, { useState } from 'react';
import { X, BookOpen, Calendar, Clock, FileText, CheckCircle2, AlertCircle, Link2, Sparkles } from 'lucide-react';
import { HomeworkAssignment, ScheduleEvent, SubjectType } from '@/types';
import { useToast } from '../shared/ToastNotification';

interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ScheduleEvent[];
  tutorId?: string;
  tutorName?: string;
  tutorAvatar?: string;
  onCreateHomework: (newHomework: HomeworkAssignment) => void;
  defaultSessionId?: string;
}

export function CreateHomeworkModal({
  isOpen,
  onClose,
  events,
  tutorId = 'tut-1',
  tutorName = 'Thầy Trần Huy Hoàng',
  tutorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  onCreateHomework,
  defaultSessionId,
}: CreateHomeworkModalProps) {
  const { showToast } = useToast();

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    defaultSessionId || (events.length > 0 ? events[0].id : '')
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [dueDate, setDueDate] = useState('2025-01-05');
  const [dueTime, setDueTime] = useState('23:59');
  const [totalScore, setTotalScore] = useState<number>(10);

  if (!isOpen) return null;

  const currentSession = events.find((e) => e.id === selectedSessionId) || events[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài tập!', 'warning');
      return;
    }
    if (!currentSession) {
      showToast('Vui lòng chọn lớp học tương ứng!', 'warning');
      return;
    }

    const newHw: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      sessionId: currentSession.id,
      sessionTitle: currentSession.title,
      subject: currentSession.subject,
      tutorId,
      tutorName,
      tutorAvatar,
      title: title.trim(),
      description: description.trim() || 'Học sinh hoàn thành bài tập theo hướng dẫn và nộp trước thời hạn.',
      attachmentUrl: attachmentUrl.trim() || undefined,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: `${dueDate} ${dueTime}`,
      totalScore,
      studentIds: currentSession.studentIds && currentSession.studentIds.length > 0 
        ? currentSession.studentIds 
        : ['stu-1', 'stu-4'],
    };

    onCreateHomework(newHw);
    showToast(`Đã giao bài tập "${title}" thành công cho lớp!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-300/20 text-amber-300 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Giao Bài Tập Về Nhà Mới</h3>
              <p className="text-xs text-slate-300">Giao nhiệm vụ rèn luyện sau buổi học cho học sinh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Pick Session */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Buổi học / Lớp học áp dụng</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.tutorName} • {ev.startTime} - {ev.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Tiêu đề bài tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Chuyên đề 04: 10 Bài toán lượng giác nâng cao"
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Yêu cầu & Hướng dẫn làm bài</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết các bài tập cần làm, các bước trình bày tự luận hoặc lưu ý đặc biệt..."
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl p-3.5 text-slate-800 font-medium focus:outline-none"
            />
          </div>

          {/* Handout Attachment URL */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Link tài liệu / Đề bài đính kèm (Google Drive / PDF)</span>
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/de-bai-tap-ve-nha.pdf"
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none"
            />
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Hạn nộp (Ngày)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Giờ hạn chót</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Students Info */}
          {currentSession && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <span className="text-slate-600 font-medium">
                Học sinh sẽ nhận bài: <strong>{currentSession.studentNames?.join(', ') || 'Cả lớp'}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold">
                Thang điểm {totalScore}
              </span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold shadow-soft transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Giao bài tập ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
