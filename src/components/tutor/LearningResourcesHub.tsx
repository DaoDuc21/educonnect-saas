'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Video,
  Presentation,
  ClipboardList,
  File,
  ExternalLink,
  Trash2,
  Edit3,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  BookOpen,
  Download,
  AlertCircle
} from 'lucide-react';
import { CourseResource, Course, SubjectType } from '@/types';
import { cn, getSubjectColor } from '@/lib/utils';

interface LearningResourcesHubProps {
  resources: CourseResource[];
  courses: Course[];
  currentTutorName: string;
  onAddResource: (resource: CourseResource) => void;
  onDeleteResource: (resourceId: string) => void;
  onUpdateResource: (resource: CourseResource) => void;
}

export const LearningResourcesHub: React.FC<LearningResourcesHubProps> = ({
  resources,
  courses,
  currentTutorName,
  onAddResource,
  onDeleteResource,
  onUpdateResource,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CourseResource | null>(null);

  // Form State
  const [formCourseId, setFormCourseId] = useState<string>(courses[0]?.id || 'course-1');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CourseResource['type']>('pdf');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formRecordingDate, setFormRecordingDate] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formGradeLevel, setFormGradeLevel] = useState('Lớp 12');

  // Stats calculation
  const stats = useMemo(() => {
    const total = resources.length;
    const recordings = resources.filter((r) => r.type === 'recording').length;
    const docs = resources.filter((r) => r.type === 'pdf' || r.type === 'slide').length;
    const exams = resources.filter((r) => r.type === 'exam').length;
    return { total, recordings, docs, exams };
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchCourse = selectedCourseId === 'all' || res.courseId === selectedCourseId;
      const matchType = selectedType === 'all' || res.type === selectedType;
      const matchSearch =
        !searchQuery.trim() ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        res.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCourse && matchType && matchSearch;
    });
  }, [resources, selectedCourseId, selectedType, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormCourseId(courses[0]?.id || 'course-1');
    setFormTitle('');
    setFormType('pdf');
    setFormFileUrl('');
    setFormFileSize('2.5 MB');
    setFormRecordingDate(new Date().toISOString().split('T')[0]);
    setFormDuration('90 phút');
    setFormDescription('');
    setFormGradeLevel('Lớp 12');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (res: CourseResource) => {
    setEditingResource(res);
    setFormCourseId(res.courseId);
    setFormTitle(res.title);
    setFormType(res.type);
    setFormFileUrl(res.fileUrl);
    setFormFileSize(res.fileSize || '');
    setFormRecordingDate(res.recordingDate || '');
    setFormDuration(res.duration || '');
    setFormDescription(res.description || '');
    setFormGradeLevel(res.gradeLevel || 'Lớp 12');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formFileUrl.trim()) return;

    const targetCourse = courses.find((c) => c.id === formCourseId);
    const courseTitle = targetCourse ? targetCourse.title : 'Khóa Học Đang Phụ Trách';
    const courseSubject = targetCourse ? targetCourse.subject : 'math';

    if (editingResource) {
      const updated: CourseResource = {
        ...editingResource,
        courseId: formCourseId,
        courseTitle,
        subject: courseSubject,
        title: formTitle.trim(),
        type: formType,
        fileUrl: formFileUrl.trim(),
        fileSize: formType !== 'recording' ? formFileSize.trim() : undefined,
        recordingDate: formType === 'recording' ? formRecordingDate : undefined,
        duration: formType === 'recording' ? formDuration.trim() : undefined,
        description: formDescription.trim(),
        gradeLevel: formGradeLevel,
      };
      onUpdateResource(updated);
    } else {
      const newRes: CourseResource = {
        id: `res-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        courseId: formCourseId,
        courseTitle,
        subject: courseSubject,
        title: formTitle.trim(),
        type: formType,
        fileUrl: formFileUrl.trim(),
        fileSize: formType !== 'recording' ? formFileSize.trim() : undefined,
        recordingDate: formType === 'recording' ? formRecordingDate : undefined,
        duration: formType === 'recording' ? formDuration.trim() : undefined,
        description: formDescription.trim(),
        uploadedBy: currentTutorName || 'Giảng Viên Phụ Trách',
        uploadedAt: new Date().toISOString(),
        gradeLevel: formGradeLevel,
      };
      onAddResource(newRes);
    }

    setIsModalOpen(false);
  };

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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Tài liệu PDF</span>;
      case 'slide':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Slide Bài giảng</span>;
      case 'exam':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đề thi / Kiểm tra</span>;
      case 'recording':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Video Ghi hình</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Tài liệu khác</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FolderOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Kho Tài Liệu & Video Bài Giảng
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500">
              Quản lý tài nguyên số, đề thi minh họa và video ghi hình Google Meet theo từng lớp học
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-soft transition-all active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Tải Lên Tài Nguyên Mới</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Tổng tài nguyên</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-indigo-50/60 rounded-2xl p-3.5 border border-indigo-100/60">
            <div className="text-xs text-indigo-600 font-medium">Video ghi hình</div>
            <div className="text-2xl font-black text-indigo-900 mt-1">{stats.recordings}</div>
          </div>
          <div className="bg-rose-50/60 rounded-2xl p-3.5 border border-rose-100/60">
            <div className="text-xs text-rose-600 font-medium">Tài liệu & Slide</div>
            <div className="text-2xl font-black text-rose-900 mt-1">{stats.docs}</div>
          </div>
          <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-100/60">
            <div className="text-xs text-emerald-600 font-medium">Đề thi khảo sát</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{stats.exams}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề tài liệu, nội dung..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          {/* Filter by Course */}
          <div className="md:col-span-4">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            >
              <option value="all">Tất cả khóa học ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Type */}
          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="pdf">Tài liệu PDF</option>
              <option value="slide">Slide Bài giảng</option>
              <option value="recording">Video Ghi hình</option>
              <option value="exam">Đề thi / Bài tập</option>
              <option value="other">Tài liệu khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy tài liệu phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử thay đổi bộ lọc tìm kiếm hoặc nhấn nút "Tải Lên Tài Nguyên Mới" để thêm tài liệu cho học sinh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
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

                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {res.title}
                  </h4>
                  <div className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                    {res.courseTitle}
                  </div>
                </div>

                {res.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}

                {/* Meta details */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400">
                  {res.type === 'recording' ? (
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
                      <span>Đăng bởi {res.uploadedBy}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={res.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    res.type === 'recording'
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-slate-900 hover:bg-black text-white"
                  )}
                >
                  {res.type === 'recording' ? (
                    <>
                      <Video className="w-3.5 h-3.5" />
                      <span>Xem Ghi Hình</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem Tài Liệu</span>
                    </>
                  )}
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(res)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Chỉnh sửa tài liệu"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${res.title}"?`)) {
                      onDeleteResource(res.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Xóa tài liệu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  {editingResource ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingResource ? 'Cập Nhật Tài Liệu' : 'Tải Lên Tài Nguyên Mới'}
                  </h3>
                  <p className="text-xs text-slate-400">Đính kèm tài liệu học tập hoặc video buổi học</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Khóa học áp dụng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tiêu đề tài liệu / Tên buổi ghi hình <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Chuyên đề 02: Bất đẳng thức tích phân (PDF)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  required
                />
              </div>

              {/* Type & Grade Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Định dạng tài nguyên <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as CourseResource['type'])}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  >
                    <option value="pdf">Tài liệu PDF</option>
                    <option value="slide">Slide Bài giảng</option>
                    <option value="recording">Video Ghi hình (Meet)</option>
                    <option value="exam">Đề thi / Kiểm tra</option>
                    <option value="other">Tài liệu khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Khối lớp
                  </label>
                  <input
                    type="text"
                    value={formGradeLevel}
                    onChange={(e) => setFormGradeLevel(e.target.value)}
                    placeholder="Lớp 12, Lớp 11..."
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>

              {/* File URL or Recording URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {formType === 'recording'
                    ? 'Liên kết Video ghi hình Google Meet / Drive'
                    : 'Đường dẫn liên kết tải tài liệu (Google Drive / OneDrive / Cloud)'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={formFileUrl}
                  onChange={(e) => setFormFileUrl(e.target.value)}
                  placeholder={
                    formType === 'recording'
                      ? 'https://meet.google.com/recordings/...'
                      : 'https://drive.google.com/file/d/...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  required
                />
              </div>

              {/* Conditional: Recording extra info OR Document extra info */}
              {formType === 'recording' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ngày ghi hình
                    </label>
                    <input
                      type="date"
                      value={formRecordingDate}
                      onChange={(e) => setFormRecordingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Thời lượng
                    </label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="Ví dụ: 90 phút"
                      className="w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Dung lượng ước tính
                  </label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    placeholder="Ví dụ: 3.5 MB"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mô tả nội dung tóm tắt
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ghi chú thêm về nội dung bài học, hướng dẫn học sinh cách ôn tập..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-soft transition-all active:scale-95"
                >
                  {editingResource ? 'Lưu Thay Đổi' : 'Đăng Tải Lên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
