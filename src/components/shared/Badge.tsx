'use client';

import React from 'react';
import { cn, getSubjectColor } from '@/lib/utils';
import { SubjectType } from '@/types';

interface SubjectBadgeProps {
  subject: SubjectType;
  className?: string;
  size?: 'sm' | 'md';
}

export function SubjectBadge({ subject, className, size = 'md' }: SubjectBadgeProps) {
  const info = getSubjectColor(subject);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        info.bg,
        info.text,
        info.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', info.dot)} />
      {info.name}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'overdue' | 'paid' | 'active' | 'suspended';
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const getDetails = () => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          text: label || 'Confirmed',
        };
      case 'paid':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          text: label || 'Đã nộp',
        };
      case 'pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          text: label || 'Chờ xử lý',
        };
      case 'overdue':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          text: label || 'Quá hạn',
        };
      case 'active':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          text: label || 'Đang học',
        };
      case 'suspended':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          text: label || 'Đã bảo lưu',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          text: label || status,
        };
    }
  };

  const details = getDetails();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-sm',
        details.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', details.dot)} />
      {details.text}
    </span>
  );
}
