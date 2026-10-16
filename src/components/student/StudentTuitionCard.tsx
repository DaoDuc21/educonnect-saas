'use client';

import React, { useState } from 'react';
import {
  QrCode,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Copy,
  Receipt,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { TuitionInvoice, Student } from '@/types';
import { formatVND } from '@/lib/utils';
import { VietQRDialog } from '../shared/VietQRDialog';
import { InvoiceModal } from '../shared/InvoiceModal';
import { StatusBadge } from '../shared/Badge';
import { mockStudents } from '@/data/mockData';
import { useToast } from '../shared/ToastNotification';

interface StudentTuitionCardProps {
  invoices: TuitionInvoice[];
  onInvoicesUpdate?: (updated: TuitionInvoice[]) => void;
}

export function StudentTuitionCard({ invoices, onInvoicesUpdate }: StudentTuitionCardProps) {
  const { showToast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<TuitionInvoice | null>(null);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<TuitionInvoice | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Filter invoices for student Minh Quân (stu-1)
  const studentInvoices = invoices.filter((i) => i.studentId === 'stu-1');
  const currentStudent = mockStudents.find((s) => s.id === 'stu-1') || mockStudents[0];

  // Financial summary metrics
  const totalAmount = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = studentInvoices.filter((i) => i.status === 'paid');
  const unpaidInvoices = studentInvoices.filter((i) => i.status !== 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const displayedInvoices = studentInvoices.filter((inv) => {
    if (filterTab === 'unpaid') return inv.status !== 'paid';
    if (filterTab === 'paid') return inv.status === 'paid';
    return true;
  });

  const handlePaymentSuccess = (invoiceId: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: 'paid' as const, paymentDate: '08/09/2026' } : inv
    );
    if (onInvoicesUpdate) {
      onInvoicesUpdate(updated);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}: ${text}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Tổng học phí */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng Học Phí Đăng Ký
            </span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatVND(totalAmount)}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {studentInvoices.length} khoản thu trong học kỳ này
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Đã thanh toán */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Đã Hoàn Tất Thanh Toán
            </span>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatVND(paidAmount)}
            </div>
            <p className="text-xs text-emerald-600/80 font-medium">
              {paidInvoices.length} khóa học có hóa đơn điện tử
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Còn phải nộp */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Chưa Thanh Toán
            </span>
            <div className="text-2xl font-black text-amber-600 tracking-tight">
              {formatVND(unpaidAmount)}
            </div>
            <p className="text-xs text-amber-700/80 font-medium">
              {unpaidInvoices.length > 0 ? `${unpaidInvoices.length} khoản cần nộp trước hạn` : 'Đã hoàn tất 100%'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Invoices Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
        <div className="pb-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Chi Tiết Học Phí & Hóa Đơn VAT
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Xem lịch sử thanh toán, quét mã VietQR tự động hoặc xem và in hóa đơn điện tử chuẩn Bộ Tài Chính
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tất cả ({studentInvoices.length})
            </button>
            <button
              onClick={() => setFilterTab('unpaid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'unpaid'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Chưa thanh toán ({unpaidInvoices.length})
            </button>
            <button
              onClick={() => setFilterTab('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'paid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Đã thanh toán ({paidInvoices.length})
            </button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4 mt-6">
          {displayedInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold">Không có khoản học phí nào trong danh mục này</p>
            </div>
          ) : (
            displayedInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                      <span>{inv.paymentCode}</span>
                      <button
                        onClick={() => copyToClipboard(inv.paymentCode, 'Mã thanh toán')}
                        className="text-slate-400 hover:text-slate-700"
                        title="Sao chép mã"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>
                    <StatusBadge
                      status={inv.status}
                      label={inv.status === 'paid' ? 'Đã hoàn tất' : 'Chưa thanh toán'}
                    />
                    {inv.status !== 'paid' && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                        Cần nộp trước {inv.dueDate}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{inv.courseName}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hạn thanh toán: <strong className="text-slate-700">{inv.dueDate}</strong>
                    </span>
                    {inv.paymentDate && (
                      <span className="text-emerald-700 font-medium">
                        Ngày thu: {inv.paymentDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase">Số tiền</span>
                    <span className="text-xl font-black text-slate-900">{formatVND(inv.amount)}</span>
                  </div>

                  {inv.status === 'paid' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceForModal(inv)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-soft transition-all"
                        title="Xem hóa đơn VAT điện tử"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Xem Hóa Đơn Điện Tử</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/25 transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Thanh toán VietQR</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* VietQR Instant Payment Dialog */}
      <VietQRDialog
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official Vietnamese VAT E-Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoiceForModal)}
        onClose={() => setSelectedInvoiceForModal(null)}
        invoice={selectedInvoiceForModal}
        student={currentStudent}
      />
    </div>
  );
}
