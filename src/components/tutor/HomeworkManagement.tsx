'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Star,
  FileText,
  Search,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { HomeworkAssignment, HomeworkSubmission, ScheduleEvent, Student } from '@/types';
import { cn, getSubjectColor } from '@/lib/utils';
import { CreateHomeworkModal } from './CreateHomeworkModal';
import { GradeHomeworkModal } from './GradeHomeworkModal';

interface HomeworkManagementProps {
  homeworkList: HomeworkAssignment[];
  submissionsList: HomeworkSubmission[];
  events: ScheduleEvent[];
  students: Student[];
  onCreateHomework: (newHw: HomeworkAssignment) => void;
  onGradeHomework: (gradedSubmission: HomeworkSubmission) => void;
}

export function HomeworkManagement({
  homeworkList,
  submissionsList,
  events,
  students,
  onCreateHomework,
  onGradeHomework,
}: HomeworkManagementProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGradingPair, setSelectedGradingPair] = useState<{
    hw: HomeworkAssignment;
    sub: HomeworkSubmission;
  } | null>(null);

  const [filterSession, setFilterSession] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate metrics
  const totalHomework = homeworkList.length;
  const submittedCount = submissionsList.filter((s) => s.status === 'submitted' || s.status === 'graded').length;
  const needGradingCount = submissionsList.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissionsList.filter((s) => s.status === 'graded').length;

  // Filtered homework list
  const filteredHomework = homeworkList.filter((hw) => {
    const matchSession = filterSession === 'all' || hw.sessionId === filterSession;
    const matchSearch =
      !searchQuery.trim() ||
      hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSession && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-indigo-900/40 shadow-soft relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Cổng Giảng Viên • Quản Lý Học Tập
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold border border-white/15">
                Bài tập & Đánh giá
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-1">
              Giao Bài Tập Về Nhà & Chấm Điểm Sau Buổi Học
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Giao nhiệm vụ rèn luyện, kiểm tra bài làm của học sinh, chấm điểm và đánh giá chất lượng buổi dạy.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs flex items-center gap-2 shadow-soft transition-all self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 text-indigo-700" />
            <span>+ Giao Bài Tập Mới</span>
          </button>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-300 uppercase">Tổng Bài Đã Giao</span>
            <div className="text-2xl font-black text-white mt-1">{totalHomework}</div>
            <span className="text-[10px] text-slate-400">Trên tất cả các lớp</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-sky-300 uppercase">Học Sinh Đã Nộp</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{submittedCount}</div>
            <span className="text-[10px] text-slate-400">Đã gửi bài qua hệ thống</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-amber-300 uppercase">Cần Chấm Điểm</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{needGradingCount}</div>
            <span className="text-[10px] text-amber-200 font-semibold">Chờ giáo viên nhận xét</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 uppercase">Đã Hoàn Tất Chấm</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{gradedCount}</div>
            <span className="text-[10px] text-slate-400">Kèm nhận xét chi tiết</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài tập theo tên môn hoặc tiêu đề..."
            className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Lớp học:</span>
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="bg-[#F5F3EF] border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả các lớp dạy</option>
            {events.slice(0, 5).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="space-y-4">
        {filteredHomework.map((hw) => {
          const colors = getSubjectColor(hw.subject);
          const hwSubmissions = submissionsList.filter((s) => s.homeworkId === hw.id);

          return (
            <div
              key={hw.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden p-6 space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full border', colors.pill)}>
                      {hw.sessionTitle}
                    </span>
                    <span className="text-xs text-slate-500">• Ngày giao: {hw.assignedDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{hw.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hạn nộp: {hw.dueDate}</span>
                  </div>
                  {hw.attachmentUrl && (
                    <a
                      href={hw.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Đề bài PDF</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-[#F5F3EF]/60 p-3.5 rounded-2xl border border-slate-200/50">
                <strong>Yêu cầu bài làm:</strong> {hw.description}
              </p>

              {/* Submissions Roster */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>Danh Sách Học Sinh Nộp Bài ({hwSubmissions.length} học sinh)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Đã chấm: <strong>{hwSubmissions.filter((s) => s.status === 'graded').length}/{hwSubmissions.length}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hwSubmissions.map((sub) => {
                    const isGraded = sub.status === 'graded';
                    const isSubmitted = sub.status === 'submitted';

                    return (
                      <div
                        key={sub.id}
                        className={cn(
                          'p-4 rounded-2xl border transition-all flex items-center justify-between gap-3',
                          isGraded
                            ? 'bg-emerald-50/50 border-emerald-200/80'
                            : isSubmitted
                            ? 'bg-blue-50/50 border-blue-200/80'
                            : 'bg-slate-50 border-slate-200/70'
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white shrink-0 shadow-xs"
                          />
                          <div className="overflow-hidden">
                            <span className="font-bold text-xs text-slate-900 block truncate">
                              {sub.studentName}
                            </span>
                            <div className="text-[11px] mt-0.5">
                              {isGraded ? (
                                <span className="font-bold text-emerald-700 flex items-center gap-1">
                                  <span>{sub.score}/{hw.totalScore} điểm</span>
                                  <span>•</span>
                                  <span className="flex items-center text-amber-500">
                                    {sub.comprehensionRating} <Star className="w-2.5 h-2.5 fill-amber-400 inline" />
                                  </span>
                                </span>
                              ) : isSubmitted ? (
                                <span className="font-semibold text-blue-700">
                                  Đã nộp lúc {sub.submittedAt?.split(' ')[1] || 'hôm nay'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">Chưa nộp bài</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div>
                          {isSubmitted ? (
                            <button
                              onClick={() => setSelectedGradingPair({ hw, sub })}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300" />
                              <span>Chấm điểm</span>
                            </button>
                          ) : isGraded ? (
                            <button
                              onClick={() => setSelectedGradingPair({ hw, sub })}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-800 font-bold text-xs transition-colors"
                            >
                              Sửa điểm
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded-lg">
                              Đang làm
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Homework Modal */}
      <CreateHomeworkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        events={events}
        onCreateHomework={onCreateHomework}
      />

      {/* Grade Homework Modal */}
      {selectedGradingPair && (
        <GradeHomeworkModal
          isOpen={true}
          onClose={() => setSelectedGradingPair(null)}
          homework={selectedGradingPair.hw}
          submission={selectedGradingPair.sub}
          onSaveGrade={(graded) => {
            onGradeHomework(graded);
            setSelectedGradingPair(null);
          }}
        />
      )}
    </div>
  );
}
