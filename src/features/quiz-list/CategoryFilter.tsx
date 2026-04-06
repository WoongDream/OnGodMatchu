import { memo } from 'react';
import type { Category } from '@/types';
import { CATEGORIES } from '@/types/quiz';
import ChipButton from '@/components/chip-button';
import type { CategoryFilterProps } from './CategoryFilter.type';
import { FilterWrapper } from './CategoryFilter.style';

const CategoryFilter = memo(({ selected, onSelect }: CategoryFilterProps) => {
  const handleChipClick = (category: Category | null) => {
    onSelect(category === selected ? null : category);
  };

  return (
    <FilterWrapper>
      <ChipButton active={selected === null} onClick={() => handleChipClick(null)}>
        전체
      </ChipButton>
      {CATEGORIES.map(({ value, label }) => (
        <ChipButton key={value} active={selected === value} onClick={() => handleChipClick(value)}>
          {label}
        </ChipButton>
      ))}
    </FilterWrapper>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
export default CategoryFilter;
