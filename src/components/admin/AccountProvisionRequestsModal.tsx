'use client';

import React, { useState } from 'react';
import { AdmissionsLead } from '@/types';
import { 
  ShieldCheck, 
  X, 
  Check, 
  UserCheck, 
  Mail, 
  Phone, 
  BookOpen, 
  AlertCircle, 
  Sparkles, 
  Key,
  Clock
} from 'lucide-react';

interface AccountProvisionRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingLeads: AdmissionsLead[];
  onApproveProvision: (lead: AdmissionsLead) => void;
}

export const AccountProvisionRequestsModal: React.FC<AccountProvisionRequestsModalProps> = ({
  isOpen,
  onClose,
  pendingLeads,
  onApproveProvision,
}) => {
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApprove = (lead: AdmissionsLead) => {
    onApproveProvision(lead);
    setProvisionSuccessMsg(`Đã duyệt & kích hoạt tài khoản thành công cho học sinh "${lead.studentName}" (${lead.studentEmail})! Mật khẩu mặc định: 123456`);
    setTimeout(() => {
      setProvisionSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Yêu Cầu Cấp Tài Khoản Học Sinh Tuyển Sinh
              </h3>
              <p className="text-xs text-slate-500">
                Hàng đợi phê duyệt từ Phòng Tuyển Sinh • Tự động kích hoạt tài khoản học viên chính thức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {provisionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{provisionSuccessMsg}</span>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {pendingLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 hover:border-amber-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{lead.studentName}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                      {lead.grade}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Chờ duyệt
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Người gửi yêu cầu: <strong className="text-slate-700">{lead.consultantName}</strong> ({lead.requestedAt || lead.createdAt})
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(lead)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all whitespace-nowrap"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Phê duyệt & Cấp tài khoản</span>
                </button>
              </div>

              {/* Lead metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-amber-100">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email: <strong className="text-slate-900">{lead.studentEmail}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phụ huynh: {lead.parentName} ({lead.parentPhone})</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Khóa học đăng ký: <strong className="text-primary">{lead.desiredCourse}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2 text-slate-500">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mật khẩu mặc định sẽ cấp: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">123456</code></span>
                </div>
              </div>

              {lead.notes && (
                <div className="text-xs text-slate-500 italic pl-1">
                  &ldquo;{lead.notes}&rdquo;
                </div>
              )}
            </div>
          ))}

          {pendingLeads.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-12 h-12 text-emerald-400 bg-emerald-50 p-2.5 rounded-full mx-auto mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm">Hàng đợi đã trống!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Hiện không có yêu cầu cấp tài khoản nào đang chờ duyệt từ Phòng Tuyển Sinh.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Tổng số yêu cầu đang chờ: <strong className="text-slate-700">{pendingLeads.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
