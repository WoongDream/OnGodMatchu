import { memo } from 'react';
import type { Category } from '@/types';
import { CATEGORIES } from '@/types/quiz';
import ChipButton from '@/components/chip-button';
import useCategories from '@/hooks/useCategories';
import type { CategoryFilterProps } from './CategoryFilter.type';
import { wrapperStyle } from './CategoryFilter.style';

const FALLBACK_CATEGORIES = CATEGORIES.map((c) => ({ key: c.value, label: c.label }));

const CategoryFilter = memo(({ selected, onSelect }: CategoryFilterProps) => {
  const { categories } = useCategories();
  const items = categories ?? FALLBACK_CATEGORIES;

  const handleChipClick = (category: Category | null) => {
    onSelect(category === selected ? null : category);
  };

  return (
    <div css={wrapperStyle}>
      <ChipButton active={selected === null} onClick={() => handleChipClick(null)}>
        전체
      </ChipButton>
      {items.map(({ key, label }) => (
        <ChipButton
          key={key}
          active={selected === key}
          onClick={() => handleChipClick(key as Category)}
        >
          {label}
        </ChipButton>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
export default CategoryFilter;
