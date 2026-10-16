'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  FileText,
  Video,
  Presentation,
  ClipboardList,
  File,
  ExternalLink,
  Download,
  Play,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { CourseResource, Course } from '@/types';
import { cn } from '@/lib/utils';

interface StudentResourcesViewProps {
  resources: CourseResource[];
  courses: Course[];
  enrolledCourseIds?: string[];
  viewerRole: 'student' | 'parent';
  studentName?: string;
}

export const StudentResourcesView: React.FC<StudentResourcesViewProps> = ({
  resources,
  courses,
  enrolledCourseIds,
  viewerRole,
  studentName = 'Học Viên',
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Enrolled courses list
  const activeCourses = useMemo(() => {
    if (!enrolledCourseIds || enrolledCourseIds.length === 0) {
      return courses;
    }
    return courses.filter((c) => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // If student has enrolled courses, verify relevance if desired, or allow all courses they study
      const isCourseAllowed =
        !enrolledCourseIds ||
        enrolledCourseIds.length === 0 ||
        enrolledCourseIds.includes(res.courseId);

      const matchCourse = selectedCourseId === 'all' || res.courseId === selectedCourseId;
      const matchType = selectedType === 'all' || res.type === selectedType;
      const matchSearch =
        !searchQuery.trim() ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        res.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

      return isCourseAllowed && matchCourse && matchType && matchSearch;
    });
  }, [resources, enrolledCourseIds, selectedCourseId, selectedType, searchQuery]);

  // Video recordings count
  const videoCount = useMemo(() => {
    return resources.filter((r) => r.type === 'recording').length;
  }, [resources]);

  // Documents count
  const docCount = useMemo(() => {
    return resources.filter((r) => r.type !== 'recording').length;
  }, [resources]);

  const getTypeIcon = (type: CourseResource['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'slide':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'exam':
        return <ClipboardList className="w-5 h-5 text-emerald-500" />;
      case 'recording':
        return <Video className="w-5 h-5 text-indigo-500" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTypeBadge = (type: CourseResource['type']) => {
    switch (type) {
      case 'pdf':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">PDF Tóm tắt</span>;
      case 'slide':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Slide Bài giảng</span>;
      case 'exam':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đề thi / Kiểm tra</span>;
      case 'recording':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Ghi hình Meet</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Tài liệu</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-soft relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {viewerRole === 'parent'
                  ? `Tài nguyên số của ${studentName}`
                  : 'Học liệu & Video bài giảng trực tuyến'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {viewerRole === 'parent'
                ? `Kho Tài Liệu & Video Bài Học Của ${studentName}`
                : 'Thư Viện Bài Giảng & Tài Liệu Học Tập'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              {viewerRole === 'parent'
                ? 'Phụ huynh có thể dễ dàng xem lại video các tiết dạy trực tuyến và tài liệu ôn tập mà thầy cô đã giao cho con.'
                : 'Tra cứu tài liệu lý thuyết, slide bài giảng, đề kiểm tra định kỳ và xem lại bản ghi hình các buổi học đã qua.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 min-w-[90px]">
              <div className="text-xl font-black text-indigo-900">{videoCount}</div>
              <div className="text-[11px] font-semibold text-indigo-600 mt-0.5">Video bài giảng</div>
            </div>
            <div className="text-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
              <div className="text-xl font-black text-slate-900">{docCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Tài liệu ôn tập</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft space-y-4">
        {/* Quick Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
          {[
            { id: 'all', label: 'Tất cả tài nguyên' },
            { id: 'recording', label: 'Video ghi hình (Meet)', icon: Video },
            { id: 'pdf', label: 'Tài liệu PDF', icon: FileText },
            { id: 'slide', label: 'Slide bài giảng', icon: Presentation },
            { id: 'exam', label: 'Đề thi & Luyện tập', icon: ClipboardList },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-soft"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Course Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên tài liệu, chủ đề hoặc từ khóa..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          <div className="md:col-span-5">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            >
              <option value="all">Tất cả môn học / khóa học</option>
              {activeCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có tài liệu nào phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thầy cô sẽ sớm cập nhật thêm slide, đề kiểm tra và link video bài học cho khóa học này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const isVideo = res.type === 'recording';
            return (
              <div
                key={res.id}
                className={cn(
                  "bg-white rounded-3xl p-5 border shadow-soft flex flex-col justify-between transition-all hover:shadow-md group",
                  isVideo
                    ? "border-indigo-100 hover:border-indigo-300"
                    : "border-slate-200/80 hover:border-slate-300"
                )}
              >
                <div className="space-y-3">
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        "p-2.5 rounded-2xl border shrink-0",
                        isVideo
                          ? "bg-indigo-50 border-indigo-100"
                          : "bg-slate-50 border-slate-100"
                      )}
                    >
                      {getTypeIcon(res.type)}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {getTypeBadge(res.type)}
                      {res.gradeLevel && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {res.gradeLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Course */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                      {res.title}
                    </h4>
                    <div className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                      {res.courseTitle}
                    </div>
                  </div>

                  {/* Description */}
                  {res.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400">
                    {isVideo ? (
                      <>
                        {res.recordingDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {res.recordingDate}
                          </span>
                        )}
                        {res.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {res.duration}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {res.fileSize && <span>{res.fileSize}</span>}
                        <span>•</span>
                        <span>Giảng viên: {res.uploadedBy}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95",
                      isVideo
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-slate-900 hover:bg-black text-white"
                    )}
                  >
                    {isVideo ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Xem Lại Video Bài Giảng</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Xem & Tải Tài Liệu</span>
                      </>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
