export type UserStats = {
  playCount: number;
  correctRate: number;
  createdQuizCount: number;
};

export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'NAVER' | 'KAKAO';

export type User = {
  id: number;
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
