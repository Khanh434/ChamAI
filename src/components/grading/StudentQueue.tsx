'use client';

import { StudentSubmission } from '@/types/grading';
import { ChevronLeft, ChevronRight, Plus, Users, Trash2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn, formatScore, getScoreBadgeColor } from '@/lib/utils/helpers';

interface StudentQueueProps {
  submissions: StudentSubmission[];
  currentIndex: number;
  onSelectStudent: (index: number) => void;
  onAddStudent: () => void;
  onRemoveStudent: (index: number) => void;
  onUpdateInfo: (index: number, name?: string, id?: string) => void;
}

export function StudentQueue({
  submissions,
  currentIndex,
  onSelectStudent,
  onAddStudent,
  onRemoveStudent,
  onUpdateInfo,
}: StudentQueueProps) {
  const currentSub = submissions[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < submissions.length - 1;

  const completedCount = submissions.filter((s) => s.status === 'completed' || s.status === 'review_needed').length;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Top row: Student Selector & Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => onSelectStudent(currentIndex - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Học sinh trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <Users className="h-4 w-4 text-blue-600" />
            <span>
              Bài #{currentIndex + 1} / {submissions.length}
            </span>
          </div>

          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onSelectStudent(currentIndex + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Học sinh kế tiếp"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Add next student CTA */}
        <button
          type="button"
          onClick={onAddStudent}
          className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm bài tiếp theo</span>
        </button>
      </div>

      {/* Editable Student Info Box */}
      {currentSub && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tên Học Sinh
            </label>
            <input
              type="text"
              value={currentSub.studentName || ''}
              onChange={(e) => onUpdateInfo(currentIndex, e.target.value, currentSub.studentId)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="w-28">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mã Số / SBD
            </label>
            <input
              type="text"
              value={currentSub.studentId || ''}
              onChange={(e) => onUpdateInfo(currentIndex, currentSub.studentName, e.target.value)}
              placeholder="HS001"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Current Score Badge if already graded */}
          {currentSub.totalScore !== undefined && (
            <div className="flex flex-col items-end justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Điểm số
              </span>
              <div
                className={cn(
                  'rounded-lg border px-3 py-1 text-xs font-extrabold',
                  getScoreBadgeColor(currentSub.totalScore, currentSub.maxScore || 10)
                )}
              >
                {formatScore(currentSub.totalScore, currentSub.maxScore)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Horizontal Student Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {submissions.map((sub, idx) => {
          const isSelected = idx === currentIndex;
          const isDone = sub.status === 'completed';
          const needsReview = sub.status === 'review_needed';

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelectStudent(idx)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all',
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {isDone ? (
                <CheckCircle2 className={cn('h-3.5 w-3.5', isSelected ? 'text-white' : 'text-emerald-500')} />
              ) : needsReview ? (
                <AlertTriangle className={cn('h-3.5 w-3.5', isSelected ? 'text-white' : 'text-amber-500')} />
              ) : (
                <Clock className={cn('h-3.5 w-3.5', isSelected ? 'text-white' : 'text-slate-400')} />
              )}
              <span>#{sub.studentIndex}</span>
              {sub.totalScore !== undefined && (
                <span className={cn('rounded px-1 text-[10px]', isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700')}>
                  {sub.totalScore}đ
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
