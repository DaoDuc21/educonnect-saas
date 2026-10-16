'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { AuthUser } from '@/types';
import { mockAccountCredentials, authenticateAccount, AccountRecord } from '@/data/mockAccounts';
import { useToast } from '../shared/ToastNotification';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onBackToHome: () => void;
  credentials?: AccountRecord[];
}

export function LoginPage({ onLoginSuccess, onBackToHome, credentials }: LoginPageProps) {
  const { showToast } = useToast();
  const accountList = credentials && credentials.length > 0 ? credentials : mockAccountCredentials;

  const [email, setEmail] = useState('dang.pham@educonnect.vn');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = authenticateAccount(email, password, accountList);
      if (user) {
        showToast(`Đăng nhập thành công! Chào mừng ${user.name} (${user.title})`, 'success');
        onLoginSuccess(user);
      } else {
        showToast('Email hoặc mật khẩu không chính xác! Vui lòng thử lại.', 'warning');
      }
    }, 600);
  };

  const handleQuickLogin = (acc: AccountRecord) => {
    setEmail(acc.email);
    setPassword(acc.password);
    showToast(`Đã chọn tài khoản: ${acc.badge} (${acc.email})`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar with Back Link */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-2 pb-4">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-slate-200 shadow-soft transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trang Chủ</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Bảo mật SSL 256-bit</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 my-auto">
        {/* Left Side: Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h1 className="font-black text-xl text-slate-900 tracking-tight">EduConnect</h1>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Đăng Nhập Cổng Hệ Thống
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Chào Mừng Trở Lại!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Nhập Gmail hoặc tài khoản EduConnect để truy cập đúng phân quyền của bạn
            </p>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Địa chỉ Email / Gmail *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: dang.pham@educonnect.vn hoặc ten@gmail.com"
                    className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Mật khẩu *</label>
                  <button
                    type="button"
                    onClick={() => showToast('Mật khẩu mẫu mặc định xem ở cột bên phải', 'info')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-[#F5F3EF] border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                  />
                  <span>Ghi nhớ phiên đăng nhập</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-soft hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng Nhập Vào Hệ Thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>EduConnect Cloud Security • NAPAS 247</span>
            <span>Mã hóa SSL 256-bit</span>
          </div>
        </div>

        {/* Right Side: Quick-Fill 1-Click Demo Accounts Bar */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-900/50 text-white rounded-3xl p-6 sm:p-7 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                Đăng Nhập Nhanh 1-Chạm
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-amber-300 text-[10px] font-bold border border-indigo-500/30">
                Chọn để test
              </span>
            </div>
            <h3 className="font-extrabold text-base text-white">
              Danh Bạ Tài Khoản Mẫu
            </h3>
            <p className="text-xs text-indigo-200/70 mt-0.5">
              Click vào tài khoản bất kỳ bên dưới để tự động điền Gmail và Mật khẩu tương ứng:
            </p>

            {/* List of Accounts */}
            <div className="space-y-2 mt-4 max-h-[380px] overflow-y-auto pr-1">
              {accountList.map((acc) => {
                const isCurrentFilled = email === acc.email;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isCurrentFilled
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200/30 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs truncate ${isCurrentFilled ? 'text-slate-950' : 'text-white'}`}>{acc.name}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isCurrentFilled
                              ? 'bg-slate-950/20 text-slate-950'
                              : 'bg-white/10 text-indigo-200 border border-white/10'
                          }`}
                        >
                          {acc.badge}
                        </span>
                      </div>
                      <span className={`text-[11px] block font-mono truncate ${isCurrentFilled ? 'text-slate-800' : 'text-indigo-200/80'}`}>
                        {acc.email} • Pass: {acc.password}
                      </span>
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${isCurrentFilled ? 'text-slate-700' : 'text-slate-400'}`}>
                        {acc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-900/50 text-[11px] text-indigo-300/80 flex items-center gap-1.5 font-medium">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Mỗi tài khoản có quyền hạn và giao diện chuyên biệt.</span>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 pt-4">
        © 2026 EduConnect Education SaaS. All rights reserved.
      </div>
    </div>
  );
}
