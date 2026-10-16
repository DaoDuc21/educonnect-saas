'use client';

import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck, ArrowRight, Landmark } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { useToast } from './ToastNotification';

interface VietQRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    studentName: string;
    courseName: string;
    amount: number;
    paymentCode: string;
  } | null;
  onPaymentSuccess?: (invoiceId: string) => void;
}

export function VietQRDialog({ isOpen, onClose, invoice, onPaymentSuccess }: VietQRDialogProps) {
  const { showToast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !invoice) return null;

  const bankInfo = {
    bankName: 'MBBank (Ngân Hàng Quân Đội)',
    accountNumber: '88880912345678',
    accountName: 'TRUNG TAM GIA SU EDUCONNECT',
    transferContent: invoice.paymentCode,
    amount: invoice.amount,
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`Đã sao chép ${field}: ${text}`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      showToast('Giao dịch thành công! Hệ thống đã ghi nhận học phí.', 'success');
      if (onPaymentSuccess) {
        onPaymentSuccess(invoice.id);
      }
      onClose();
    }, 1500);
  };

  // Generate VietQR URL
  const qrUrl = `https://img.vietqr.io/image/970422-${bankInfo.accountNumber}-compact2.png?amount=${bankInfo.amount}&addInfo=${encodeURIComponent(
    bankInfo.transferContent
  )}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Cổng Thanh Toán VietQR Tự Động</h3>
              <p className="text-xs text-slate-300">Quét mã QR bằng App Ngân Hàng bất kỳ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Amount banner */}
          <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-amber-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số tiền thanh toán</span>
              <p className="text-2xl font-bold text-slate-900">{formatVND(invoice.amount)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Học sinh</span>
              <span className="font-semibold text-sm text-slate-800">{invoice.studentName}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 rounded-2xl shadow-sm">
            <div className="relative p-2 bg-white rounded-xl shadow-md border border-slate-100">
              {/* Fallback to simulated QR SVG if image loading is restricted */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="VietQR Code"
                className="w-56 h-auto object-contain rounded-lg"
                onError={(e) => {
                  // Fallback to QR server if vietqr is slow
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                    `2|99|0912345678|CONG TY EDUCONNECT|${invoice.amount}|${invoice.paymentCode}`
                  )}`;
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Mã QR chuẩn NAPAS 247 - Tự động điền số tiền & nội dung
            </p>
          </div>

          {/* Transfer Info Details */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-slate-400" /> Ngân hàng
              </span>
              <span className="font-semibold text-slate-800 text-right">{bankInfo.bankName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
              <span className="text-slate-500">Chủ tài khoản</span>
              <span className="font-medium text-slate-800">{bankInfo.accountName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
              <span className="text-slate-500">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{bankInfo.accountNumber}</span>
                <button
                  onClick={() => handleCopy(bankInfo.accountNumber, 'Số tài khoản')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Sao chép STK"
                >
                  {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Nội dung chuyển tiền</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {bankInfo.transferContent}
                </span>
                <button
                  onClick={() => handleCopy(bankInfo.transferContent, 'Nội dung')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Sao chép nội dung"
                >
                  {copiedField === 'Nội dung' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-900 hover:bg-black text-white flex items-center gap-2 shadow-sm transition-all"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xác nhận...
              </>
            ) : (
              <>
                Tôi đã chuyển khoản thành công
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
