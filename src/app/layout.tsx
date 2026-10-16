import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/shared/ToastNotification';

export const metadata: Metadata = {
  title: 'EduConnect - Trung Tâm Gia Sư & Điều Phối Học Tập Thông Minh',
  description: 'Hệ thống quản lý và điều phối học tập EdTech SaaS thế hệ mới chuẩn Maham Timetable & Be.run Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-[#F5F3EF] min-h-screen text-[#1E1E24] antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
