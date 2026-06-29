import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import useSubmitAttempt from './useSubmitAttempt';
import type { AttemptAnswerInput, AttemptResponse } from '@/types';
import type { AttemptErrorCode } from '@/api/attempt';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockSubmitAttempt = vi.hoisted(() => vi.fn());
const mockMapAttemptError = vi.hoisted(() => vi.fn());

vi.mock('@/api/attempt', () => ({
  submitAttempt: mockSubmitAttempt,
  mapAttemptError: mockMapAttemptError,
}));

// ── 가짜 axios 에러 생성 헬퍼 ─────────────────────────────────────────────
const makeAxiosError = (status: number, code?: string): AxiosError => {
  const err = new AxiosError('failed');
  err.response = {
    status,
    data: code ? { error: { code } } : {},
    headers: {},
    config: {} as never,
    statusText: '',
  };
  return err;
};

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const MOCK_ANSWERS: AttemptAnswerInput[] = [
  { questionId: 1, userAnswer: '정답1' },
  { questionId: 2, userAnswer: '정답2' },
];

const MOCK_RESPONSE: AttemptResponse = {
  id: 42,
  quizId: 1,
  score: 2,
  totalQuestions: 2,
  percent: 100,
  topPercentile: null,
  completedAt: '2025-01-01T00:00:00Z',
  results: [
    {
      questionId: 1,
      userAnswer: '정답1',
      correctAnswer: '정답1',
      correct: true,
      correctAnswerImageUrl: null,
    },
    {
      questionId: 2,
      userAnswer: '정답2',
      correctAnswer: '정답2',
      correct: true,
      correctAnswerImageUrl: null,
    },
  ],
};

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useSubmitAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('isSubmitting=false, error=null, errorCode=null 로 시작한다', () => {
      const { result } = renderHook(() => useSubmitAttempt());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });

    it('submit 과 clearError 함수가 노출된다', () => {
      const { result } = renderHook(() => useSubmitAttempt());

      expect(typeof result.current.submit).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('성공 케이스', () => {
    it('submitAttempt 를 quizId 와 answers 로 호출한다', async () => {
      mockSubmitAttempt.mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      const [calledQuizId, calledAnswers] = mockSubmitAttempt.mock.calls[0];
      expect(calledQuizId).toBe(1);
      expect(calledAnswers).toEqual(MOCK_ANSWERS);
    });

    it('timeLimitSec 인자를 submitAttempt 로 그대로 전달한다', async () => {
      mockSubmitAttempt.mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS, 10);
      });

      expect(mockSubmitAttempt).toHaveBeenCalledWith(1, MOCK_ANSWERS, 10);
    });

    it('timeLimitSec=null 도 submitAttempt 로 그대로 전달한다', async () => {
      mockSubmitAttempt.mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS, null);
      });

      expect(mockSubmitAttempt).toHaveBeenCalledWith(1, MOCK_ANSWERS, null);
    });

    it('timeLimitSec 을 생략하면 submitAttempt 의 세 번째 인자가 undefined 다', async () => {
      mockSubmitAttempt.mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(mockSubmitAttempt).toHaveBeenCalledWith(1, MOCK_ANSWERS, undefined);
    });

    it('AttemptResponse 를 반환한다', async () => {
      mockSubmitAttempt.mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useSubmitAttempt());

      let returned: AttemptResponse | null = null;
      await act(async () => {
        returned = await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(returned).toEqual(MOCK_RESPONSE);
    });

    it('성공 후 error 와 errorCode 는 null 이다', async () => {
      mockSubmitAttempt.mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });

    it('성공 후 isSubmitting 은 false 이다', async () => {
      mockSubmitAttempt.mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('isSubmitting 토글', () => {
    it('submit 동안 isSubmitting=true → 완료 후 false 가 된다', async () => {
      let resolveSubmit!: (v: AttemptResponse) => void;
      mockSubmitAttempt.mockReturnValue(
        new Promise<AttemptResponse>((res) => {
          resolveSubmit = res;
        }),
      );

      const { result } = renderHook(() => useSubmitAttempt());
      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.submit(1, MOCK_ANSWERS);
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        resolveSubmit(MOCK_RESPONSE);
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('에러 발생 시에도 isSubmitting 은 false 로 복구된다', async () => {
      mockSubmitAttempt.mockRejectedValue(new Error('boom'));
      mockMapAttemptError.mockReturnValue('NETWORK');
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('axios 에러 → mapAttemptError 결과를 errorCode 로 노출', () => {
    it('mapAttemptError 를 axios 에러로 호출한다', async () => {
      const axiosErr = makeAxiosError(400);
      mockSubmitAttempt.mockRejectedValue(axiosErr);
      mockMapAttemptError.mockReturnValue('INVALID_INPUT');
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(mockMapAttemptError).toHaveBeenCalledWith(axiosErr);
    });

    it('axios 에러 → null 을 반환한다', async () => {
      mockSubmitAttempt.mockRejectedValue(makeAxiosError(400));
      mockMapAttemptError.mockReturnValue('INVALID_INPUT');
      const { result } = renderHook(() => useSubmitAttempt());

      let returned: AttemptResponse | null = MOCK_RESPONSE;
      await act(async () => {
        returned = await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(returned).toBeNull();
    });
  });

  describe('비-axios 에러 → NETWORK', () => {
    it('비-axios 에러 시 errorCode=NETWORK 로 세팅된다', async () => {
      mockSubmitAttempt.mockRejectedValue(new TypeError('network fail'));
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(result.current.errorCode).toBe('NETWORK');
      expect(mockMapAttemptError).not.toHaveBeenCalled();
    });

    it('비-axios 에러 시 null 을 반환한다', async () => {
      mockSubmitAttempt.mockRejectedValue(new Error('unknown'));
      const { result } = renderHook(() => useSubmitAttempt());

      let returned: AttemptResponse | null = MOCK_RESPONSE;
      await act(async () => {
        returned = await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(returned).toBeNull();
    });
  });

  describe('에러 코드별 메시지 매핑', () => {
    const errorCases: Array<[AttemptErrorCode, string]> = [
      ['QUIZ_NOT_FOUND', '퀴즈를 찾을 수 없어요.'],
      ['QUESTION_NOT_FOUND', '잘못된 문제 정보가 포함됐어요.'],
      ['INVALID_INPUT', '답안을 다시 확인해주세요.'],
      ['UNAUTHORIZED', '로그인이 필요해요.'],
      ['NETWORK', '제출에 실패했어요. 잠시 후 다시 시도해주세요.'],
    ];

    it.each(errorCases)(
      'errorCode=%s → error 메시지가 올바르게 세팅된다',
      async (code, expectedMessage) => {
        mockSubmitAttempt.mockRejectedValue(makeAxiosError(400));
        mockMapAttemptError.mockReturnValue(code);
        const { result } = renderHook(() => useSubmitAttempt());

        await act(async () => {
          await result.current.submit(1, MOCK_ANSWERS);
        });

        expect(result.current.errorCode).toBe(code);
        expect(result.current.error).toBe(expectedMessage);
      },
    );
  });

  describe('clearError()', () => {
    it('에러 발생 후 clearError 호출 시 error 와 errorCode 가 null 로 초기화된다', async () => {
      mockSubmitAttempt.mockRejectedValue(makeAxiosError(401));
      mockMapAttemptError.mockReturnValue('UNAUTHORIZED');
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.errorCode).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });

    it('에러 없는 상태에서 clearError 를 호출해도 문제없다', () => {
      const { result } = renderHook(() => useSubmitAttempt());

      expect(() => {
        act(() => {
          result.current.clearError();
        });
      }).not.toThrow();

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });

    it('clearError 는 isSubmitting 에 영향을 주지 않는다', async () => {
      mockSubmitAttempt.mockRejectedValue(makeAxiosError(400));
      mockMapAttemptError.mockReturnValue('INVALID_INPUT');
      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('연속 호출', () => {
    it('두 번째 submit 시작 시 이전 에러가 clearError 로 초기화된다', async () => {
      mockSubmitAttempt
        .mockRejectedValueOnce(makeAxiosError(400))
        .mockResolvedValueOnce(MOCK_RESPONSE);
      mockMapAttemptError.mockReturnValue('INVALID_INPUT');

      const { result } = renderHook(() => useSubmitAttempt());

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      expect(result.current.errorCode).toBe('INVALID_INPUT');

      await act(async () => {
        await result.current.submit(1, MOCK_ANSWERS);
      });

      // 두 번째 호출 성공 후 에러 없음
      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });
  });
});
