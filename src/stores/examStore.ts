import { create } from 'zustand';
import { Exam } from '@/types/exam';
import { db, seedDemoDataIfEmpty } from '@/lib/db';

interface ExamStoreState {
  exams: Exam[];
  activeExam: Exam | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadExams: () => Promise<void>;
  getExamById: (id: string) => Promise<Exam | null>;
  setActiveExam: (exam: Exam | null) => void;
  createExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Exam>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<Exam | null>;
  deleteExam: (id: string) => Promise<void>;
}

export const useExamStore = create<ExamStoreState>((set, get) => ({
  exams: [],
  activeExam: null,
  isLoading: false,
  error: null,

  loadExams: async () => {
    set({ isLoading: true, error: null });
    try {
      await seedDemoDataIfEmpty();
      const exams = await db.exams.orderBy('createdAt').reverse().toArray();
      set({ exams, isLoading: false });
    } catch (err) {
      console.error('Error loading exams:', err);
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  getExamById: async (id: string) => {
    try {
      await seedDemoDataIfEmpty();
      const exam = await db.exams.get(id);
      if (exam) {
        set({ activeExam: exam });
        return exam;
      }
      return null;
    } catch (err) {
      console.error(`Error loading exam ${id}:`, err);
      return null;
    }
  },

  setActiveExam: (exam: Exam | null) => {
    set({ activeExam: exam });
  },

  createExam: async (examData) => {
    const id = `exam-${Date.now()}`;
    const now = new Date().toISOString();
    const newExam: Exam = {
      ...examData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.exams.add(newExam);
    set((state) => ({ exams: [newExam, ...state.exams], activeExam: newExam }));
    return newExam;
  },

  updateExam: async (id: string, updates: Partial<Exam>) => {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: now };

    await db.exams.update(id, cleanUpdates);
    const updated = await db.exams.get(id);

    if (updated) {
      set((state) => ({
        exams: state.exams.map((e) => (e.id === id ? updated : e)),
        activeExam: state.activeExam?.id === id ? updated : state.activeExam,
      }));
      return updated;
    }
    return null;
  },

  deleteExam: async (id: string) => {
    await db.exams.delete(id);
    await db.submissions.where('examId').equals(id).delete();
    await db.slotImages.where('examId').equals(id).delete();
    set((state) => ({
      exams: state.exams.filter((e) => e.id !== id),
      activeExam: state.activeExam?.id === id ? null : state.activeExam,
    }));
  },
}));
