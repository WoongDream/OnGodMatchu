import type { Category } from '@/types';

export type CategoryFilterProps = {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
};
