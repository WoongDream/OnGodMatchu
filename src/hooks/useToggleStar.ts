import { useCallback, useState } from 'react';
import { useSWRConfig } from 'swr';
import { starQuiz, unstarQuiz } from '@/api/quiz';
import type { Quiz, Question } from '@/types';

type Detail = Quiz & { questions: Question[] };

type UseToggleStarReturn = {
  toggle: (quizId: number, currentIsStarred: boolean) => Promise<void>;
  pendingQuizId: number | null;
  error: string | null;
};

/**
 * 스타 토글 훅. quizId 별로 인스턴스를 만들 필요 없이 호출 시점에 quizId 를 넘긴다.
 * detail 캐시(`['quiz', quizId]`) + 목록 캐시(`['quizzes', ...]`) 양쪽 낙관적 업데이트.
 */
const useToggleStar = (): UseToggleStarReturn => {
  const { mutate } = useSWRConfig();
  const [pendingQuizId, setPendingQuizId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(
    async (quizId: number, currentIsStarred: boolean): Promise<void> => {
      const nextStarred = !currentIsStarred;
      setPendingQuizId(quizId);
      setError(null);

      await mutate(
        ['quiz', quizId],
        (prev: Detail | undefined) =>
          prev
            ? {
                ...prev,
                isStarred: nextStarred,
                starCount: Math.max(0, prev.starCount + (nextStarred ? 1 : -1)),
              }
            : prev,
        { revalidate: false },
      );
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'quizzes',
        (prev: { content: Quiz[]; [k: string]: unknown } | undefined) => {
          if (!prev?.content) {
            return prev;
          }
          return {
            ...prev,
            content: prev.content.map((q) =>
              q.id === quizId
                ? {
                    ...q,
                    isStarred: nextStarred,
                    starCount: Math.max(0, q.starCount + (nextStarred ? 1 : -1)),
                  }
                : q,
            ),
          };
        },
        { revalidate: false },
      );

      try {
        if (nextStarred) {
          await starQuiz(quizId);
        } else {
          await unstarQuiz(quizId);
        }
      } catch (e) {
        setError('스타 토글에 실패했어요. 잠시 후 다시 시도해주세요.');
        await mutate(['quiz', quizId]);
        await mutate((key) => Array.isArray(key) && key[0] === 'quizzes');
        throw e;
      } finally {
        setPendingQuizId(null);
      }
    },
    [mutate],
  );

  return { toggle, pendingQuizId, error };
};

export default useToggleStar;
