'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exam, ExamType, Question } from '@/types/exam';
import { ExamTypeSelector } from './ExamTypeSelector';
import { AnswerKeyInput } from './AnswerKeyInput';
import { Save, ArrowLeft, Layers, BookOpen, FileCheck2 } from 'lucide-react';
import Link from 'next/link';

interface ExamFormProps {
  initialData?: Exam;
  onSubmit: (data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  title: string;
  submitLabel: string;
}

export function ExamForm({ initialData, onSubmit, title, submitLabel }: ExamFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [subject, setSubject] = useState(initialData?.subject || 'Toán học');
  const [examType, setExamType] = useState<ExamType>(initialData?.examType || 'branch_a');
  const [totalPages, setTotalPages] = useState<number>(initialData?.totalPages || 1);
  const [description, setDescription] = useState(initialData?.description || '');
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || [
      { number: 1, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
      { number: 2, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
      { number: 3, type: 'multiple_choice', correctAnswer: 'C', points: 0.5 },
      { number: 4, type: 'multiple_choice', correctAnswer: 'D', points: 0.5 },
      { number: 5, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
      { number: 6, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
      { number: 7, type: 'multiple_choice', correctAnswer: 'C', points: 0.5 },
      { number: 8, type: 'multiple_choice', correctAnswer: 'D', points: 0.5 },
      { number: 9, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
      { number: 10, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjects = [
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Tiếng Anh',
    'Lịch sử',
    'Địa lý',
    'GDCD / KTXH',
    'Tin học',
    'Môn khác',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Vui lòng nhập tên đề thi');
      return;
    }

    if (questions.length === 0) {
      setError('Đề thi phải có ít nhất 1 câu hỏi');
      return;
    }

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        subject,
        examType,
        totalPages: Math.max(1, totalPages),
        questions,
        totalPoints: +totalPoints.toFixed(2),
        description: description.trim(),
      });
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi lưu đề thi');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Thiết lập thông tin đề thi và đáp án chuẩn để AI nhận diện chấm bài
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Section 1: Basic Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Thông tin chung về đề thi
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tên đề thi / Bài kiểm tra <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kiểm tra 1 tiết Đại số - Chương 2 (Mã đề 101)"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Môn học
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Số trang bài làm (Số slot chụp / học sinh)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={totalPages}
              onChange={(e) => setTotalPages(parseInt(e.target.value) || 1)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Ghi chú thêm (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú về lớp, thang điểm, thời gian làm bài..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Exam Type */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <Layers className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Định dạng & Mẫu phiếu thi
          </h2>
        </div>

        <ExamTypeSelector value={examType} onChange={setExamType} />
      </div>

      {/* Section 3: Answer Key */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <FileCheck2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Đáp án chuẩn (Answer Key)
          </h2>
        </div>

        <AnswerKeyInput questions={questions} onChange={setQuestions} />
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Link
          href="/exams"
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Hủy bỏ
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {isSubmitting ? 'Đang lưu đề thi...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
