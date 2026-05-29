import type { Quiz } from '@/types';

export type QuizCardProps = {
  quiz: Quiz;
  onClick: (id: number) => void;
  onStarClick: (quizId: number, isStarred: boolean, e: React.MouseEvent) => void;
  isStarPending?: boolean;
};
