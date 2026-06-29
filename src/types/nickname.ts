/** 차단 닉네임 분류 — 예약어 / 금지어 (분류 지표, 금지 정책은 매칭 방식이 결정). */
export type NicknameRuleType = 'RESERVED' | 'FORBIDDEN';

/** 매칭 방식 — 완전 / 접두 / 부분 일치. */
export type NicknameMatchType = 'EXACT' | 'PREFIX' | 'CONTAINS';

/** 백오피스 리스트 필터 탭. */
export type NicknameRuleFilter = 'ALL' | 'FORBIDDEN' | 'RESERVED';

export type ForbiddenNickname = {
  id: number;
  /** 표시용 원본 패턴. */
  value: string;
  /** Tier 0·1 정규화된 매칭 키. */
  normalizedValue: string;
  type: NicknameRuleType;
  matchType: NicknameMatchType;
  reason: string | null;
  createdAt: string;
};

export type NicknameRuleStats = {
  total: number;
  forbidden: number;
  reserved: number;
};
