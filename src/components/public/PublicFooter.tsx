'use client';

import React from 'react';
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block">
                EduConnect
              </span>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Hệ Sinh Thái Gia Sư & Điều Phối Học Tập
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Nền tảng công nghệ giáo dục kết nối gia sư chuyên nghiệp và học sinh theo lộ trình cá nhân hóa, báo cáo tiến độ minh bạch từng buổi học.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Kiểm định chất lượng sư phạm 100%
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Chương Trình Học
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 font-medium">
            <li><a href="#courses" className="hover:text-slate-900 transition-colors">Toán 12 & Luyện Thi ĐGNL</a></li>
            <li><a href="#courses" className="hover:text-slate-900 transition-colors">IELTS Academic 7.0+</a></li>
            <li><a href="#courses" className="hover:text-slate-900 transition-colors">Vật Lý 11-12 Nâng Cao</a></li>
            <li><a href="#courses" className="hover:text-slate-900 transition-colors">Ngữ Văn 9 Thi Vào 10</a></li>
            <li><a href="#courses" className="hover:text-slate-900 transition-colors">Toán Tư Duy Tiểu Học</a></li>
          </ul>
        </div>

        {/* Portals */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Cổng Thông Tin
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 font-medium">
            <li><span className="text-slate-700 font-semibold">Cổng Quản Trị Viên (Admin)</span></li>
            <li><span className="text-slate-700 font-semibold">Cổng Giảng Viên (Tutor)</span></li>
            <li><span className="text-slate-700 font-semibold">Góc Học Tập (Student)</span></li>
            <li><span className="text-slate-700 font-semibold">Cổng Phụ Huynh (Parent)</span></li>
            <li><span className="text-slate-700 font-semibold">Thanh Toán VietQR NAPAS</span></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Liên Hệ Trung Tâm
          </h4>
          <div className="space-y-2.5 text-xs text-slate-500">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Cơ sở 1: Tầng 5, Tòa Nhà Tri Thức, Ba Đình, Hà Nội</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>1900 8888 • 0912 345 678</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>hotro@educonnect.vn</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>07:00 - 21:30 (Thứ 2 - CN)</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <p>© 2026 EduConnect Education SaaS. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>Điều khoản dịch vụ</span>
          <span>•</span>
          <span>Chính sách bảo mật học viên</span>
        </div>
      </div>
    </footer>
  );
}
