import type { MyQuizListItem } from '@/types';

export type MyQuizCardProps = {
  item: MyQuizListItem;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isMutating?: boolean;
  /** 읽기 전용(타인 공개 프로필) — 편집/삭제 버튼을 숨기고 카드 클릭 시 onOpen 호출 */
  readOnly?: boolean;
  onOpen?: (id: number) => void;
};
