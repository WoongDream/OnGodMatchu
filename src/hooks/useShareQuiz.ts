import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { recordQuizShare, type QuizShareResult } from '@/api/quiz';
import type { Quiz, Question } from '@/types';

type Detail = Quiz & { questions: Question[] };

export type ShareResult = 'copied' | 'failed';

type UseShareQuizReturn = {
  share: () => Promise<ShareResult>;
};

const buildShareUrl = (quizId: number): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  // 라우트가 `/quiz/:id` 의 `id` 를 `Number()` 로 파싱 → 내부 id 만 유효.
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
 * 퀴즈 공유 훅 — clipboard-only.
 *
 * - 환경(모바일/데스크톱) 무관 매 클릭마다 URL 을 clipboard 로 복사하고 호출자가 토스트 표시.
 * - 사용자가 여러 번 눌러도 클립보드 복사·토스트는 동일하게 동작. 서버 카운트는 BE 가
 *   사용자/익명 단위 1회만 증가 (`recordQuizShare` 가 멱등).
 * - 응답 `shareCount` 로 SWR 캐시를 덮어쓰기 (서버가 권위).
 */
const useShareQuiz = (quizId: number): UseShareQuizReturn => {
  const { mutate } = useSWRConfig();

  const syncShareCount = useCallback(
    async (data: QuizShareResult) => {
      await mutate(
        ['quiz', quizId],
        (prev: Detail | undefined) => (prev ? { ...prev, shareCount: data.shareCount } : prev),
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
              q.id === quizId ? { ...q, shareCount: data.shareCount } : q,
            ),
          };
        },
        { revalidate: false },
      );
    },
    [mutate, quizId],
  );

  const share = useCallback(async (): Promise<ShareResult> => {
    const url = buildShareUrl(quizId);
    if (!url) {
      return 'failed';
    }
    const ok = await copyToClipboard(url);
    if (!ok) {
      return 'failed';
    }

    try {
      const data = await recordQuizShare(quizId);
      await syncShareCount(data);
    } catch {
      // 서버 기록 실패는 사용자 흐름에 영향 X — 다음 revalidate 시 동기화
    }

    return 'copied';
  }, [quizId, syncShareCount]);

  return { share };
};

export default useShareQuiz;
