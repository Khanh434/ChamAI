import { ChamAIDatabase } from './schema';
import { Exam } from '@/types/exam';

export const db = new ChamAIDatabase();

// Preload demo sample exam if database is empty for great first-run UX
export async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    const count = await db.exams.count();
    if (count > 0) return;

    const sampleExam: Exam = {
      id: 'demo-math-midterm-101',
      name: 'Toán 12 - Khảo sát chất lượng Giữa kỳ I',
      subject: 'Toán học',
      examType: 'branch_a',
      totalPages: 1,
      totalPoints: 10,
      description: 'Đề thi trắc nghiệm 20 câu chuẩn phân ban 2024 - 2025',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        { number: 1, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
        { number: 2, type: 'multiple_choice', correctAnswer: 'C', points: 0.5 },
        { number: 3, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
        { number: 4, type: 'multiple_choice', correctAnswer: 'D', points: 0.5 },
        { number: 5, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
        { number: 6, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
        { number: 7, type: 'multiple_choice', correctAnswer: 'D', points: 0.5 },
        { number: 8, type: 'multiple_choice', correctAnswer: 'C', points: 0.5 },
        { number: 9, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
        { number: 10, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
        { number: 11, type: 'multiple_choice', correctAnswer: 'D', points: 0.5 },
        { number: 12, type: 'multiple_choice', correctAnswer: 'C', points: 0.5 },
        { number: 13, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
        { number: 14, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
        { number: 15, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
        { number: 16, type: 'multiple_choice', correctAnswer: 'C', points: 0.5 },
        { number: 17, type: 'multiple_choice', correctAnswer: 'D', points: 0.5 },
        { number: 18, type: 'multiple_choice', correctAnswer: 'A', points: 0.5 },
        { number: 19, type: 'multiple_choice', correctAnswer: 'B', points: 0.5 },
        { number: 20, type: 'multiple_choice', correctAnswer: 'C', points: 0.5 },
      ],
    };

    await db.exams.add(sampleExam);
  } catch (error) {
    console.error('Failed to seed demo exam:', error);
  }
}
