'use client';

import { useState } from 'react';
import { ClipboardPaste, Check, X, HelpCircle } from 'lucide-react';
import { Question } from '@/types/exam';

interface AnswerKeyPasteProps {
  onApply: (questions: Question[]) => void;
  defaultPointsPerQuestion?: number;
}

export function AnswerKeyPaste({ onApply, defaultPointsPerQuestion = 0.25 }: AnswerKeyPasteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleParseAndApply = () => {
    setError(null);
    if (!rawText.trim()) {
      setError('Vui lòng nhập chuỗi đáp án');
      return;
    }

    const parsed: Question[] = [];
    const text = rawText.toUpperCase();

    // Pattern 1: e.g. "1A 2B 3C" or "1.A, 2.B, 3.C" or "1: A\n2: B"
    const numberedRegex = /(?:CÂU|QUESTION|\b)?\s*(\d+)[\.\s:\-\)\/]*([A-D])/gi;
    let match: RegExpExecArray | null;
    const foundNumbered = new Map<number, string>();

    while ((match = numberedRegex.exec(text)) !== null) {
      const qNum = parseInt(match[1], 10);
      const answer = match[2];
      if (qNum > 0 && !foundNumbered.has(qNum)) {
        foundNumbered.set(qNum, answer);
      }
    }

    if (foundNumbered.size >= 2) {
      // Sort by question number
      const sortedNums = Array.from(foundNumbered.keys()).sort((a, b) => a - b);
      sortedNums.forEach((num) => {
        parsed.push({
          number: num,
          type: 'multiple_choice',
          correctAnswer: foundNumbered.get(num)!,
          points: defaultPointsPerQuestion,
        });
      });
    } else {
      // Pattern 2: Pure letter sequence like "ABCDACBD..." or space/comma separated letters
      const letters = text.replace(/[^A-D]/g, '').split('');
      if (letters.length > 0) {
        letters.forEach((letter, idx) => {
          parsed.push({
            number: idx + 1,
            type: 'multiple_choice',
            correctAnswer: letter,
            points: defaultPointsPerQuestion,
          });
        });
      }
    }

    if (parsed.length === 0) {
      setError('Không tìm thấy đáp án hợp lệ (hỗ trợ các ký tự A, B, C, D)');
      return;
    }

    onApply(parsed);
    setIsOpen(false);
    setRawText('');
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
      >
        <ClipboardPaste className="h-4 w-4" />
        Dán nhanh đáp án
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Dán nhanh chuỗi đáp án
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Đóng dán nhanh đáp án"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Các định dạng hỗ trợ:
            </p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Có số thứ tự: <code className="text-blue-600 font-mono">1A 2B 3C 4D</code> hoặc <code className="text-blue-600 font-mono">1.A, 2.B, 3.C</code></li>
              <li>Chuỗi ký tự liên tiếp: <code className="text-blue-600 font-mono">ABCDACBDDCBA...</code></li>
              <li>Mỗi câu 1 dòng hoặc cách nhau bởi dấu cách, dấu phẩy.</li>
            </ul>
          </div>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Dán hoặc gõ chuỗi đáp án tại đây... Ví dụ: 1A 2B 3C 4D hoặc ABCDDCBA"
            className="w-full rounded-xl border border-slate-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleParseAndApply}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95"
          >
            <Check className="h-4 w-4" />
            Áp dụng đáp án
          </button>
        </div>
      </div>
    </div>
  );
}
