'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Copy,
  Check,
  QrCode,
  FileCheck2,
  Video,
  MapPin,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Course, CourseRegistration, CourseRegistrationStep, SubjectType } from '@/types';
import { formatVND } from '@/lib/utils';
import { useToast } from '@/components/shared/ToastNotification';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: Course | null;
  currentStudentName?: string;
  currentStudentPhone?: string;
  currentStudentEmail?: string;
  currentGrade?: string;
  onCompleteEnrollment: (registration: CourseRegistration) => void;
  // External registration state if exists
  activeRegistration?: CourseRegistration | null;
  onUpdateRegistration?: (reg: CourseRegistration) => void;
}

export function CourseEnrollmentModal({
  isOpen,
  onClose,
  selectedCourse,
  currentStudentName = 'Nguyễn Minh Quân',
  currentStudentPhone = '0909 112 233',
  currentStudentEmail = 'quan.nguyen@educonnect.vn',
  currentGrade = 'Lớp 12',
  onCompleteEnrollment,
  activeRegistration,
  onUpdateRegistration,
}: CourseEnrollmentModalProps) {
  const { showToast } = useToast();

  const [step, setStep] = useState<CourseRegistrationStep>(1);

  // Form Step 1: Student info
  const [studentName, setStudentName] = useState(currentStudentName);
  const [studentPhone, setStudentPhone] = useState(currentStudentPhone);
  const [studentEmail, setStudentEmail] = useState(currentStudentEmail);
  const [grade, setGrade] = useState(currentGrade);
  const [targetGoal, setTargetGoal] = useState('Đạt điểm 8.0+ và hoàn thành xuất sắc mục tiêu');

  // Form Step 2: Confirmation & schedule
  const [selectedSchedule, setSelectedSchedule] = useState(
    selectedCourse?.scheduleDescription || 'Thứ 3 & Thứ 6 (19:30 - 21:00)'
  );
  const [learningFormat, setLearningFormat] = useState<'online' | 'offline'>('online');
  const [confirmedTerms, setConfirmedTerms] = useState(false);

  // Step 3 & 4 data
  const [registrationData, setRegistrationData] = useState<CourseRegistration | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (selectedCourse) {
      setSelectedSchedule(selectedCourse.scheduleDescription);
    }
  }, [selectedCourse]);

  // If there's an active registration passed from props, resume that step
  useEffect(() => {
    if (activeRegistration) {
      setRegistrationData(activeRegistration);
      setStep(activeRegistration.currentStep);
    }
  }, [activeRegistration]);

  if (!isOpen || !selectedCourse) return null;

  // STEP 1 SUBMIT -> TO STEP 2
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên và số điện thoại!', 'warning');
      return;
    }
    setStep(2);
  };

  // STEP 2 SUBMIT -> TO STEP 3 (Send to Center)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedTerms) {
      showToast('Vui lòng xác nhận đồng ý với lịch học và nội quy khóa học!', 'warning');
      return;
    }

    const regCode = `DK-${selectedCourse.subject.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg: CourseRegistration = {
      id: `reg-${Date.now()}`,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      subject: selectedCourse.subject,
      tutorName: selectedCourse.tutorName,
      tutorAvatar: selectedCourse.tutorAvatar,
      price: selectedCourse.price,
      duration: selectedCourse.duration,
      scheduleDescription: selectedCourse.scheduleDescription,
      studentName: studentName.trim(),
      studentPhone: studentPhone.trim(),
      studentEmail: studentEmail.trim(),
      grade: grade.trim(),
      targetGoal: targetGoal.trim(),
      selectedSchedule,
      learningFormat,
      confirmedTerms: true,
      centerStatus: 'pending',
      paymentStatus: 'unpaid',
      paymentCode: regCode,
      currentStep: 3,
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    setRegistrationData(newReg);
    if (onUpdateRegistration) {
      onUpdateRegistration(newReg);
    }
    setStep(3);
    showToast('Đã gửi thông tin lớp học lên Ban Học Vụ trung tâm!', 'info');
  };

  // STEP 4 COMPLETE PAYMENT -> ENROLL COURSE
  const handleCompletePayment = () => {
    if (!registrationData) return;

    const completedReg: CourseRegistration = {
      ...registrationData,
      paymentStatus: 'paid',
      paidAt: new Date().toLocaleString('vi-VN'),
      currentStep: 4,
    };

    setRegistrationData(completedReg);
    onCompleteEnrollment(completedReg);
    showToast(`Thanh toán thành công! Khóa học "${selectedCourse.title}" đã chính thức được kích hoạt.`, 'success');
    onClose();
  };

  const copyPaymentCode = () => {
    if (registrationData?.paymentCode) {
      navigator.clipboard.writeText(registrationData.paymentCode);
      setCopiedCode(true);
      showToast('Đã sao chép mã thanh toán!', 'info');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 relative max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                Quy Trình 4 Bước
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Đăng Ký Khóa Học Mới
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
              {selectedCourse.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-STEP WIZARD PROGRESS BAR */}
        <div className="py-4 border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Step 1 */}
            <div className="space-y-1">
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > 1
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : step === 1
                    ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-[10px] font-bold block ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                1. Đăng ký
              </span>
            </div>

            {/* Step 2 */}
            <div className="space-y-1">
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > 2
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : step === 2
                    ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className={`text-[10px] font-bold block ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                2. Xác nhận lớp
              </span>
            </div>

            {/* Step 3 */}
            <div className="space-y-1">
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > 3
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : step === 3
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span className={`text-[10px] font-bold block ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                3. Chờ trung tâm
              </span>
            </div>

            {/* Step 4 */}
            <div className="space-y-1">
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  registrationData?.paymentStatus === 'paid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : step === 4
                    ? 'bg-red-600 text-white ring-4 ring-red-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {registrationData?.paymentStatus === 'paid' ? <Check className="w-4 h-4" /> : '4'}
              </div>
              <span className={`text-[10px] font-bold block ${step === 4 ? 'text-red-600' : 'text-slate-400'}`}>
                4. Thanh toán
              </span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE STEP CONTENT BODY */}
        <div className="overflow-y-auto pr-1 py-4 flex-1 space-y-4">
          {/* ============================================================ */}
          {/* BƯỚC 1: ĐĂNG KÝ TRÊN HỆ THỐNG                                */}
          {/* ============================================================ */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-900">
                    Bước 1: Điền thông tin đăng ký học viên
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Hệ thống sẽ lưu hồ sơ và chuẩn bị phương án xếp lịch học tối ưu cho bạn.
                  </p>
                </div>
              </div>

              {/* Course Brief Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCourse.bannerImage}
                  alt={selectedCourse.title}
                  className="w-16 h-14 object-cover rounded-xl shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-slate-900 block truncate">{selectedCourse.title}</span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    Giảng viên: {selectedCourse.tutorName} • {selectedCourse.duration}
                  </span>
                  <span className="text-xs font-black text-red-600 block mt-0.5">
                    {formatVND(selectedCourse.price)}
                  </span>
                </div>
              </div>

              {/* Student info fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email nhận thông báo tài khoản & bài giảng
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khối lớp hiện tại
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mục tiêu điểm số / Nguyện vọng học viên
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="VD: Đạt 7.5 IELTS trong 4 tháng, Thi đỗ Chuyên Sư Phạm..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Tiếp Tục: Xác Nhận Lớp & Lịch Dạy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 2: XÁC NHẬN LẠI THÔNG TIN CỦA LỚP HỌC VÀ LỊCH DẠY       */}
          {/* ============================================================ */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center gap-3">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-xl shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-sky-900">
                    Bước 2: Xác nhận thông tin lớp học & lịch dạy
                  </h4>
                  <p className="text-[11px] text-sky-700 mt-0.5">
                    Vui lòng chọn khung giờ học và hình thức phù hợp trước khi gửi yêu cầu lên trung tâm.
                  </p>
                </div>
              </div>

              {/* Course Detail Confirmation Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs font-bold text-slate-900">Khóa học đăng ký:</span>
                  <span className="text-xs font-black text-slate-900">{selectedCourse.title}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs text-slate-600">Giảng viên đứng lớp:</span>
                  <div className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedCourse.tutorAvatar} alt={selectedCourse.tutorName} className="w-5 h-5 rounded-full" />
                    <strong className="text-xs text-slate-900">{selectedCourse.tutorName}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs text-slate-600">Thời lượng chương trình:</span>
                  <strong className="text-xs text-slate-900">{selectedCourse.duration}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Học phí trọn gói:</span>
                  <strong className="text-sm font-black text-red-600">{formatVND(selectedCourse.price)}</strong>
                </div>
              </div>

              {/* Choose Schedule Slot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lựa chọn ca học / Lịch dạy trong tuần <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    selectedCourse.scheduleDescription,
                    'Ca tối 2: Thứ 2 & Thứ 5 (18:00 - 19:30)',
                    'Ca cuối tuần: Thứ 7 & Chủ Nhật (09:00 - 10:30)',
                  ].map((sched, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedSchedule === sched
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="schedule"
                        value={sched}
                        checked={selectedSchedule === sched}
                        onChange={() => setSelectedSchedule(sched)}
                        className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-xs font-bold">{sched}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format selection: Online vs Offline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hình thức tham gia lớp học <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLearningFormat('online')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      learningFormat === 'online'
                        ? 'bg-sky-50 border-sky-400 text-sky-950 ring-2 ring-sky-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Video className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs">Trực Tuyến (Google Meet)</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Tương tác 1:1, ghi hình buổi học xem lại</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLearningFormat('offline')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      learningFormat === 'offline'
                        ? 'bg-purple-50 border-purple-400 text-purple-950 ring-2 ring-purple-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs">Trực Tiếp Tại Trung Tâm</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Phòng máy lạnh, sĩ số vàng 4 - 6 bạn</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmedTerms}
                  onChange={(e) => setConfirmedTerms(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900 mt-0.5"
                />
                <span className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  Tôi đã xác nhận lại chính xác thông tin lớp học, giảng viên phụ trách, lịch học đã chọn và cam kết chấp hành quy chế học vụ của trung tâm EduConnect.
                </span>
              </label>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Gửi Hồ Sơ Lên Trung Tâm (Bước 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 3: CHỜ XÁC NHẬN CỦA TRUNG TÂM                            */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-white animate-spin" />
                </div>
                <h3 className="font-extrabold text-base">
                  Bước 3: Chờ Xác Nhận Của Trung Tâm
                </h3>
                <p className="text-xs text-amber-100 max-w-sm mx-auto leading-relaxed">
                  Hồ sơ đăng ký của bạn đã được gửi tới <strong>Phòng Học Vụ EduConnect</strong>. Ban Học vụ đang đối soát lịch trống của Giảng viên và xếp phòng học.
                </p>
              </div>

              {/* Information Snapshot */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mã đơn đăng ký:</span>
                  <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {registrationData?.paymentCode}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Học sinh đăng ký:</span>
                  <strong className="text-slate-900">{registrationData?.studentName} ({registrationData?.grade})</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Khóa học:</span>
                  <strong className="text-slate-900">{registrationData?.courseTitle}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lịch học đã xác nhận:</span>
                  <strong className="text-amber-700">{registrationData?.selectedSchedule}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hình thức đào tạo:</span>
                  <span className="font-bold text-slate-800">
                    {registrationData?.learningFormat === 'online' ? 'Trực tuyến qua Google Meet' : 'Tại trung tâm EduConnect'}
                  </span>
                </div>
              </div>

              {/* Notice Box: Waiting for Center Approval */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-amber-950 leading-relaxed">
                    <p className="font-semibold text-amber-900">
                      Ban Học Vụ đang xử lý đối soát lịch trống và xếp lớp
                    </p>
                    <p className="text-amber-800 text-[11px]">
                      Thông thường trung tâm sẽ phản hồi trong vòng <strong>15 phút</strong>. Hệ thống sẽ tự động gửi thông báo đến tài khoản học viên ngay khi lớp học được xếp phòng thành công để chuyển sang Bước 4 (Thanh toán học phí).
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Action */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Đã Hiểu & Đóng Cửa Sổ
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 4: THANH TOÁN TIỀN KHÓA HỌC                             */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-900">
                    Trung tâm đã phê duyệt xếp lớp thành công!
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Phê duyệt bởi: <strong>{registrationData?.approvedBy || 'Ban Học Vụ'}</strong> • {registrationData?.assignedRoom || 'Phòng A101'}
                  </p>
                </div>
              </div>

              {/* Payment Bill Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs text-slate-500">Khóa học:</span>
                  <span className="text-xs font-bold text-slate-900">{selectedCourse.title}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs text-slate-500">Số tiền học phí:</span>
                  <span className="text-base font-black text-red-600">{formatVND(selectedCourse.price)}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs text-slate-500">Mã đơn thanh toán:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {registrationData?.paymentCode}
                    </span>
                    <button
                      onClick={copyPaymentCode}
                      className="p-1 rounded text-slate-500 hover:text-slate-800"
                      title="Sao chép mã"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Ngân hàng thụ hưởng:</span>
                  <span className="text-xs font-bold text-slate-900">MBBank (Ngân hàng Quân Đội)</span>
                </div>
              </div>

              {/* VietQR Dynamic Code Showcase */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                {/* QR Image */}
                <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0 shadow-xs text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.vietqr.io/image/970422-88880912345678-compact2.jpg?amount=${selectedCourse.price}&addInfo=${registrationData?.paymentCode || 'HOCPHI'}&accountName=TRUNG%20TAM%20EDUCONNECT`}
                    alt="Mã VietQR Thanh Toán"
                    className="w-36 h-36 object-contain rounded-lg mx-auto"
                  />
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">NAPAS 24/7 Chuẩn Quốc Gia</span>
                </div>

                {/* Transfer Guidance */}
                <div className="space-y-2 text-xs flex-1">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-red-600" />
                    Quét mã VietQR trên ứng dụng Ngân hàng:
                  </h5>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>• <strong>Số tài khoản:</strong> <span className="font-mono font-bold text-slate-900">88880912345678</span></p>
                    <p>• <strong>Chủ tài khoản:</strong> <span className="font-bold text-slate-900">TRUNG TAM EDUCONNECT</span></p>
                    <p>• <strong>Nội dung CK:</strong> <span className="font-mono font-bold text-red-600">{registrationData?.paymentCode}</span></p>
                  </div>
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    Hệ thống tự động kích hoạt tài khoản và đồng bộ thời khóa biểu ngay khi nhận được tín hiệu thanh toán!
                  </p>
                </div>
              </div>

              {/* Action Confirm Payment */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Xem lại Bước 3</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompletePayment}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Tôi Đã Hoàn Tất Chuyển Khoản Học Phí</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
