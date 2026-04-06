import { useState } from 'react';
import type { Category } from '@/types';
import CategoryFilter from '@/features/quiz-list/CategoryFilter';
import QuizList from '@/features/quiz-list/QuizList';
import { MOCK_QUIZZES } from '@/features/quiz-list/mock';

const MainPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredQuizzes =
    selectedCategory === null
      ? MOCK_QUIZZES
      : MOCK_QUIZZES.filter((quiz) => quiz.category === selectedCategory);

  return (
    <>
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      <QuizList quizzes={filteredQuizzes} />
    </>
  );
};

export default MainPage;
