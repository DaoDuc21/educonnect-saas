'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Star,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Clock,
  AlertCircle,
  Sliders,
  Sparkles,
  Check,
} from 'lucide-react';
import { HomeworkAssignment, HomeworkSubmission, RubricScoreEvaluation } from '@/types';
import { useToast } from '../shared/ToastNotification';
import { cn } from '@/lib/utils';

interface GradeHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: HomeworkAssignment;
  submission: HomeworkSubmission;
  onSaveGrade: (gradedSubmission: HomeworkSubmission) => void;
}

export function GradeHomeworkModal({
  isOpen,
  onClose,
  homework,
  submission,
  onSaveGrade,
}: GradeHomeworkModalProps) {
  const { showToast } = useToast();

  // Mode: 'rubric' | 'direct'
  const [gradingMode, setGradingMode] = useState<'rubric' | 'direct'>('rubric');

  // 4 Pedagogical Rubrics Criteria
  const [c1Method, setC1Method] = useState<number>(3.5); // Thang 4.0
  const [c2Accuracy, setC2Accuracy] = useState<number>(2.5); // Thang 3.0
  const [c3Logic, setC3Logic] = useState<number>(2.0); // Thang 2.0
  const [c4Conclusion, setC4Conclusion] = useState<number>(1.0); // Thang 1.0

  // Direct score fallback
  const [directScore, setDirectScore] = useState<number>(
    submission.score !== undefined ? submission.score : 9.0
  );

  const [feedback, setFeedback] = useState<string>(submission.tutorFeedback || '');
  const [rating, setRating] = useState<number>(submission.comprehensionRating || 5);

  // Initialize from previous submission if exists
  useEffect(() => {
    if (submission.rubricScores && submission.rubricScores.length >= 4) {
      setC1Method(submission.rubricScores[0]?.scoreAwarded ?? 3.5);
      setC2Accuracy(submission.rubricScores[1]?.scoreAwarded ?? 2.5);
      setC3Logic(submission.rubricScores[2]?.scoreAwarded ?? 2.0);
      setC4Conclusion(submission.rubricScores[3]?.scoreAwarded ?? 1.0);
      setGradingMode('rubric');
    } else if (submission.score !== undefined) {
      setDirectScore(submission.score);
    }
    if (submission.tutorFeedback) setFeedback(submission.tutorFeedback);
    if (submission.comprehensionRating) setRating(submission.comprehensionRating);
  }, [submission]);

  if (!isOpen) return null;

  // Real-time calculation: Sum = C1 + C2 + C3 + C4
  const rubricTotal = Number((c1Method + c2Accuracy + c3Logic + c4Conclusion).toFixed(1));
  const effectiveScore = gradingMode === 'rubric' ? rubricTotal : directScore;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (effectiveScore < 0 || effectiveScore > homework.totalScore) {
      showToast(`Điểm số phải nằm trong khoảng từ 0 đến ${homework.totalScore}!`, 'warning');
      return;
    }

    const rubricScores: RubricScoreEvaluation[] = [
      {
        criterionId: 'crit-method',
        criterionName: 'Phương pháp & Hướng giải quyết',
        scoreAwarded: c1Method,
        maxScore: 4.0,
      },
      {
        criterionId: 'crit-accuracy',
        criterionName: 'Độ chính xác & Biến đổi đại số',
        scoreAwarded: c2Accuracy,
        maxScore: 3.0,
      },
      {
        criterionId: 'crit-logic',
        criterionName: 'Trình bày & Lập luận logic',
        scoreAwarded: c3Logic,
        maxScore: 2.0,
      },
      {
        criterionId: 'crit-conclusion',
        criterionName: 'Kết luận & Điều kiện bài toán',
        scoreAwarded: c4Conclusion,
        maxScore: 1.0,
      },
    ];

    const cleanFeedback = feedback.trim() || 'Thầy/Cô đã chấm bài và ghi nhận nỗ lực giải bài rất tốt của em.';

    const updated: HomeworkSubmission = {
      ...submission,
      status: 'graded',
      score: effectiveScore,
      tutorFeedback: cleanFeedback,
      comprehensionRating: rating,
      gradedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      rubricScores: gradingMode === 'rubric' ? rubricScores : undefined,
    };

    onSaveGrade(updated);
    showToast(
      `Đã chấm điểm ${effectiveScore}/${homework.totalScore} cho học sinh ${submission.studentName}!`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-indigo-950">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={submission.studentAvatar}
              alt={submission.studentName}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                  Chấm Bài Tập Tự Luận
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  Chấm Điểm Theo Rubrics
                </span>
              </div>
              <h3 className="font-bold text-base text-white">{submission.studentName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Homework assignment info card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{homework.sessionTitle}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 font-bold text-[10px]">
                Hạn: {homework.dueDate}
              </span>
            </div>
            <h4 className="font-semibold text-slate-800 text-[11px]">{homework.title}</h4>
            <p className="text-slate-500 text-[10px]">{homework.description}</p>
          </div>

          {/* Student's Submission Content */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Thời điểm nộp: {submission.submittedAt || 'Đã nộp bài'}</span>
              </span>
              {submission.submissionFileUrl && (
                <a
                  href={submission.submissionFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Mở file bài làm</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-blue-100 text-slate-700 leading-relaxed text-[11px]">
              <span className="font-bold text-slate-900 block mb-1">Ghi chú của học sinh:</span>
              <p className="italic">{submission.submissionText || 'Học sinh không để lại ghi chú kèm theo.'}</p>
            </div>
          </div>

          {/* Grading Mode Tabs */}
          <div className="flex items-center justify-between pt-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Chế độ chấm điểm:</span>
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setGradingMode('rubric')}
                className={cn(
                  'px-3 py-1 rounded-xl transition-all',
                  gradingMode === 'rubric'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Tiêu Chí Rubrics (4.0 + 3.0 + 2.0 + 1.0)
              </button>
              <button
                type="button"
                onClick={() => setGradingMode('direct')}
                className={cn(
                  'px-3 py-1 rounded-xl transition-all',
                  gradingMode === 'direct'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Nhập điểm trực tiếp
              </button>
            </div>
          </div>

          {/* RUBRIC GRADING MODE */}
          {gradingMode === 'rubric' ? (
            <div className="space-y-3.5 bg-indigo-50/40 p-4 rounded-3xl border border-indigo-100">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Bảng Tiêu Chí Rubrics Chuẩn Hóa Sư Phạm
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Tổng điểm tính tự động:</span>
                  <span className="px-3 py-1 rounded-xl bg-indigo-900 text-amber-300 font-black text-sm">
                    {rubricTotal} / 10
                  </span>
                </div>
              </div>

              {/* Criterion 1: Phương pháp & Hướng giải quyết (Thang 4.0) */}
              <div className="bg-white p-3 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-slate-900 text-xs">
                      1. Phương Pháp & Hướng Giải Quyết
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Chọn đúng công thức, phương pháp tích phân / hình học và hướng giải tối ưu.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="4.0"
                      value={c1Method}
                      onChange={(e) => setC1Method(Math.min(4.0, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-16 bg-indigo-50/80 border border-indigo-200 rounded-xl p-1.5 text-center font-black text-indigo-900"
                    />
                    <span className="text-slate-400 font-bold">/ 4.0 đ</span>
                  </div>
                </div>
                <input
                  type="range"
                  step="0.25"
                  min="0"
                  max="4.0"
                  value={c1Method}
                  onChange={(e) => setC1Method(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Criterion 2: Độ chính xác & Biến đổi đại số (Thang 3.0) */}
              <div className="bg-white p-3 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-slate-900 text-xs">
                      2. Độ Chính Xác & Biến Đổi Đại Số
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Tính toán số liệu chuẩn xác, không nhầm dấu, biến đổi đạo hàm / vi phân chính xác.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="3.0"
                      value={c2Accuracy}
                      onChange={(e) => setC2Accuracy(Math.min(3.0, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-16 bg-indigo-50/80 border border-indigo-200 rounded-xl p-1.5 text-center font-black text-indigo-900"
                    />
                    <span className="text-slate-400 font-bold">/ 3.0 đ</span>
                  </div>
                </div>
                <input
                  type="range"
                  step="0.25"
                  min="0"
                  max="3.0"
                  value={c2Accuracy}
                  onChange={(e) => setC2Accuracy(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Criterion 3: Trình bày & Lập luận logic (Thang 2.0) */}
              <div className="bg-white p-3 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-slate-900 text-xs">
                      3. Trình Bày & Lập Luận Logic
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Bố cục lời giải rõ ràng, chữ viết sạch sẽ, có giải thích từng bước lập luận.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="2.0"
                      value={c3Logic}
                      onChange={(e) => setC3Logic(Math.min(2.0, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-16 bg-indigo-50/80 border border-indigo-200 rounded-xl p-1.5 text-center font-black text-indigo-900"
                    />
                    <span className="text-slate-400 font-bold">/ 2.0 đ</span>
                  </div>
                </div>
                <input
                  type="range"
                  step="0.25"
                  min="0"
                  max="2.0"
                  value={c3Logic}
                  onChange={(e) => setC3Logic(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Criterion 4: Kết luận & Điều kiện bài toán (Thang 1.0) */}
              <div className="bg-white p-3 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-slate-900 text-xs">
                      4. Kết Luận & Điều Kiện Bài Toán
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Có câu kết luận rõ ràng, kiểm tra nghiệm thỏa mãn điều kiện xác định.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="1.0"
                      value={c4Conclusion}
                      onChange={(e) => setC4Conclusion(Math.min(1.0, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-16 bg-indigo-50/80 border border-indigo-200 rounded-xl p-1.5 text-center font-black text-indigo-900"
                    />
                    <span className="text-slate-400 font-bold">/ 1.0 đ</span>
                  </div>
                </div>
                <input
                  type="range"
                  step="0.25"
                  min="0"
                  max="1.0"
                  value={c4Conclusion}
                  onChange={(e) => setC4Conclusion(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          ) : (
            /* DIRECT SCORE INPUT MODE */
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Điểm số (Thang {homework.totalScore})</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={homework.totalScore}
                    value={directScore}
                    onChange={(e) => setDirectScore(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-slate-100 border border-slate-200 rounded-2xl p-2.5 text-center text-lg font-black text-slate-900 focus:outline-none"
                    required
                  />
                  <span className="text-slate-400 font-bold">/ {homework.totalScore} điểm</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Đánh giá hiểu bài ({rating} sao)
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={cn(
                          'w-6 h-6',
                          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-100'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rating stars if in Rubric mode */}
          {gradingMode === 'rubric' && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-700">Mức độ tiếp thu & thái độ học tập:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={cn(
                        'w-5 h-5',
                        s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-100'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback & Comments */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Lời phê & Nhận xét chi tiết cho học sinh & phụ huynh</span>
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="VD: Em giải rất tốt phương pháp đặt ẩn phụ. Cần cẩn thận hơn ở khâu biến đổi tính toán cuối cùng để đạt điểm tuyệt đối..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Lưu Điểm ({effectiveScore}/10) & Gửi Đánh Giá</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
