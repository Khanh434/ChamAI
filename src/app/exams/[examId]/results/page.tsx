'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExamStore } from '@/stores/examStore';
import { db } from '@/lib/db';
import { StudentSubmission } from '@/types/grading';
import { ScoreDistribution } from '@/components/results/ScoreDistribution';
import { QuestionAnalysis } from '@/components/results/QuestionAnalysis';
import { ScoreTable } from '@/components/results/ScoreTable';
import { ExportButton } from '@/components/results/ExportButton';
import {
  ArrowLeft,
  Camera,
  CheckSquare,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { formatScore } from '@/lib/utils/helpers';

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const { activeExam, getExamById } = useExamStore();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (examId) {
        setIsLoading(true);
        await getExamById(examId);
        const list = await db.submissions.where('examId').equals(examId).toArray();
        setSubmissions(list);
        setIsLoading(false);
      }
    }
    load();
  }, [examId]);

  if (isLoading || !activeExam) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-64 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
      </div>
    );
  }

  const gradedSubmissions = submissions.filter((s) => s.totalScore !== undefined);
  const totalGraded = gradedSubmissions.length;

  // Calculate statistics
  let avgScore = 0;
  let maxScoreAchieved = 0;
  let minScoreAchieved = activeExam.totalPoints || 10;
  let passCount = 0; // score >= 50%

  if (totalGraded > 0) {
    let sum = 0;
    const scores = gradedSubmissions.map((s) => s.totalScore || 0);
    maxScoreAchieved = Math.max(...scores);
    minScoreAchieved = Math.min(...scores);

    gradedSubmissions.forEach((s) => {
      const score = s.totalScore || 0;
      sum += score;
      const maxPts = s.maxScore || activeExam.totalPoints || 10;
      if (score / maxPts >= 0.5) {
        passCount++;
      }
    });

    avgScore = +(sum / totalGraded).toFixed(2);
  }

  const passRate = totalGraded > 0 ? +((passCount / totalGraded) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Export Actions */}
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
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Thống kê & Kết quả
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">{activeExam.name}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Bảng điểm và Phân tích kết quả thi
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/exams/${activeExam.id}/grade`}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <Camera className="h-4 w-4" />
            <span>Chấm thêm</span>
          </Link>

          <ExportButton exam={activeExam} submissions={gradedSubmissions} />
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-3">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Tổng số bài chấm</span>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {totalGraded} <span className="text-xs font-normal text-slate-400">bài</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-3">
            <Award className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Điểm trung bình</span>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {avgScore} <span className="text-xs font-normal text-slate-400">/{activeExam.totalPoints}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Cao nhất / Thấp nhất</span>
          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {maxScoreAchieved}{' '}
            <span className="text-sm font-bold text-slate-400">/ {totalGraded > 0 ? minScoreAchieved : 0}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-3">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Tỉ lệ đạt (≥ 50%)</span>
          <p className="mt-1 text-2xl font-black text-teal-600 dark:text-teal-400">
            {passRate}%
          </p>
        </div>
      </div>

      {/* Score Distribution Chart */}
      <ScoreDistribution submissions={gradedSubmissions} maxScore={activeExam.totalPoints} />

      {/* Question Analysis Breakdown */}
      <QuestionAnalysis exam={activeExam} submissions={gradedSubmissions} />

      {/* Full Score Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Bảng điểm chi tiết từng học sinh
        </h2>
        <ScoreTable exam={activeExam} submissions={gradedSubmissions} />
      </div>
    </div>
  );
}
