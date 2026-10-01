import { create } from 'zustand';
import { Exam } from '@/types/exam';
import { StudentSubmission, Slot } from '@/types/grading';
import { db } from '@/lib/db';
import { runPlaceholderPipeline } from '@/lib/pipeline/placeholder';
import { generateId } from '@/lib/utils/helpers';

interface GradingStoreState {
  exam: Exam | null;
  submissions: StudentSubmission[];
  currentStudentIndex: number; // 0-based
  currentSlotIndex: number; // 0-based
  isGrading: boolean;
  isLoadingSession: boolean;
  error: string | null;

  // Actions
  initSession: (exam: Exam) => Promise<void>;
  setCurrentStudentIndex: (index: number) => void;
  setCurrentSlotIndex: (index: number) => void;
  setSlotImage: (studentIndex: number, slotIndex: number, dataUrl: string) => Promise<void>;
  clearSlotImage: (studentIndex: number, slotIndex: number) => Promise<void>;
  updateStudentInfo: (studentIndex: number, name?: string, studentId?: string) => Promise<void>;
  gradeCurrentStudent: () => Promise<boolean>;
  addNewStudent: () => void;
  removeStudent: (studentIndex: number) => Promise<void>;
  reloadSubmissions: (examId: string) => Promise<void>;
}

function createEmptySlots(count: number): Slot[] {
  return Array.from({ length: Math.max(1, count) }, (_, i) => ({
    index: i,
    status: 'empty',
  }));
}

export const useGradingStore = create<GradingStoreState>((set, get) => ({
  exam: null,
  submissions: [],
  currentStudentIndex: 0,
  currentSlotIndex: 0,
  isGrading: false,
  isLoadingSession: false,
  error: null,

  initSession: async (exam: Exam) => {
    set({ exam, isLoadingSession: true, error: null });
    try {
      // Load any existing submissions for this exam from Dexie
      const existing = await db.submissions.where('examId').equals(exam.id).toArray();

      if (existing.length > 0) {
        // Load stored slot images for existing submissions
        const populated = await Promise.all(
          existing.map(async (sub) => {
            const images = await db.slotImages.where('submissionId').equals(sub.id).toArray();
            const imageMap = new Map(images.map((img) => [img.slotIndex, img.imageData]));

            const slots = sub.slots.map((s) => ({
              ...s,
              imageDataUrl: imageMap.get(s.index) || s.imageDataUrl,
            }));

            return { ...sub, slots };
          })
        );

        set({
          submissions: populated,
          currentStudentIndex: 0,
          currentSlotIndex: 0,
          isLoadingSession: false,
        });
      } else {
        // Create first student submission
        const firstSubmission: StudentSubmission = {
          id: generateId('sub'),
          examId: exam.id,
          studentIndex: 1,
          studentName: 'Học sinh 1',
          studentId: 'HS001',
          slots: createEmptySlots(exam.totalPages),
          status: 'pending',
        };

        await db.submissions.add(firstSubmission);
        set({
          submissions: [firstSubmission],
          currentStudentIndex: 0,
          currentSlotIndex: 0,
          isLoadingSession: false,
        });
      }
    } catch (err) {
      console.error('Error initializing grading session:', err);
      set({ error: (err as Error).message, isLoadingSession: false });
    }
  },

  setCurrentStudentIndex: (index: number) => {
    const { submissions } = get();
    if (index >= 0 && index < submissions.length) {
      set({ currentStudentIndex: index, currentSlotIndex: 0 });
    }
  },

  setCurrentSlotIndex: (index: number) => {
    set({ currentSlotIndex: index });
  },

  setSlotImage: async (studentIndex: number, slotIndex: number, dataUrl: string) => {
    const { submissions, exam } = get();
    const currentSub = submissions[studentIndex];
    if (!currentSub || !exam) return;

    const updatedSlots = [...currentSub.slots];
    updatedSlots[slotIndex] = {
      index: slotIndex,
      status: 'captured',
      imageDataUrl: dataUrl,
      capturedAt: new Date().toISOString(),
    };

    const updatedSubmission: StudentSubmission = {
      ...currentSub,
      slots: updatedSlots,
    };

    // Save image to Dexie slotImages table
    const imageRecordId = `${currentSub.id}_slot_${slotIndex}`;
    await db.slotImages.put({
      id: imageRecordId,
      submissionId: currentSub.id,
      examId: exam.id,
      slotIndex,
      imageData: dataUrl,
      createdAt: new Date().toISOString(),
    });

    // Update submission in Dexie
    await db.submissions.put(updatedSubmission);

    const updatedSubmissions = [...submissions];
    updatedSubmissions[studentIndex] = updatedSubmission;

    // Auto-advance slot if there's a next empty slot
    let nextSlotIndex = slotIndex;
    const nextEmpty = updatedSlots.findIndex((s, idx) => idx > slotIndex && s.status === 'empty');
    if (nextEmpty !== -1) {
      nextSlotIndex = nextEmpty;
    }

    set({
      submissions: updatedSubmissions,
      currentSlotIndex: nextSlotIndex,
    });
  },

  clearSlotImage: async (studentIndex: number, slotIndex: number) => {
    const { submissions } = get();
    const currentSub = submissions[studentIndex];
    if (!currentSub) return;

    const updatedSlots = [...currentSub.slots];
    updatedSlots[slotIndex] = {
      index: slotIndex,
      status: 'empty',
      imageDataUrl: undefined,
      capturedAt: undefined,
    };

    const updatedSubmission: StudentSubmission = {
      ...currentSub,
      slots: updatedSlots,
    };

    const imageRecordId = `${currentSub.id}_slot_${slotIndex}`;
    await db.slotImages.delete(imageRecordId);
    await db.submissions.put(updatedSubmission);

    const updatedSubmissions = [...submissions];
    updatedSubmissions[studentIndex] = updatedSubmission;

    set({ submissions: updatedSubmissions, currentSlotIndex: slotIndex });
  },

  updateStudentInfo: async (studentIndex: number, name?: string, studentId?: string) => {
    const { submissions } = get();
    const currentSub = submissions[studentIndex];
    if (!currentSub) return;

    const updatedSubmission: StudentSubmission = {
      ...currentSub,
      studentName: name ?? currentSub.studentName,
      studentId: studentId ?? currentSub.studentId,
    };

    await db.submissions.put(updatedSubmission);

    const updatedSubmissions = [...submissions];
    updatedSubmissions[studentIndex] = updatedSubmission;
    set({ submissions: updatedSubmissions });
  },

  gradeCurrentStudent: async () => {
    const { submissions, currentStudentIndex, exam } = get();
    const currentSub = submissions[currentStudentIndex];
    if (!currentSub || !exam) return false;

    // Verify all slots are captured
    const allFilled = currentSub.slots.every((s) => s.status === 'captured' || s.imageDataUrl);
    if (!allFilled) return false;

    set({ isGrading: true });

    try {
      // Mark slots as processing
      const processingSlots: Slot[] = currentSub.slots.map((s) => ({
        ...s,
        status: 'processing' as const,
      }));
      set((state) => {
        const subs = [...state.submissions];
        subs[currentStudentIndex] = { ...subs[currentStudentIndex], slots: processingSlots };
        return { submissions: subs };
      });

      // Run placeholder pipeline
      const pipelineResult = await runPlaceholderPipeline(currentSub.slots, exam.questions);

      const status = pipelineResult.flaggedCount > 0 ? 'review_needed' : 'completed';

      const doneSlots: Slot[] = currentSub.slots.map((s) => ({
        ...s,
        status: 'done' as const,
      }));

      const gradedSubmission: StudentSubmission = {
        ...currentSub,
        status,
        slots: doneSlots,
        results: pipelineResult.results,
        totalScore: pipelineResult.totalScore,
        maxScore: pipelineResult.maxScore,
        flaggedCount: pipelineResult.flaggedCount,
        gradedAt: new Date().toISOString(),
      };

      await db.submissions.put(gradedSubmission);

      const updatedSubmissions = [...submissions];
      updatedSubmissions[currentStudentIndex] = gradedSubmission;

      set({
        submissions: updatedSubmissions,
        isGrading: false,
      });

      return true;
    } catch (err) {
      console.error('Grading error:', err);
      set({ isGrading: false, error: (err as Error).message });
      return false;
    }
  },

  addNewStudent: () => {
    const { submissions, exam } = get();
    if (!exam) return;

    const nextIndex = submissions.length + 1;
    const newSub: StudentSubmission = {
      id: generateId('sub'),
      examId: exam.id,
      studentIndex: nextIndex,
      studentName: `Học sinh ${nextIndex}`,
      studentId: `HS${String(nextIndex).padStart(3, '0')}`,
      slots: createEmptySlots(exam.totalPages),
      status: 'pending',
    };

    db.submissions.add(newSub);
    set({
      submissions: [...submissions, newSub],
      currentStudentIndex: submissions.length, // move to new student
      currentSlotIndex: 0,
    });
  },

  removeStudent: async (studentIndex: number) => {
    const { submissions } = get();
    const target = submissions[studentIndex];
    if (!target) return;

    await db.submissions.delete(target.id);
    await db.slotImages.where('submissionId').equals(target.id).delete();

    const remaining = submissions.filter((_, idx) => idx !== studentIndex);
    const newIdx = Math.min(studentIndex, Math.max(0, remaining.length - 1));

    set({
      submissions: remaining,
      currentStudentIndex: newIdx,
      currentSlotIndex: 0,
    });
  },

  reloadSubmissions: async (examId: string) => {
    const list = await db.submissions.where('examId').equals(examId).toArray();
    set({ submissions: list });
  },
}));
