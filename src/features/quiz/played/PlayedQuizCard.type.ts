import type { AttemptListItem } from '@/types';

export type PlayedQuizCardProps = {
  attempt: AttemptListItem;
  /** 카드 클릭 → 해당 퀴즈 상세로 이동 */
  onClick: (quizId: number) => void;
  /** 기록 라벨 (기본 "내 기록"). 타인 공개 프로필에선 "{닉네임}님 기록" */
  recordLabel?: string;
};

/** 상위 N% 를 primary 톤으로 강조하는 임계값 (이내면 강조). */
export const TOP_PERCENTILE_HIGHLIGHT_THRESHOLD = 10;
