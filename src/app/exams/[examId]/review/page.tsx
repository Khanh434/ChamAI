'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExamStore } from '@/stores/examStore';
import { useReviewStore } from '@/stores/reviewStore';
import { ReviewBucket } from '@/components/review/ReviewBucket';
import { ArrowLeft, CheckSquare, Camera, BarChart3, RefreshCw } from 'lucide-react';

export default function ExamReviewPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const { activeExam, getExamById } = useExamStore();
  const {
    flaggedItems,
    filterStatus,
    isLoading,
    loadFlaggedItems,
    setFilterStatus,
    overrideAnswer,
  } = useReviewStore();

  useEffect(() => {
    async function load() {
      if (examId) {
        const exam = await getExamById(examId);
        if (exam) {
          await loadFlaggedItems(exam);
        }
      }
    }
    load();
  }, [examId]);

  if (!activeExam) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-64 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
      </div>
    );
  }

  const handleRefresh = async () => {
    if (activeExam) {
      await loadFlaggedItems(activeExam);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/exams/${activeExam.id}`}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Hàng chờ duyệt nghi vấn
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">{activeExam.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Duyệt các câu hỏi bị đánh cờ (Flagged Review)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Làm mới danh sách"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Làm mới</span>
          </button>

          <Link
            href={`/exams/${activeExam.id}/grade`}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95"
          >
            <Camera className="h-4 w-4" />
            <span>Tiếp tục chấm</span>
          </Link>

          <Link
            href={`/exams/${activeExam.id}/results`}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Xem bảng điểm</span>
          </Link>
        </div>
      </div>

      {/* Review Bucket */}
      <ReviewBucket
        items={flaggedItems}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onOverride={overrideAnswer}
      />
    </div>
  );
}
