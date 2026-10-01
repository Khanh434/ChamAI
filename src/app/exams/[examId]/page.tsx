'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExamStore } from '@/stores/examStore';
import { db } from '@/lib/db';
import { StudentSubmission } from '@/types/grading';
import {
  Camera,
  CheckSquare,
  BarChart3,
  Edit3,
  ArrowLeft,
  BookOpen,
  Layers,
  FileCheck2,
  Users,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/helpers';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const { activeExam, getExamById, deleteExam } = useExamStore();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!examId) return;
      setIsLoading(true);
      await getExamById(examId);
      const subs = await db.submissions.where('examId').equals(examId).toArray();
      setSubmissions(subs);
      setIsLoading(false);
    }
    loadData();
  }, [examId]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-32 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
        <div className="h-64 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
      </div>
    );
  }

  if (!activeExam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy đề thi</h2>
        <Link href="/exams" className="mt-4 text-sm font-bold text-blue-600">
          Quay lại danh sách đề thi
        </Link>
      </div>
    );
  }

  const gradedCount = submissions.filter((s) => s.totalScore !== undefined).length;
  const flaggedCount = submissions.reduce(
    (sum, s) => sum + (s.status === 'review_needed' ? s.flaggedCount ?? 0 : 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/exams')}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {activeExam.subject}
              </span>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {activeExam.examType === 'branch_a' ? 'Phiếu chuẩn (A)' : 'Đề cổ điển (B)'}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {activeExam.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/exams/${activeExam.id}/edit`}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <Edit3 className="h-4 w-4" />
            <span>Sửa đề</span>
          </Link>
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa đề thi "${activeExam.name}"?`)) {
                deleteExam(activeExam.id);
                router.push('/exams');
              }
            }}
            className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30"
            title="Xóa đề thi"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Workflow Action Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Grade Action */}
        <Link
          href={`/exams/${activeExam.id}/grade`}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur mb-3">
            <Camera className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold">Chấm bài bằng Camera</h3>
          <p className="mt-1 text-xs text-blue-100">
            Chụp liên tục theo slot các trang bài làm của học sinh
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-white group-hover:underline">
            <span>Bắt đầu chấm</span> →
          </div>
        </Link>

        {/* Flagged Review Action */}
        <Link
          href={`/exams/${activeExam.id}/review`}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-3">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Duyệt câu nghi vấn
            </h3>
            {flaggedCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-extrabold text-white">
                {flaggedCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Kiểm tra các câu nét mờ, tô trùng 2 đáp án hoặc tẩy smudge
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:underline">
            <span>Vào duyệt ngay</span> →
          </div>
        </Link>

        {/* Results Action */}
        <Link
          href={`/exams/${activeExam.id}/results`}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-3">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Bảng điểm & Xuất Excel
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Xem phân tích phổ điểm, tỉ lệ đúng từng câu và tải file .xlsx
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:underline">
            <span>Xem kết quả</span> →
          </div>
        </Link>
      </div>

      {/* Exam Specs Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Thông tin cấu hình đề thi
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <span className="text-[11px] font-medium text-slate-500">Số câu hỏi</span>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {activeExam.questions.length} câu
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <span className="text-[11px] font-medium text-slate-500">Tổng thang điểm</span>
            <p className="text-base font-black text-blue-600 dark:text-blue-400">
              {activeExam.totalPoints} điểm
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <span className="text-[11px] font-medium text-slate-500">Số trang chụp (Slot)</span>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {activeExam.totalPages} trang
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <span className="text-[11px] font-medium text-slate-500">Bài thi đã nạp</span>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {gradedCount} bài
            </p>
          </div>
        </div>

        {activeExam.description && (
          <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
            {activeExam.description}
          </p>
        )}
      </div>

      {/* Answer Key Grid View */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Đáp án chuẩn của đề ({activeExam.questions.length} câu)
            </h3>
          </div>
          <Link
            href={`/exams/${activeExam.id}/edit`}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Chỉnh sửa đáp án
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {activeExam.questions.map((q) => (
            <div
              key={q.number}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60"
            >
              <span className="font-bold text-slate-600 dark:text-slate-300">
                Câu {q.number}:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-black text-white">
                  {q.correctAnswer}
                </span>
                <span className="text-[10px] text-slate-400">({q.points}đ)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
