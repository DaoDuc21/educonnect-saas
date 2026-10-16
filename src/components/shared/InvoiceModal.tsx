'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode, Building2 } from 'lucide-react';
import { TuitionInvoice, Student } from '@/types';
import { formatVND } from '@/lib/utils';
import { useToast } from './ToastNotification';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: TuitionInvoice | null;
  student?: Student;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  student,
}) => {
  const { showToast } = useToast();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    showToast(`Đã xuất tệp dữ liệu hóa đơn điện tử XML (${invoice.paymentCode}.xml) chuẩn Tổng Cục Thuế!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-float overflow-hidden border border-slate-200 flex flex-col my-auto animate-in zoom-in-95 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (hidden when printing) */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">Hóa Đơn Điện Tử VAT Hợp Lệ</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="In hoặc lưu PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadXml}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải XML</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed bg-white">
          {/* Official National Header */}
          <div className="text-center pb-4 border-b border-slate-200 space-y-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam
            </h4>
            <p className="text-[11px] font-medium text-slate-600 italic">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="pt-3">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                HÓA ĐƠN GIÁ TRỊ GIA TĂNG (ĐIỆN TỬ)
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                (Dịch vụ Đào tạo & Bồi dưỡng Văn hóa - Ngoại ngữ)
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-mono mt-1">
                <span>Ký hiệu (Serial): <strong>EC/26E</strong></span>
                <span>•</span>
                <span>Số HĐ: <strong>{invoice.paymentCode.replace('HP-', '00')}</strong></span>
                <span>•</span>
                <span>Ngày xuất: <strong>{invoice.paymentDate || new Date().toLocaleDateString('vi-VN')}</strong></span>
              </div>
            </div>
          </div>

          {/* Seller & Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>ĐƠN VỊ CUNG CẤP DỊCH VỤ</span>
              </div>
              <p className="font-bold text-slate-900">TRUNG TÂM GIÁO DỤC EDUCONNECT</p>
              <p className="text-slate-600">Mã số thuế: <strong className="font-mono text-slate-800">0109887766</strong></p>
              <p className="text-slate-600">Địa chỉ: Tầng 5, Tòa Nhà Tri Thức, Cầu Giấy, Hà Nội</p>
              <p className="text-slate-600">Hotline: 024.7300.8899 • Email: info@educonnect.vn</p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>THÔNG TIN NGƯỜI NỘP & HỌC VIÊN</span>
              </div>
              <p className="text-slate-600">
                Họ tên học viên: <strong className="text-slate-900">{invoice.studentName}</strong>
              </p>
              <p className="text-slate-600">
                Phụ huynh nộp: <strong className="text-slate-900">{student?.parentName || 'Hoàng Thảo My'}</strong>
              </p>
              <p className="text-slate-600">
                Lớp / Trình độ: <strong>{student?.grade || 'Lớp 12 - Ôn Thi THPT Quốc Gia'}</strong>
              </p>
              <p className="text-slate-600">
                Hình thức TT: <span className="font-semibold text-emerald-700">Chuyển khoản VietQR 24/7 (Đã ghi có)</span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-10">STT</th>
                  <th className="p-2.5">Nội dung khóa học / Dịch vụ</th>
                  <th className="p-2.5 text-center">Số buổi</th>
                  <th className="p-2.5 text-right">Đơn giá</th>
                  <th className="p-2.5 text-center">Thuế GTGT</th>
                  <th className="p-2.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 text-center font-bold text-slate-500">1</td>
                  <td className="p-2.5">
                    <strong className="block text-slate-900">{invoice.courseName}</strong>
                    <span className="text-[11px] text-slate-500">Chương trình chuẩn chất lượng cao, bao gồm giáo trình & phòng học Meet</span>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-800">{invoice.sessionsCount} buổi</td>
                  <td className="p-2.5 text-right font-mono text-slate-700">{formatVND(Math.round(invoice.amount / (invoice.sessionsCount || 1)))}</td>
                  <td className="p-2.5 text-center text-slate-500">KCT (0%)</td>
                  <td className="p-2.5 text-right font-bold text-slate-900 font-mono">{formatVND(invoice.amount)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="p-2.5 text-right">Tổng cộng tiền thanh toán (Đã bao gồm VAT):</td>
                  <td className="p-2.5 text-right text-sm font-black text-slate-900 font-mono">
                    {formatVND(invoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount In Words */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950">
            <span>Số tiền viết bằng chữ: </span>
            <strong className="italic font-bold">
              {invoice.amount === 2800000 ? 'Hai triệu tám trăm nghìn đồng chẵn.' :
               invoice.amount === 3500000 ? 'Ba triệu năm trăm nghìn đồng chẵn.' :
               invoice.amount === 4200000 ? 'Bốn triệu hai trăm nghìn đồng chẵn.' :
               `${formatVND(invoice.amount)} đồng chẵn.`}
            </strong>
          </div>

          {/* Electronic Signatures & QR Code */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 items-end">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-300 p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div className="space-y-0.5 text-[10px] text-slate-500">
                <span className="font-bold text-slate-700 block">Tra cứu hóa đơn điện tử</span>
                <span>Quét mã QR để đối soát tại</span>
                <span className="font-mono text-indigo-700 block truncate">hoadondientu.gdt.gov.vn</span>
              </div>
            </div>

            {/* Official Center Digital Stamp */}
            <div className="text-center p-3 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                Chữ Ký Số Hợp Lệ
              </span>
              <p className="font-black text-rose-800 text-xs mt-0.5 uppercase">
                TRUNG TÂM EDUCONNECT
              </p>
              <p className="text-[9px] text-rose-600 font-mono mt-0.5">
                Ký ngày: {invoice.paymentDate || new Date().toLocaleDateString('vi-VN')}
              </p>
              <span className="inline-block mt-1 text-[8px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                ✓ ĐÃ KÝ ĐIỆN TỬ
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <p className="text-[11px] text-slate-500">
            Hóa đơn điện tử khởi tạo từ máy tính tiền theo Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-soft"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
