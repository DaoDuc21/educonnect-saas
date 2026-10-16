'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Printer, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExportDropdownProps {
  title?: string;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  variant?: 'dropdown' | 'buttons';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function ExportDropdown({
  title = 'Xuất dữ liệu',
  onExportExcel,
  onExportCSV,
  onPrint,
  variant = 'dropdown',
  disabled = false,
  className,
  size = 'md',
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Variant 1: Segmented Button Group
  if (variant === 'buttons') {
    return (
      <div
        className={cn(
          'inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-sm gap-1',
          className
        )}
      >
        <button
          type="button"
          onClick={onExportExcel}
          disabled={disabled}
          title="Xuất định dạng Microsoft Excel (.xls)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-white transition-all shadow-none hover:shadow-sm active:scale-95 disabled:opacity-50"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Excel</span>
        </button>

        <button
          type="button"
          onClick={onExportCSV}
          disabled={disabled}
          title="Xuất định dạng CSV tiếng Việt UTF-8 BOM"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-white transition-all shadow-none hover:shadow-sm active:scale-95 disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          <span>CSV</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          disabled={disabled}
          title="Mở biểu mẫu in ấn A4 chuẩn hóa"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-white transition-all shadow-none hover:shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Printer className="w-3.5 h-3.5 text-indigo-600" />
          <span>In</span>
        </button>
      </div>
    );
  }

  // Variant 2: Elegant Dropdown Menu
  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-sm active:scale-95 border disabled:opacity-50 cursor-pointer',
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs',
          isOpen
            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/10'
            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        )}
      >
        <Download className="w-3.5 h-3.5 text-amber-500" />
        <span>{title}</span>
        <ChevronDown
          className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-white')}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Chọn định dạng xuất file
            </span>
          </div>

          <div className="space-y-1 pt-1">
            {/* Export Excel */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onExportExcel();
              }}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                  Xuất Microsoft Excel (.xls)
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Bảng tính có định dạng, bảo toàn số 0 điện thoại
                </div>
              </div>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onExportCSV();
              }}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50/70 transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-sky-100/70 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-900">
                  Xuất Tệp CSV (.csv)
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Chuẩn UTF-8 BOM hiển thị tiếng Việt có dấu
                </div>
              </div>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Print Document */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onPrint();
              }}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-indigo-50/70 transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-indigo-100/70 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                  In Biểu Mẫu A4 (Print / PDF)
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Biểu mẫu hành chính kèm 3 chữ ký kiểm duyệt
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
