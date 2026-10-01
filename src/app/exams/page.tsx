'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useExamStore } from '@/stores/examStore';
import { db } from '@/lib/db';
import { ExamCard } from '@/components/exam/ExamCard';
import { Plus, Search, Filter, FileText } from 'lucide-react';

export default function ExamsListPage() {
  const { exams, loadExams, deleteExam, isLoading } = useExamStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [examStats, setExamStats] = useState<
    Record<string, { submissions: number; flagged: number }>
  >({});

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const subs = await db.submissions.toArray();
        const counts: Record<string, { submissions: number; flagged: number }> = {};
        subs.forEach((s) => {
          if (!counts[s.examId]) {
            counts[s.examId] = { submissions: 0, flagged: 0 };
          }
          if (s.totalScore !== undefined) {
            counts[s.examId].submissions++;
          }
          if (s.status === 'review_needed' && (s.flaggedCount ?? 0) > 0) {
            counts[s.examId].flagged += s.flaggedCount ?? 0;
          }
        });
        setExamStats(counts);
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }
    fetchStats();
  }, [exams]);

  const subjects = Array.from(new Set(exams.map((e) => e.subject)));

  const filteredExams = exams.filter((exam) => {
    const matchSearch =
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = subjectFilter === 'all' || exam.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Danh sách đề thi ({exams.length})
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý các đề thi, cấu hình đáp án và tiến độ chấm bài
          </p>
        </div>

        <Link
          href="/exams/new"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Tạo đề thi mới
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên đề thi, môn học..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Exams */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <FileText className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Không tìm thấy đề thi phù hợp
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn môn học khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => {
            const stats = examStats[exam.id];
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
  );
}
