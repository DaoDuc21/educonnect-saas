'use client';

import React, { useState } from 'react';
import { X, Send, Link2, FileText, Calendar, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { HomeworkAssignment, HomeworkSubmission } from '@/types';
import { useToast } from '../shared/ToastNotification';

interface SubmitHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: HomeworkAssignment;
  existingSubmission?: HomeworkSubmission;
  onSubmitHomework: (submission: HomeworkSubmission) => void;
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
}

export function SubmitHomeworkModal({
  isOpen,
  onClose,
  homework,
  existingSubmission,
  onSubmitHomework,
  studentId = 'stu-1',
  studentName = 'Nguyễn Minh Quân',
  studentAvatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
}: SubmitHomeworkModalProps) {
  const { showToast } = useToast();

  const [submissionText, setSubmissionText] = useState(existingSubmission?.submissionText || '');
  const [submissionFileUrl, setSubmissionFileUrl] = useState(existingSubmission?.submissionFileUrl || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() && !submissionFileUrl.trim()) {
      showToast('Vui lòng nhập nội dung bài làm hoặc đính kèm link bài tập!', 'warning');
      return;
    }

    const submission: HomeworkSubmission = {
      id: existingSubmission ? existingSubmission.id : `sub-${Date.now()}`,
      homeworkId: homework.id,
      studentId,
      studentName,
      studentAvatar,
      status: 'submitted',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      submissionText: submissionText.trim() || 'Em đã nộp bài tập theo link đính kèm.',
      submissionFileUrl: submissionFileUrl.trim() || undefined,
    };

    onSubmitHomework(submission);
    showToast(`Đã nộp bài tập "${homework.title}" thành công! Thầy/Cô sẽ chấm điểm sớm.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-300/20 text-amber-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Nộp Bài Tập Về Nhà</h3>
              <p className="text-xs text-slate-300 truncate max-w-sm">{homework.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Assignment Overview */}
          <div className="p-4 bg-[#F5F3EF] rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{homework.sessionTitle}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px]">
                Hạn chót: {homework.dueDate}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">{homework.description}</p>
            {homework.attachmentUrl && (
              <a
                href={homework.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:underline pt-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xem đề bài phát tay của giáo viên (PDF/Docs)</span>
              </a>
            )}
          </div>

          {/* Solution Notes / Text */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Nội dung bài làm / Lời giải / Ghi chú gửi thầy cô
            </label>
            <textarea
              rows={4}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Nhập phần giải tóm tắt, câu trả lời tự luận hoặc thắc mắc của em trong quá trình làm bài..."
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl p-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 leading-relaxed"
            />
          </div>

          {/* Drive / PDF Link Attachment */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Link file bài làm (Google Drive / Docs / Ảnh chụp)</span>
            </label>
            <input
              type="url"
              value={submissionFileUrl}
              onChange={(e) => setSubmissionFileUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/bai-lam-cua-em.pdf"
              className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Gợi ý: Tải bài làm lên Google Drive hoặc Google Docs rồi dán link chia sẻ (quyền xem) vào đây.
            </p>
          </div>

          {/* Actions */}
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
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Nộp bài ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
