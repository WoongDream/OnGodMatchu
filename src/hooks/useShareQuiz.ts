import { useCallback, useState } from 'react';
import { useSWRConfig } from 'swr';
import { recordQuizShare } from '@/api/quiz';
import type { Quiz, Question } from '@/types';

type Detail = Quiz & { questions: Question[] };

export type ShareResult = 'copied' | 'failed';

type UseShareQuizReturn = {
  share: () => Promise<ShareResult>;
  isPending: boolean;
};

const buildShareUrl = (_publicId: string | undefined, quizId: number): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  // 라우트가 `/quiz/:id` 의 `id` 를 `Number()` 로 파싱 → 내부 id 만 유효.
  // publicId(UUID) 를 넣으면 `Number(uuid)=NaN` 으로 404 페이지 진입.
  return `${window.location.origin}/quiz/${quizId}`;
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한/보안 컨텍스트 외 — fallthrough
    }
  }
  // execCommand fallback (HTTP 등 비보안 컨텍스트)
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};

/**
 * 퀴즈 공유 훅. 1차 정책: URL 을 clipboard 로 복사하고 호출자가 토스트 표시.
 * 성공 시 detail+list 캐시의 shareCount 낙관적 증분 + 서버 카운트 비동기 기록.
 */
const useShareQuiz = (quiz: {
  id: number;
  publicId?: string;
  title: string;
}): UseShareQuizReturn => {
  const { mutate } = useSWRConfig();
  const [isPending, setIsPending] = useState(false);

  const share = useCallback(async (): Promise<ShareResult> => {
    setIsPending(true);
    try {
      const url = buildShareUrl(quiz.publicId, quiz.id);
      if (!url) {
        return 'failed';
      }
      const ok = await copyToClipboard(url);
      if (!ok) {
        return 'failed';
      }

      await mutate(
        ['quiz', quiz.id],
        (prev: Detail | undefined) => (prev ? { ...prev, shareCount: prev.shareCount + 1 } : prev),
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
              q.id === quiz.id ? { ...q, shareCount: q.shareCount + 1 } : q,
            ),
          };
        },
        { revalidate: false },
      );

      void recordQuizShare(quiz.id).catch(() => {
        // 서버 실패해도 사용자 흐름은 진행 — 다음 revalidate 시 동기화
      });

      return 'copied';
    } finally {
      setIsPending(false);
    }
  }, [quiz.id, quiz.publicId, mutate]);

  return { share, isPending };
};

export default useShareQuiz;
