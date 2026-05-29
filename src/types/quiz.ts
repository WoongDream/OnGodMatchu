import type { ImageTransform } from './image';

// 카테고리 10종 (영문 키 + 한글 라벨). 라벨 표시·fallback 의 단일 소스.
// 메인/만들기 화면의 실제 노출 순서는 BE categories API(총 플레이수 내림차순)를 따르고,
// 이 배열 순서는 API 미응답 시 fallback 기본 순서로만 쓰인다.
export const CATEGORIES = [
  { value: 'game', label: '게임' },
  { value: 'music', label: '음악' },
  { value: 'culture', label: '문화' },
  { value: 'broadcast', label: '방송' },
  { value: 'general', label: '상식' },
  { value: 'comic', label: '만화' },
  { value: 'food', label: '음식' },
  { value: 'person', label: '인물' },
  { value: 'sports', label: '스포츠' },
  { value: 'meme', label: '병맛' },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];

export type QuizVisibility = 'PUBLIC' | 'PRIVATE';

export type Quiz = {
  id: number;
  publicId?: string;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  title: string;
  description: string;
  category: Category;
  thumbnailKey?: string | null;
  thumbnailUrl: string | null;
  /** 크롭 전 원본 key (소유자 상세 응답에만). 재편집 시 재전송해 원본 보존. */
  originalThumbnailKey?: string | null;
  /** 크롭 전 원본 presigned URL (재편집용). 소유자에게만, 원본 미보존이면 null. */
  originalThumbnailUrl?: string | null;
  /** 썸네일 크롭/변환 파라미터 (재편집 복원용). */
  thumbnailTransform?: ImageTransform | null;
  playCount: number;
  starCount: number;
  commentCount: number;
  shareCount: number;
  isStarred: boolean | null;
  isPublic: boolean;
  createdAt: string;
};

export type Question = {
  id: number;
  quizId: number;
  orderNum: number;
  imageKey?: string | null;
  imageUrl: string | null;
  /** 문제 이미지 크롭 전 원본 key (소유자에게만). 재편집 시 재전송용. */
  originalImageKey?: string | null;
  /** 문제 이미지 크롭 전 원본 presigned URL (재편집용, 소유자에게만). */
  originalImageUrl?: string | null;
  /** 문제 이미지 크롭/변환 파라미터. */
  imageTransform?: ImageTransform | null;
  answerImageKey?: string | null;
  answerImageUrl?: string | null;
  /** 정답 이미지 크롭 전 원본 key (소유자에게만). */
  originalAnswerImageKey?: string | null;
  /** 정답 이미지 크롭 전 원본 presigned URL (재편집용, 소유자에게만). */
  originalAnswerImageUrl?: string | null;
  /** 정답 이미지 크롭/변환 파라미터. */
  answerImageTransform?: ImageTransform | null;
  questionText: string | null;
  answer: string;
};

export type MyQuizListItem = {
  id: number;
  publicId: string;
  title: string;
  category: Category;
  categoryLabel: string;
  isPublic: boolean;
  thumbnailKey?: string | null;
  thumbnailUrl: string | null;
  playCount: number;
  shareCount: number;
  starCount: number;
  commentCount: number;
  correctRate: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MyQuizzesAggregate = {
  totalQuizCount: number;
  totalPlayCount: number;
  totalShareCount: number;
  totalStarCount: number;
  totalCommentCount: number;
  weeklyPlayCount: number;
  avgCorrectRate?: number | null;
  /** 내가 푼 횟수 (본인 attempts 수) */
  solvedCount?: number;
  /** 내가 푼 평균 정답률 0~100, 시도 0이면 null */
  avgSolveRate?: number | null;
};

export type ScoreCount = {
  score: number;
  count: number;
};

export type QuizScoreDistribution = {
  totalAttempts: number;
  averageScore: number;
  /** score 0~totalQuestions 모든 칸 (count=0 포함) */
  distribution: ScoreCount[];
};
