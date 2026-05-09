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
  bio?: string;
  isProfilePublic: boolean;
  createdAt: string;
  stats?: UserStats;
};
