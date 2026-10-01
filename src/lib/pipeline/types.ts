import { Question } from '@/types/exam';
import { Slot } from '@/types/grading';
import { QuestionResult } from '@/types/result';

export interface PipelineOptions {
  simulationDelayMs?: number;
  strictConfidenceThreshold?: number;
}

export interface PipelineExecutionResult {
  results: QuestionResult[];
  totalScore: number;
  maxScore: number;
  flaggedCount: number;
  processingTimeMs: number;
}

export interface ImageQualityReport {
  isValid: boolean;
  blurScore: number; // 0 (blurry) to 1 (sharp)
  brightnessScore: number; // 0 (too dark) to 1 (good)
  orientation: 'portrait' | 'landscape' | 'unknown';
  detectedSheetCorners?: Array<{ x: number; y: number }>;
  warnings: string[];
}
