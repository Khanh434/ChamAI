import Dexie, { type Table } from 'dexie';
import { Exam } from '@/types/exam';
import { StudentSubmission, GradingSession } from '@/types/grading';

export interface StoredSlotImage {
  id: string; // `${submissionId}_slot_${slotIndex}`
  submissionId: string;
  examId: string;
  slotIndex: number;
  imageData: string; // Base64 data URI
  createdAt: string;
}

export class ChamAIDatabase extends Dexie {
  exams!: Table<Exam, string>;
  submissions!: Table<StudentSubmission, string>;
  sessions!: Table<GradingSession, string>;
  slotImages!: Table<StoredSlotImage, string>;

  constructor() {
    super('ChamAIDatabase');
    this.version(1).stores({
      exams: 'id, name, subject, examType, createdAt, updatedAt',
      submissions: 'id, examId, studentIndex, studentName, studentId, status, totalScore, gradedAt',
      sessions: 'id, examId, startedAt',
      slotImages: 'id, submissionId, examId, slotIndex, createdAt',
    });
  }
}
