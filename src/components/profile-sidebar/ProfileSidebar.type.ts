import type { UserStats } from '@/types';

export type ProfileSidebarProps = {
  isMe: boolean;
  userId?: number;
  stats?: UserStats;
};
