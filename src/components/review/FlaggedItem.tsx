'use client';

import { useState } from 'react';
import { FlaggedItem } from '@/types/result';
import { ScoreOverride } from './ScoreOverride';
import { QuickReasonChips } from './QuickReasonChips';
import { CheckCircle2, AlertTriangle, HelpCircle, Save, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface FlaggedItemCardProps {
  item: FlaggedItem;
  onOverride: (flaggedItemId: string, correctedAnswer: string, reason: string) => Promise<void>;
}

export function FlaggedItemCard({ item, onOverride }: FlaggedItemCardProps) {
  const isOverridden = Boolean(item.questionResult.teacherOverride);

  const initialAnswer =
    item.questionResult.teacherOverride?.correctedAnswer ||
    (item.questionResult.verdict === 'MULTI'
      ? item.correctAnswer // Suggest correct answer by default
      : item.questionResult.selectedAnswer || 'A');

  const [selectedAnswer, setSelectedAnswer] = useState<string>(initialAnswer);
  const [reason, setReason] = useState<string>(
    item.questionResult.teacherOverride?.reason || 'Giáo viên xác nhận đáp án chuẩn'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onOverride(item.id, selectedAnswer, reason);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const verdictBadge = {
    MULTI: { label: 'Tô nhiều đáp án', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    UNCERTAIN: { label: 'Độ tin cậy thấp / Nét mờ', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    BLANK: { label: 'Bỏ trống', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    VALID: { label: 'Hợp lệ', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  }[item.questionResult.verdict];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-white shadow-sm transition-all dark:bg-slate-900',
        isOverridden
          ? 'border-emerald-300 dark:border-emerald-800/80'
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
      )}
    >
      {/* Top Banner with Student & Question info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                {item.studentName || `Học sinh #${item.studentIndex}`}
              </span>
              {item.studentId && (
                <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {item.studentId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-black text-white">
            Câu {item.questionNumber}
          </span>
          <span className={cn('rounded-lg px-2.5 py-1 text-xs font-bold', verdictBadge.bg)}>
            {verdictBadge.label}
          </span>
          {isOverridden && (
            <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đã duyệt
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Visual Crop Preview */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Ảnh chụp thực tế vết tô của học sinh:
          </label>
          <div className="mt-1.5 flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-amber-50/20 p-2 dark:border-slate-800">
            {item.imageThumbnailUrl ? (
              <img
                src={item.imageThumbnailUrl}
                alt={`Ảnh vết tô câu ${item.questionNumber}`}
                className="max-h-24 w-auto rounded-lg object-contain shadow-xs"
              />
            ) : (
              <div className="py-4 text-xs text-slate-400">Không có ảnh crop chi tiết</div>
            )}
          </div>
        </div>

        {/* AI Reading Summary */}
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
          <div>
            <span className="text-slate-500">AI nhận diện ban đầu:</span>
            <p className="font-mono font-bold text-slate-900 dark:text-white">
              {item.questionResult.selectedAnswer || 'Không chọn'}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Đáp án chuẩn của đề:</span>
            <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {item.correctAnswer}
            </p>
          </div>
        </div>

        {/* Score Override Controls */}
        <ScoreOverride
          selectedAnswer={selectedAnswer}
          onSelectAnswer={setSelectedAnswer}
          correctAnswer={item.correctAnswer}
        />

        {/* Reason Chips */}
        <QuickReasonChips selectedReason={reason} onSelectReason={setReason} />

        {/* Confirm Save CTA */}
        <div className="flex items-center justify-between pt-2">
          {item.questionResult.teacherOverride && (
            <p className="text-xs text-slate-400 italic">
              Đã sửa: {item.questionResult.teacherOverride.correctedAnswer} ({item.questionResult.teacherOverride.reason})
            </p>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="ml-auto flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Đang lưu...' : 'Xác nhận & Cập nhật điểm'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
