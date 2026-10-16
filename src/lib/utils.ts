import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SubjectType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function getSubjectColor(subject: SubjectType) {
  switch (subject) {
    case 'math':
      return {
        bg: 'bg-violet-100',
        text: 'text-violet-700',
        border: 'border-violet-200',
        dot: 'bg-violet-500',
        pill: 'bg-violet-50 text-violet-700 border border-violet-200',
        badge: 'bg-violet-100 text-violet-700 border border-violet-200',
        name: 'Toán học & Logic',
        label: 'Toán học & Logic',
      };
    case 'literature':
      return {
        bg: 'bg-sky-100',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
        pill: 'bg-sky-50 text-sky-700 border border-sky-200',
        badge: 'bg-sky-100 text-sky-700 border border-sky-200',
        name: 'Ngữ văn & Xã hội',
        label: 'Ngữ văn & Xã hội',
      };
    case 'english':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        name: 'Tiếng Anh & Ngoại ngữ',
        label: 'Tiếng Anh & Ngoại ngữ',
      };
    case 'science':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        pill: 'bg-amber-50 text-amber-800 border border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border border-amber-200',
        name: 'Khoa học Tự nhiên',
        label: 'Khoa học Tự nhiên',
      };
    case 'art':
      return {
        bg: 'bg-pink-100',
        text: 'text-pink-700',
        border: 'border-pink-200',
        dot: 'bg-pink-500',
        pill: 'bg-pink-50 text-pink-700 border border-pink-200',
        badge: 'bg-pink-100 text-pink-700 border border-pink-200',
        name: 'Nghệ thuật & Kỹ năng',
        label: 'Nghệ thuật & Kỹ năng',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500',
        pill: 'bg-slate-50 text-slate-700 border border-slate-200',
        badge: 'bg-slate-100 text-slate-700 border border-slate-200',
        name: 'Môn khác',
        label: 'Môn khác',
      };
  }
}
