'use client';

import { Slot } from '@/types/grading';
import { SlotCard } from './SlotCard';
import { Sparkles, Layers } from 'lucide-react';

interface SlotManagerProps {
  slots: Slot[];
  activeSlotIndex: number;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
  onGradeNow: () => void;
  isGrading: boolean;
}

export function SlotManager({
  slots,
  activeSlotIndex,
  onSelectSlot,
  onClearSlot,
  onGradeNow,
  isGrading,
}: SlotManagerProps) {
  const filledCount = slots.filter((s) => Boolean(s.imageDataUrl)).length;
  const allFilled = filledCount === slots.length && slots.length > 0;

  return (
    <div className="space-y-4">
      {/* Header Slot Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Các trang cần chụp ({filledCount}/{slots.length})
          </h3>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {allFilled ? 'Đã đủ tất cả các trang' : `Còn thiếu ${slots.length - filledCount} trang`}
        </span>
      </div>

      {/* Slots Grid */}
      <div
        className={`grid gap-3 ${
          slots.length === 1
            ? 'grid-cols-2 max-w-xs'
            : slots.length === 2
            ? 'grid-cols-2'
            : slots.length === 3
            ? 'grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {slots.map((slot) => (
          <SlotCard
            key={slot.index}
            slot={slot}
            isActive={activeSlotIndex === slot.index}
            onSelect={() => onSelectSlot(slot.index)}
            onClear={() => onClearSlot(slot.index)}
          />
        ))}
      </div>

      {/* GRADE NOW Primary Action Button */}
      <button
        type="button"
        disabled={!allFilled || isGrading}
        onClick={onGradeNow}
        className={`w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-extrabold transition-all shadow-lg active:scale-[0.98] ${
          allFilled && !isGrading
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 animate-pulse'
            : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
        }`}
      >
        <Sparkles className="h-5 w-5" />
        <span>{isGrading ? 'AI Đang nhận diện & chấm điểm...' : 'CHẤM ĐIỂM NGAY (GRADE NOW)'}</span>
      </button>
    </div>
  );
}
