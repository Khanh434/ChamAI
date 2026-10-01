'use client';

import { Exam } from '@/types/exam';
import { StudentSubmission } from '@/types/grading';
import { TrendingDown, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface QuestionAnalysisProps {
  exam: Exam;
  submissions: StudentSubmission[];
}

interface QuestionStat {
  questionNumber: number;
  correctAnswer: string;
  correctCount: number;
  totalAnswered: number;
  accuracyRate: number; // 0 to 100
  optionsCount: Record<string, number>;
}

export function QuestionAnalysis({ exam, submissions }: QuestionAnalysisProps) {
  const gradedSubs = submissions.filter((s) => s.results && s.results.length > 0);

  if (gradedSubs.length === 0) {
    return null;
  }

  const stats: QuestionStat[] = exam.questions.map((q) => {
    let correctCount = 0;
    const optionsCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, BLANK: 0, OTHER: 0 };

    gradedSubs.forEach((sub) => {
      const res = sub.results?.find((r) => r.questionNumber === q.number);
      const answer = res?.teacherOverride
        ? res.teacherOverride.correctedAnswer
        : res?.selectedAnswer;

      if (answer === q.correctAnswer) {
        correctCount++;
      }

      if (answer && ['A', 'B', 'C', 'D'].includes(answer)) {
        optionsCount[answer] = (optionsCount[answer] || 0) + 1;
      } else if (res?.verdict === 'BLANK' || !answer) {
        optionsCount.BLANK = (optionsCount.BLANK || 0) + 1;
      } else {
        optionsCount.OTHER = (optionsCount.OTHER || 0) + 1;
      }
    });

    const accuracyRate =
      gradedSubs.length > 0 ? +((correctCount / gradedSubs.length) * 100).toFixed(1) : 0;

    return {
      questionNumber: q.number,
      correctAnswer: q.correctAnswer,
      correctCount,
      totalAnswered: gradedSubs.length,
      accuracyRate,
      optionsCount,
    };
  });

  // Top 3 lowest accuracy questions
  const hardestQuestions = [...stats].sort((a, b) => a.accuracyRate - b.accuracyRate).slice(0, 3);

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Phân tích câu hỏi & Độ khó (Question Analysis)
          </h3>
        </div>
      </div>

      {/* Top 3 Hardest Questions Highlights */}
      {hardestQuestions.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 mb-3">
            <TrendingDown className="h-4 w-4" />
            <span>Top câu học sinh làm sai nhiều nhất:</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {hardestQuestions.map((hq) => (
              <div
                key={hq.questionNumber}
                className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-rose-950 dark:bg-rose-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Câu {hq.questionNumber} (ĐA: {hq.correctAnswer})
                  </span>
                  <span className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-extrabold text-white">
                    {hq.accuracyRate}% đúng
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  {hq.correctCount} / {hq.totalAnswered} học sinh làm đúng
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Question Grid Accuracy */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Tỉ lệ đúng từng câu:
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.questionNumber}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Câu {s.questionNumber}
              </span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-xs font-black',
                  s.accuracyRate >= 80
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : s.accuracyRate >= 50
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                )}
              >
                {s.accuracyRate}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
