'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Award,
  Star,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search,
  Brain,
  HelpCircle,
  TrendingUp,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { HomeworkAssignment, HomeworkSubmission, Quiz, QuizSubmission } from '@/types';
import { cn, getSubjectColor } from '@/lib/utils';
import { SubmitHomeworkModal } from './SubmitHomeworkModal';
import { QuizEngineModal } from './QuizEngineModal';
import { mockQuizzes, mockQuizSubmissions } from '@/data/mockQuizzes';

interface StudentHomeworkViewProps {
  homeworkList: HomeworkAssignment[];
  submissionsList: HomeworkSubmission[];
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
  onSubmitHomework: (submission: HomeworkSubmission) => void;
  quizzes?: Quiz[];
  quizSubmissions?: QuizSubmission[];
  onCompleteQuiz?: (submission: QuizSubmission) => void;
}

export function StudentHomeworkView({
  homeworkList,
  submissionsList,
  studentId = 'stu-1',
  studentName = 'Nguyễn Minh Quân',
  studentAvatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  onSubmitHomework,
  quizzes = mockQuizzes,
  quizSubmissions = mockQuizSubmissions,
  onCompleteQuiz,
}: StudentHomeworkViewProps) {
  // Main view tab: 'homework' | 'quizzes'
  const [mainTab, setMainTab] = useState<'homework' | 'quizzes'>('homework');

  // Homework filter tab: 'all' | 'pending' | 'submitted' | 'graded'
  const [selectedHwTab, setSelectedHwTab] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [submittingHw, setSubmittingHw] = useState<HomeworkAssignment | null>(null);

  // Active quiz modal state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeQuizSubmission, setActiveQuizSubmission] = useState<QuizSubmission | null>(null);

  // Local state for quiz submissions to immediately reflect updates in UI
  const [localQuizSubmissions, setLocalQuizSubmissions] = useState<QuizSubmission[]>(quizSubmissions);

  // Sync prop changes
  React.useEffect(() => {
    setLocalQuizSubmissions(quizSubmissions);
  }, [quizSubmissions]);

  // Student's homework submissions
  const mySubmissions = submissionsList.filter((s) => s.studentId === studentId);

  // Student's quiz submissions
  const myQuizSubmissions = localQuizSubmissions.filter((s) => s.studentId === studentId);

  // Calculate homework metrics
  const totalAssignments = homeworkList.length;
  const gradedList = mySubmissions.filter((s) => s.status === 'graded');
  const submittedWaitingList = mySubmissions.filter((s) => s.status === 'submitted');
  const pendingCount = homeworkList.filter((hw) => {
    const sub = mySubmissions.find((s) => s.homeworkId === hw.id);
    return !sub || sub.status === 'not_submitted';
  }).length;

  const averageHwScore = gradedList.length > 0
    ? (gradedList.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedList.length).toFixed(1)
    : 'Chưa có';

  // Calculate quiz metrics
  const totalQuizzes = quizzes.length;
  const completedQuizCount = myQuizSubmissions.length;
  const averageQuizScore = completedQuizCount > 0
    ? (myQuizSubmissions.reduce((acc, curr) => acc + curr.score, 0) / completedQuizCount).toFixed(1)
    : 'Chưa có';

  // Filter homework list
  const filteredHomework = homeworkList.filter((hw) => {
    const sub = mySubmissions.find((s) => s.homeworkId === hw.id);
    const status = sub ? sub.status : 'not_submitted';

    if (selectedHwTab === 'pending') return status === 'not_submitted';
    if (selectedHwTab === 'submitted') return status === 'submitted';
    if (selectedHwTab === 'graded') return status === 'graded';
    return true;
  });

  const handleOpenQuiz = (quizItem: Quiz) => {
    const existing = myQuizSubmissions.find((s) => s.quizId === quizItem.id) || null;
    setActiveQuizSubmission(existing);
    setActiveQuiz(quizItem);
  };

  const handleQuizCompleted = (newSub: QuizSubmission) => {
    setLocalQuizSubmissions((prev) => {
      const filtered = prev.filter((s) => s.id !== newSub.id && !(s.quizId === newSub.quizId && s.studentId === newSub.studentId));
      return [newSub, ...filtered];
    });
    if (onCompleteQuiz) {
      onCompleteQuiz(newSub);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/40 shadow-soft relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Góc Học Tập • Khảo Thí & Đánh Giá
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold border border-white/15">
                Tự luyện & Đánh giá năng lực
              </span>
            </div>
            <h2 className="text-xl lg:text-3xl font-black text-white tracking-tight mt-1.5">
              Bài Tập Về Nhà & Thi Thử Trắc Nghiệm Tính Giờ
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Nộp bài tập tự luận cho Thầy/Cô chấm điểm hoặc tham gia các bài thi trắc nghiệm tính giờ chuẩn hóa có phân tích lỗ hổng kiến thức.
            </p>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-amber-300 uppercase">BTVN Cần Nộp Gấp</span>
            <div className="text-2xl font-black text-white mt-1">{pendingCount}</div>
            <span className="text-[10px] text-amber-200 font-semibold">Chưa hoàn thành nộp</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-sky-300 uppercase">Đề Thi Trắc Nghiệm</span>
            <div className="text-2xl font-black text-white mt-1">{totalQuizzes}</div>
            <span className="text-[10px] text-slate-300">Đã hoàn thành {completedQuizCount}/{totalQuizzes}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 uppercase">BTVN Đã Có Điểm</span>
            <div className="text-2xl font-black text-emerald-300 mt-1">{gradedList.length}</div>
            <span className="text-[10px] text-emerald-200 font-semibold">Điểm TB: {averageHwScore}/10</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-purple-300 uppercase">Điểm TB Trắc Nghiệm</span>
            <div className="text-2xl font-black text-amber-300 mt-1">{averageQuizScore}</div>
            <span className="text-[10px] text-slate-300">Chuẩn hóa thang 10</span>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher: Homework vs Quiz Engine */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200/80 shadow-soft flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMainTab('homework')}
          className={cn(
            'flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all',
            mainTab === 'homework'
              ? 'bg-slate-900 text-white shadow-soft'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bài Tập Về Nhà Tự Luận</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px]',
              mainTab === 'homework' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {totalAssignments}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('quizzes')}
          className={cn(
            'flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all',
            mainTab === 'quizzes'
              ? 'bg-gradient-to-r from-indigo-900 to-indigo-950 text-white shadow-soft'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <Brain className="w-4 h-4 text-amber-300" />
          <span>Thi Thử Trắc Nghiệm Tính Giờ</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px]',
              mainTab === 'quizzes' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
            )}
          >
            {totalQuizzes} đề
          </span>
        </button>
      </div>

      {/* ================================================================ */}
      {/* TAB 1: HOMEWORK ASSIGNMENTS LIST                                 */}
      {/* ================================================================ */}
      {mainTab === 'homework' && (
        <div className="space-y-5">
          {/* Sub-Filter Tabs */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-soft flex flex-wrap items-center gap-2 text-xs font-bold">
            {[
              { id: 'all', label: 'Tất cả bài tập', count: totalAssignments },
              { id: 'pending', label: 'Cần làm gấp', count: pendingCount, color: 'text-amber-700' },
              { id: 'submitted', label: 'Đã nộp chờ chấm', count: submittedWaitingList.length, color: 'text-blue-700' },
              { id: 'graded', label: 'Đã có kết quả', count: gradedList.length, color: 'text-emerald-700' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedHwTab(tab.id as any)}
                className={cn(
                  'px-4 py-2 rounded-2xl transition-all flex items-center gap-2',
                  selectedHwTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px]',
                    selectedHwTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Homework Cards */}
          <div className="space-y-4">
            {filteredHomework.map((hw) => {
              const colors = getSubjectColor(hw.subject);
              const submission = mySubmissions.find((s) => s.homeworkId === hw.id);
              const isGraded = submission?.status === 'graded';
              const isSubmitted = submission?.status === 'submitted';

              return (
                <div
                  key={hw.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4 transition-all hover:shadow-hover"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider', colors.badge)}>
                        {colors.label}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{hw.sessionTitle}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isGraded ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã có điểm ({submission.score}/{hw.totalScore})
                        </span>
                      ) : isSubmitted ? (
                        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Đã nộp • Chờ Thầy/Cô chấm
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Chưa nộp bài
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base lg:text-lg leading-snug">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {hw.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hw.tutorAvatar}
                        alt={hw.tutorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-700">{hw.tutorName}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Giao: {hw.assignedDate}</span>
                    </div>

                    <div className="flex items-center gap-1 text-rose-600 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hạn nộp: {hw.dueDate}</span>
                    </div>

                    {hw.attachmentUrl && (
                      <a
                        href={hw.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xem đề bài đính kèm</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Submission Status Display */}
                  {isGraded && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-600" />
                          <span className="font-black text-sm text-emerald-950">
                            Kết Quả Chấm Điểm: {submission.score} / {hw.totalScore} Điểm
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                'w-4 h-4',
                                s <= (submission.comprehensionRating || 5)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300'
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {submission.tutorFeedback && (
                        <div className="bg-white p-3 rounded-xl border border-emerald-100 text-xs text-slate-700">
                          <div className="flex items-center gap-1 text-slate-500 font-bold mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lời phê của Thầy/Cô ({submission.gradedAt}):</span>
                          </div>
                          <p className="italic text-slate-800 leading-relaxed font-medium">
                            &ldquo;{submission.tutorFeedback}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isGraded && isSubmitted && (
                    <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-sky-950 block">
                            Đã Nộp Bài Thành Công ({submission.submittedAt})
                          </span>
                          <span className="text-[11px] text-sky-700 truncate max-w-md block">
                            Ghi chú: {submission.submissionText || 'Đã đính kèm file bài làm'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSubmittingHw(hw)}
                        className="px-4 py-2 rounded-xl bg-white border border-sky-200 text-sky-800 font-bold text-xs hover:bg-sky-100 transition-colors"
                      >
                        Nộp lại bài
                      </button>
                    </div>
                  )}

                  {!isGraded && !isSubmitted && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-amber-900 block">
                            Chưa Nộp Bài Tập Này
                          </span>
                          <span className="text-[11px] text-amber-700">
                            Vui lòng hoàn thành và nộp bài trước {hw.dueDate}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSubmittingHw(hw)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-300" />
                        <span>Làm & Nộp Bài Ngay</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: TIMED QUIZ ENGINE LIST                                    */}
      {/* ================================================================ */}
      {mainTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                Danh Sách Đề Khảo Sát & Thi Thử Chuẩn Hóa
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              {quizzes.length} đề thi sẵn sàng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quizItem) => {
              const submission = myQuizSubmissions.find((s) => s.quizId === quizItem.id);
              const isCompleted = Boolean(submission);
              const colors = getSubjectColor(quizItem.subject);

              return (
                <div
                  key={quizItem.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-hover transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', colors.badge)}>
                        {quizItem.subject === 'math' ? 'Toán Học' : 'Tiếng Anh IELTS'}
                      </span>

                      {isCompleted && submission ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Điểm: {submission.score} / 10</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Chưa thi
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                        {quizItem.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {quizItem.description}
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60 font-semibold">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{quizItem.totalQuestions} câu hỏi</span>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{quizItem.durationMinutes} phút</span>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Qua bài: {quizItem.passingScore}+</span>
                      </div>
                    </div>

                    {/* Bloom Level Distribution */}
                    <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                        Phân bố độ khó câu hỏi (Bloom Taxonomy):
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">
                          Nhận biết: {quizItem.difficultyBreakdown.recognitionCount}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800">
                          Thông hiểu: {quizItem.difficultyBreakdown.comprehensionCount}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800">
                          Vận dụng: {quizItem.difficultyBreakdown.applicationCount}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800">
                          VDC 9+: {quizItem.difficultyBreakdown.advancedCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {isCompleted ? (
                      <>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          ✓ Đã phân tích lỗ hổng kiến thức
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenQuiz(quizItem)}
                          className="px-4 py-2.5 rounded-2xl bg-indigo-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Xem Chữa Bài & Gap Report</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Hạn chót: {quizItem.dueDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenQuiz(quizItem)}
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition-all"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          <span>Vào Thi Trực Tuyến</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Homework Modal */}
      {submittingHw && (
        <SubmitHomeworkModal
          isOpen={true}
          onClose={() => setSubmittingHw(null)}
          homework={submittingHw}
          existingSubmission={mySubmissions.find((s) => s.homeworkId === submittingHw.id)}
          studentId={studentId}
          studentName={studentName}
          studentAvatar={studentAvatar}
          onSubmitHomework={(newSub) => {
            onSubmitHomework(newSub);
            setSubmittingHw(null);
          }}
        />
      )}

      {/* Quiz Engine Modal */}
      {activeQuiz && (
        <QuizEngineModal
          isOpen={true}
          onClose={() => {
            setActiveQuiz(null);
            setActiveQuizSubmission(null);
          }}
          quiz={activeQuiz}
          studentId={studentId}
          studentName={studentName}
          studentAvatar={studentAvatar}
          existingSubmission={activeQuizSubmission}
          onCompleteQuiz={handleQuizCompleted}
        />
      )}
    </div>
  );
}
