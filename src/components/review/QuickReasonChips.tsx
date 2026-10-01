'use client';

import { cn } from '@/lib/utils/helpers';

interface QuickReasonChipsProps {
  selectedReason: string;
  onSelectReason: (reason: string) => void;
}

export function QuickReasonChips({ selectedReason, onSelectReason }: QuickReasonChipsProps) {
  const reasons = [
    'Tô trùng 2 đáp án',
    'Tẩy chưa sạch (smudge)',
    'Nét chì quá mờ',
    'Học sinh gạch chéo sửa',
    'Lỗi OCR / Nhận diện',
    'Giáo viên chấm thủ công',
  ];

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Lý do điều chỉnh (Reason)
      </label>
      <div className="flex flex-wrap gap-1.5">
        {reasons.map((reason) => {
          const isSelected = selectedReason === reason;
          return (
            <button
              key={reason}
              type="button"
              onClick={() => onSelectReason(reason)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {reason}
            </button>
          );
        })}
      </div>
    </div>
  );
}
