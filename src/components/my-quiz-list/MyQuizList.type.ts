import type { MyQuizListItem } from '@/types';

export type MyQuizListProps = {
  items: MyQuizListItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isMutating?: boolean;
  emptyLabel?: string;
};
