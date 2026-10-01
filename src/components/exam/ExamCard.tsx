'use client';

import Link from 'next/link';
import { Exam } from '@/types/exam';
import { Camera, CheckSquare, BarChart3, Edit3, Trash2, Calendar, FileText, Layers } from 'lucide-react';
import { formatDate } from '@/lib/utils/helpers';

interface ExamCardProps {
  exam: Exam;
  submissionCount?: number;
  flaggedCount?: number;
  onDelete: (id: string) => void;
}

export function ExamCard({ exam, submissionCount = 0, flaggedCount = 0, onDelete }: ExamCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {exam.subject}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {exam.examType === 'branch_a' ? 'Phiếu chuẩn (A)' : 'Đề cổ điển (B)'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={`/exams/${exam.id}/edit`}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              title="Chỉnh sửa đề thi"
            >
              <Edit3 className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                if (confirm(`Bạn có chắc muốn xóa đề thi "${exam.name}"?`)) {
                  onDelete(exam.id);
                }
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              title="Xóa đề thi"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title & info */}
        <div className="mt-3">
          <Link href={`/exams/${exam.id}`}>
            <h3 className="text-base font-bold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {exam.name}
            </h3>
          </Link>
          {exam.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {exam.description}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/60">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Số câu</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {exam.questions.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Số bài đã chấm</p>
            <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {submissionCount}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cần duyệt</p>
            <p
              className={`text-sm font-extrabold ${
                flaggedCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
              }`}
            >
              {flaggedCount}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>Tạo ngày {formatDate(exam.createdAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <Link
          href={`/exams/${exam.id}/grade`}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-2 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Chấm bài</span>
        </Link>

        <Link
          href={`/exams/${exam.id}/review`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
          <span>Duyệt ({flaggedCount})</span>
        </Link>

        <Link
          href={`/exams/${exam.id}/results`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Kết quả</span>
        </Link>
      </div>
    </div>
  );
}
