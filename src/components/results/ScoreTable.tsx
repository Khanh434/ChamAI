'use client';

import { useState } from 'react';
import { Exam } from '@/types/exam';
import { StudentSubmission } from '@/types/grading';
import { Search, Eye, CheckCircle2, AlertTriangle, Clock, X } from 'lucide-react';
import { formatScore, getScoreBadgeColor, cn } from '@/lib/utils/helpers';

interface ScoreTableProps {
  exam: Exam;
  submissions: StudentSubmission[];
}

export function ScoreTable({ exam, submissions }: ScoreTableProps) {
  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(null);

  const filtered = submissions.filter((s) => {
    const term = search.toLowerCase();
    const nameMatch = (s.studentName || '').toLowerCase().includes(term);
    const idMatch = (s.studentId || '').toLowerCase().includes(term);
    const indexMatch = `bài ${s.studentIndex}`.includes(term);
    return nameMatch || idMatch || indexMatch;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh, SBD..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <span className="text-xs font-medium text-slate-500">
          Hiển thị <strong>{filtered.length}</strong> / {submissions.length} bài thi
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="py-3.5 pl-4 pr-2 text-center">STT</th>
              <th className="py-3.5 px-3">Mã Số / SBD</th>
              <th className="py-3.5 px-3">Họ và Tên</th>
              <th className="py-3.5 px-3 text-center">Điểm Số</th>
              <th className="py-3.5 px-3 text-center">Số câu đúng</th>
              <th className="py-3.5 px-3 text-center">Trạng thái</th>
              <th className="py-3.5 pr-4 pl-2 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((sub, idx) => {
              const isGraded = sub.totalScore !== undefined;
              const correctCount = sub.results?.filter((r) => r.isCorrect).length ?? 0;
              const totalCount = exam.questions.length;

              return (
                <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 pl-4 pr-2 text-center font-bold text-slate-500">
                    {sub.studentIndex || idx + 1}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {sub.studentId || `HS${String(idx + 1).padStart(3, '0')}`}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {sub.studentName || `Học sinh #${sub.studentIndex || idx + 1}`}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isGraded ? (
                      <span
                        className={cn(
                          'inline-block rounded-lg border px-2.5 py-0.5 font-black text-xs',
                          getScoreBadgeColor(sub.totalScore!, sub.maxScore || 10)
                        )}
                      >
                        {formatScore(sub.totalScore, sub.maxScore)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Chưa chấm</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                    {isGraded ? `${correctCount}/${totalCount}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {sub.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Hoàn tất
                      </span>
                    ) : sub.status === 'review_needed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" /> Cần duyệt ({sub.flaggedCount})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <Clock className="h-3 w-3" /> Đang chờ
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 pl-2 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSub(sub)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                      title="Xem chi tiết bài làm"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chi tiết bài làm: {selectedSub.studentName || `Học sinh #${selectedSub.studentIndex}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Mã số: {selectedSub.studentId} • Điểm:{' '}
                  <strong className="text-blue-600 font-bold">
                    {formatScore(selectedSub.totalScore, selectedSub.maxScore)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Questions breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {exam.questions.map((q) => {
                const res = selectedSub.results?.find((r) => r.questionNumber === q.number);
                const studentAns = res?.teacherOverride
                  ? res.teacherOverride.correctedAnswer
                  : res?.selectedAnswer || '—';
                const isCorrect = studentAns === q.correctAnswer;

                return (
                  <div
                    key={q.number}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-2.5 text-xs',
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
                        : 'border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30'
                    )}
                  >
                    <div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">
                        C{q.number}:
                      </span>{' '}
                      <strong className={isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                        {studentAns}
                      </strong>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      (Đúng: {q.correctAnswer})
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
