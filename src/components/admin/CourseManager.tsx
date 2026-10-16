'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Users,
  Star,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Calendar,
  AlertCircle,
  FileCheck2,
  DollarSign,
  ChevronRight,
  Video,
  MapPin
} from 'lucide-react';
import { Course, CourseRegistration, SubjectType, Tutor } from '@/types';
import { formatVND, getSubjectColor } from '@/lib/utils';
import { useToast } from '@/components/shared/ToastNotification';
import { AddCourseModal } from './AddCourseModal';

interface CourseManagerProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  registrations: CourseRegistration[];
  onApproveRegistration: (regId: string, assignedRoom?: string) => void;
  tutors: Tutor[];
  isSuperAdmin: boolean;
  currentUserTitle?: string;
}

export function CourseManager({
  courses,
  onAddCourse,
  onDeleteCourse,
  registrations,
  onApproveRegistration,
  tutors,
  isSuperAdmin,
  currentUserTitle = 'Điều Phối Học Vụ',
}: CourseManagerProps) {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'courses' | 'registrations'>('courses');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Approval modal state for assigning room / note
  const [selectedRegToApprove, setSelectedRegToApprove] = useState<CourseRegistration | null>(null);
  const [assignedRoomInput, setAssignedRoomInput] = useState('Phòng A102 & Google Meet VIP 2');

  const pendingRegistrationsCount = registrations.filter((r) => r.centerStatus === 'pending' || r.currentStep === 3).length;

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesSubject = selectedSubject === 'all' || c.subject === selectedSubject;
    const matchesQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  const handleConfirmApproval = () => {
    if (!selectedRegToApprove) return;
    onApproveRegistration(selectedRegToApprove.id, assignedRoomInput);
    showToast(`Đã duyệt đơn đăng ký của học sinh "${selectedRegToApprove.studentName}". Hồ sơ đã chuyển sang Bước 4 (Thanh toán học phí)!`, 'success');
    setSelectedRegToApprove(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Quản Lý Khóa Học & Phê Duyệt Ghi Danh
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                  Website & Học Vụ
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Phân quyền cho Chủ trung tâm & Ban Học vụ xuất bản khóa học ra ngoài Landing Page và duyệt đơn đăng ký của học sinh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Thêm Khóa Học Mới</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Switcher */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => setActiveSubTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'courses'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Khóa học trên Website ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('registrations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeSubTab === 'registrations'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Đơn Đăng Ký Chờ Duyệt (Bước 3)</span>
            {pendingRegistrationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {pendingRegistrationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DANH MỤC KHÓA HỌC HIỂN THỊ NGOÀI WEBSITE              */}
      {/* ============================================================ */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tất cả môn' },
                { id: 'english', label: 'IELTS / Tiếng Anh' },
                { id: 'math', label: 'Toán Học' },
                { id: 'science', label: 'Vật Lý / KHTN' },
                { id: 'literature', label: 'Ngữ Văn' },
                { id: 'other', label: 'Gia sư 1:1' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSubject === sub.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm khóa học, giáo viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Banner */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.bannerImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-white/95 backdrop-blur-sm text-slate-900 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-xs">
                        {course.gradeLevel}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                          HOT DEAL
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

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    {/* Tutor */}
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.tutorAvatar}
                        alt={course.tutorName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div className="truncate">
                        <span className="font-bold text-xs text-slate-900 block truncate">{course.tutorName}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{course.tutorTitle || 'Giảng viên chuyên môn'}</span>
                      </div>
                    </div>

                    {/* Schedule & Duration */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{course.scheduleDescription}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Thời lượng: <strong>{course.duration}</strong></span>
                      </div>
                    </div>

                    {/* Commitment Badge */}
                    {course.commitmentBadge && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{course.commitmentBadge}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Pricing & Delete */}
                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {course.originalPrice && (
                      <span className="text-[11px] text-slate-400 line-through block">
                        {formatVND(course.originalPrice)}
                      </span>
                    )}
                    <span className="text-base font-black text-red-600">
                      {formatVND(course.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa/ẩn khóa học "${course.title}" khỏi website?`)) {
                          onDeleteCourse(course.id);
                          showToast(`Đã gỡ khóa học "${course.title}" khỏi website!`, 'info');
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Gỡ khóa học khỏi website"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: DUYỆT ĐƠN ĐĂNG KÝ CỦA HỌC SINH (BƯỚC 3)               */}
      {/* ============================================================ */}
      {activeSubTab === 'registrations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Danh Sách Đơn Đăng Ký Chờ Trung Tâm Xác Nhận (Bước 3)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Học sinh đã hoàn tất Bước 1 (Đăng ký) và Bước 2 (Xác nhận lớp & lịch). Ban Học vụ duyệt xếp phòng để học sinh chuyển sang Bước 4 (Thanh toán).
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                {pendingRegistrationsCount} đơn cần xử lý
              </span>
            </div>

            {/* Registrations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">MÃ ĐƠN</th>
                    <th className="pb-3">HỌC SINH / PHỤ HUYNH</th>
                    <th className="pb-3">KHÓA HỌC & GIẢNG VIÊN</th>
                    <th className="pb-3">LỊCH DẠY CHỌN</th>
                    <th className="pb-3">HÌNH THỨC</th>
                    <th className="pb-3">TRẠNG THÁI</th>
                    <th className="pb-3 pr-2 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 pl-2 font-mono font-bold text-slate-700">
                        {reg.paymentCode || reg.id}
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-slate-900">{reg.studentName}</div>
                        <div className="text-[11px] text-slate-500">{reg.studentPhone} • {reg.grade}</div>
                        {reg.targetGoal && (
                          <div className="text-[10px] text-amber-700 font-medium mt-0.5 italic">
                            Mục tiêu: {reg.targetGoal}
                          </div>
                        )}
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{reg.courseTitle}</div>
                        <div className="text-[11px] text-slate-500">{reg.tutorName} • {formatVND(reg.price)}</div>
                      </td>

                      <td className="py-4">
                        <div className="font-medium text-slate-800">{reg.selectedSchedule}</div>
                        <div className="text-[11px] text-slate-400">{reg.duration}</div>
                      </td>

                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.learningFormat === 'online'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {reg.learningFormat === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {reg.learningFormat === 'online' ? 'Online Google Meet' : 'Trực tiếp tại TT'}
                        </span>
                      </td>

                      <td className="py-4">
                        {reg.currentStep === 3 ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200 animate-pulse">
                            Chờ trung tâm duyệt (Bước 3)
                          </span>
                        ) : reg.currentStep === 4 && reg.paymentStatus === 'unpaid' ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                            Đã duyệt • Chờ thanh toán (Bước 4)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            Đã hoàn tất & Đang học
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-2 text-right">
                        {reg.currentStep === 3 ? (
                          <button
                            onClick={() => setSelectedRegToApprove(reg)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 ml-auto active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Xác Nhận & Duyệt Lớp</span>
                          </button>
                        ) : reg.currentStep === 4 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Đã duyệt bởi {reg.approvedBy || 'Học vụ'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold">
                            Kích hoạt xong
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Duyệt Đơn Đăng Ký & Gán Phòng */}
      {selectedRegToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Xác Nhận Lớp & Phê Duyệt Bước 3
                </h3>
                <p className="text-xs text-slate-500">
                  Dành cho Học vụ thẩm định lịch dạy và xếp lớp cho học sinh
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Học sinh đăng ký:</span>
                <strong className="text-slate-900">{selectedRegToApprove.studentName} ({selectedRegToApprove.studentPhone})</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Khóa học đăng ký:</span>
                <strong className="text-slate-900">{selectedRegToApprove.courseTitle}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Lịch dạy đã chọn:</span>
                <strong className="text-amber-700">{selectedRegToApprove.selectedSchedule}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Học phí cần thu:</span>
                <strong className="text-red-600 font-black">{formatVND(selectedRegToApprove.price)}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phòng học phân bổ / Ghi chú cho học sinh:
              </label>
              <input
                type="text"
                value={assignedRoomInput}
                onChange={(e) => setAssignedRoomInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="VD: Phòng A102 & Link Google Meet..."
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedRegToApprove(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Phê Duyệt & Chuyển Sang Thanh Toán</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Khóa Học */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCourse={onAddCourse}
        tutors={tutors}
      />
    </div>
  );
}
