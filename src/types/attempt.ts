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
  /** 최신 attempt id */
  id: number;
  quizId: number;
  quizPublicId: string;
  quizTitle: string;
  quizCategory: Category;
  quizCategoryLabel: string;
  quizThumbnailKey?: string | null;
  quizThumbnailUrl: string | null;
  /** 퀴즈 카운터 (메인 카드와 동일) */
  playCount: number;
  starCount: number;
  commentCount: number;
  shareCount: number;
  score: number;
  totalQuestions: number;
  percent: number | null;
  /** 풀이 당시 상위 백분위 0~100 스냅샷. 첫 응시/레거시면 null */
  topPercentile: number | null;
  /** 풀이 당시 문항당 타이머 설정(초). 타이머 없음/레거시면 null */
  timeLimitSec: number | null;
  /** 이 퀴즈를 푼 누적 횟수 (>=1) */
  attemptCount: number;
  /** 최신 풀이 완료 시각 */
  completedAt: string;
};
