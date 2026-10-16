'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Phone, BookOpen, MoreVertical, CheckCircle2, PauseCircle } from 'lucide-react';
import { Student, Course, AttendanceRecord } from '@/types';
import { StatusBadge } from '../shared/Badge';
import { useToast } from '../shared/ToastNotification';
import { ExportDropdown } from '../common/ExportDropdown';
import {
  exportToExcel,
  exportToCSV,
  printFormattedTable,
  getStudentRosterExportColumns,
} from '@/lib/exportUtils';

interface StudentTableProps {
  students: Student[];
  courses?: Course[];
  attendanceRecords?: AttendanceRecord[];
}

export function StudentTable({ students, courses, attendanceRecords }: StudentTableProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Extract unique classes/courses from students and courses
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    if (courses) {
      courses.forEach((c) => set.add(c.title));
    }
    students.forEach((s) => {
      s.enrolledCourses.forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [courses, students]);

  const filtered = students.filter((s) => {
    const matchName =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchClass = selectedClass === 'all' || s.enrolledCourses.includes(selectedClass);
    return matchName && matchStatus && matchClass;
  });

  const columns = getStudentRosterExportColumns(selectedClass);
  const classSlug =
    selectedClass === 'all' ? 'toan-truong' : selectedClass.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const handleExportExcel = () => {
    exportToExcel(
      `Danh_Sach_Hoc_Sinh_${classSlug}_${new Date().toISOString().slice(0, 10)}`,
      columns,
      filtered,
      'DanhSachHocSinh'
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Danh_Sach_Hoc_Sinh_${classSlug}_${new Date().toISOString().slice(0, 10)}`,
      columns,
      filtered
    );
  };

  const handlePrintRoster = () => {
    const title =
      selectedClass === 'all'
        ? 'DANH SÁCH HỌC SINH TOÀN HỆ THỐNG'
        : `DANH SÁCH HỌC SINH LỚP: ${selectedClass.toUpperCase()}`;
    printFormattedTable(
      title,
      columns,
      filtered,
      `Lớp phụ trách: ${selectedClass === 'all' ? 'Toàn bộ khóa học' : selectedClass} • Tổng số học sinh: ${filtered.length} học viên`
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Header controls */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Học Sinh & Khóa Học
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng {students.length} học viên đang tham gia điều phối học tập
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class / Course Selector Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-[#F5F3EF] border border-slate-200/80 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">Tất cả lớp học ({students.length} HS)</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                Lớp: {cls}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, phụ huynh..."
              className="w-48 sm:w-56 bg-[#F5F3EF] border border-slate-200/80 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === 'suspended' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Bảo lưu
            </button>
          </div>

          {/* Export Dropdown */}
          <ExportDropdown
            title={selectedClass === 'all' ? 'Xuất danh sách' : `Xuất lớp (${filtered.length})`}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onPrint={handlePrintRoster}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">Học Sinh</th>
              <th className="py-3.5 px-4">Lớp & Trường</th>
              <th className="py-3.5 px-4">Phụ Huynh Liên Kết</th>
              <th className="py-3.5 px-4">Khóa Học Tham Gia</th>
              <th className="py-3.5 px-4">Tiến Độ Học</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                {/* Student Info */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs md:text-sm">
                        {student.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        Mã: {student.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Grade */}
                <td className="py-4 px-4 text-slate-600 font-medium">
                  {student.grade}
                </td>

                {/* Parent */}
                <td className="py-4 px-4">
                  <span className="font-semibold text-slate-800 block">
                    {student.parentName}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {student.parentPhone}
                  </span>
                </td>

                {/* Courses */}
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {student.enrolledCourses.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Progress bar */}
                <td className="py-4 px-4">
                  <div className="w-32">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Hoàn thành</span>
                      <span className="text-slate-900">{student.overallProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full transition-all duration-500"
                        style={{ width: `${student.overallProgress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <StatusBadge
                    status={student.status === 'active' ? 'active' : 'suspended'}
                    label={student.status === 'active' ? 'Đang học' : 'Bảo lưu'}
                  />
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => showToast(`Mở hồ sơ chi tiết học viên: ${student.name}`, 'info')}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Xem hồ sơ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
