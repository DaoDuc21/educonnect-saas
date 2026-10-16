import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ToastProvider } from '@/components/shared/ToastNotification';

export const metadata: Metadata = {
  title: 'EduConnect - Trung Tâm Gia Sư & Điều Phối Học Tập Thông Minh',
  description: 'Hệ thống quản lý và điều phối học tập EdTech SaaS thế hệ mới chuẩn Maham Timetable & Be.run Dashboard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F172A',
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
