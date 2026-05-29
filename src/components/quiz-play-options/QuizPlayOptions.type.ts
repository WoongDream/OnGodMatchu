/** 문항당 시간(초). null = 타이머X. */
export type TimeLimitOption = null | 5 | 10 | 20 | 30;

/** 풀이 개수 옵션. */
export type CountOption = 10 | 20 | 30 | 50;

export const TIME_LIMIT_OPTIONS: TimeLimitOption[] = [null, 5, 10, 20, 30];
export const COUNT_OPTIONS: CountOption[] = [10, 20, 30, 50];

export type StartOption = {
  count: number;
  timeLimitSec: TimeLimitOption;
  shuffle: boolean;
};

export type QuizPlayOptionsProps = {
  /** 퀴즈의 총 문항 수 — 옵션 카드 disabled / 적은 문제 수 분기에 사용 */
  questionCount: number;
  /** 시작 버튼 클릭 시 호출됨. 문항이 10 미만이면 count=questionCount, shuffle=false 로 고정 */
  onStart: (option: StartOption) => void;
};

/** 풀이 개수 옵션 카드를 노출하는 최소 문항 수. 미만이면 안내 박스 표시. */
export const MIN_QUESTIONS_FOR_COUNT_OPTIONS = 10;
