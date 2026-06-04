export type UserStats = {
  playCount: number;
  correctRate: number;
  createdQuizCount: number;
};

export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'NAVER';

export type User = {
  id: number;
  /** 공개 식별자(UUID). BE /me 응답의 userId — 타인 프로필과 본인 비교에 사용 */
  userId?: string;
  email: string;
  nickname: string;
  provider: AuthProvider;
  profileImageKey?: string | null;
  profileImageUrl?: string | null;
  /** 크롭 전 원본 key (소유자 응답에만). 재편집 시 재전송용. */
  originalProfileImageKey?: string | null;
  /** 크롭 전 원본 presigned URL (재편집용, 소유자에게만). */
  originalProfileImageUrl?: string | null;
  /** 프로필 이미지 크롭/변환 파라미터 (재편집 복원용). */
  profileImageTransform?: import('./image').ImageTransform | null;
  bio?: string;
  isProfilePublic: boolean;
  createdAt: string;
  needsTermsAgreement?: boolean;
  stats?: UserStats;
};

/**
 * 프로필 모달 / 공개 프로필 화면용 타인 프로필 요약. 통계는 전부 PUBLIC 퀴즈 기준(비공개 퀴즈 제외).
 * 비공개 프로필도 통계는 내려오며, isProfilePublic 으로 "프로필 보러가기" 노출만 분기한다.
 */
export type PublicProfileSummary = {
  userId: string;
  nickname: string;
  profileImageUrl: string;
  bio: string | null;
  isProfilePublic: boolean;
  /** 풀어본 횟수 (PUBLIC 퀴즈 attempt 수) */
  solvedCount: number;
  /** 평균 정답률 0~100, PUBLIC 풀이 0회면 null */
  avgSolveRate: number | null;
  /** 만든 PUBLIC 퀴즈 개수 */
  quizCount: number;
  /** 만든 PUBLIC 퀴즈 총 플레이 수 */
  totalPlayCount: number;
  /** 만든 PUBLIC 퀴즈 받은 스타 합계 */
  totalStarCount: number;
};
