import { create } from 'zustand';
import { Exam } from '@/types/exam';
import { FlaggedItem, QuestionResult } from '@/types/result';
import { StudentSubmission } from '@/types/grading';
import { db } from '@/lib/db';
import { recalculateSubmissionScore } from '@/lib/pipeline/engine';
import { generateSimulatedCropDataUrl } from '@/lib/utils/image';

interface ReviewStoreState {
  exam: Exam | null;
  flaggedItems: FlaggedItem[];
  currentFlaggedIndex: number;
  isLoading: boolean;
  filterStatus: 'all' | 'unresolved' | 'resolved';

  // Actions
  loadFlaggedItems: (exam: Exam) => Promise<void>;
  setCurrentFlaggedIndex: (index: number) => void;
  setFilterStatus: (status: 'all' | 'unresolved' | 'resolved') => void;
  overrideAnswer: (
    flaggedItemId: string,
    correctedAnswer: string,
    reason: string
  ) => Promise<void>;
  markAsConfirmedValid: (flaggedItemId: string, confirmedAnswer: string) => Promise<void>;
}

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  exam: null,
  flaggedItems: [],
  currentFlaggedIndex: 0,
  isLoading: false,
  filterStatus: 'all',

  loadFlaggedItems: async (exam: Exam) => {
    set({ exam, isLoading: true });
    try {
      const submissions = await db.submissions.where('examId').equals(exam.id).toArray();
      const items: FlaggedItem[] = [];

      const questionMap = new Map<number, string>();
      exam.questions.forEach((q) => questionMap.set(q.number, q.correctAnswer));

      submissions.forEach((sub) => {
        if (!sub.results) return;

        sub.results.forEach((res) => {
          // If flagged or has teacher override
          if (res.needsReview || res.teacherOverride || res.verdict === 'MULTI' || res.verdict === 'UNCERTAIN') {
            const correctAnswer = questionMap.get(res.questionNumber) || 'A';
            const cropUrl = generateSimulatedCropDataUrl(
              res.questionNumber,
              res.verdict,
              res.selectedAnswer
            );

            items.push({
              id: `${sub.id}_q${res.questionNumber}`,
              submissionId: sub.id,
              studentIndex: sub.studentIndex,
              studentName: sub.studentName,
              studentId: sub.studentId,
              questionNumber: res.questionNumber,
              correctAnswer,
              questionResult: res,
              imageThumbnailUrl: cropUrl,
            });
          }
        });
      });

      set({
        flaggedItems: items,
        currentFlaggedIndex: 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error loading flagged review items:', err);
      set({ isLoading: false });
    }
  },

  setCurrentFlaggedIndex: (index: number) => {
    set({ currentFlaggedIndex: index });
  },

  setFilterStatus: (filterStatus) => {
    set({ filterStatus, currentFlaggedIndex: 0 });
  },

  overrideAnswer: async (flaggedItemId, correctedAnswer, reason) => {
    const { flaggedItems, exam } = get();
    const item = flaggedItems.find((f) => f.id === flaggedItemId);
    if (!item || !exam) return;

    const submission = await db.submissions.get(item.submissionId);
    if (!submission || !submission.results) return;

    // Update specific question result
    const updatedResults = submission.results.map((res) => {
      if (res.questionNumber === item.questionNumber) {
        return {
          ...res,
          needsReview: false,
          teacherOverride: {
            correctedAnswer,
            reason,
            overriddenAt: new Date().toISOString(),
          },
        };
      }
      return res;
    });

    // Recalculate score
    const recalculated = recalculateSubmissionScore(updatedResults, exam.questions);

    const updatedSubmission: StudentSubmission = {
      ...submission,
      results: updatedResults,
      totalScore: recalculated.totalScore,
      maxScore: recalculated.maxScore,
      flaggedCount: recalculated.flaggedCount,
      status: recalculated.flaggedCount === 0 ? 'completed' : 'review_needed',
    };

    await db.submissions.put(updatedSubmission);

    // Update store state
    const updatedFlaggedItems = flaggedItems.map((f) => {
      if (f.id === flaggedItemId) {
        return {
          ...f,
          questionResult: {
            ...f.questionResult,
            needsReview: false,
            teacherOverride: {
              correctedAnswer,
              reason,
              overriddenAt: new Date().toISOString(),
            },
          },
        };
      }
      return f;
    });

    set({ flaggedItems: updatedFlaggedItems });
  },

  markAsConfirmedValid: async (flaggedItemId, confirmedAnswer) => {
    const { overrideAnswer } = get();
    await overrideAnswer(flaggedItemId, confirmedAnswer, 'Giáo viên xác nhận đáp án chuẩn');
  },
}));
