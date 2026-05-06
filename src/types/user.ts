export type UserStats = {
  playCount: number;
  correctRate: number;
  createdQuizCount: number;
};

export type User = {
  id: number;
  email: string;
  nickname: string;
  provider: string;
  profileImageKey?: string | null;
  profileImageUrl?: string | null;
  bio?: string;
  isPublic: boolean;
  createdAt: string;
  stats?: UserStats;
};
