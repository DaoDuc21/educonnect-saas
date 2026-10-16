'use client';

import React, { useState } from 'react';
import {
  FileText,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { TuitionInvoice, Student } from '@/types';
import { formatVND } from '@/lib/utils';
import { VietQRDialog } from '../shared/VietQRDialog';
import { StatusBadge } from '../shared/Badge';
import { useToast } from '../shared/ToastNotification';
import { InvoiceModal } from '../shared/InvoiceModal';

interface ParentTuitionCenterProps {
  child: Student;
  invoices: TuitionInvoice[];
  onInvoicesUpdate?: (updated: TuitionInvoice[]) => void;
}

export function ParentTuitionCenter({
  child,
  invoices,
  onInvoicesUpdate,
}: ParentTuitionCenterProps) {
  const { showToast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<TuitionInvoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<TuitionInvoice | null>(null);

  // Filter invoices for current child
  const childInvoices = invoices.filter((i) => i.studentId === child.id);

  const handlePaymentSuccess = (invoiceId: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: 'paid' as const, paymentDate: '08/09/2026' } : inv
    );
    if (onInvoicesUpdate) {
      onInvoicesUpdate(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
        <div className="pb-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cổng Kiểm Soát Học Phí & Hóa Đơn Điện Tử
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Học viên: <strong className="text-slate-800">{child.name}</strong> • Phụ huynh: Chị Hoàng Thảo My
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Minh bạch hóa đơn VAT 100%
            </span>
          </div>
        </div>

        {/* Invoice List */}
        <div className="divide-y divide-slate-100 mt-4">
          {childInvoices.map((inv) => (
            <div
              key={inv.id}
              className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-[#F5F3EF] px-2 py-0.5 rounded border border-slate-200">
                    {inv.paymentCode}
                  </span>
                  <StatusBadge
                    status={inv.status}
                    label={
                      inv.status === 'paid'
                        ? 'Đã thanh toán'
                        : inv.status === 'pending'
                        ? 'Đang chờ nộp'
                        : 'Quá hạn'
                    }
                  />
                </div>

                <h3 className="font-bold text-base text-slate-900">{inv.courseName}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>Quy mô: <strong>{inv.sessionsCount} buổi</strong></span>
                  <span>•</span>
                  <span>Hạn thanh toán: <strong>{inv.dueDate}</strong></span>
                  {inv.paymentDate && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">Ngày nộp: {inv.paymentDate}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between md:justify-end gap-5">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Tổng tiền</span>
                  <span className="text-xl font-black text-slate-900">
                    {formatVND(inv.amount)}
                  </span>
                </div>

                {inv.status === 'paid' ? (
                  <button
                    onClick={() => setViewingInvoice(inv)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xem & In hóa đơn VAT</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-soft hover:shadow-md transition-all"
                  >
                    <QrCode className="w-4 h-4 text-amber-300" />
                    <span>Quét mã VietQR</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {childInvoices.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              Không có hóa đơn nào tồn đọng cho học viên này.
            </div>
          )}
        </div>
      </div>

      {/* VietQR Modal */}
      <VietQRDialog
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official E-Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        student={child}
      />
    </div>
  );
}
