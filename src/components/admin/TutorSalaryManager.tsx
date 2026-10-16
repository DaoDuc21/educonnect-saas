'use client';

import React, { useState } from 'react';
import { Tutor } from '@/types';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Search, 
  Award, 
  AlertCircle, 
  Check, 
  X, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  Printer
} from 'lucide-react';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportToExcel, exportToCSV, printFormattedTable, TUTOR_PAYROLL_COLUMNS } from '@/lib/exportUtils';

interface TutorSalaryManagerProps {
  tutors: Tutor[];
  onUpdateHourlyRate: (tutorId: string, newRate: number, notes?: string) => void;
  onApproveSalary: (tutorId: string) => void;
  onBatchApproveSalaries: () => void;
  isSuperAdmin: boolean;
}

export const TutorSalaryManager: React.FC<TutorSalaryManagerProps> = ({
  tutors,
  onUpdateHourlyRate,
  onApproveSalary,
  onBatchApproveSalaries,
  isSuperAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'paid'>('all');
  
  // State for editing hourly rate
  const [editingTutorId, setEditingTutorId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(350000);
  const [editNotesValue, setEditNotesValue] = useState<string>('');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleStartEdit = (tutor: Tutor) => {
    setEditingTutorId(tutor.id);
    setEditRateValue(tutor.hourlyRate);
    setEditNotesValue(tutor.hourlyRateNotes || '');
  };

  const handleSaveEdit = (tutorId: string) => {
    if (editRateValue > 0) {
      onUpdateHourlyRate(tutorId, editRateValue, editNotesValue);
    }
    setEditingTutorId(null);
  };

  const handleCancelEdit = () => {
    setEditingTutorId(null);
  };

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = 
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tutor.salaryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalPayroll = tutors.reduce((sum, t) => sum + (t.completedHoursThisMonth * t.hourlyRate), 0);
  const pendingTutors = tutors.filter(t => t.salaryStatus === 'pending_approval' || !t.salaryStatus);
  const pendingPayroll = pendingTutors.reduce((sum, t) => sum + (t.completedHoursThisMonth * t.hourlyRate), 0);
  const approvedPayroll = tutors.filter(t => t.salaryStatus === 'approved' || t.salaryStatus === 'paid')
                                .reduce((sum, t) => sum + (t.completedHoursThisMonth * t.hourlyRate), 0);

  const handleExportExcel = () => {
    exportToExcel(
      `Bang_Thanh_Toan_Thu_Lao_Gia_Su_${new Date().toISOString().slice(0, 10)}`,
      TUTOR_PAYROLL_COLUMNS,
      filteredTutors,
      'BangLuongGiaSu'
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Bang_Thanh_Toan_Thu_Lao_Gia_Su_${new Date().toISOString().slice(0, 10)}`,
      TUTOR_PAYROLL_COLUMNS,
      filteredTutors
    );
  };

  const handlePrintPayroll = () => {
    printFormattedTable(
      'BẢNG THANH TOÁN THÙ LAO GIA SƯ & GIẢNG VIÊN',
      TUTOR_PAYROLL_COLUMNS,
      filteredTutors,
      'Kỳ thanh toán: Tháng 09/2026 • Đơn vị tiền tệ: VNĐ • Trạng thái: Dữ liệu hệ thống xác thực'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Đơn Giá & Duyệt Bảng Lương Giảng Viên</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kỳ thanh toán: <strong className="text-slate-800">Tháng 09/2026</strong> • Điều chỉnh đơn giá tiết dạy và phê duyệt thù lao trước ngày 10 hàng tháng.
          </p>
        </div>

        {/* Header Actions: Export Suite + Batch Approve */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ExportDropdown
            title="Xuất bảng lương"
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onPrint={handlePrintPayroll}
          />

          {isSuperAdmin && pendingTutors.length > 0 && (
            <button
              onClick={onBatchApproveSalaries}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Duyệt toàn bộ ({pendingTutors.length} giảng viên)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng quỹ lương dự kiến</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{formatVND(totalPayroll)}</div>
            <span className="text-xs text-slate-500 mt-1 block">Cho {tutors.length} giảng viên phụ trách ca</span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100/80 bg-amber-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Chờ Admin duyệt lương</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{formatVND(pendingPayroll)}</div>
            <span className="text-xs font-medium text-amber-600/90 mt-1 block">
              {pendingTutors.length} giảng viên đang chờ duyệt
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 bg-emerald-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Đã duyệt & Sẵn sàng chi trả</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{formatVND(approvedPayroll)}</div>
            <span className="text-xs font-medium text-emerald-600/90 mt-1 block">
              {tutors.length - pendingTutors.length} giảng viên đã duyệt xong
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên giảng viên hoặc môn dạy..."
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
            Tất cả ({tutors.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'pending_approval'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Chờ duyệt ({pendingTutors.length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Đã duyệt ({tutors.filter(t => t.salaryStatus === 'approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'paid'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Đã chi trả ({tutors.filter(t => t.salaryStatus === 'paid').length})
          </button>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-medium">
                <th className="py-3.5 px-5">Giảng viên</th>
                <th className="py-3.5 px-4">Chuyên môn</th>
                <th className="py-3.5 px-4 text-center">Giờ dạy tháng này</th>
                <th className="py-3.5 px-4">Đơn giá / Giờ</th>
                <th className="py-3.5 px-4 text-right">Tổng thù lao (VND)</th>
                <th className="py-3.5 px-4 text-center">Trạng thái duyệt</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTutors.map((tutor) => {
                const isEditing = editingTutorId === tutor.id;
                const totalSalary = tutor.completedHoursThisMonth * tutor.hourlyRate;
                const isApproved = tutor.salaryStatus === 'approved';
                const isPaid = tutor.salaryStatus === 'paid';
                const isPending = !tutor.salaryStatus || tutor.salaryStatus === 'pending_approval';

                return (
                  <tr key={tutor.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Tutor Profile */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={tutor.avatar}
                          alt={tutor.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{tutor.name}</div>
                          <div className="text-xs text-slate-400">{tutor.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-4 px-4 text-slate-600">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        {tutor.subject}
                      </span>
                    </td>

                    {/* Completed Hours */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-slate-900 text-base">{tutor.completedHoursThisMonth}</span>
                      <span className="text-xs text-slate-400 ml-1">giờ</span>
                    </td>

                    {/* Hourly Rate & Inline Edit */}
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="10000"
                              value={editRateValue}
                              onChange={(e) => setEditRateValue(Number(e.target.value))}
                              className="w-28 px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-50/50 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="text-xs text-slate-500">đ/h</span>
                            <button
                              onClick={() => handleSaveEdit(tutor.id)}
                              className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                              title="Lưu đơn giá"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Ghi chú điều chỉnh (vd: Tăng thâm niên)..."
                            value={editNotesValue}
                            onChange={(e) => setEditNotesValue(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{formatVND(tutor.hourlyRate)}</span>
                            <span className="text-xs text-slate-400">/h</span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleStartEdit(tutor)}
                                className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                                title="Chỉnh sửa đơn giá giờ dạy"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {tutor.hourlyRateNotes && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                              {tutor.hourlyRateNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Total Calculated Earnings */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-extrabold text-base text-primary">
                        {formatVND(totalSalary)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tutor.completedHoursThisMonth}h × {formatVND(tutor.hourlyRate)}
                      </div>
                    </td>

                    {/* Salary Status */}
                    <td className="py-4 px-4 text-center">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                          Chờ duyệt
                        </span>
                      )}
                      {isApproved && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã duyệt lương
                          </span>
                          {tutor.approvedAt && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {tutor.approvedAt}
                            </span>
                          )}
                        </div>
                      )}
                      {isPaid && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                          <Award className="w-3 h-3 text-blue-600" />
                          Đã chi trả
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            printFormattedTable(
                              `PHIẾU THANH TOÁN THÙ LAO - ${tutor.name.toUpperCase()}`,
                              TUTOR_PAYROLL_COLUMNS,
                              [tutor],
                              `Kỳ lương: Tháng 09/2026 • Giảng viên: ${tutor.name} (${tutor.id.toUpperCase()})`
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="In phiếu lương cá nhân"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {isSuperAdmin ? (
                          isPending ? (
                            <button
                              onClick={() => onApproveSalary(tutor.id)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-semibold rounded-xl text-xs transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Duyệt lương
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Hoàn tất</span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chỉ xem</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTutors.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Không tìm thấy giảng viên nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
};
