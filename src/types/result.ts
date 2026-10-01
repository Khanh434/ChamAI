export type QuestionVerdict = 'VALID' | 'BLANK' | 'MULTI' | 'UNCERTAIN';
export type MarkStatus = 'EMPTY' | 'MARKED' | 'CROSSED_OUT' | 'ERASED';

export interface OptionDetail {
  label: string; // 'A' | 'B' | 'C' | 'D' etc.
  markStatus: MarkStatus;
  confidence: number;
}

export interface QuestionResult {
  questionNumber: number;
  verdict: QuestionVerdict;
  selectedAnswer?: string; // e.g. 'A' or 'A & C'
  isCorrect?: boolean;
  pointsEarned: number;
  maxPoints: number;
  confidence: number; // 0 - 1
  needsReview: boolean;
  reviewReason?: string;
  optionDetails?: OptionDetail[];
  originalSelectedAnswer?: string; // before any teacher override
  teacherOverride?: {
    correctedAnswer: string;
    reason: string;
    overriddenAt: string;
  };
}

export interface FlaggedItem {
  id: string; // unique ID e.g. `${submissionId}_q${questionNumber}`
  submissionId: string;
  studentIndex: number;
  studentName?: string;
  studentId?: string;
  questionNumber: number;
  correctAnswer: string;
  questionResult: QuestionResult;
  slotIndex?: number;
  imageThumbnailUrl?: string;
  cropCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
