import type { MyQuizzesAggregate } from '@/types';

export type ProfileCardProps = {
  nickname: string;
  imageUrl?: string | null;
  bio?: string;
  isProfilePublic: boolean;
  stats?: MyQuizzesAggregate;
  /** 'card'(기본): 테두리/배경 있는 카드, 'plain': 모달 등 컨테이너 안에서 테두리 없이 */
  variant?: 'card' | 'plain';
};
