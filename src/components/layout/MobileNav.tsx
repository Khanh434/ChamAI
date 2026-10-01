'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/exams/new', label: 'Tạo đề', icon: PlusCircle },
    { href: '/exams', label: 'Đề thi', icon: FileText },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
