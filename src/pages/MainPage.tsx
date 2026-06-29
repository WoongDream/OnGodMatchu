import { memo, useEffect, useState } from 'react';
import type { QuizListSort } from '@/api/quiz';
import Dropdown from '@/components/dropdown';
import Input from '@/components/input';
import type { Category } from '@/types';
import CategoryFilter from '@/features/quiz/list/CategoryFilter';
import QuizList from '@/features/quiz/list/QuizList';
import useQuizzes from '@/hooks/useQuizzes';
import {
  wrapperStyle,
  toolbarStyle,
  sortBoxStyle,
  searchBoxStyle,
  messageStyle,
} from './MainPage.style';

const SEARCH_DEBOUNCE_MS = 300;

const SORT_OPTIONS: ReadonlyArray<{ value: QuizListSort; label: string }> = [
  { value: 'plays', label: '인기순' },
  { value: 'latest', label: '최신순' },
];

const MainPage = memo(() => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sort, setSort] = useState<QuizListSort>('plays');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { quizzes, isLoading, error } = useQuizzes({
    category: selectedCategory ?? undefined,
    q: debouncedSearch,
    sort,
  });

  const isSearching = debouncedSearch.trim() !== '';
  const isEmpty = !isLoading && !error && quizzes.length === 0;

  return (
    <div css={wrapperStyle}>
      <div css={toolbarStyle}>
        <div css={sortBoxStyle}>
          <Dropdown<QuizListSort>
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
            ariaLabel="정렬 기준"
          />
        </div>
        <div css={searchBoxStyle}>
          <Input value={search} onChange={setSearch} placeholder="검색어를 입력하세요." />
        </div>
      </div>

      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {error ? (
        <p css={messageStyle}>퀴즈를 불러오지 못했습니다.</p>
      ) : isLoading ? (
        <p css={messageStyle}>로딩 중...</p>
      ) : isEmpty ? (
        <p css={messageStyle}>{isSearching ? '검색 결과가 없어요.' : '퀴즈가 없어요.'}</p>
      ) : (
        <QuizList quizzes={quizzes} />
      )}
    </div>
  );
});

MainPage.displayName = 'MainPage';
export default MainPage;
