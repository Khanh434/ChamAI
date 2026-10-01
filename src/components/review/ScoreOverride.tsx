'use client';

import { cn } from '@/lib/utils/helpers';
import { Ban } from 'lucide-react';

interface ScoreOverrideProps {
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
  correctAnswer: string;
}

export function ScoreOverride({
  selectedAnswer,
  onSelectAnswer,
  correctAnswer,
}: ScoreOverrideProps) {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Chọn đáp án đúng thực tế của học sinh:
        </label>
        <span className="text-xs font-semibold text-slate-500">
          Đáp án chuẩn đề: <strong className="text-blue-600 font-bold">{correctAnswer}</strong>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isKey = opt === correctAnswer;

          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelectAnswer(opt)}
              className={cn(
                'flex h-12 flex-1 min-w-[50px] items-center justify-center rounded-xl font-black text-base transition-all active:scale-95',
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2'
                  : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              )}
            >
              <span>{opt}</span>
              {isKey && !isSelected && (
                <span className="ml-1 text-[10px] text-blue-500 font-semibold">(Đúng)</span>
              )}
            </button>
          );
        })}

        {/* Mark Blank option */}
        <button
          type="button"
          onClick={() => onSelectAnswer('BLANK')}
          className={cn(
            'flex h-12 items-center gap-1.5 rounded-xl border-2 px-3 text-xs font-bold transition-all',
            selectedAnswer === 'BLANK'
              ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500 ring-offset-1 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
          )}
        >
          <Ban className="h-4 w-4 text-rose-500" />
          <span>Bỏ trống / Không tính</span>
        </button>
      </div>
    </div>
  );
}
