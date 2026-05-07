import type { MyQuizListItem } from '@/types';

export type MyQuizCardProps = {
  item: MyQuizListItem;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isMutating?: boolean;
};
