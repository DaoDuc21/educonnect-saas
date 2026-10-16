'use client';

import React, { useState } from 'react';
import { AdmissionsLead, LeadStatus } from '@/types';
import { 
  UserPlus, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Sparkles, 
  Phone, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';

interface AdmissionsLeadManagerProps {
  leads: AdmissionsLead[];
  onAddLead: (leadData: Omit<AdmissionsLead, 'id' | 'createdAt' | 'status' | 'requestedAt' | 'provisionedAt'>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  onRequestAccountProvision: (leadId: string) => void;
  currentUserName: string;
}

export const AdmissionsLeadManager: React.FC<AdmissionsLeadManagerProps> = ({
  leads,
  onAddLead,
  onUpdateLeadStatus,
  onRequestAccountProvision,
  currentUserName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('Lớp 10');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [desiredCourse, setDesiredCourse] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmitNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !parentPhone || !studentEmail) {
      alert('Vui lòng điền đầy đủ: Tên học sinh, SĐT phụ huynh và Email Gmail!');
      return;
    }

    onAddLead({
      studentName,
      grade,
      parentName: parentName || 'Phụ huynh ' + studentName,
      parentPhone,
      studentEmail,
      desiredCourse: desiredCourse || 'Toán học Tuyển sinh 10 Chuyên',
      consultantId: 'adm-current',
      consultantName: currentUserName,
      notes,
    });

    // Reset form
    setStudentName('');
    setParentName('');
    setParentPhone('');
    setStudentEmail('');
    setDesiredCourse('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.parentPhone.includes(searchTerm) ||
      lead.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.desiredCourse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'consulting':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-500" />
            Đang tư vấn
          </span>
        );
      case 'trial_lesson':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <Sparkles className="w-3 h-3 text-violet-500" />
            Đang học thử
          </span>
        );
      case 'enrolled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Đăng ký khóa học thành công
          </span>
        );
      case 'pending_provision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            Chờ Admin duyệt cấp tài khoản
          </span>
        );
      case 'provisioned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Đã cấp tài khoản chính thức
          </span>
        );
      default:
        return null;
    }
  };

  const countByStatus = (status: LeadStatus) => leads.filter(l => l.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Tuyển Sinh & Cấp Quyền Học Viên</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tiếp nhận thông tin ghi danh, chăm sóc phễu tuyển sinh và chuyển tiếp yêu cầu cấp tài khoản cho Ban Quản Trị.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Thêm học sinh tuyển sinh</span>
        </button>
      </div>

      {/* KPI Workflow Steps */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div 
          onClick={() => setStatusFilter('consulting')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'consulting' ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-300/30' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">1. Đang tư vấn</div>
          <div className="text-2xl font-bold text-sky-700 mt-1">{countByStatus('consulting')}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('trial_lesson')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'trial_lesson' ? 'bg-violet-50 border-violet-300 ring-2 ring-violet-300/30' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">2. Học thử</div>
          <div className="text-2xl font-bold text-violet-700 mt-1">{countByStatus('trial_lesson')}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('enrolled')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'enrolled' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300/30' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="text-xs text-emerald-600 font-medium">3. Đăng ký thành công</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{countByStatus('enrolled')}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending_provision')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'pending_provision' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/30' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="text-xs text-amber-600 font-medium">4. Chờ Admin cấp acc</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{countByStatus('pending_provision')}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('provisioned')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'provisioned' ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-300/30' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="text-xs text-indigo-600 font-medium">5. Đã kích hoạt</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{countByStatus('provisioned')}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, SĐT, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({leads.length})
          </button>
          <button
            onClick={() => setStatusFilter('enrolled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'enrolled'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Đã đăng ký ({countByStatus('enrolled')})
          </button>
          <button
            onClick={() => setStatusFilter('pending_provision')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'pending_provision'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Chờ duyệt ({countByStatus('pending_provision')})
          </button>
        </div>
      </div>

      {/* Leads List Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            {/* Left: Lead Details */}
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-slate-900 text-base">{lead.studentName}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                  {lead.grade}
                </span>
                {getStatusBadge(lead.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email dự kiến: <strong className="text-slate-800">{lead.studentEmail}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phụ huynh: {lead.parentName} ({lead.parentPhone})</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Khóa học đăng ký: <strong className="text-primary">{lead.desiredCourse}</strong></span>
                </div>
              </div>

              {lead.notes && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 italic">
                  Ghi chú tuyển sinh: {lead.notes}
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                <span>Tư vấn viên: <strong>{lead.consultantName}</strong></span>
                <span>• Ngày tiếp nhận: {lead.createdAt}</span>
                {lead.requestedAt && (
                  <span className="text-amber-600 font-medium">• Gửi yêu cầu lúc: {lead.requestedAt}</span>
                )}
                {lead.provisionedAt && (
                  <span className="text-emerald-600 font-medium">• Admin duyệt lúc: {lead.provisionedAt}</span>
                )}
              </div>
            </div>

            {/* Right: Actions & Workflow */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              {/* Status Switcher for Consultant */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={lead.status}
                  disabled={lead.status === 'provisioned'}
                  onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="consulting">Đang tư vấn</option>
                  <option value="trial_lesson">Đang học thử</option>
                  <option value="enrolled">Đăng ký thành công</option>
                  <option value="pending_provision">Chờ Admin cấp acc</option>
                  <option value="provisioned" disabled>Đã cấp tài khoản</option>
                </select>
              </div>

              {/* Action Button: Send Request to Admin */}
              {lead.status === 'enrolled' && (
                <button
                  onClick={() => onRequestAccountProvision(lead.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi yêu cầu cho Admin để cấp tài khoản</span>
                </button>
              )}

              {lead.status === 'pending_provision' && (
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đã gửi Admin • Chờ duyệt</span>
                </div>
              )}

              {lead.status === 'provisioned' && (
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tài khoản đã hoạt động</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Không tìm thấy hồ sơ tuyển sinh nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Modal Add Lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-lg">Tiếp Nhận Học Sinh Tuyển Sinh</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewLead} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Minh Châu"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Lớp 6">Lớp 6</option>
                    <option value="Lớp 7">Lớp 7</option>
                    <option value="Lớp 8">Lớp 8</option>
                    <option value="Lớp 9">Lớp 9</option>
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Đại học / Khác">Đại học / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gmail học sinh (Cấp acc) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vd: minhchau@gmail.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ tên phụ huynh
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hoàng Văn An"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại phụ huynh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="vd: 0912 345 678"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khóa học quan tâm / Đăng ký <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Toán Tuyển sinh 10, IELTS Academic..."
                  value={desiredCourse}
                  onChange={(e) => setDesiredCourse(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú tư vấn ban đầu
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập thông tin nhu cầu, lực học hiện tại, ca học mong muốn..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 transition-all"
                >
                  Lưu hồ sơ tuyển sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
