import type { MyQuizzesAggregate, Role } from '@/types';

export type ProfileCardProps = {
  nickname: string;
  imageUrl?: string | null;
  bio?: string;
  isProfilePublic: boolean;
  stats?: MyQuizzesAggregate;
  /** 닉네임 위 역할 배지. OWNER/ADMIN 만 표시되고 USER/미지정이면 미노출. */
  role?: Role | null;
  /** 'card'(기본): 테두리/배경 있는 카드, 'plain': 모달 등 컨테이너 안에서 테두리 없이 */
  variant?: 'card' | 'plain';
};
