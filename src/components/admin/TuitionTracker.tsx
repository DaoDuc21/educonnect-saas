'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Send,
  QrCode,
  ArrowUpRight,
  Filter,
  DollarSign,
  Clock,
  Sparkles,
  Printer
} from 'lucide-react';
import { TuitionInvoice, AdminRole } from '@/types';
import { formatVND } from '@/lib/utils';
import { StatusBadge } from '../shared/Badge';
import { useToast } from '../shared/ToastNotification';
import { VietQRDialog } from '../shared/VietQRDialog';
import { ShieldAlert, Lock } from 'lucide-react';
import { ExportDropdown } from '../common/ExportDropdown';
import {
  exportToExcel,
  exportToCSV,
  printFormattedTable,
  printSingleInvoice,
  TUITION_INVOICE_COLUMNS,
} from '@/lib/exportUtils';

interface TuitionTrackerProps {
  invoices: TuitionInvoice[];
  onInvoicesUpdate?: (updated: TuitionInvoice[]) => void;
  currentAdminRole?: AdminRole;
  onSendReminder?: (invoice: TuitionInvoice) => void;
}

export function TuitionTracker({
  invoices,
  onInvoicesUpdate,
  currentAdminRole = 'super_admin',
  onSendReminder,
}: TuitionTrackerProps) {
  const { showToast } = useToast();
  const [selectedInvoiceForQR, setSelectedInvoiceForQR] = useState<TuitionInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // KPI Calculations
  const expectedTotal = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const collectedTotal = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const overdueTotal = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const collectedPercentage = Math.round((collectedTotal / (expectedTotal || 1)) * 100);

  const handleSendReminder = (invoice: TuitionInvoice) => {
    if (onSendReminder) {
      onSendReminder(invoice);
    }
    showToast(
      `Đã gửi thông báo nhắc học phí qua Zalo & SMS cho phụ huynh học sinh ${invoice.studentName}!`,
      'success'
    );
  };

  const handlePaymentSuccess = (invoiceId: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: 'paid' as const, paymentDate: '08/09/2026' } : inv
    );
    if (onInvoicesUpdate) {
      onInvoicesUpdate(updated);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  const handleExportExcel = () => {
    exportToExcel(
      `Hoa_Don_Hoc_Phi_${statusFilter}_${new Date().toISOString().slice(0, 10)}`,
      TUITION_INVOICE_COLUMNS,
      filteredInvoices,
      'HoaDonHocPhi'
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Hoa_Don_Hoc_Phi_${statusFilter}_${new Date().toISOString().slice(0, 10)}`,
      TUITION_INVOICE_COLUMNS,
      filteredInvoices
    );
  };

  const handlePrintInvoicesList = () => {
    const statusLabel =
      statusFilter === 'paid'
        ? 'ĐÃ NỘP HỌC PHÍ'
        : statusFilter === 'pending'
        ? 'CHỜ XỬ LÝ THANH TOÁN'
        : statusFilter === 'overdue'
        ? 'NỢ ĐỌNG QUÁ HẠN'
        : 'TOÀN BỘ KỲ THU PHÍ';

    printFormattedTable(
      `BẢNG KÊ HÓA ĐƠN THU HỌC PHÍ - ${statusLabel}`,
      TUITION_INVOICE_COLUMNS,
      filteredInvoices,
      `Kỳ đối soát: Tháng 09/2026 • Tổng số hóa đơn: ${filteredInvoices.length} bản ghi`
    );
  };

  if (currentAdminRole === 'admissions') {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-soft text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Giới Hạn Quyền Truy Cập Tài Chính</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tài khoản <strong>Tư Vấn Tuyển Sinh & CSKH</strong> không có quyền xem báo cáo doanh thu, quỹ lương và số dư nợ đọng học phí. Vui lòng liên hệ Kế Toán Trưởng hoặc Ban Giám Đốc nếu cần đối soát.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentAdminRole === 'academic_coordinator' && (
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center gap-2 font-medium">
          <Lock className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Bạn đang xem dữ liệu học phí ở chế độ <strong>Đối soát học vụ (Read-only)</strong>. Quyền sửa số tiền và duyệt chi thuộc về Kế toán.</span>
        </div>
      )}

      {/* 3 KPI Widget Cards (Be.run Aesthetic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Dự Thu Tháng */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dự Thu Tháng 09/2026
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#F5F3EF] flex items-center justify-center text-slate-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatVND(expectedTotal)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-600 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
              </span>
              so với kỳ trước
            </p>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-100/40 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        </div>

        {/* Card 2: Đã Thu Thực Tế */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-soft relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Đã Thu Thực Tế
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatVND(collectedTotal)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Tiến độ thu:</span>
              <span className="font-bold text-amber-300">{collectedPercentage}%</span>
            </div>
            {/* Be.run segmented bar style */}
            <div className="w-full bg-white/10 h-2 rounded-full mt-1.5 overflow-hidden flex gap-1 p-0.5">
              <div
                className="bg-amber-300 h-full rounded-full transition-all duration-700"
                style={{ width: `${collectedPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Nợ Đọng Học Phí */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nợ Đọng / Chờ Thu
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-rose-600 tracking-tight">
              {formatVND(overdueTotal)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-rose-600">
                {invoices.filter((i) => i.status === 'overdue').length} hóa đơn
              </span>
              cần xử lý nhắc nợ khẩn cấp
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-100/40 rounded-full blur-xl" />
        </div>
      </div>

      {/* Tuition Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Bảng Theo Dõi Trạng Thái Đóng Tiền
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi đối soát kỳ phí học sinh và gửi nhắc nhở tự động
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex bg-[#F5F3EF] p-1 rounded-full text-xs font-semibold">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'paid', label: 'Đã nộp' },
                { id: 'pending', label: 'Chờ xử lý' },
                { id: 'overdue', label: 'Quá hạn' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Table Export Dropdown */}
            <ExportDropdown
              title="Xuất hóa đơn"
              onExportExcel={handleExportExcel}
              onExportCSV={handleExportCSV}
              onPrint={handlePrintInvoicesList}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Mã Hóa Đơn</th>
                <th className="py-3.5 px-4">Học Sinh</th>
                <th className="py-3.5 px-4">Tên Khóa Học</th>
                <th className="py-3.5 px-4">Số Tiền</th>
                <th className="py-3.5 px-4">Hạn Chót</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-6 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    {invoice.paymentCode}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {invoice.studentName}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {invoice.courseName}
                    <span className="block text-[11px] text-slate-400">
                      Gói {invoice.sessionsCount} buổi
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                    {formatVND(invoice.amount)}
                  </td>
                  <td className="py-4 px-4 text-slate-500 flex items-center gap-1.5 mt-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {invoice.dueDate}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge
                      status={invoice.status}
                      label={
                        invoice.status === 'paid'
                          ? 'Đã nộp'
                          : invoice.status === 'pending'
                          ? 'Chờ xử lý'
                          : 'Quá hạn'
                      }
                    />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Single Invoice Print Button */}
                      <button
                        onClick={() => printSingleInvoice(invoice)}
                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="In phiếu thu / hóa đơn cá nhân"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* VietQR Button */}
                      <button
                        onClick={() => setSelectedInvoiceForQR(invoice)}
                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Xem mã VietQR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      {/* Send Reminder Button */}
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handleSendReminder(invoice)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-colors shadow-soft"
                        >
                          <Send className="w-3 h-3" />
                          <span>Gửi nhắc nhở</span>
                        </button>
                      )}

                      {invoice.status === 'paid' && (
                        <span className="text-[11px] text-emerald-600 font-semibold px-2 py-1">
                          Đã thanh toán ({invoice.paymentDate})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VietQR Modal */}
      <VietQRDialog
        isOpen={Boolean(selectedInvoiceForQR)}
        onClose={() => setSelectedInvoiceForQR(null)}
        invoice={selectedInvoiceForQR}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
