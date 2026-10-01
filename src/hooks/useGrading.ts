'use client';

import { useGradingStore } from '@/stores/gradingStore';

export function useGrading() {
  return useGradingStore();
}
