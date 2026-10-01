'use client';

import { ExamType } from '@/types/exam';
import { Layers, FileSpreadsheet, Check } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface ExamTypeSelectorProps {
  value: ExamType;
  onChange: (value: ExamType) => void;
}

export function ExamTypeSelector({ value, onChange }: ExamTypeSelectorProps) {
  const options = [
    {
      id: 'branch_a' as ExamType,
      title: 'Phiếu Tô Chuẩn (Branch A)',
      subtitle: 'Phiếu trắc nghiệm theo mẫu chuẩn (Bộ GD&ĐT, mẫu 20/40/50 câu)',
      icon: FileSpreadsheet,
      badge: 'Khuyên dùng',
    },
    {
      id: 'branch_b' as ExamType,
      title: 'Đề Thi Trực Tiếp (Branch B)',
      subtitle: 'Khoanh tròn hoặc tô trực tiếp lên đề thi/tờ bài làm cổ điển',
      icon: Layers,
      badge: 'Linh hoạt',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const isSelected = value === opt.id;
        const Icon = opt.icon;

        return (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-4 transition-all',
              isSelected
                ? 'border-blue-600 bg-blue-50/50 shadow-sm dark:border-blue-500 dark:bg-blue-950/20'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {opt.title}
                  </h4>
                  <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {opt.badge}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {opt.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
