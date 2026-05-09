import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useWithdrawAccount from './useWithdrawAccount';

// ── API mock ──────────────────────────────────────────────────────────────────
const mockWithdrawAccount = vi.hoisted(() => vi.fn());

vi.mock('@/api/user', () => ({
  withdrawAccount: mockWithdrawAccount,
  mapUserError: (error: unknown) => {
    const err = error as { response?: { status?: number; data?: { error?: { code?: string } } } };
    const code = err.response?.data?.error?.code;
    const status = err.response?.status;
    if (code === 'WITHDRAWAL_FAILED') {
      return 'WITHDRAWAL_FAILED';
    }
    if (code === 'INVALID_CURRENT_PASSWORD') {
      return 'INVALID_CURRENT_PASSWORD';
    }
    if (code === 'OAUTH_USER_CANNOT_CHANGE_PASSWORD') {
      return 'OAUTH_USER_CANNOT_CHANGE_PASSWORD';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    return 'NETWORK';
  },
}));

// ── clearAuthSession mock ─────────────────────────────────────────────────────
const mockClearAuthSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  clearAuthSession: mockClearAuthSession,
}));

// ── authStore mock ────────────────────────────────────────────────────────────
const mockLogout = vi.hoisted(() => vi.fn());

vi.mock('@/store/authStore', () => ({
  default: {
    getState: vi.fn(() => ({ logout: mockLogout })),
  },
}));

// ── useNavigate mock ──────────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// ── 가짜 axios 에러 생성 헬퍼 ──────────────────────────────────────────────────
const makeAxiosError = (status: number, code?: string) =>
  Object.assign(new Error('AxiosError'), {
    isAxiosError: true,
    response: {
      status,
      data: code ? { error: { code } } : {},
    },
  });

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('useWithdrawAccount', () => {
  beforeEach(() => {
    mockWithdrawAccount.mockReset();
    mockClearAuthSession.mockReset();
    mockLogout.mockReset();
    mockNavigate.mockReset();
  });

  describe('withdraw()', () => {
    it('성공 시 clearAuthSession 을 호출한다', async () => {
      mockWithdrawAccount.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ reason: 'no_time', deleteMyQuizzes: false });
      });

      expect(mockClearAuthSession).toHaveBeenCalledTimes(1);
    });

    it('성공 시 authStore.logout 을 호출한다', async () => {
      mockWithdrawAccount.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: true });
      });

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('성공 시 navigate("/login?withdrawn=1", { replace: true }) 를 호출한다', async () => {
      mockWithdrawAccount.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login?withdrawn=1', { replace: true });
    });

    it('성공 시 true 를 반환한다', async () => {
      mockWithdrawAccount.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWithdrawAccount());

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(returned).toBe(true);
    });

    it('실패 시 navigate 를 호출하지 않는다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(500, 'WITHDRAWAL_FAILED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('실패 시 clearAuthSession 을 호출하지 않는다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(500, 'WITHDRAWAL_FAILED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(mockClearAuthSession).not.toHaveBeenCalled();
    });

    it('실패 시 authStore.logout 을 호출하지 않는다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(500, 'WITHDRAWAL_FAILED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('실패 시 false 를 반환한다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(500, 'WITHDRAWAL_FAILED'));
      const { result } = renderHook(() => useWithdrawAccount());

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(returned).toBe(false);
    });

    it('WITHDRAWAL_FAILED → errorCode=WITHDRAWAL_FAILED + error 메시지 세팅', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(500, 'WITHDRAWAL_FAILED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(result.current.errorCode).toBe('WITHDRAWAL_FAILED');
      expect(result.current.error).toBeTruthy();
    });

    it('401 에러 → errorCode=UNAUTHORIZED', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(401));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(result.current.errorCode).toBe('UNAUTHORIZED');
    });

    it('비-axios 에러 → errorCode=NETWORK', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(new Error('network fail'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('isSubmitting 이 호출 중 true → 완료 후 false', async () => {
      let resolve!: () => void;
      mockWithdrawAccount.mockReturnValueOnce(
        new Promise<void>((res) => {
          resolve = res;
        }),
      );

      const { result } = renderHook(() => useWithdrawAccount());

      act(() => {
        result.current.withdraw({ deleteMyQuizzes: false });
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        resolve();
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('실패 후에도 isSubmitting 이 false 로 복원된다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(500, 'WITHDRAWAL_FAILED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('clearError()', () => {
    it('error 와 errorCode 를 null 로 초기화한다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(500, 'WITHDRAWAL_FAILED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ deleteMyQuizzes: false });
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.errorCode).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });
  });
});
