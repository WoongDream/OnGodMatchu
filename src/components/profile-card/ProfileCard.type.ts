import type { MyQuizzesAggregate } from '@/types';

export type ProfileCardProps = {
  nickname: string;
  imageUrl?: string | null;
  bio?: string;
  isProfilePublic: boolean;
  stats?: MyQuizzesAggregate;
};
