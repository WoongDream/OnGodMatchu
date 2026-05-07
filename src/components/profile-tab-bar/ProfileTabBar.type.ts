import type { UserStats } from '@/types';

export type ProfileTabBarProps = {
  isMe: boolean;
  userId?: number;
  stats?: UserStats;
};
