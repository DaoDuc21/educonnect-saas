'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Star, Users, Check, ArrowRight, Sparkles, Clock, Calendar, ShieldCheck, Video, MapPin, Search, Filter } from 'lucide-react';
import { Course, CourseRegistration, SubjectType } from '@/types';
import { formatVND, getSubjectColor } from '@/lib/utils';
import { useToast } from '../shared/ToastNotification';
import { CourseEnrollmentModal } from './CourseEnrollmentModal';

interface CourseCatalogProps {
  courses: Course[];
  onCompleteEnrollment?: (registration: CourseRegistration) => void;
  enrolledCourseTitles?: string[];
  currentStudentName?: string;
  currentStudentPhone?: string;
  currentStudentEmail?: string;
  currentGrade?: string;
  registrations?: CourseRegistration[];
  onUpdateRegistration?: (reg: CourseRegistration) => void;
}

export function CourseCatalog({
  courses,
  onCompleteEnrollment,
  enrolledCourseTitles = ['Toán 12 - Chinh Phục Điểm 9+ THPT Quốc Gia & ĐGNL'],
  currentStudentName = 'Nguyễn Minh Quân',
  currentStudentPhone = '0909 112 233',
  currentStudentEmail = 'quan.nguyen@educonnect.vn',
  currentGrade = 'Lớp 12',
  registrations = [],
  onUpdateRegistration,
}: CourseCatalogProps) {
  const { showToast } = useToast();

  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrolledTitlesState, setEnrolledTitlesState] = useState<string[]>(enrolledCourseTitles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSubject = selectedSubject === 'all' || c.subject === selectedSubject;
      const matchSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSubject && matchSearch;
    });
  }, [courses, selectedSubject, searchQuery]);

  const handleOpenEnroll = (course: Course) => {
    setSelectedCourseForEnroll(course);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSuccess = (reg: CourseRegistration) => {
    setEnrolledTitlesState((prev) => [...prev, reg.courseTitle]);
    if (onCompleteEnrollment) {
      onCompleteEnrollment(reg);
    }
    setIsEnrollModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Modern Student Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-soft border border-indigo-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Khám Phá & Đăng Ký Khóa Học EduConnect
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Chinh Phục Kỳ Thi Với Giảng Viên Hàng Đầu
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Quy trình 4 bước chuẩn hóa: Chọn khóa → Chọn ca học → Học vụ xếp phòng & Google Meet VIP → Nộp học phí VietQR tự động.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center min-w-[130px]">
              <span className="text-xl font-black text-amber-300 block">{courses.length} Khóa</span>
              <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Đang mở tuyển sinh</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center min-w-[130px]">
              <span className="text-xl font-black text-emerald-300 block">100% VIP</span>
              <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Gặp Meet 1:1 & Offline</span>
            </div>
          </div>
        </div>

        {/* Search & Subject Tabs Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tất cả môn' },
              { id: 'math', label: 'Toán học' },
              { id: 'english', label: 'Tiếng Anh & IELTS' },
              { id: 'literature', label: 'Ngữ văn' },
              { id: 'science', label: 'Vật lý & KHTN' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSubject(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubject === tab.id
                    ? 'bg-white text-indigo-950 shadow-md scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-indigo-200 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên môn, giáo viên..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 text-white placeholder-indigo-200 text-xs border border-white/20 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 lg:p-8">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Hiển thị {filteredCourses.length} khóa học phù hợp
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F3EF] text-slate-700">
            Học kỳ 1 - Năm học 2026-2027
          </span>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledTitlesState.includes(course.title);
            const activeReg = registrations.find((r) => r.courseId === course.id || r.courseTitle === course.title);

            return (
              <div
                key={course.id}
                className="rounded-3xl border border-slate-200/80 bg-white hover:border-slate-300 shadow-soft hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Course Banner */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.bannerImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                      {course.gradeLevel}
                    </span>
                    {course.commitmentBadge && (
                      <span className="bg-amber-500/90 backdrop-blur-sm text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                        {course.commitmentBadge}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-slate-900/80 backdrop-blur-sm text-amber-300 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      {course.rating}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {course.title}
                    </h3>

                    {/* Tutor info */}
                    <div className="flex items-center gap-2.5 mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.tutorAvatar}
                        alt={course.tutorName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div className="truncate">
                        <span className="text-xs font-semibold text-slate-800 block truncate">
                          {course.tutorName}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {course.tutorTitle || 'Giảng viên phụ trách'}
                        </span>
                      </div>
                    </div>

                    {/* Schedule & Duration info */}
                    <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{course.scheduleDescription}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Thời lượng: <strong>{course.duration}</strong></span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5 mt-4">
                      {course.features.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Enroll Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-[11px] text-slate-400 line-through block">
                          {formatVND(course.originalPrice)}
                        </span>
                      )}
                      <span className="text-base font-black text-red-600 block">
                        {formatVND(course.price)}
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        Đang theo học
                      </span>
                    ) : activeReg && activeReg.currentStep === 3 ? (
                      <button
                        onClick={() => handleOpenEnroll(course)}
                        className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-soft transition-all shrink-0 animate-pulse"
                      >
                        Chờ trung tâm duyệt (Bước 3)
                      </button>
                    ) : activeReg && activeReg.currentStep === 4 && activeReg.paymentStatus === 'unpaid' ? (
                      <button
                        onClick={() => handleOpenEnroll(course)}
                        className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-soft transition-all shrink-0"
                      >
                        Thanh toán học phí (Bước 4)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenEnroll(course)}
                        className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-soft transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Đăng ký 4 bước</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Step Enrollment Modal */}
      <CourseEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        selectedCourse={selectedCourseForEnroll}
        currentStudentName={currentStudentName}
        currentStudentPhone={currentStudentPhone}
        currentStudentEmail={currentStudentEmail}
        currentGrade={currentGrade}
        onCompleteEnrollment={handleEnrollSuccess}
        activeRegistration={
          selectedCourseForEnroll
            ? registrations.find(
                (r) => r.courseId === selectedCourseForEnroll.id || r.courseTitle === selectedCourseForEnroll.title
              )
            : null
        }
        onUpdateRegistration={onUpdateRegistration}
      />
    </div>
  );
}
