export type ExamType = 'branch_a' | 'branch_b';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer_number'
  | 'short_answer_english';

export interface Question {
  number: number;
  type: QuestionType;
  correctAnswer: string; // 'A'|'B'|'C'|'D' or exact value
  alternativeAnswers?: string[]; // For English short answer or alternatives
  points: number;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  examType: ExamType;
  totalPages: number; // Number of pages -> number of slots required per student
  questions: Question[];
  totalPoints: number;
  description?: string;
  createdAt: string; // ISO date string for Dexie compatibility
  updatedAt: string;
}
