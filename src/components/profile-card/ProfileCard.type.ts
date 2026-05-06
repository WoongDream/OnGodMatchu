import type { UserStats } from '@/types';

export type ProfileCardProps = {
  nickname: string;
  imageUrl?: string | null;
  bio?: string;
  isPublic: boolean;
  stats?: UserStats;
};
