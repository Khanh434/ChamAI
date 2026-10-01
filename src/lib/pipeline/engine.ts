import { Question } from '@/types/exam';
import { QuestionResult } from '@/types/result';

export function recalculateSubmissionScore(
  results: QuestionResult[],
  questions: Question[]
): { totalScore: number; maxScore: number; flaggedCount: number } {
  let totalScore = 0;
  let maxScore = 0;
  let flaggedCount = 0;

  const questionMap = new Map<number, Question>();
  questions.forEach((q) => questionMap.set(q.number, q));

  results.forEach((res) => {
    const q = questionMap.get(res.questionNumber);
    const maxPoints = q ? q.points : res.maxPoints || 0.25;
    maxScore += maxPoints;

    if (res.needsReview) {
      flaggedCount++;
    }

    const currentAnswer = res.teacherOverride
      ? res.teacherOverride.correctedAnswer
      : res.selectedAnswer;

    if (q && currentAnswer === q.correctAnswer) {
      res.isCorrect = true;
      res.pointsEarned = maxPoints;
      totalScore += maxPoints;
    } else {
      res.isCorrect = false;
      res.pointsEarned = 0;
    }
  });

  return {
    totalScore: +totalScore.toFixed(2),
    maxScore: +maxScore.toFixed(2),
    flaggedCount,
  };
}
