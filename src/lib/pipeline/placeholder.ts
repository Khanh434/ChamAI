import { Question } from '@/types/exam';
import { Slot } from '@/types/grading';
import { OptionDetail, QuestionResult } from '@/types/result';
import { PipelineExecutionResult, PipelineOptions } from './types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockOptionDetails(
  selectedPrimary: string | null,
  selectedSecondary?: string | null
): OptionDetail[] {
  const options = ['A', 'B', 'C', 'D'];
  return options.map((opt) => {
    if (opt === selectedPrimary || opt === selectedSecondary) {
      return {
        label: opt,
        markStatus: 'MARKED',
        confidence: 0.88 + Math.random() * 0.1,
      };
    }
    // Random smudge or erased on some distractors
    const subRoll = Math.random();
    if (subRoll < 0.05) {
      return {
        label: opt,
        markStatus: 'ERASED',
        confidence: 0.45,
      };
    }
    return {
      label: opt,
      markStatus: 'EMPTY',
      confidence: 0.95,
    };
  });
}

/**
 * Placeholder Scoring Pipeline
 * Simulates real AI inference with realistic distribution (valid, blank, multi, uncertain)
 */
export async function runPlaceholderPipeline(
  slots: Slot[],
  questions: Question[],
  options?: PipelineOptions
): Promise<PipelineExecutionResult> {
  const startTime = Date.now();
  const waitMs = options?.simulationDelayMs ?? 1200;
  await delay(waitMs);

  let totalScore = 0;
  let maxScore = 0;
  let flaggedCount = 0;

  const results: QuestionResult[] = questions.map((q) => {
    maxScore += q.points;
    const roll = Math.random();

    // 72% - Valid single mark
    if (roll < 0.72) {
      // 80% chance of student picking correct answer (realistic high school test distribution)
      const isStudentCorrect = Math.random() < 0.78;
      const options = ['A', 'B', 'C', 'D'];
      const selected = isStudentCorrect
        ? q.correctAnswer
        : options.filter((o) => o !== q.correctAnswer)[Math.floor(Math.random() * 3)] || 'A';

      const isCorrect = selected === q.correctAnswer;
      const pointsEarned = isCorrect ? q.points : 0;
      totalScore += pointsEarned;

      return {
        questionNumber: q.number,
        verdict: 'VALID',
        selectedAnswer: selected,
        originalSelectedAnswer: selected,
        isCorrect,
        pointsEarned,
        maxPoints: q.points,
        confidence: +(0.88 + Math.random() * 0.11).toFixed(2),
        needsReview: false,
        optionDetails: generateMockOptionDetails(selected),
      };
    }
    // 14% - Blank (unanswered)
    else if (roll < 0.86) {
      return {
        questionNumber: q.number,
        verdict: 'BLANK',
        selectedAnswer: undefined,
        originalSelectedAnswer: undefined,
        isCorrect: false,
        pointsEarned: 0,
        maxPoints: q.points,
        confidence: +(0.92 + Math.random() * 0.07).toFixed(2),
        needsReview: false,
        optionDetails: generateMockOptionDetails(null),
      };
    }
    // 7% - Uncertain (faint pencil / low confidence -> Flagged for review)
    else if (roll < 0.93) {
      flaggedCount++;
      const selected = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
      const isCorrect = selected === q.correctAnswer;
      const pointsEarned = isCorrect ? q.points : 0;
      totalScore += pointsEarned;

      return {
        questionNumber: q.number,
        verdict: 'UNCERTAIN',
        selectedAnswer: selected,
        originalSelectedAnswer: selected,
        isCorrect,
        pointsEarned,
        maxPoints: q.points,
        confidence: +(0.38 + Math.random() * 0.22).toFixed(2),
        needsReview: true,
        reviewReason: 'Độ tin cậy thấp / Nét chì mờ',
        optionDetails: generateMockOptionDetails(selected),
      };
    }
    // 7% - Multiple marks (e.g. A & C marked -> Flagged for review)
    else {
      flaggedCount++;
      const optA = ['A', 'B'][Math.floor(Math.random() * 2)];
      const optB = ['C', 'D'][Math.floor(Math.random() * 2)];
      const doublePick = `${optA} & ${optB}`;

      return {
        questionNumber: q.number,
        verdict: 'MULTI',
        selectedAnswer: doublePick,
        originalSelectedAnswer: doublePick,
        isCorrect: false,
        pointsEarned: 0,
        maxPoints: q.points,
        confidence: +(0.52 + Math.random() * 0.15).toFixed(2),
        needsReview: true,
        reviewReason: 'Tô trùng nhiều đáp án',
        optionDetails: generateMockOptionDetails(optA, optB),
      };
    }
  });

  const processingTimeMs = Date.now() - startTime;

  return {
    results,
    totalScore: +totalScore.toFixed(2),
    maxScore: +maxScore.toFixed(2),
    flaggedCount,
    processingTimeMs,
  };
}
