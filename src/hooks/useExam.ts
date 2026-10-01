'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/stores/examStore';

export function useExam(examId?: string) {
  const store = useExamStore();

  useEffect(() => {
    if (examId) {
      store.getExamById(examId);
    } else {
      store.loadExams();
    }
  }, [examId]);

  return store;
}
