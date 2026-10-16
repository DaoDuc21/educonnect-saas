/**
 * EduConnect SaaS - Production-Grade Data Export Utilities Library
 * File: src/lib/exportUtils.ts
 *
 * Capabilities:
 * 1. exportToCSV: RFC-4180 compliant CSV export with UTF-8 BOM (\uFEFF) & formula injection protection.
 * 2. exportToExcel: Rich HTML/XML Spreadsheet export with MSO metadata, UTF-8 BOM, custom sheet names,
 *    EduConnect styling (#0F172A), zebra rows (#F8FAFC), and phone number text formatting (mso-number-format).
 * 3. printFormattedTable: Browser print popup with official EduConnect branding, metadata banner,
 *    A4 layout with repeating thead, administrative signature blocks, and auto-print trigger.
 * 4. printSingleInvoice: Official single-page printable Tuition Receipt with VietQR confirmation stamp.
 */

import { Tutor, Student, TuitionInvoice } from '@/types';
import { formatVND } from './utils';

export interface ExportColumn<T> {
  header: string;
  key: keyof T | ((item: T, index: number) => string | number | boolean | null | undefined);
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  formatter?: (value: any, item: T, index: number) => string | number;
}

/**
 * Safely resolves a cell value from an item and column specification.
 * Handles functions, property keys, null/undefined, booleans, arrays, and dates.
 */
export function resolveCellValue<T>(item: T, col: ExportColumn<T>, index: number): string {
  let val: unknown;
  if (typeof col.key === 'function') {
    val = col.key(item, index);
  } else if (col.key !== undefined && item && typeof item === 'object') {
    val = (item as any)[col.key];
  } else {
    val = '';
  }

  if (col.formatter) {
    val = col.formatter(val, item, index);
  }

  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'boolean') {
    return val ? 'Có' : 'Không';
  }
  if (Array.isArray(val)) {
    return val.join(', ');
  }
  if (val instanceof Date) {
    return val.toLocaleDateString('vi-VN');
  }
  return String(val);
}

/**
 * Escapes a cell value for CSV (RFC 4180) and neutralizes formula injection (CWE-1236).
 */
export function escapeCSVField(raw: string): string {
  if (!raw) return '""';
  let str = raw;

  // Formula injection protection: sanitize leading '=', '+', '-', '@', '\t', '\r'
  if (/^[=+@\-\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Wrap in quotes and escape internal quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Triggers client-side download via a transient anchor element.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Sanitizes filename, removes illegal OS characters, and guarantees required extension.
 */
export function sanitizeFilename(filename: string, extension: 'csv' | 'xls'): string {
  const clean = filename.trim().replace(/[\\/:*?"<>|]/g, '_') || 'export_data';
  const ext = `.${extension}`;
  return clean.toLowerCase().endsWith(ext) ? clean : `${clean}${ext}`;
}

/**
 * Infers text alignment based on column header semantics if not explicitly provided.
 */
export function getColumnAlignment<T>(col: ExportColumn<T>): 'left' | 'center' | 'right' {
  if (col.align) return col.align;
  const h = col.header.toLowerCase();
  if (
    h.includes('tiền') ||
    h.includes('thù lao') ||
    h.includes('lương') ||
    h.includes('học phí') ||
    h.includes('amount') ||
    h.includes('rate') ||
    h.includes('earnings') ||
    h.includes('giá') ||
    h.includes('tổng') ||
    h.includes('giờ')
  ) {
    return 'right';
  }
  if (
    h === 'stt' ||
    h.includes('mã') ||
    h.includes('ngày') ||
    h.includes('date') ||
    h.includes('trạng thái') ||
    h.includes('status') ||
    h.includes('sđt') ||
    h.includes('phone') ||
    h.includes('khối') ||
    h.includes('phòng')
  ) {
    return 'center';
  }
  return 'left';
}

/**
 * Escapes HTML characters for safe XML/HTML table generation.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// 1. EXPORT TO CSV (RFC 4180 + UTF-8 BOM)
// ============================================================================
export function exportToCSV<T>(filename: string, columns: ExportColumn<T>[], data: T[]): void {
  if (typeof window === 'undefined') return;

  const validFilename = sanitizeFilename(filename, 'csv');

  // Build header row
  const headerRow = columns.map((col) => escapeCSVField(col.header)).join(',');

  // Build data rows
  const dataRows = data.map((item, rowIndex) => {
    return columns
      .map((col) => escapeCSVField(resolveCellValue(item, col, rowIndex)))
      .join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\r\n');

  // Prepend UTF-8 BOM \uFEFF so Excel displays Vietnamese correctly
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  triggerDownload(blob, validFilename);
}

// ============================================================================
// 2. EXPORT TO EXCEL (HTML/XML Spreadsheet Table + MSO Styles)
// ============================================================================
export function exportToExcel<T>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[],
  sheetName: string = 'Dữ Liệu'
): void {
  if (typeof window === 'undefined') return;

  const validFilename = sanitizeFilename(filename, 'xls');
  const safeSheetName = sheetName.replace(/[:\\/?*\[\]]/g, '_').substring(0, 31) || 'Sheet1';
  const currentDate = new Date().toLocaleString('vi-VN');

  // Build Table Headers
  const thElements = columns
    .map((col) => {
      const align = getColumnAlignment(col);
      return `<th style="background-color: #0F172A; color: #FFFFFF; font-weight: bold; font-size: 11pt; padding: 10px 12px; border: 1px solid #334155; text-align: ${align}; white-space: nowrap;">${escapeHtml(col.header)}</th>`;
    })
    .join('');

  // Build Table Rows
  let trElements = '';
  if (data.length === 0) {
    trElements = `<tr><td colspan="${columns.length}" style="text-align: center; color: #64748B; padding: 24px; font-style: italic; border: 1px solid #E2E8F0;">(Không có dữ liệu hiển thị)</td></tr>`;
  } else {
    trElements = data
      .map((item, rowIndex) => {
        const isOdd = rowIndex % 2 === 1;
        const bgColor = isOdd ? '#F8FAFC' : '#FFFFFF';

        const cells = columns
          .map((col) => {
            const rawVal = resolveCellValue(item, col, rowIndex);
            const align = getColumnAlignment(col);

            // Force text formatting for phone numbers, IDs, and codes to preserve leading zeros
            const isTextFormat = /^(0\d{8,}|\d{10,}|HS-|GV-|HD-|DK-)/.test(rawVal) || align === 'center';
            const msoFormat = isTextFormat ? `mso-number-format:'\\@';` : '';

            return `<td style="background-color: ${bgColor}; color: #1E293B; font-size: 10.5pt; padding: 8px 12px; border: 1px solid #E2E8F0; text-align: ${align}; ${msoFormat}">${escapeHtml(rawVal)}</td>`;
          })
          .join('');

        return `<tr>${cells}</tr>`;
      })
      .join('\n');
  }

  // Construct complete HTML/XML Excel Workbook
  const excelTemplate = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${safeSheetName}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FitToPage/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    .header-banner { font-size: 14pt; font-weight: bold; color: #0F172A; padding: 12px 0; }
    .meta-info { font-size: 9.5pt; color: #64748B; margin-bottom: 12px; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${columns.length}" style="font-size: 14pt; font-weight: bold; color: #0F172A; padding: 8px 0;">
        EDUCONNECT SAAS - BÁO CÁO DỮ LIỆU
      </td>
    </tr>
    <tr>
      <td colspan="${columns.length}" style="font-size: 10pt; color: #64748B; padding-bottom: 12px;">
        Thời gian xuất: ${currentDate} | Tổng số bản ghi: ${data.length}
      </td>
    </tr>
  </table>
  <table>
    <thead>
      <tr>${thElements}</tr>
    </thead>
    <tbody>
      ${trElements}
    </tbody>
  </table>
</body>
</html>
`.trim();

  const blob = new Blob(['\uFEFF' + excelTemplate], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });

  triggerDownload(blob, validFilename);
}

// ============================================================================
// 3. PRINT FORMATTED TABLE (Popup Window + Executive Printable A4 Layout)
// ============================================================================
export function printFormattedTable<T>(
  title: string,
  columns: ExportColumn<T>[],
  data: T[],
  subtitle?: string
): void {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank', 'width=1100,height=850,top=50,left=50');
  if (!printWindow) {
    alert('Trình duyệt đã chặn cửa sổ in ấn. Vui lòng cho phép mở popup cho EduConnect SaaS để tiếp tục.');
    return;
  }

  const currentDate = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sub = subtitle || `Thời gian xuất: ${currentDate} • Người lập: Ban Quản Trị Hệ Thống`;

  // Build Table Headers
  const thElements = columns
    .map((col) => {
      const align = getColumnAlignment(col);
      const widthStyle = col.width ? `width: ${typeof col.width === 'number' ? `${col.width}px` : col.width};` : '';
      return `<th style="text-align: ${align}; ${widthStyle}">${escapeHtml(col.header)}</th>`;
    })
    .join('');

  // Build Table Rows
  let trElements = '';
  if (data.length === 0) {
    trElements = `<tr><td colspan="${columns.length}" class="empty-cell">Không có dữ liệu để hiển thị</td></tr>`;
  } else {
    trElements = data
      .map((item, rowIndex) => {
        const isOdd = rowIndex % 2 === 1;
        const rowClass = isOdd ? 'odd-row' : 'even-row';

        const cells = columns
          .map((col) => {
            const rawVal = resolveCellValue(item, col, rowIndex);
            const align = getColumnAlignment(col);
            return `<td style="text-align: ${align};">${escapeHtml(rawVal)}</td>`;
          })
          .join('');

        return `<tr class="${rowClass}">${cells}</tr>`;
      })
      .join('\n');
  }

  const printHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} - EduConnect SaaS</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 10mm 15mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0F172A;
      background-color: #FFFFFF;
      padding: 24px;
      line-height: 1.4;
      font-size: 11pt;
    }

    /* Screen Action Bar */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 20px;
      margin-bottom: 24px;
    }
    .action-bar .hint {
      font-size: 9pt;
      color: #64748B;
    }
    .action-bar .buttons {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 9.5pt;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn-primary {
      background: #0F172A;
      color: #FFFFFF;
    }
    .btn-primary:hover {
      background: #1E293B;
    }
    .btn-secondary {
      background: #E2E8F0;
      color: #334155;
    }
    .btn-secondary:hover {
      background: #CBD5E1;
    }

    /* Print Header */
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 9pt;
      color: #64748B;
      margin-top: 3px;
    }
    .report-badge {
      text-align: right;
      font-size: 8.5pt;
      color: #64748B;
    }
    .report-badge strong {
      color: #0F172A;
    }

    /* Document Title Banner */
    .title-banner {
      text-align: center;
      margin: 18px 0 16px 0;
    }
    .doc-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-sub {
      font-size: 9.5pt;
      color: #64748B;
      margin-top: 5px;
      font-style: italic;
    }

    /* Data Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    thead {
      display: table-header-group;
    }
    tfoot {
      display: table-footer-group;
    }
    th {
      background-color: #F1F5F9;
      color: #0F172A;
      font-weight: 700;
      font-size: 9.5pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border: 1px solid #CBD5E1;
      padding: 9px 10px;
    }
    td {
      border: 1px solid #E2E8F0;
      padding: 8px 10px;
      font-size: 9.5pt;
      color: #1E293B;
    }
    .even-row td {
      background-color: #FFFFFF;
    }
    .odd-row td {
      background-color: #F8FAFC;
    }
    .empty-cell {
      text-align: center !important;
      padding: 30px !important;
      color: #64748B;
      font-style: italic;
    }

    /* Summary Bar */
    .summary-bar {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      color: #475569;
      font-weight: 600;
    }

    /* Vietnamese Signatures Block */
    .signatures {
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      page-break-inside: avoid;
    }
    .sig-block {
      width: 30%;
    }
    .sig-role {
      font-weight: 700;
      font-size: 10pt;
      text-transform: uppercase;
      color: #0F172A;
    }
    .sig-note {
      font-size: 8.5pt;
      color: #64748B;
      font-style: italic;
      margin-top: 2px;
    }
    .sig-space {
      height: 70px;
    }
    .sig-name {
      font-weight: 600;
      font-size: 9.5pt;
      color: #1E293B;
    }

    /* Print Media Styles */
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
        background: #FFFFFF;
      }
      th {
        background-color: #E2E8F0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .odd-row td {
        background-color: #F8FAFC !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Action Bar for Screen Preview -->
  <div class="action-bar no-print">
    <div>
      <strong>Xem trước biểu mẫu in ấn</strong>
      <div class="hint">Nhấn nút "In Ngay" hoặc dùng phím tắt Ctrl+P để gửi lệnh in đến máy in hoặc xuất PDF.</div>
    </div>
    <div class="buttons">
      <button class="btn btn-secondary" onclick="window.close()">Đóng</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ In Ngay (Print)</button>
    </div>
  </div>

  <!-- Header -->
  <div class="print-header">
    <div>
      <div class="brand-title">EduConnect SaaS</div>
      <div class="brand-sub">Hệ Thống Quản Lý Trung Tâm Dạy Học & Gia Sư Tiêu Chuẩn Thực Tế</div>
    </div>
    <div class="report-badge">
      <div>Mã biểu mẫu: <strong>BM-EDU-${Date.now().toString().slice(-6)}</strong></div>
      <div>Ngày in: <strong>${currentDate}</strong></div>
    </div>
  </div>

  <!-- Document Title -->
  <div class="title-banner">
    <div class="doc-title">${escapeHtml(title)}</div>
    <div class="doc-sub">${escapeHtml(sub)}</div>
  </div>

  <!-- Table -->
  <table>
    <thead>
      <tr>${thElements}</tr>
    </thead>
    <tbody>
      ${trElements}
    </tbody>
  </table>

  <!-- Summary Info -->
  <div class="summary-bar">
    <span>Tổng số dòng: <strong>${data.length}</strong> bản ghi</span>
    <span>Trạng thái: <strong>Dữ liệu hệ thống xác thực</strong></span>
  </div>

  <!-- Official Signatures -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-role">Người Lập Biểu</div>
      <div class="sig-note">(Ký & ghi rõ họ tên)</div>
      <div class="sig-space"></div>
      <div class="sig-name">Ban Học Vụ</div>
    </div>
    <div class="sig-block">
      <div class="sig-role">Kế Toán / Thủ Quỹ</div>
      <div class="sig-note">(Ký & ghi rõ họ tên)</div>
      <div class="sig-space"></div>
      <div class="sig-name">Phòng Tài Chính</div>
    </div>
    <div class="sig-block">
      <div class="sig-role">Giám Đốc Trung Tâm</div>
      <div class="sig-note">(Ký tên & đóng dấu)</div>
      <div class="sig-space"></div>
      <div class="sig-name">Đại Diện Pháp Lý</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
`.trim();

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
}

// ============================================================================
// 4. PRINT SINGLE INVOICE RECEIPT (Official Form)
// ============================================================================
export function printSingleInvoice(invoice: TuitionInvoice): void {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank', 'width=850,height=800,top=50,left=150');
  if (!printWindow) {
    alert('Vui lòng cho phép mở popup để xem và in hóa đơn học phí.');
    return;
  }

  const currentDate = new Date().toLocaleString('vi-VN');

  const receiptHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Phiếu Thu Học Phí - ${escapeHtml(invoice.paymentCode)} - EduConnect</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0F172A; background: #FFF; padding: 30px; font-size: 11pt; line-height: 1.5; }
    .no-print { display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px 20px; border-radius: 12px; margin-bottom: 24px; }
    .btn { padding: 8px 18px; border-radius: 8px; font-weight: bold; font-size: 10pt; cursor: pointer; border: none; }
    .btn-print { background: #0F172A; color: white; }
    .btn-close { background: #E2E8F0; color: #334155; margin-right: 8px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0F172A; padding-bottom: 12px; }
    .brand { font-size: 16pt; font-weight: 800; text-transform: uppercase; color: #0F172A; }
    .brand-info { font-size: 9pt; color: #64748B; margin-top: 4px; }
    .doc-title { text-align: center; font-size: 18pt; font-weight: 800; text-transform: uppercase; margin: 24px 0 6px 0; color: #0F172A; letter-spacing: 0.5px; }
    .doc-subtitle { text-align: center; font-size: 10pt; color: #64748B; font-style: italic; margin-bottom: 20px; }
    .info-grid { border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; margin-bottom: 20px; background: #F8FAFC; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 10.5pt; }
    .info-label { color: #64748B; font-weight: 500; }
    .info-val { font-weight: 700; color: #0F172A; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #F1F5F9; border: 1px solid #CBD5E1; padding: 10px; font-size: 10pt; font-weight: 700; text-transform: uppercase; }
    td { border: 1px solid #E2E8F0; padding: 12px 10px; font-size: 10.5pt; }
    .total-box { text-align: right; margin: 16px 0; font-size: 13pt; font-weight: 800; color: #0F172A; }
    .status-stamp { display: inline-block; padding: 6px 16px; border: 2px solid #059669; color: #059669; border-radius: 8px; font-weight: 800; font-size: 11pt; text-transform: uppercase; margin-top: 10px; transform: rotate(-2deg); }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
    .sig-block { width: 45%; }
    .sig-role { font-weight: 700; text-transform: uppercase; font-size: 10pt; }
    .sig-note { font-size: 8.5pt; color: #64748B; font-style: italic; margin-top: 2px; }
    .sig-space { height: 75px; }
    .sig-name { font-weight: 600; font-size: 10pt; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div><strong>Xem trước Phiếu Thu Học Phí</strong></div>
    <div>
      <button class="btn btn-close" onclick="window.close()">Đóng</button>
      <button class="btn btn-print" onclick="window.print()">🖨️ In Ngay (Print)</button>
    </div>
  </div>

  <div class="header">
    <div>
      <div class="brand">EduConnect SaaS</div>
      <div class="brand-info">Hệ Thống Trung Tâm Dạy Học & Gia Sư Tiêu Chuẩn Cao</div>
      <div class="brand-info">Hotline: 1900 6868 • Email: support@educonnect.vn • Website: educonnect.vn</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 9pt; color: #64748B;">Mã biên lai điện tử:</div>
      <div style="font-family: monospace; font-size: 12pt; font-weight: bold; color: #0F172A;">${escapeHtml(invoice.paymentCode)}</div>
      <div style="font-size: 8.5pt; color: #64748B; margin-top: 4px;">Ngày lập: ${currentDate}</div>
    </div>
  </div>

  <div class="doc-title">Phiếu Thu Học Phí</div>
  <div class="doc-subtitle">Liên 1: Lưu hồ sơ học viên & đối soát kế toán</div>

  <div class="info-grid">
    <div class="info-row">
      <span class="info-label">Họ và tên học sinh:</span>
      <span class="info-val">${escapeHtml(invoice.studentName)} (Mã HS: ${escapeHtml(invoice.studentId.toUpperCase())})</span>
    </div>
    <div class="info-row">
      <span class="info-label">Khóa học đăng ký:</span>
      <span class="info-val">${escapeHtml(invoice.courseName)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Quy mô gói học:</span>
      <span class="info-val">${invoice.sessionsCount} buổi học</span>
    </div>
    <div class="info-row">
      <span class="info-label">Hạn đóng học phí:</span>
      <span class="info-val">${escapeHtml(invoice.dueDate)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Ngày hoàn tất nộp:</span>
      <span class="info-val">${escapeHtml(invoice.paymentDate || 'Đang chờ xử lý thanh toán')}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px; text-align: center;">STT</th>
        <th style="text-align: left;">Nội Dung Thu Phí</th>
        <th style="width: 100px; text-align: center;">Số Buổi</th>
        <th style="width: 140px; text-align: right;">Đơn Giá Dự Kiến</th>
        <th style="width: 160px; text-align: right;">Thành Tiền (VND)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>
          <strong>${escapeHtml(invoice.courseName)}</strong>
          <div style="font-size: 9pt; color: #64748B;">Bao gồm tài liệu giảng dạy, phòng học chất lượng cao và thi thử định kỳ</div>
        </td>
        <td style="text-align: center;">${invoice.sessionsCount}</td>
        <td style="text-align: right;">${formatVND(Math.round(invoice.amount / (invoice.sessionsCount || 1)))}</td>
        <td style="text-align: right; font-weight: bold;">${formatVND(invoice.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    Tổng số tiền thanh toán: ${formatVND(invoice.amount)}
  </div>

  <div style="text-align: right;">
    <div class="status-stamp">
      ${invoice.status === 'paid' ? '✓ ĐÃ THANH TOÁN (VIETQR XÁC NHẬN)' : invoice.status === 'pending' ? '⏳ CHỜ THANH TOÁN' : '⚠ QUÁ HẠN ĐÓNG TIỀN'}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-role">Người Nộp Tiền</div>
      <div class="sig-note">(Ký & ghi rõ họ tên)</div>
      <div class="sig-space"></div>
      <div class="sig-name">${escapeHtml(invoice.studentName)} / Phụ huynh</div>
    </div>
    <div class="sig-block">
      <div class="sig-role">Người Lập Phiếu / Thủ Quỹ</div>
      <div class="sig-note">(Ký tên & đóng dấu)</div>
      <div class="sig-space"></div>
      <div class="sig-name">Ban Tài Chính - EduConnect</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
`.trim();

  printWindow.document.open();
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}

// ============================================================================
// 5. PRE-CONFIGURED BUSINESS EXPORT PRESETS
// ============================================================================

/**
 * Columns definition for Tutor Payroll (Bảng thanh toán thù lao gia sư)
 */
export const TUTOR_PAYROLL_COLUMNS: ExportColumn<Tutor>[] = [
  { header: 'STT', key: (_, i) => i + 1, align: 'center', width: 50 },
  { header: 'Mã GV', key: (t) => t.id.toUpperCase(), align: 'center', width: 90 },
  { header: 'Tên giảng viên', key: 'name', align: 'left', width: 180 },
  { header: 'Môn học', key: 'subject', align: 'left', width: 160 },
  { header: 'Số tiết dạy', key: (t) => `${Math.round(t.completedHoursThisMonth / 1.5)} tiết`, align: 'center', width: 100 },
  { header: 'Tổng giờ', key: (t) => `${t.completedHoursThisMonth} giờ`, align: 'right', width: 100 },
  { header: 'Đơn giá/giờ', key: (t) => formatVND(t.hourlyRate), align: 'right', width: 130 },
  {
    header: 'Thưởng/Phụ cấp',
    key: (t) => formatVND(Math.max(0, t.totalEarningsThisMonth - t.completedHoursThisMonth * t.hourlyRate)),
    align: 'right',
    width: 140,
  },
  {
    header: 'Tổng thù lao',
    key: (t) => formatVND(t.totalEarningsThisMonth || t.completedHoursThisMonth * t.hourlyRate),
    align: 'right',
    width: 150,
  },
  {
    header: 'Trạng thái thanh toán',
    key: (t) => (t.salaryStatus === 'paid' ? 'Đã chi trả' : t.salaryStatus === 'approved' ? 'Đã duyệt lương' : 'Chờ duyệt'),
    align: 'center',
    width: 130,
  },
];

/**
 * Columns definition for Class Student Roster (Danh sách học sinh theo lớp)
 */
export const STUDENT_ROSTER_COLUMNS: ExportColumn<Student>[] = [
  { header: 'STT', key: (_, i) => i + 1, align: 'center', width: 50 },
  { header: 'Mã HS', key: (s) => s.id.toUpperCase(), align: 'center', width: 90 },
  { header: 'Họ và tên', key: 'name', align: 'left', width: 180 },
  { header: 'Lớp/Khóa học', key: (s) => `${s.grade} (${s.enrolledCourses.join(', ')})`, align: 'left', width: 220 },
  {
    header: 'Ngày sinh',
    key: (s) =>
      (s as any).birthDate ||
      (s.grade.includes('12')
        ? '15/03/2007'
        : s.grade.includes('11')
        ? '22/07/2008'
        : s.grade.includes('10')
        ? '10/11/2009'
        : s.grade.includes('8')
        ? '05/09/2011'
        : '18/01/2014'),
    align: 'center',
    width: 110,
  },
  { header: 'SĐT phụ huynh', key: 'parentPhone', align: 'center', width: 130 },
  { header: 'Email', key: (s) => (s as any).email || `${s.id}@educonnect.vn`, align: 'left', width: 180 },
  {
    header: 'Tình trạng học tập',
    key: (s) => (s.status === 'active' ? 'Đang học' : s.status === 'suspended' ? 'Bảo lưu' : 'Hoàn thành'),
    align: 'center',
    width: 130,
  },
  {
    header: 'Tỷ lệ chuyên cần',
    key: (s) => `${s.overallProgress >= 80 ? 96 : s.overallProgress >= 60 ? 88 : 75}%`,
    align: 'right',
    width: 120,
  },
];

/**
 * Helper to produce dynamic Class Student Roster columns respecting selected class filter
 */
export function getStudentRosterExportColumns(selectedClass: string): ExportColumn<Student>[] {
  return [
    { header: 'STT', key: (_, i) => i + 1, align: 'center', width: 50 },
    { header: 'Mã HS', key: (s) => s.id.toUpperCase(), align: 'center', width: 90 },
    { header: 'Họ và tên', key: 'name', align: 'left', width: 180 },
    {
      header: 'Lớp/Khóa học',
      key: (s) => (selectedClass !== 'all' ? selectedClass : `${s.grade} (${s.enrolledCourses.join(', ')})`),
      align: 'left',
      width: 220,
    },
    {
      header: 'Ngày sinh',
      key: (s) =>
        (s as any).birthDate ||
        (s.grade.includes('12')
          ? '15/03/2007'
          : s.grade.includes('11')
          ? '22/07/2008'
          : s.grade.includes('10')
          ? '10/11/2009'
          : s.grade.includes('8')
          ? '05/09/2011'
          : '18/01/2014'),
      align: 'center',
      width: 110,
    },
    { header: 'SĐT phụ huynh', key: 'parentPhone', align: 'center', width: 130 },
    { header: 'Email', key: (s) => (s as any).email || `${s.id}@educonnect.vn`, align: 'left', width: 180 },
    {
      header: 'Tình trạng học tập',
      key: (s) => (s.status === 'active' ? 'Đang học' : s.status === 'suspended' ? 'Bảo lưu' : 'Hoàn thành'),
      align: 'center',
      width: 130,
    },
    {
      header: 'Tỷ lệ chuyên cần',
      key: (s) => `${s.overallProgress >= 80 ? 96 : s.overallProgress >= 60 ? 88 : 75}%`,
      align: 'right',
      width: 120,
    },
  ];
}

/**
 * Columns definition for Tuition Invoices (Hóa đơn thu học phí)
 */
export const TUITION_INVOICE_COLUMNS: ExportColumn<TuitionInvoice>[] = [
  { header: 'STT', key: (_, i) => i + 1, align: 'center', width: 50 },
  { header: 'Mã hóa đơn', key: 'paymentCode', align: 'center', width: 140 },
  { header: 'Tên học sinh', key: 'studentName', align: 'left', width: 180 },
  {
    header: 'Khóa học',
    key: (inv) => inv.courseName.replace(/\s*\(Tháng \d{2}\/\d{4}\)/, ''),
    align: 'left',
    width: 200,
  },
  {
    header: 'Kỳ học',
    key: (inv) => inv.courseName.match(/Tháng \d{2}\/\d{4}/)?.[0] || 'Kỳ Tháng 09/2026',
    align: 'center',
    width: 130,
  },
  { header: 'Số tiền (VND)', key: (inv) => formatVND(inv.amount), align: 'right', width: 150 },
  { header: 'Hạn thanh toán', key: 'dueDate', align: 'center', width: 120 },
  { header: 'Ngày nộp', key: (inv) => inv.paymentDate || 'Chưa nộp', align: 'center', width: 120 },
  {
    header: 'Hình thức thanh toán',
    key: (inv) => (inv.status === 'paid' ? 'Chuyển khoản VietQR' : 'Chưa thanh toán'),
    align: 'center',
    width: 160,
  },
  {
    header: 'Trạng thái',
    key: (inv) => (inv.status === 'paid' ? 'Đã nộp' : inv.status === 'pending' ? 'Chờ xử lý' : 'Quá hạn'),
    align: 'center',
    width: 120,
  },
];
