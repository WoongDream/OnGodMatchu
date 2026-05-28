export type QuestionCardVariant = 'item' | 'add';

export type QuestionCardProps = {
  variant?: QuestionCardVariant;
  /** item variant 에서만 사용 — 카드 본문 이미지 */
  imageUrl?: string | null;
  /** item variant 에서만 사용 — 이미지 없을 때 표시할 텍스트 */
  questionText?: string;
  /** 선택 상태 (item variant 에서만 의미 있음) */
  selected?: boolean;
  /** 외부 검증 invalid */
  invalid?: boolean;
  onClick?: () => void;
  /** 접근성 라벨 — 카드 식별 (예: '문제 2 카드') */
  ariaLabel?: string;
};
