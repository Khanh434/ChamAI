import { QuestionResult } from './result';

export type SlotStatus = 'empty' | 'captured' | 'processing' | 'done' | 'error';
export type SubmissionStatus = 'pending' | 'grading' | 'review_needed' | 'completed';

export interface Slot {
  index: number; // 0-indexed or 1-indexed
  status: SlotStatus;
  imageDataUrl?: string; // base64 or object URL for display
  imageId?: string; // reference to IndexedDB image store
  capturedAt?: string;
  errorMessage?: string;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  studentIndex: number;
  studentName?: string;
  studentId?: string; // Roll number or student code
  slots: Slot[];
  status: SubmissionStatus;
  results?: QuestionResult[];
  totalScore?: number;
  maxScore?: number;
  gradedAt?: string;
  flaggedCount?: number;
}

export interface GradingSession {
  id: string;
  examId: string;
  startedAt: string;
  completedAt?: string;
  currentStudentIndex: number;
  submissions: StudentSubmission[];
}
