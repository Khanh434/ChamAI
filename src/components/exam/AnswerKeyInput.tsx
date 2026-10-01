'use client';

import { Question } from '@/types/exam';
import { Plus, Trash2, Sliders, Check } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { AnswerKeyPaste } from './AnswerKeyPaste';

interface AnswerKeyInputProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function AnswerKeyInput({ questions, onChange }: AnswerKeyInputProps) {
  const options = ['A', 'B', 'C', 'D'];

  const handleSelectAnswer = (qNumber: number, answer: string) => {
    const updated = questions.map((q) =>
      q.number === qNumber ? { ...q, correctAnswer: answer } : q
    );
    onChange(updated);
  };

  const handlePointChange = (qNumber: number, points: number) => {
    const updated = questions.map((q) =>
      q.number === qNumber ? { ...q, points: Math.max(0, points) } : q
    );
    onChange(updated);
  };

  const handleAddQuestion = () => {
    const nextNum = questions.length > 0 ? Math.max(...questions.map((q) => q.number)) + 1 : 1;
    const defaultPoints = questions.length > 0 ? questions[questions.length - 1].points : 0.25;
    onChange([
      ...questions,
      {
        number: nextNum,
        type: 'multiple_choice',
        correctAnswer: 'A',
        points: defaultPoints,
      },
    ]);
  };

  const handleRemoveQuestion = (qNumber: number) => {
    const filtered = questions
      .filter((q) => q.number !== qNumber)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    onChange(filtered);
  };

  const handleBatchSetPoints = (pts: number) => {
    onChange(questions.map((q) => ({ ...q, points: pts })));
  };

  const handleSetPresetQuestionCount = (count: number) => {
    const pointsPerQuestion = +(10 / count).toFixed(2);
    const newQuestions: Question[] = Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      type: 'multiple_choice',
      correctAnswer: questions[i]?.correctAnswer || ['A', 'B', 'C', 'D'][i % 4],
      points: pointsPerQuestion,
    }));
    onChange(newQuestions);
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mẫu nhanh:
          </span>
          {[10, 20, 40, 50].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleSetPresetQuestionCount(count)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                questions.length === count
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {count} câu
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <AnswerKeyPaste onApply={(parsed) => onChange(parsed)} />
          <div className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Tổng: {+totalPoints.toFixed(2)} điểm ({questions.length} câu)
          </div>
        </div>
      </div>

      {/* Grid of Questions */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {questions.map((q) => (
          <div
            key={q.number}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            {/* Question label */}
            <div className="flex items-center gap-1.5 min-w-[52px]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {q.number}
              </span>
            </div>

            {/* A B C D Option Bubbles */}
            <div className="flex items-center gap-1">
              {options.map((opt) => {
                const isSelected = q.correctAnswer === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectAnswer(q.number, opt)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                      isSelected
                        ? 'scale-105 bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Point & Delete */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.05"
                min="0"
                value={q.points}
                onChange={(e) => handlePointChange(q.number, parseFloat(e.target.value) || 0)}
                className="w-12 rounded-lg border border-slate-200 px-1 py-1 text-center text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                title="Điểm cho câu này"
              />
              <button
                type="button"
                onClick={() => handleRemoveQuestion(q.number)}
                className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                title="Xóa câu này"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add question row */}
      <button
        type="button"
        onClick={handleAddQuestion}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
      >
        <Plus className="h-4 w-4" />
        Thêm câu hỏi (Câu {questions.length + 1})
      </button>
    </div>
  );
}
