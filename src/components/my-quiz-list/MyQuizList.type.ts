import type { MyQuizListItem } from '@/types';

export type MyQuizListProps = {
  items: MyQuizListItem[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isMutating?: boolean;
  emptyLabel?: string;
  /** 읽기 전용(타인 공개 프로필) — 편집/삭제 숨기고 카드 클릭 시 onOpen */
  readOnly?: boolean;
  onOpen?: (id: number) => void;
};
