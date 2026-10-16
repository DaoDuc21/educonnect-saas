'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  Sparkles,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Check,
  Zap,
  Target,
} from 'lucide-react';
import {
  Quiz,
  QuizQuestion,
  QuizSubmission,
  StudentQuizAnswer,
  KnowledgeGapReport,
  TopicGapItem,
  QuizDifficultyLevel,
} from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';

interface QuizEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
  existingSubmission?: QuizSubmission | null;
  onCompleteQuiz: (submission: QuizSubmission) => void;
}

export function QuizEngineModal({
  isOpen,
  onClose,
  quiz,
  studentId = 'stu-1',
  studentName = 'Nguyễn Minh Quân',
  studentAvatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  existingSubmission = null,
  onCompleteQuiz,
}: QuizEngineModalProps) {
  const { showToast } = useToast();

  // Mode: 'taking' | 'review'
  const [mode, setMode] = useState<'taking' | 'review'>('taking');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(quiz.durationMinutes * 60);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState<boolean>(false);
  const [completedSubmission, setCompletedSubmission] = useState<QuizSubmission | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedAnswersRef = useRef<Record<string, string>>(selectedAnswers);
  const hasAutoSubmittedRef = useRef<boolean>(false);

  // Keep selectedAnswersRef in sync with state
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Initialize state when modal opens or quiz changes
  useEffect(() => {
    if (!isOpen) return;

    if (existingSubmission) {
      setCompletedSubmission(existingSubmission);
      setMode('review');
      setCurrentQuestionIndex(0);
      const answerMap: Record<string, string> = {};
      existingSubmission.answers.forEach((ans) => {
        if (ans.selectedOptionId) answerMap[ans.questionId] = ans.selectedOptionId;
      });
      setSelectedAnswers(answerMap);
      selectedAnswersRef.current = answerMap;
    } else {
      setMode('taking');
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      selectedAnswersRef.current = {};
      setFlaggedQuestionIds(new Set());
      setTimeLeftSeconds(quiz.durationMinutes * 60);
      setCompletedSubmission(null);
      hasAutoSubmittedRef.current = false;
      startTimeRef.current = Date.now();
    }
  }, [isOpen, quiz, existingSubmission]);

  // Countdown Timer Interval
  useEffect(() => {
    if (!isOpen || mode !== 'taking') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, mode]);

  // Decoupled Timeout Trigger: auto-submit when timer expires
  useEffect(() => {
    if (!isOpen || mode !== 'taking') return;
    if (timeLeftSeconds === 0 && !hasAutoSubmittedRef.current) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      handleAutoSubmit();
    }
  }, [timeLeftSeconds, isOpen, mode]);

  if (!isOpen) return null;

  const currentQuestion: QuizQuestion = quiz.questions[currentQuestionIndex] || quiz.questions[0];

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = quiz.questions.length - answeredCount;

  // Handle Option Select
  const handleSelectOption = (questionId: string, optionId: string) => {
    if (mode === 'review') return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Toggle Flag
  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // Submit Logic
  const handleAutoSubmit = () => {
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    showToast('Hết giờ làm bài! Hệ thống tự động nộp bài thi của bạn.', 'info');
    processSubmission();
  };

  const processSubmission = (overrideAnswers?: Record<string, string>) => {
    hasAutoSubmittedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const isAnswersRecord = overrideAnswers && typeof overrideAnswers === 'object' && !('nativeEvent' in overrideAnswers) && !('target' in overrideAnswers);
    const currentAnswers = isAnswersRecord ? overrideAnswers : selectedAnswersRef.current;
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const studentAnswers: StudentQuizAnswer[] = quiz.questions.map((q) => {
      const selected = currentAnswers[q.id] || null;
      const isCorrect = selected === q.correctOptionId;
      return {
        questionId: q.id,
        selectedOptionId: selected,
        isCorrect,
        timeSpentSeconds: quiz.questions.length > 0 ? Math.round(timeSpentSeconds / quiz.questions.length) : 0,
      };
    });

    const totalCorrect = studentAnswers.filter((a) => a.isCorrect).length;
    const rawScore = quiz.questions.length > 0 ? (totalCorrect / quiz.questions.length) * 10 : 0;
    const finalScore = Number(rawScore.toFixed(1));
    const accuracyRate = quiz.questions.length > 0 ? Number(((totalCorrect / quiz.questions.length) * 100).toFixed(1)) : 0;

    // Calculate Bloom level accuracy
    const levelCounts: Record<QuizDifficultyLevel, { total: number; correct: number }> = {
      recognition: { total: 0, correct: 0 },
      comprehension: { total: 0, correct: 0 },
      application: { total: 0, correct: 0 },
      advanced_application: { total: 0, correct: 0 },
    };

    quiz.questions.forEach((q) => {
      levelCounts[q.difficultyLevel].total += 1;
      const ans = studentAnswers.find((a) => a.questionId === q.id);
      if (ans?.isCorrect) {
        levelCounts[q.difficultyLevel].correct += 1;
      }
    });

    const levelAccuracy = {
      recognition: levelCounts.recognition.total > 0
        ? Math.round((levelCounts.recognition.correct / levelCounts.recognition.total) * 100)
        : 100,
      comprehension: levelCounts.comprehension.total > 0
        ? Math.round((levelCounts.comprehension.correct / levelCounts.comprehension.total) * 100)
        : 100,
      application: levelCounts.application.total > 0
        ? Math.round((levelCounts.application.correct / levelCounts.application.total) * 100)
        : 100,
      advancedApplication: levelCounts.advanced_application.total > 0
        ? Math.round((levelCounts.advanced_application.correct / levelCounts.advanced_application.total) * 100)
        : 100,
    };

    // Calculate Topic Gaps
    const topicMap: Record<string, { total: number; correct: number }> = {};
    quiz.questions.forEach((q) => {
      if (!topicMap[q.topic]) {
        topicMap[q.topic] = { total: 0, correct: 0 };
      }
      topicMap[q.topic].total += 1;
      const ans = studentAnswers.find((a) => a.questionId === q.id);
      if (ans?.isCorrect) {
        topicMap[q.topic].correct += 1;
      }
    });

    const topicGaps: TopicGapItem[] = Object.entries(topicMap).map(([topic, stat]) => {
      const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      let masteryLevel: 'mastered' | 'proficient' | 'needs_improvement' = 'needs_improvement';
      let recommendationNote = 'Cần ôn tập kỹ lại lý thuyết và làm thêm các bài tập cơ bản ở chuyên đề này.';

      if (pct >= 80) {
        masteryLevel = 'mastered';
        recommendationNote = 'Nắm rất vững bản chất chuyên đề, tốc độ xử lý câu hỏi tốt.';
      } else if (pct >= 60) {
        masteryLevel = 'proficient';
        recommendationNote = 'Hiểu cách làm nhưng cần rèn luyện thêm tính chính xác trong biến đổi và bẫy đề.';
      }

      return {
        topic,
        totalQuestions: stat.total,
        correctQuestions: stat.correct,
        accuracyPercentage: pct,
        masteryLevel,
        recommendationNote,
      };
    });

    const gapReport: KnowledgeGapReport = {
      overallScore: finalScore,
      totalCorrect,
      totalQuestions: quiz.questions.length,
      accuracyRate,
      timeSpentSeconds,
      completionDate: nowIso,
      levelAccuracy,
      topicGaps,
      strengthsSummary: finalScore >= 8.0
        ? 'Nắm rất vững các kiến thức nền tảng và vận dụng tốt công thức. Khả năng tư duy logic và biến đổi nhanh nhẹn.'
        : 'Có sự chuẩn bị tốt ở các câu hỏi nhận biết và thông hiểu cơ bản.',
      weaknessesSummary: finalScore < 8.0
        ? 'Cần cẩn thận hơn ở các câu hỏi bẫy tính toán và rèn luyện thêm các dạng bài vận dụng cao phân hóa 8+.'
        : 'Tiếp tục duy trì phong độ và tối ưu thêm thời gian giải quyết các bài toán phân hóa 9+.',
    };

    const newSubmission: QuizSubmission = {
      id: `qsub-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId,
      studentName,
      studentAvatar,
      startedAt: new Date(startTimeRef.current).toISOString().replace('T', ' ').substring(0, 16),
      submittedAt: nowIso,
      score: finalScore,
      status: 'reviewed',
      answers: studentAnswers,
      gapReport,
    };

    setCompletedSubmission(newSubmission);
    setMode('review');
    setIsConfirmSubmitOpen(false);
    onCompleteQuiz(newSubmission);
    showToast(`Chúc mừng! Bạn đã hoàn thành bài thi với điểm số ${finalScore}/10!`, 'success');
  };

  const activeSubmission = completedSubmission || existingSubmission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in overflow-hidden">
      <div
        className="bg-white w-full max-w-6xl h-[92vh] rounded-3xl shadow-float border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================ */}
        {/* HEADER BAR                                                       */}
        {/* ================================================================ */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-indigo-950 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-amber-300 font-bold shrink-0 shadow-inner">
              <Brain className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                  {mode === 'taking' ? 'Thi Thử Trực Tuyến' : 'Báo Cáo & Chữa Bài Chi Tiết'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• {quiz.subject === 'math' ? 'Toán Học' : 'Tiếng Anh'}</span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-white truncate max-w-md mt-0.5">
                {quiz.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Taking Mode: Countdown Timer */}
            {mode === 'taking' && (
              <div
                className={cn(
                  'px-4 py-2 rounded-2xl flex items-center gap-2 font-mono font-black text-sm tracking-wider shadow-sm transition-all',
                  timeLeftSeconds <= 120
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : timeLeftSeconds <= 300
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/10 text-white border border-white/15'
                )}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            )}

            {/* Review Mode: Overall Score Badge */}
            {mode === 'review' && activeSubmission && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Điểm số:</span>
                <span className="text-sm font-black text-amber-200">{activeSubmission.score} / 10</span>
              </div>
            )}

            {/* Taking Mode: Submit Button */}
            {mode === 'taking' && (
              <button
                type="button"
                onClick={() => setIsConfirmSubmitOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Nộp Bài Thi</span>
                <span className="sm:hidden">Nộp</span>
              </button>
            )}

            {/* Review Mode: Retake button */}
            {mode === 'review' && (
              <button
                type="button"
                onClick={() => {
                  setMode('taking');
                  setSelectedAnswers({});
                  selectedAnswersRef.current = {};
                  setFlaggedQuestionIds(new Set());
                  setTimeLeftSeconds(quiz.durationMinutes * 60);
                  setCurrentQuestionIndex(0);
                  hasAutoSubmittedRef.current = false;
                  startTimeRef.current = Date.now();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">Làm lại bài thi</span>
              </button>
            )}

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* MAIN BODY                                                        */}
        {/* ================================================================ */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* ============================================================== */}
          {/* LEFT: QUESTION / CONTENT AREA                                  */}
          {/* ============================================================== */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* If in Review Mode, show Knowledge Gap Card at the top */}
            {mode === 'review' && activeSubmission?.gapReport && (
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-indigo-900/40 shadow-soft relative overflow-hidden space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Knowledge Gap Analysis
                      </span>
                      <span className="text-xs text-slate-300">Ma trận chẩn đoán năng lực học tập</span>
                    </div>
                    <h4 className="text-lg font-black text-white mt-1">
                      Báo Cáo Phân Tích Lỗ Hổng Kiến Thức & Mức Độ Thành Thạo
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-300 block">Độ chính xác</span>
                      <span className="text-xl font-black text-white">{activeSubmission.gapReport.accuracyRate}%</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">Số câu đúng</span>
                      <span className="text-xl font-black text-emerald-400">
                        {activeSubmission.gapReport.totalCorrect} / {activeSubmission.gapReport.totalQuestions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Bloom Levels Progress Bars */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Độ Chính Xác Theo 4 Cấp Độ Tư Duy Nhận Thức (Bloom Taxonomy)
                  </span>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {[
                      { label: 'Nhận Biết', pct: activeSubmission.gapReport.levelAccuracy.recognition, color: 'bg-emerald-400' },
                      { label: 'Thông Hiểu', pct: activeSubmission.gapReport.levelAccuracy.comprehension, color: 'bg-sky-400' },
                      { label: 'Vận Dụng', pct: activeSubmission.gapReport.levelAccuracy.application, color: 'bg-amber-400' },
                      { label: 'Vận Dụng Cao (9+)', pct: activeSubmission.gapReport.levelAccuracy.advancedApplication, color: 'bg-purple-400' },
                    ].map((lvl, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300 text-[11px]">{lvl.label}</span>
                          <span className="font-black text-white">{lvl.pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', lvl.color)}
                            style={{ width: `${lvl.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Topic Gaps */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Chi Tiết Mức Độ Nắm Vững Từng Chuyên Đề & Lời Khuyên Hành Động
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeSubmission.gapReport.topicGaps.map((gap, gIdx) => {
                      const isMastered = gap.masteryLevel === 'mastered';
                      const isProficient = gap.masteryLevel === 'proficient';

                      return (
                        <div
                          key={gIdx}
                          className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-xs text-white leading-tight">{gap.topic}</h5>
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                                  isMastered
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : isProficient
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                )}
                              >
                                {isMastered ? '✓ Nắm vững' : isProficient ? 'Khá' : '⚠️ Lỗ hổng cần ôn'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-300">
                              <span>Đúng: <strong>{gap.correctQuestions}/{gap.totalQuestions}</strong> câu</span>
                              <span>•</span>
                              <span>Độ chính xác: <strong>{gap.accuracyPercentage}%</strong></span>
                            </div>

                            <p className="text-[11px] text-slate-300 italic mt-1.5 bg-black/20 p-2 rounded-xl border border-white/5">
                              {gap.recommendationNote}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Question Header & Content Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-5">
              {/* Question metadata badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-black text-xs">
                    Câu {currentQuestion.orderNumber} / {quiz.questions.length}
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                      currentQuestion.difficultyLevel === 'recognition' && 'bg-emerald-100 text-emerald-800',
                      currentQuestion.difficultyLevel === 'comprehension' && 'bg-sky-100 text-sky-800',
                      currentQuestion.difficultyLevel === 'application' && 'bg-amber-100 text-amber-800',
                      currentQuestion.difficultyLevel === 'advanced_application' && 'bg-purple-100 text-purple-800'
                    )}
                  >
                    {currentQuestion.difficultyLevel === 'recognition' && 'Nhận biết'}
                    {currentQuestion.difficultyLevel === 'comprehension' && 'Thông hiểu'}
                    {currentQuestion.difficultyLevel === 'application' && 'Vận dụng'}
                    {currentQuestion.difficultyLevel === 'advanced_application' && 'Vận dụng cao 9+'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
                    • {currentQuestion.topic}
                  </span>
                </div>

                {mode === 'taking' && (
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    className={cn(
                      'px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors',
                      flaggedQuestionIds.has(currentQuestion.id)
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <Flag className={cn('w-3.5 h-3.5', flaggedQuestionIds.has(currentQuestion.id) && 'fill-amber-500 text-amber-600')} />
                    <span>{flaggedQuestionIds.has(currentQuestion.id) ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}</span>
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {currentQuestion.content}
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                  const isCorrect = currentQuestion.correctOptionId === opt.id;

                  let cardStyle = 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60';
                  let labelStyle = 'bg-slate-200 text-slate-700';

                  if (mode === 'taking') {
                    if (isSelected) {
                      cardStyle = 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm';
                      labelStyle = 'bg-indigo-600 text-white';
                    }
                  } else if (mode === 'review') {
                    if (isCorrect) {
                      cardStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20';
                      labelStyle = 'bg-emerald-600 text-white';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20';
                      labelStyle = 'bg-rose-600 text-white';
                    }
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className={cn(
                        'p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-xs sm:text-sm',
                        mode === 'taking' ? 'cursor-pointer' : 'cursor-default',
                        cardStyle
                      )}
                    >
                      <span className={cn('w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0', labelStyle)}>
                        {opt.label}
                      </span>
                      <div className="flex-1 font-medium text-slate-900 leading-relaxed pt-0.5">
                        {opt.content}
                      </div>
                      {mode === 'review' && isCorrect && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" /> Đáp án đúng
                        </span>
                      )}
                      {mode === 'review' && isSelected && !isCorrect && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shrink-0">
                          ✕ Bạn đã chọn sai
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Review Mode: Pedagogical Explanation Box */}
              {mode === 'review' && (
                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
                    <BookOpen className="w-4 h-4 text-indigo-700" />
                    <span>Lời giải chi tiết & Phương pháp giải từ Thầy/Cô:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons (Prev / Next) */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu Trước</span>
              </button>

              <div className="text-xs font-bold text-slate-500">
                Câu {currentQuestionIndex + 1} trên {quiz.questions.length}
              </div>

              <button
                type="button"
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-black disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <span>Câu Tiếp Theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT: QUESTION NAVIGATOR PALETTE                              */}
          {/* ============================================================== */}
          <div className="w-full md:w-80 bg-slate-50/90 border-t md:border-t-0 md:border-l border-slate-200/80 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Bảng Chuyển Câu Hỏi
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  {answeredCount}/{quiz.questions.length} đã làm
                </span>
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 bg-white p-2.5 rounded-2xl border border-slate-200/60">
                {mode === 'taking' ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-indigo-600" />
                      <span>Đã chọn ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
                      <span>Chưa chọn ({unansweredCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <span className="w-3 h-3 rounded-md bg-amber-400" />
                      <span>Đánh dấu xem lại ({flaggedQuestionIds.size})</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-emerald-500" />
                      <span>Đáp án đúng</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-rose-500" />
                      <span>Đáp án sai</span>
                    </div>
                  </>
                )}
              </div>

              {/* Grid Palette */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {quiz.questions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = Boolean(selectedAnswers[q.id]);
                  const isFlagged = flaggedQuestionIds.has(q.id);

                  let cellStyle = 'bg-white text-slate-700 border-slate-200 hover:border-slate-400';

                  if (mode === 'taking') {
                    if (isAnswered) {
                      cellStyle = 'bg-indigo-600 text-white border-indigo-600 font-black shadow-xs';
                    }
                    if (isFlagged) {
                      cellStyle = 'bg-amber-400 text-slate-900 border-amber-500 font-black';
                    }
                    if (isCurrent) {
                      cellStyle += ' ring-2 ring-slate-900 ring-offset-1';
                    }
                  } else if (mode === 'review') {
                    const ans = activeSubmission?.answers.find((a) => a.questionId === q.id);
                    if (ans?.isCorrect) {
                      cellStyle = 'bg-emerald-500 text-white border-emerald-600 font-black';
                    } else {
                      cellStyle = 'bg-rose-500 text-white border-rose-600 font-black';
                    }
                    if (isCurrent) {
                      cellStyle += ' ring-2 ring-slate-900 ring-offset-1';
                    }
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={cn(
                        'h-9 rounded-xl border text-xs font-bold flex items-center justify-center transition-all',
                        cellStyle
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
              {mode === 'taking' ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn Thành & Nộp Bài</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft transition-all"
                >
                  <span>Đóng Báo Cáo Chữa Bài</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* CONFIRM SUBMIT MODAL DIALOG                                      */}
      {/* ================================================================ */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-float border border-slate-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <CheckCircle2 className="w-7 h-7 text-indigo-600" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">Xác Nhận Nộp Bài Thi</h4>
              <p className="text-xs text-slate-600 mt-1">
                Bạn đã trả lời <strong className="text-indigo-600">{answeredCount}/{quiz.questions.length}</strong> câu hỏi.
                {unansweredCount > 0 && (
                  <span className="block text-amber-600 font-semibold mt-1">
                    ⚠️ Còn {unansweredCount} câu hỏi bạn chưa chọn đáp án!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={() => processSubmission()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-soft"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
