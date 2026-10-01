import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return '—';
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatScore(score?: number, maxScore?: number): string {
  if (score === undefined || score === null) return '—';
  const scoreStr = Number.isInteger(score) ? score.toString() : score.toFixed(2);
  if (maxScore !== undefined) {
    const maxStr = Number.isInteger(maxScore) ? maxScore.toString() : maxScore.toFixed(2);
    return `${scoreStr}/${maxStr}`;
  }
  return scoreStr;
}

export function getScoreBadgeColor(score: number, maxScore: number = 10): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  if (percentage >= 65) return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
  if (percentage >= 50) return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  return 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
}
