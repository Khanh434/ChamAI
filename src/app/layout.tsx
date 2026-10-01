import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { InstallPrompt } from '@/components/layout/InstallPrompt';

export const metadata: Metadata = {
  title: 'ChamAI — Ứng dụng Chấm Thi Trắc Nghiệm Thông Minh',
  description:
    'Giải pháp chấm thi trắc nghiệm AI trên di động dành cho giáo viên. Chấm nhanh bằng camera, tự động phát hiện câu nghi vấn, xuất Excel bảng điểm tức thì.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-512.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 pb-20 md:pb-6">
        <InstallPrompt />
        <Header />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
