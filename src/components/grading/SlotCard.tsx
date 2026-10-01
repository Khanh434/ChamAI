'use client';

import { Slot } from '@/types/grading';
import { Camera, CheckCircle2, RotateCcw, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface SlotCardProps {
  slot: Slot;
  isActive: boolean;
  onSelect: () => void;
  onClear: () => void;
}

export function SlotCard({ slot, isActive, onSelect, onClear }: SlotCardProps) {
  const isCaptured = Boolean(slot.imageDataUrl);
  const isProcessing = slot.status === 'processing';

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex aspect-[3/4] cursor-pointer flex-col overflow-hidden rounded-2xl border-2 transition-all',
        isActive
          ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-md dark:border-blue-500'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900',
        isCaptured && 'border-emerald-500/50'
      )}
    >
      {/* Thumbnail or Empty State */}
      {isCaptured && slot.imageDataUrl ? (
        <div className="relative h-full w-full bg-slate-100 dark:bg-slate-800">
          <img
            src={slot.imageDataUrl}
            alt={`Trang ${slot.index + 1}`}
            className="h-full w-full object-cover"
          />

          {/* Overlay Status Badge */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur">
            <CheckCircle2 className="h-3 w-3" />
            <span>Đã chụp</span>
          </div>

          {/* Quick Clear / Retake Button on Hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-2 right-2 z-10 rounded-full bg-slate-900/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600"
            title="Chụp lại trang này"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-3 text-center">
          {isProcessing ? (
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          ) : (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              )}
            >
              <Camera className="h-5 w-5" />
            </div>
          )}

          <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            Trang {slot.index + 1}
          </p>
          <span className="text-[10px] text-slate-400">
            {isActive ? 'Chụp ngay' : 'Chưa có ảnh'}
          </span>
        </div>
      )}

      {/* Page number footer bar */}
      <div
        className={cn(
          'flex items-center justify-between border-t px-2.5 py-1 text-[11px] font-bold',
          isActive
            ? 'border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
            : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
        )}
      >
        <span>Trang {slot.index + 1}</span>
        {isCaptured && <span className="text-emerald-600 font-extrabold">✓</span>}
      </div>
    </div>
  );
}
