import type { Quiz } from '@/types';

export type QuizCardProps = {
  quiz: Quiz;
  onClick: (id: number) => void;
};
