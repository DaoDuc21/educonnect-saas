'use client';

import React, { useState } from 'react';
import { Sparkles, LogIn, PhoneCall, ChevronRight, Menu, X, Calculator } from 'lucide-react';

interface PublicNavbarProps {
  onOpenLogin: () => void;
  onExploreCourses?: () => void;
}

export function PublicNavbar({ onOpenLogin, onExploreCourses }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#about', label: 'Về EduConnect' },
    { href: '#courses', label: 'Chương Trình Học' },
    { href: '#tuition-calculator', label: 'Tra Cứu Học Phí' },
    { href: '#method', label: 'Phương Pháp Điều Phối' },
    { href: '#tutors', label: 'Đội Ngũ Gia Sư' },
    { href: '#reviews', label: 'Đánh Giá & Kết Quả' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F5F3EF]/95 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight block leading-tight">
              EduConnect
            </span>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Trung Tâm Gia Sư & Điều Phối Học Tập
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-700">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-slate-950 transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <a
            href="tel:19008888"
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-full hover:bg-white transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
            <span>Hotline: 1900 8888</span>
          </a>

          {/* Login Button */}
          <button
            onClick={onOpenLogin}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-soft hover:shadow-md transition-all group"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
            <span>Đăng Nhập Cổng</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-800 hover:text-slate-950 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors border-b border-slate-100 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}

            <div className="pt-3 flex flex-col gap-2.5">
              <a
                href="tel:19008888"
                className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#F5F3EF] text-xs font-bold text-slate-700"
              >
                <PhoneCall className="w-4 h-4 text-amber-500" />
                <span>Hotline: 1900 8888</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-soft"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Đăng Nhập Cổng Hệ Thống</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
