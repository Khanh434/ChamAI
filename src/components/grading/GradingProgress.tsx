'use client';

import { StudentSubmission } from '@/types/grading';
import { CheckCircle2, AlertTriangle, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatScore, getScoreBadgeColor } from '@/lib/utils/helpers';

interface GradingProgressProps {
  submission: StudentSubmission;
  examId: string;
  onNextStudent: () => void;
  hasNextStudent: boolean;
}

export function GradingProgress({
  submission,
  examId,
  onNextStudent,
  hasNextStudent,
}: GradingProgressProps) {
  if (!submission.results || submission.totalScore === undefined) return null;

  const correctCount = submission.results.filter((r) => r.isCorrect).length;
  const totalCount = submission.results.length;
  const flaggedCount = submission.flaggedCount ?? 0;

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-5 shadow-sm dark:border-blue-900/50 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Score & Verdict */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 font-black ${getScoreBadgeColor(
              submission.totalScore,
              submission.maxScore || 10
            )}`}
          >
            <span className="text-xl leading-none">{submission.totalScore}</span>
            <span className="text-[10px] font-bold opacity-80">/{submission.maxScore || 10}đ</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {submission.studentName || `Học sinh #${submission.studentIndex}`}
              </h4>
              {flaggedCount > 0 ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {flaggedCount} câu cần duyệt
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Hoàn hảo
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Đúng <strong className="text-emerald-600 font-bold">{correctCount}</strong> /{' '}
              {totalCount} câu ({+((correctCount / totalCount) * 100).toFixed(0)}%)
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {flaggedCount > 0 && (
            <Link
              href={`/exams/${examId}/review`}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
            >
              <Eye className="h-4 w-4" />
              Duyệt {flaggedCount} câu nghi vấn
            </Link>
          )}

          {hasNextStudent && (
            <button
              type="button"
              onClick={onNextStudent}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95"
            >
              <span>Chấm bài tiếp theo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
