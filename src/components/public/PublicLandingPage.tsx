'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Star,
  BookOpen,
  GraduationCap,
  ChevronRight,
  LogIn,
  PhoneCall,
  Clock,
  Send,
  Zap,
  HelpCircle,
  FileCheck,
  Flame,
  Check,
  X,
  Target,
  Search,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { formatVND } from '@/lib/utils';
import { mockTutors, mockCoursesCatalog } from '@/data/mockData';
import { Course, Tutor, AdmissionsLead, CourseRegistration } from '@/types';
import { useToast } from '@/components/shared/ToastNotification';
import { CourseEnrollmentModal } from '@/components/student/CourseEnrollmentModal';
import { TuitionCalculator, TuitionPlanSelection } from './TuitionCalculator';

interface PublicLandingPageProps {
  onOpenLogin: () => void;
  onRegisterLead?: (leadData: Omit<AdmissionsLead, 'id' | 'createdAt' | 'status' | 'requestedAt' | 'provisionedAt'>) => void;
  courses?: Course[];
  onCompleteEnrollment?: (registration: CourseRegistration) => void;
}

const DRAFT_STORAGE_KEY = 'educonnect_admissions_draft';
const VIETNAMESE_PHONE_REGEX = /^(0[35789])[0-9]{8}$/;

const STANDARD_GRADE_OPTIONS = [
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 5 (Chuyển cấp)',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9 (Thi vào 10)',
  'Lớp 9 (Luyện thi vào 10)',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12 (Luyện thi ĐH)',
  'Lớp 12 & Ôn Thi ĐH',
  'Đại học / Người đi làm',
];

const STANDARD_COURSE_OPTIONS = [
  'IELTS Academic Master 7.0+ Toàn Diện (4 Kỹ Năng)',
  'Toán Học Tuyển Sinh 10 Chuyên (KHTN, Sư Phạm, Ams)',
  'Toán 12 - Chinh Phục Điểm 9+ THPT Quốc Gia & ĐGNL',
  'Vật Lý 11 - 12 Cốt Lõi & Luyện Đề Đánh Giá Năng Lực',
  'Ngữ Văn 9 - Bí Quyết Viết Nghị Luận Điểm 9 Vào 10',
  'Toán Tiểu Học (Lớp 1 - 5) - Phát Triển Tư Duy Nền Tảng',
  'Tiếng Anh Tiểu Học (Lớp 1 - 5) - Chuẩn Cambridge',
  'Gia Sư Kèm Riêng 1:1 Cá Nhân Hóa (Toán - Lý - Anh)',
];

export function PublicLandingPage({
  onOpenLogin,
  onRegisterLead,
  courses = mockCoursesCatalog,
  onCompleteEnrollment,
}: PublicLandingPageProps) {
  const { showToast } = useToast();

  // Category filter state for courses
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ielts' | 'math' | 'science' | 'literature' | 'tutoring'>('all');
  const [gradeLevelFilter, setGradeLevelFilter] = useState<'all' | 'primary' | 'secondary' | 'high' | 'exam'>('all');
  const [courseSearch, setCourseSearch] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Selected course for detail modal
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  // Selected course for 4-step enrollment modal
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Lead Form States (Hero & Bottom Form)
  const [leadStudentName, setLeadStudentName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadGrade, setLeadGrade] = useState('Lớp 10');
  const [leadCourse, setLeadCourse] = useState('IELTS Academic Master 7.0+ Toàn Diện (4 Kỹ Năng)');
  const [leadNotes, setLeadNotes] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');

  // Draft persistence to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentName) setLeadStudentName(parsed.studentName);
        if (parsed.phone) setLeadPhone(parsed.phone);
        if (parsed.email) setLeadEmail(parsed.email);
        if (parsed.grade) setLeadGrade(parsed.grade);
        if (parsed.course) setLeadCourse(parsed.course);
        if (parsed.notes) setLeadNotes(parsed.notes);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (leadStudentName || leadPhone || leadEmail || leadNotes) {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            studentName: leadStudentName,
            phone: leadPhone,
            email: leadEmail,
            grade: leadGrade,
            course: leadCourse,
            notes: leadNotes,
          })
        );
      }
    } catch {}
  }, [leadStudentName, leadPhone, leadEmail, leadGrade, leadCourse, leadNotes]);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadStudentName.trim() || !leadPhone.trim()) {
      showToast('Vui lòng nhập họ tên và số điện thoại liên hệ!', 'warning');
      return;
    }

    const cleanPhone = leadPhone.replace(/[\s.-]/g, '');
    if (!VIETNAMESE_PHONE_REGEX.test(cleanPhone)) {
      showToast('Số điện thoại không hợp lệ! Vui lòng nhập số di động Việt Nam 10 chữ số (đầu 03, 05, 07, 08, 09).', 'warning');
      return;
    }

    if (leadEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail.trim())) {
      showToast('Địa chỉ email không đúng định dạng!', 'warning');
      return;
    }

    const genCode = `TS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setRegistrationCode(genCode);

    if (onRegisterLead) {
      onRegisterLead({
        studentName: leadStudentName.trim(),
        grade: leadGrade,
        parentName: 'Phụ huynh ' + leadStudentName.trim(),
        parentPhone: cleanPhone,
        studentEmail: leadEmail.trim() || `${leadStudentName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        desiredCourse: leadCourse,
        consultantId: 'adm-marketing',
        consultantName: 'Đỗ Minh Đức (Tuyển Sinh Online)',
        notes: `${leadNotes ? leadNotes + ' | ' : ''}Mã tư vấn: ${genCode}`,
      });
    }

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}

    setIsSubmittedSuccess(true);
    showToast(`Đăng ký thành công! Mã tiếp nhận tuyển sinh: ${genCode}. Chuyên viên sẽ liên hệ trong 15 phút.`, 'success');
  };

  const handleSelectTuitionPlan = (plan: TuitionPlanSelection) => {
    setLeadCourse(`${plan.subject} - ${plan.grade} (${plan.format})`);
    setLeadGrade(plan.grade);
    setLeadNotes(`Tra cứu học phí: ${formatVND(plan.finalPrice)} / ${plan.cycle} (${plan.totalSessions} buổi)`);
    showToast(`Đã áp dụng mức học phí ${formatVND(plan.finalPrice)} cho môn ${plan.subject}! Vui lòng điền thông tin để hoàn tất.`, 'info');
  };

  const courseList = courses && courses.length > 0 ? courses : mockCoursesCatalog;

  const filteredCourses = useMemo(() => {
    let result = courseList.filter((course) => {
      // Category filter
      if (selectedCategory === 'ielts' && course.subject !== 'english') return false;
      if (selectedCategory === 'math' && course.subject !== 'math') return false;
      if (selectedCategory === 'science' && course.subject !== 'science') return false;
      if (selectedCategory === 'literature' && course.subject !== 'literature') return false;
      if (selectedCategory === 'tutoring' && course.subject !== 'other') return false;

      // Grade level filter
      if (gradeLevelFilter !== 'all') {
        const gl = (course.gradeLevel || '').toLowerCase();
        if (gradeLevelFilter === 'primary' && !gl.includes('tiểu học') && !gl.includes('1') && !gl.includes('2') && !gl.includes('3') && !gl.includes('4') && !gl.includes('5')) return false;
        if (gradeLevelFilter === 'secondary' && !gl.includes('thcs') && !gl.includes('6') && !gl.includes('7') && !gl.includes('8') && !gl.includes('9')) return false;
        if (gradeLevelFilter === 'high' && !gl.includes('thpt') && !gl.includes('10') && !gl.includes('11') && !gl.includes('12')) return false;
        if (gradeLevelFilter === 'exam' && !gl.includes('luyện thi') && !gl.includes('đgnl') && !gl.includes('ielts') && !gl.includes('đại học')) return false;
      }

      // Keyword search
      if (courseSearch.trim()) {
        const q = courseSearch.toLowerCase().trim();
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchDesc = ((course.description || course.courseOverview || '')).toLowerCase().includes(q);
        const matchTutor = (course.tutorName || '').toLowerCase().includes(q);
        const matchCode = (course.code || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTutor && !matchCode) return false;
      }

      return true;
    });

    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => (a.price ?? (a as any).tuitionFee ?? 0) - (b.price ?? (a as any).tuitionFee ?? 0));
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => (b.price ?? (b as any).tuitionFee ?? 0) - (a.price ?? (a as any).tuitionFee ?? 0));
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return result;
  }, [courseList, selectedCategory, gradeLevelFilter, courseSearch, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <PublicNavbar onOpenLogin={onOpenLogin} />

      {/* ============================================================ */}
      {/* 1. HERO SECTION (Marketing Focused - ZIM Academy Inspired)   */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-[#F5F3EF] via-[#F8F7F4] to-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-900 shadow-sm">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
                <span>HỆ THỐNG ĐÀO TẠO & LUYỆN THI CHẤT LƯỢNG CAO • CAM KẾT ĐẦU RA BẰNG VĂN BẢN</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.15]">
                Học Tập Cá Nhân Hóa,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-600 to-primary">
                  Bứt Phá Điểm Số
                </span>{' '}
                & Chinh Phục Mục Tiêu
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
                Rút ngắn <strong className="text-slate-900 font-bold">80% thời gian tự học</strong> với phương pháp đào tạo cá nhân hóa chuyên sâu. Cam kết đầu ra bằng văn bản pháp lý cho các kỳ thi <strong className="text-slate-900">IELTS 7.0+</strong>, <strong className="text-slate-900">Tuyển sinh 10 Chuyên</strong> và <strong className="text-slate-900">THPT Quốc Gia / ĐGNL</strong>.
              </p>

              {/* Core USPs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Cam Kết Đầu Ra Bằng Văn Bản</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Học lại miễn phí 100% nếu không đạt mục tiêu cam kết.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="p-1.5 bg-sky-100 text-sky-700 rounded-xl shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Lộ Trình Cá Nhân Hóa 1:1</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Thiết kế theo chính xác năng lực và mục tiêu từng học sinh.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="p-1.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Giảng Viên Top 1% Tinh Hoa</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Thủ khoa ĐH Sư Phạm, IELTS 8.5+ & Thạc sĩ nhiều năm kinh nghiệm.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-xl shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Sĩ Số Vàng (Tối Đa 4 - 6 Bạn)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Thầy cô tương tác 100% thời lượng, sửa bài chi tiết từng câu.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3.5">
                <a
                  href="#register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  <span>Đăng Ký Tư Vấn & Test Trình Độ Miễn Phí</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#courses"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-300 shadow-sm transition-all text-center"
                >
                  Khám Phá Các Khóa Học 2026
                </a>
              </div>
            </div>

            {/* Right Card: Quick Lead Consultation Form (5 Cols) */}
            <div id="register" className="lg:col-span-5">
              <div id="admissions-form" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 relative">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Đăng Ký Nhận Lộ Trình Học Cá Nhân Hóa
                    </h3>
                    <p className="text-xs text-slate-500">
                      Miễn phí 100% bài kiểm tra năng lực & tư vấn 1:1 cùng Chuyên gia
                    </p>
                  </div>
                </div>

                {isSubmittedSuccess ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg text-slate-900">Đăng Ký Thành Công!</h4>
                    {registrationCode && (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-amber-400 font-mono text-xs font-bold shadow-sm">
                        <span className="text-slate-400 font-normal">Mã tiếp nhận:</span>
                        <span className="tracking-wider">{registrationCode}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Chuyên viên tư vấn của EduConnect sẽ liên hệ với bạn qua SĐT <strong>{leadPhone}</strong> trong vòng 15 phút để gửi tài liệu & xếp lịch kiểm tra miễn phí.
                    </p>
                    <button
                      onClick={() => setIsSubmittedSuccess(false)}
                      className="text-xs text-primary font-bold hover:underline block mx-auto pt-2"
                    >
                      Đăng ký cho học viên khác →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3.5 mt-4">
                    {leadNotes && leadNotes.includes('Tra cứu học phí:') && (
                      <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2 shadow-sm">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-amber-950">Gói học phí đã chọn từ Bảng tính:</p>
                          <p className="text-[11px] text-amber-900 font-medium mt-0.5">{leadCourse} — {leadNotes}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Họ và tên học sinh / phụ huynh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Hoàng Minh Châu"
                        value={leadStudentName}
                        onChange={(e) => setLeadStudentName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Số điện thoại liên hệ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Ví dụ: 0912 345 678"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Khối lớp hiện tại
                        </label>
                        <select
                          id="leadGrade"
                          value={leadGrade}
                          onChange={(e) => setLeadGrade(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                        >
                          {leadGrade && !STANDARD_GRADE_OPTIONS.includes(leadGrade) && (
                            <option value={leadGrade}>{leadGrade}</option>
                          )}
                          <option value="Lớp 1">Lớp 1</option>
                          <option value="Lớp 2">Lớp 2</option>
                          <option value="Lớp 3">Lớp 3</option>
                          <option value="Lớp 4">Lớp 4</option>
                          <option value="Lớp 5">Lớp 5</option>
                          <option value="Lớp 5 (Chuyển cấp)">Lớp 5 (Chuyển cấp)</option>
                          <option value="Lớp 6">Lớp 6</option>
                          <option value="Lớp 7">Lớp 7</option>
                          <option value="Lớp 8">Lớp 8</option>
                          <option value="Lớp 9 (Thi vào 10)">Lớp 9 (Thi vào 10)</option>
                          <option value="Lớp 9 (Luyện thi vào 10)">Lớp 9 (Luyện thi vào 10)</option>
                          <option value="Lớp 10">Lớp 10</option>
                          <option value="Lớp 11">Lớp 11</option>
                          <option value="Lớp 12 (Luyện thi ĐH)">Lớp 12 (Luyện thi ĐH)</option>
                          <option value="Lớp 12 & Ôn Thi ĐH">Lớp 12 & Ôn Thi ĐH</option>
                          <option value="Đại học / Người đi làm">Đại học / Người đi làm</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email nhận tài liệu học tập
                      </label>
                      <input
                        type="email"
                        placeholder="vd: minhchau@gmail.com"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chương trình đào tạo quan tâm <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="leadCourse"
                        value={leadCourse}
                        onChange={(e) => setLeadCourse(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-800"
                      >
                        {leadCourse && !STANDARD_COURSE_OPTIONS.includes(leadCourse) && (
                          <option value={leadCourse}>{leadCourse}</option>
                        )}
                        <option value="IELTS Academic Master 7.0+ Toàn Diện (4 Kỹ Năng)">Luyện thi IELTS 7.0+ (Cam kết đầu ra)</option>
                        <option value="Toán Học Tuyển Sinh 10 Chuyên (KHTN, Sư Phạm, Ams)">Toán học Tuyển sinh 10 Chuyên & THPT Top 1</option>
                        <option value="Toán 12 - Chinh Phục Điểm 9+ THPT Quốc Gia & ĐGNL">Toán 12 Bứt phá 9+ THPT QG & ĐGNL</option>
                        <option value="Vật Lý 11 - 12 Cốt Lõi & Luyện Đề Đánh Giá Năng Lực">Vật Lý 11 - 12 Chuyên sâu & ĐGNL</option>
                        <option value="Ngữ Văn 9 - Bí Quyết Viết Nghị Luận Điểm 9 Vào 10">Ngữ Văn 9 Luyện thi vào 10 chuyên</option>
                        <option value="Toán Tiểu Học (Lớp 1 - 5) - Phát Triển Tư Duy Nền Tảng">Toán Tiểu học (Lớp 1 - 5) - Phát triển tư duy</option>
                        <option value="Tiếng Anh Tiểu Học (Lớp 1 - 5) - Chuẩn Cambridge">Tiếng Anh Tiểu học (Lớp 1 - 5) - Cambridge</option>
                        <option value="Gia Sư Kèm Riêng 1:1 Cá Nhân Hóa (Toán - Lý - Anh)">Gia sư kèm riêng 1:1 cá nhân hóa</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-amber-400 border border-amber-500/30 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-slate-950/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nhận Tư Vấn Lộ Trình & Test Miễn Phí</span>
                    </button>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>🔒 Cam kết bảo mật thông tin 100%</span>
                      <span>⚡ Phản hồi trong 15 phút</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STATS & CREDIBILITY BAR (ZIM Style)                       */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-100">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-red-600 block">15,000+</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học Viên Đạt Mục Tiêu</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 block">98.8%</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đỗ Trường Chuyên & Đạt Band</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 block">Top 1%</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giảng Viên Tinh Hoa Tuyển Chọn</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">100%</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cam Kết Đầu Ra Bằng Văn Bản</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FEATURED COURSES MARKETING SHOWCASE (ZIM Course Catalog)  */}
      {/* ============================================================ */}
      <section id="courses" className="py-20 max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Chương Trình Đào Tạo Chuẩn Đầu Ra
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Lộ Trình Đào Tạo Toàn Diện, Cam Kết Bứt Phá Điểm Số
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Các khóa học được thiết kế khoa học, kết hợp giữa bài giảng chuyên sâu của Giảng viên và hệ sinh thái luyện đề, chấm chữa bài 24/7.
          </p>
        </div>

        {/* Category Tabs Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất Cả Khóa Học ({mockCoursesCatalog.length})
          </button>
          <button
            onClick={() => setSelectedCategory('ielts')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'ielts'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-red-50 border border-slate-200'
            }`}
          >
            Luyện Thi IELTS & Chứng Chỉ
          </button>
          <button
            onClick={() => setSelectedCategory('math')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'math'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-red-50 border border-slate-200'
            }`}
          >
            Toán Chuyên & Tuyển Sinh 10
          </button>
          <button
            onClick={() => setSelectedCategory('science')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'science'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-red-50 border border-slate-200'
            }`}
          >
            Vật Lý & Luyện Thi ĐGNL
          </button>
          <button
            onClick={() => setSelectedCategory('literature')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'literature'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-red-50 border border-slate-200'
            }`}
          >
            Ngữ Văn 9 Vào 10 Chuyên
          </button>
          <button
            onClick={() => setSelectedCategory('tutoring')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'tutoring'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-red-50 border border-slate-200'
            }`}
          >
            Gia Sư Kèm Riêng 1:1
          </button>
        </div>

        {/* Search, Grade Level Filter & Sorting Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Tìm khóa học theo môn, tên khóa, mã lớp, hoặc giáo viên..."
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all placeholder:text-slate-400"
              />
              {courseSearch && (
                <button
                  onClick={() => setCourseSearch('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-4 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sắp xếp khóa học"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 cursor-pointer"
              >
                <option value="featured">✨ Sắp xếp: Khóa nổi bật</option>
                <option value="price_asc">📈 Học phí: Thấp đến cao</option>
                <option value="price_desc">📉 Học phí: Cao đến thấp</option>
                <option value="rating">⭐ Đánh giá: Cao nhất</option>
              </select>
            </div>
          </div>

          {/* Grade Level Pills & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Khối lớp:</span>
              <button
                onClick={() => setGradeLevelFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gradeLevelFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setGradeLevelFilter('primary')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gradeLevelFilter === 'primary'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tiểu học (1 - 5)
              </button>
              <button
                onClick={() => setGradeLevelFilter('secondary')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gradeLevelFilter === 'secondary'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                THCS (6 - 9)
              </button>
              <button
                onClick={() => setGradeLevelFilter('high')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gradeLevelFilter === 'high'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                THPT (10 - 12)
              </button>
              <button
                onClick={() => setGradeLevelFilter('exam')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gradeLevelFilter === 'exam'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Luyện thi & ĐGNL
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Tìm thấy <strong className="text-slate-900 font-bold">{filteredCourses.length}</strong> khóa học
              </span>
              {(courseSearch || gradeLevelFilter !== 'all' || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setCourseSearch('');
                    setGradeLevelFilter('all');
                    setSelectedCategory('all');
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty state if filteredCourses is empty */}
        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-800">Không tìm thấy khóa học phù hợp</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có khóa học nào khớp với từ khóa hoặc bộ lọc đã chọn. Vui lòng thử tìm kiếm với điều kiện khác.
            </p>
            <button
              onClick={() => {
                setCourseSearch('');
                setGradeLevelFilter('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors inline-block mt-2"
            >
              Xem tất cả khóa học
            </button>
          </div>
        )}

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Banner with Badge */}
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.bannerImage}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {course.commitmentBadge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {course.commitmentBadge}
                  </span>
                )}
                {course.originalPrice && (
                  <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                    GIẢM 25%
                  </span>
                )}
                <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {course.gradeLevel}
                </span>
              </div>

              {/* Course Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  {/* Tutor info pill */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.tutorAvatar}
                      alt={course.tutorName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-xs text-slate-900 block truncate">{course.tutorName}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{course.tutorTitle || 'Giảng viên chuyên môn cao'}</span>
                    </div>
                  </div>

                  {course.courseOverview && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.courseOverview}
                    </p>
                  )}

                  {/* Course Features Checklist */}
                  <div className="space-y-1.5 pt-1">
                    {course.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                    <span>Thời lượng: <strong className="text-slate-800">{course.duration}</strong></span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {course.rating} ({course.enrolledCount} học viên)
                    </span>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    {course.originalPrice && (
                      <span className="text-xs text-slate-400 line-through block">
                        {formatVND(course.originalPrice)}
                      </span>
                    )}
                    <span className="font-black text-lg text-red-600 block leading-none">
                      {formatVND(course.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCourseForModal(course)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourseForEnroll(course);
                        setIsEnrollModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all whitespace-nowrap"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3.5 DYNAMIC TUITION CALCULATOR (Tra Cứu Học Phí Dự Kiến)    */}
      {/* ============================================================ */}
      <TuitionCalculator onSelectPlan={handleSelectTuitionPlan} />

      {/* ============================================================ */}
      {/* 4. FACULTY & TUTORS SHOWCASE (ZIM Elite Teacher Profiles)    */}
      {/* ============================================================ */}
      <section id="tutors" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Đội Ngũ Giảng Viên Hàng Đầu
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Những Người Thầy Truyền Cảm Hứng & Dẫn Dắt Thành Công
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Chỉ <strong className="text-slate-900 font-bold">1.5% ứng viên</strong> vượt qua quy trình tuyển chọn 5 vòng khắt khe của EduConnect. 100% giáo viên sở hữu bằng Cử nhân/Thạc sĩ xuất sắc và chứng chỉ giảng dạy quốc tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-[#F8F7F4] rounded-3xl p-6 border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 text-center group"
              >
                <div className="space-y-3">
                  {/* Portrait Avatar */}
                  <div className="relative inline-block mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tutor.avatar}
                      alt={tutor.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-0 right-1 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-white shadow-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Name & Badge */}
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider mb-1">
                      {tutor.badgeTitle || 'Giảng viên chuyên môn cao'}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">{tutor.name}</h3>
                    <span className="text-xs font-semibold text-slate-500 block mt-0.5">{tutor.subject}</span>
                  </div>

                  {/* Star rating & Experience */}
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-bold text-amber-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {tutor.rating} / 5.0
                    </span>
                    <span className="text-slate-500 font-medium">
                      {tutor.experienceYears || 7}+ năm kinh nghiệm
                    </span>
                  </div>

                  {/* Quote */}
                  {tutor.quote && (
                    <p className="text-xs text-slate-600 italic bg-white p-3 rounded-2xl border border-slate-200/60 leading-relaxed">
                      &ldquo;{tutor.quote}&rdquo;
                    </p>
                  )}

                  {/* Key Achievements */}
                  {tutor.achievements && (
                    <div className="text-left space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Thành tích tiêu biểu:</span>
                      {tutor.achievements.slice(0, 2).map((ach, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{ach}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <a
                  href="#register"
                  onClick={() => {
                    setLeadCourse(`Học cùng ${tutor.name} (${tutor.subject})`);
                    setLeadNotes(`Muốn xếp lịch học cùng ${tutor.name}`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Đăng ký học cùng Thầy/Cô</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. METHODOLOGY & PERSONALIZED SYSTEM (ZIM Style)             */}
      {/* ============================================================ */}
      <section id="method" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Phương Pháp Đào Tạo Độc Quyền
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hệ Thống Học Tập Cá Nhân Hóa Toàn Diện
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Không áp dụng một giáo trình đại trà cho tất cả. Mỗi học viên được khảo sát chính xác điểm yếu để xây dựng lộ trình bứt phá nhanh nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-black text-lg">
              01
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Kiểm Tra Năng Lực Chuẩn Hóa</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bài test 4 kỹ năng được thiết kế theo format chuẩn của kỳ thi thật, giúp phát hiện chính xác lỗ hổng kiến thức và thói quen làm bài chưa tối ưu.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">
              02
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Thiết Kế Lộ Trình Riêng Biệt</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Xây dựng kế hoạch học tập theo từng tuần, tập trung 80% thời gian rèn luyện những dạng bài học sinh còn yếu để nâng điểm thần tốc.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg">
              03
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Lớp Sĩ Số Vàng (4 - 6 Bạn)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quy mô lớp nhỏ hoặc kèm 1:1 đảm bảo giảng viên tương tác trực tiếp, theo sát từng bước giải và uốn nắn phát âm ngay trong buổi học.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
              04
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Chấm Chữa Bài Tập Chi Tiết 24/7</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Học sinh nộp bài tập về nhà trên hệ thống và nhận lời phê, audio nhận xét chi tiết từng câu trong 24 giờ từ chính giảng viên phụ trách.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. HALL OF FAME & TESTIMONIALS (Bảng Vàng Thành Tích)        */}
      {/* ============================================================ */}
      <section id="reviews" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Bảng Vàng Thành Tích
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tự Hào Cùng Hơn 15,000 Học Viên Chinh Phục Điểm Số Mơ Ước
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Mỗi điểm số ấn tượng là minh chứng rõ nét cho sự tận tâm của đội ngũ thầy cô và phương pháp học tập hiệu quả tại EduConnect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student 1 */}
            <div className="bg-[#F8F7F4] rounded-3xl p-6 border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Hoàng Minh Châu"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Hoàng Minh Châu</h4>
                    <span className="text-[11px] text-slate-500 block">Lớp 11 Chuyên Ngoại Ngữ</span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200/60 text-red-900">
                  <span className="text-2xl font-black block">8.0 IELTS</span>
                  <span className="text-[11px] font-bold opacity-80">Listening 8.5 • Reading 9.0</span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;Cô Linh sửa bài Writing cực kỳ chi tiết, chỉ ra từng lỗi dùng từ chưa tự nhiên. Sau khóa học 3 tháng em đã tự tin bứt phá từ 6.5 lên thẳng 8.0!&rdquo;
                </p>
              </div>
            </div>

            {/* Student 2 */}
            <div className="bg-[#F8F7F4] rounded-3xl p-6 border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                    alt="Trần Gia Bảo"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Trần Gia Bảo</h4>
                    <span className="text-[11px] text-slate-500 block">Thủ khoa Chuyên KHTN</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-amber-900">
                  <span className="text-2xl font-black block">Toán 9.75</span>
                  <span className="text-[11px] font-bold opacity-80">Thủ khoa môn Toán vào 10</span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;Thầy Hoàng dạy tư duy hình học và bất đẳng thức cực kỳ sáng tạo. Nhờ thầy mà những bài toán điểm 10 trở nên dễ hiểu hơn rất nhiều.&rdquo;
                </p>
              </div>
            </div>

            {/* Student 3 */}
            <div className="bg-[#F8F7F4] rounded-3xl p-6 border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                    alt="Đỗ Thùy Trang"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Đỗ Thùy Trang</h4>
                    <span className="text-[11px] text-slate-500 block">Đỗ ĐH Ngoại Thương D01</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/60 text-emerald-900">
                  <span className="text-2xl font-black block">28.8 Điểm</span>
                  <span className="text-[11px] font-bold opacity-80">Toán 9.6 • Tiếng Anh 9.8</span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;Các bài giảng trực quan và ngân hàng đề thi bám sát cấu trúc Bộ GD đã giúp em rèn phản xạ bấm máy tính và làm bài thi rất bình tĩnh.&rdquo;
                </p>
              </div>
            </div>

            {/* Student 4 */}
            <div className="bg-[#F8F7F4] rounded-3xl p-6 border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Lê Hoàng Nam"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Lê Hoàng Nam</h4>
                    <span className="text-[11px] text-slate-500 block">Lớp 12 Chuyên Lê Hồng Phong</span>
                  </div>
                </div>
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200/60 text-sky-900">
                  <span className="text-2xl font-black block">Vật Lý 9.5</span>
                  <span className="text-[11px] font-bold opacity-80">980/1200 Điểm ĐGNL</span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;Phương pháp mô phỏng 3D của thầy Quang giúp em hiểu sâu bản chất phần Điện xoay chiều và Sóng cơ mà trước đây em hay bị nhầm lẫn.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FINAL ENROLLMENT CTA (ZIM Style Campaign Banner)          */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white rounded-4xl p-10 md:p-14 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
              Ưu Đãi Đặc Biệt Khai Giảng Tháng 09/2026
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Sẵn Sàng Bứt Phá Điểm Số Cùng Đội Ngũ Giảng Viên Hàng Đầu?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Đăng ký ngay hôm nay để nhận trọn bộ quà tặng: 01 buổi Test trình độ chuyên sâu 1:1 cùng Giảng viên, Bộ đề thi thử độc quyền 2026 và ưu đãi giảm 20% học phí khóa học!
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Đăng Ký Nhận Ưu Đãi 20% Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Đăng Nhập Cổng Học Viên / Giảng Viên</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span>Hotline tư vấn 24/7: <strong className="text-white">1900 8888</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-white">tuyensinh@educonnect.vn</strong></span>
            </div>
          </div>

          {/* Ambient Glows */}
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. MODAL CHI TIẾT KHÓA HỌC & ĐĂNG KÝ (Course Detail Modal)   */}
      {/* ============================================================ */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                  {selectedCourseForModal.gradeLevel}
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                  {selectedCourseForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourseForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course details */}
            <div className="space-y-4 text-xs text-slate-600">
              {/* Tutor badge */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCourseForModal.tutorAvatar}
                  alt={selectedCourseForModal.tutorName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <span className="font-bold text-sm text-slate-900 block">{selectedCourseForModal.tutorName}</span>
                  <span className="text-xs text-slate-500">{selectedCourseForModal.tutorTitle || 'Giảng viên chuyên môn cao'}</span>
                </div>
              </div>

              {selectedCourseForModal.courseOverview && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Mục tiêu & Nội dung:</h4>
                  <p className="leading-relaxed bg-[#F8F7F4] p-3.5 rounded-2xl border border-slate-200/60">
                    {selectedCourseForModal.courseOverview}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block font-medium">Thời lượng đào tạo:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedCourseForModal.duration}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block font-medium">Lịch học hàng tuần:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedCourseForModal.scheduleDescription}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Đặc quyền học viên:</h4>
                <div className="space-y-1.5">
                  {selectedCourseForModal.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-red-600 font-bold block uppercase tracking-wider">Học phí ưu đãi tháng 09:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-red-700">{formatVND(selectedCourseForModal.price)}</span>
                    {selectedCourseForModal.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">{formatVND(selectedCourseForModal.originalPrice)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourseForEnroll(selectedCourseForModal);
                    setIsEnrollModalOpen(true);
                    setSelectedCourseForModal(null);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Đăng ký 4 bước ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Course Enrollment Modal */}
      <CourseEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        selectedCourse={selectedCourseForEnroll}
        onCompleteEnrollment={(reg) => {
          if (onCompleteEnrollment) {
            onCompleteEnrollment(reg);
          }
          setIsEnrollModalOpen(false);
        }}
      />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
