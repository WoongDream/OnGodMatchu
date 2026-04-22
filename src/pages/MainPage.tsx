import { memo, useState } from 'react';
import type { Category } from '@/types';
import CategoryFilter from '@/features/quiz-list/CategoryFilter';
import QuizList from '@/features/quiz-list/QuizList';
import useQuizzes from '@/hooks/useQuizzes';

const MainPage = memo(() => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { quizzes, isLoading } = useQuizzes({ category: selectedCategory ?? undefined });

  return (
    <>
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      {isLoading ? <div>로딩 중...</div> : <QuizList quizzes={quizzes} />}
    </>
  );
});

export default MainPage;
