'use client';

import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Check, Image as ImageIcon, GraduationCap, DollarSign, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { Course, SubjectType, Tutor } from '@/types';
import { useToast } from '@/components/shared/ToastNotification';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (newCourse: Course) => void;
  tutors: Tutor[];
}

const PRESET_BANNERS: { label: string; subject: SubjectType; url: string }[] = [
  {
    label: 'Toán học & Luyện thi',
    subject: 'math',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tiếng Anh & IELTS',
    subject: 'english',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Vật Lý & Khoa học',
    subject: 'science',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Ngữ Văn & Nghị Luận',
    subject: 'literature',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Gia sư kèm riêng 1:1',
    subject: 'other',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
  },
];

export function AddCourseModal({ isOpen, onClose, onAddCourse, tutors }: AddCourseModalProps) {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('english');
  const [gradeLevel, setGradeLevel] = useState('Lớp 12 & Luyện thi');
  const [selectedTutorId, setSelectedTutorId] = useState(tutors[0]?.id || '');
  const [duration, setDuration] = useState('24 buổi (3 tháng)');
  const [price, setPrice] = useState<number>(3500000);
  const [originalPrice, setOriginalPrice] = useState<number>(4500000);
  const [scheduleDescription, setScheduleDescription] = useState('Thứ 3 & Thứ 6 (19:30 - 21:00)');
  const [commitmentBadge, setCommitmentBadge] = useState('Cam kết đầu ra bằng văn bản');
  const [targetAudience, setTargetAudience] = useState('Dành cho học sinh đặt mục tiêu đạt kết quả xuất sắc');
  const [courseOverview, setCourseOverview] = useState('');
  const [featuresText, setFeaturesText] = useState('Lộ trình cá nhân hóa 1:1\nKiểm tra định kỳ hàng tuần\nHọc lại miễn phí nếu không đạt cam kết');
  const [bannerImage, setBannerImage] = useState(PRESET_BANNERS[0].url);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Vui lòng nhập tên khóa học!', 'warning');
      return;
    }

    const tutorObj = tutors.find((t) => t.id === selectedTutorId) || tutors[0];
    const featuresList = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: title.trim(),
      subject,
      gradeLevel: gradeLevel.trim(),
      tutorName: tutorObj ? tutorObj.name : 'Giảng viên Chuyên môn',
      tutorTitle: tutorObj ? `${tutorObj.subject} • ${tutorObj.experienceYears || 5}+ năm kinh nghiệm` : 'Giảng viên cao cấp',
      tutorAvatar: tutorObj ? tutorObj.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      duration: duration.trim(),
      price: Number(price) || 3000000,
      originalPrice: Number(originalPrice) || 0,
      scheduleDescription: scheduleDescription.trim(),
      rating: 5.0,
      enrolledCount: 1,
      maxStudents: 20,
      commitmentBadge: commitmentBadge.trim(),
      targetAudience: targetAudience.trim(),
      courseOverview: courseOverview.trim() || `Khóa học được thiết kế chuyên sâu dành cho đối tượng ${gradeLevel}, giúp bứt phá điểm số trong thời gian ngắn nhất.`,
      features: featuresList.length > 0 ? featuresList : ['Giáo trình chuyên sâu cập nhật 2026', 'Tương tác trực tiếp cùng Giảng viên', 'Chữa bài 1:1 tỉ mỉ'],
      bannerImage,
    };

    onAddCourse(newCourse);
    showToast(`Đã xuất bản khóa học "${newCourse.title}" ra trang web giới thiệu thành công!`, 'success');
    onClose();

    // Reset form
    setTitle('');
    setCourseOverview('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Thêm Khóa Học Xuất Bản Ra Website
              </h2>
              <p className="text-xs text-slate-500">
                Dành cho Học vụ & Chủ trung tâm quản lý danh mục khóa học Landing Page
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 py-4 flex-1">
          {/* Tên khóa học */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên khóa học hiển thị ngoài web <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: IELTS Intensive 7.0+ Bứt Tốc 90 Ngày..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-slate-900"
            />
          </div>

          {/* Grid 2 cols: Môn học & Khối lớp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phân loại môn học <span className="text-red-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  const val = e.target.value as SubjectType;
                  setSubject(val);
                  const banner = PRESET_BANNERS.find((b) => b.subject === val);
                  if (banner) setBannerImage(banner.url);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              >
                <option value="english">Tiếng Anh / IELTS</option>
                <option value="math">Toán Học</option>
                <option value="science">Vật Lý / Khoa Học</option>
                <option value="literature">Ngữ Văn</option>
                <option value="other">Gia Sư Kèm Riêng 1:1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Khối lớp / Đối tượng học viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Lớp 10 - 12 & Luyện Thi ĐH"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* Giảng viên phụ trách */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Giảng viên phụ trách <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            >
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.subject} ({t.degrees?.[0] || 'Giảng viên chuyên môn cao'})
                </option>
              ))}
            </select>
          </div>

          {/* Grid 2 cols: Học phí & Giá gốc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Học phí ưu đãi (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step={50000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Học phí gốc niêm yết (VND, để gạch giá khuyến mãi)
              </label>
              <input
                type="number"
                step={50000}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-500"
              />
            </div>
          </div>

          {/* Grid 2 cols: Thời lượng & Lịch học dự kiến */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thời lượng khóa học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: 24 buổi (3 tháng)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lịch học dự kiến trong tuần <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Thứ 3 & Thứ 6 (19:30 - 21:00)"
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* Cam kết đầu ra & Mục tiêu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Badge cam kết chất lượng
              </label>
              <input
                type="text"
                placeholder="VD: Cam kết 7.0+ bằng văn bản pháp lý"
                value={commitmentBadge}
                onChange={(e) => setCommitmentBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đối tượng phù hợp
              </label>
              <input
                type="text"
                placeholder="VD: Học sinh ôn thi THPT QG & ĐGNL"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* Giới thiệu tổng quan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tóm tắt nội dung khóa học (Overview)
            </label>
            <textarea
              rows={2}
              placeholder="Mô tả phương pháp đào tạo, mục tiêu đạt được sau khóa học..."
              value={courseOverview}
              onChange={(e) => setCourseOverview(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none"
            />
          </div>

          {/* Đặc điểm nổi bật (Features) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đặc điểm nổi bật (Mỗi dòng 1 điểm nhấn, hiển thị tích xanh)
            </label>
            <textarea
              rows={3}
              placeholder="Giáo trình độc quyền bám sát format thi&#10;Chữa bài 1:1 tỉ mỉ từng câu&#10;Học lại miễn phí nếu không đạt cam kết"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none font-mono"
            />
          </div>

          {/* Chọn ảnh bìa Preset hoặc URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ảnh bìa khóa học (Chọn mẫu nhanh hoặc dán URL)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_BANNERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBannerImage(preset.url)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    bannerImage === preset.url
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              required
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-slate-600"
            />
          </div>

          {/* Preview nhỏ */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerImage} alt="Preview" className="w-16 h-12 object-cover rounded-xl shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-slate-900 block truncate">{title || 'Tiêu đề khóa học'}</span>
              <span className="text-[10px] text-slate-500 block truncate">{gradeLevel} • {duration}</span>
            </div>
            <span className="text-xs font-black text-red-600 shrink-0">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Xuất Bản Khóa Học Ra Website</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
