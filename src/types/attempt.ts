import type { Category } from './quiz';

export type AttemptAnswerInput = {
  questionId: number;
  userAnswer: string;
};

export type AttemptResultItem = {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  correctAnswerImageUrl: string | null;
};

export type AttemptResponse = {
  id: number | null;
  quizId: number;
  score: number;
  totalQuestions: number;
  percent: number | null;
  /** 상위 백분위 0~100 (소수 1자리). 첫 응시자(totalAttempts=1)면 null */
  topPercentile: number | null;
  completedAt: string;
  results: AttemptResultItem[];
};

export type AttemptListItem = {
  id: number;
  quizId: number;
  quizPublicId: string;
  quizTitle: string;
  quizCategory: Category;
  quizCategoryLabel: string;
  quizThumbnailKey?: string | null;
  quizThumbnailUrl: string | null;
  score: number;
  totalQuestions: number;
  percent: number | null;
  completedAt: string;
};
