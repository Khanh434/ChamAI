'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useExamStore } from '@/stores/examStore';
import { db } from '@/lib/db';
import { ExamCard } from '@/components/exam/ExamCard';
import {
  FileText,
  Camera,
  CheckSquare,
  BarChart3,
  Plus,
  Sparkles,
  Zap,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { exams, loadExams, deleteExam, isLoading } = useExamStore();
  const [submissionStats, setSubmissionStats] = useState<{
    totalSubmissions: number;
    totalFlagged: number;
    examCounts: Record<string, { submissions: number; flagged: number }>;
  }>({
    totalSubmissions: 0,
    totalFlagged: 0,
    examCounts: {},
  });

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const subs = await db.submissions.toArray();
        let totalFlagged = 0;
        const examCounts: Record<string, { submissions: number; flagged: number }> = {};

        subs.forEach((sub) => {
          if (!examCounts[sub.examId]) {
            examCounts[sub.examId] = { submissions: 0, flagged: 0 };
          }
          if (sub.totalScore !== undefined) {
            examCounts[sub.examId].submissions++;
          }
          const flagged = sub.flaggedCount ?? 0;
          if (flagged > 0 && sub.status === 'review_needed') {
            examCounts[sub.examId].flagged += flagged;
            totalFlagged += flagged;
          }
        });

        const gradedSubs = subs.filter((s) => s.totalScore !== undefined);

        setSubmissionStats({
          totalSubmissions: gradedSubs.length,
          totalFlagged,
          examCounts,
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    }

    if (exams.length > 0) {
      loadStats();
    }
  }, [exams]);

  const recentExams = exams.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white shadow-xl sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>AI Chấm Thi Di Động Cho Giáo Viên</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
            Chấm thi trắc nghiệm bằng camera trong vài giây
          </h1>

          <p className="text-sm text-blue-100 sm:text-base leading-relaxed">
            Hỗ trợ chụp nhiều trang theo slot, AI tự động nhận diện vết tô mờ / tô trùng và hỗ trợ duyệt nhanh 1 chạm, xuất file Excel bảng điểm tức thì.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/exams/new"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-md shadow-black/10 transition hover:bg-blue-50 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Tạo đề thi mới
            </Link>

            {exams.length > 0 && (
              <Link
                href={`/exams/${exams[0].id}/grade`}
                className="flex items-center gap-2 rounded-xl bg-blue-900/60 border border-blue-400/30 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-blue-900/80 active:scale-95"
              >
                <Camera className="h-4 w-4" />
                Chấm bài ngay
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 -bottom-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng số đề thi
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{exams.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bài thi đã chấm
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {submissionStats.totalSubmissions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Câu cần giáo viên duyệt
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {submissionStats.totalFlagged}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 mb-3">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Chụp theo Slot thông minh
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Hỗ trợ bài thi 1 trang hoặc nhiều trang. Tự động chuyển trang kế tiếp sau mỗi lần bấm chụp.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Duyệt câu nghi vấn 1-tap
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            AI tự động gom các câu mờ hoặc tô trùng vào hàng chờ để giáo viên kiểm tra và điều chỉnh trong 1 giây.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 mb-3">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Xuất Excel & Phổ điểm tức thì
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Tự động tính điểm, vẽ biểu đồ phổ điểm và xuất file Excel chuẩn phân phối điểm hoàn toàn trên máy client.
          </p>
        </div>
      </div>

      {/* Recent Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Đề thi gần đây
            </h2>
            <p className="text-xs text-slate-500">
              Chọn đề thi để tiếp tục chấm bài hoặc xem phân tích kết quả
            </p>
          </div>

          <Link
            href="/exams"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <span>Xem tất cả ({exams.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <FileText className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chưa có đề thi nào
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Bắt đầu bằng việc tạo đề thi mới với đáp án chuẩn để AI nhận diện chấm bài.
            </p>
            <Link
              href="/exams/new"
              className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Tạo đề thi đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recentExams.map((exam) => {
              const stats = submissionStats.examCounts[exam.id];
              return (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  submissionCount={stats?.submissions || 0}
                  flaggedCount={stats?.flagged || 0}
                  onDelete={deleteExam}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
