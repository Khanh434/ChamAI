'use client';

import { FlaggedItem } from '@/types/result';
import { FlaggedItemCard } from './FlaggedItem';
import { CheckSquare, AlertTriangle, CheckCircle2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface ReviewBucketProps {
  items: FlaggedItem[];
  filterStatus: 'all' | 'unresolved' | 'resolved';
  onFilterChange: (status: 'all' | 'unresolved' | 'resolved') => void;
  onOverride: (flaggedItemId: string, correctedAnswer: string, reason: string) => Promise<void>;
}

export function ReviewBucket({
  items,
  filterStatus,
  onFilterChange,
  onOverride,
}: ReviewBucketProps) {
  const unresolvedCount = items.filter((i) => !i.questionResult.teacherOverride).length;
  const resolvedCount = items.filter((i) => Boolean(i.questionResult.teacherOverride)).length;

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'unresolved') return !item.questionResult.teacherOverride;
    if (filterStatus === 'resolved') return Boolean(item.questionResult.teacherOverride);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={cn(
              'rounded-lg px-3.5 py-1.5 text-xs font-bold transition',
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            Tất cả ({items.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('unresolved')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-bold transition',
              filterStatus === 'unresolved'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:text-amber-900 dark:text-amber-400'
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Cần duyệt ({unresolvedCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('resolved')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-bold transition',
              filterStatus === 'resolved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:text-emerald-900 dark:text-emerald-400'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đã duyệt ({resolvedCount})
          </button>
        </div>

        {/* Progress text */}
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Tiến độ duyệt: <strong className="text-blue-600 font-bold">{resolvedCount}</strong> /{' '}
          {items.length} câu ({items.length > 0 ? +((resolvedCount / items.length) * 100).toFixed(0) : 100}%)
        </div>
      </div>

      {/* List of items */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            Không có câu hỏi nào trong mục này
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Tất cả các câu nghi vấn đã được xử lý xong hoặc không có câu nào bị đánh cờ.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <FlaggedItemCard key={item.id} item={item} onOverride={onOverride} />
          ))}
        </div>
      )}
    </div>
  );
}
