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
    if (code === 'INVALID_VERIFICATION_CODE') {
      return 'INVALID_VERIFICATION_CODE';
    }
    if (code === 'VERIFICATION_CODE_EXPIRED') {
      return 'VERIFICATION_CODE_EXPIRED';
    }
    if (code === 'INVALID_WITHDRAWAL_CONFIRMATION') {
      return 'INVALID_WITHDRAWAL_CONFIRMATION';
    }
    if (code === 'RATE_LIMITED' || status === 429) {
      return 'RATE_LIMITED';
    }
    if (code === 'INVALID_CURRENT_PASSWORD') {
      return 'INVALID_CURRENT_PASSWORD';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    return 'NETWORK';
  },
  USER_ERROR_MESSAGES: {
    NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
    INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
    INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
    INVALID_WITHDRAWAL_CONFIRMATION: '확인 문구가 일치하지 않습니다.',
    INVALID_VERIFICATION_CODE: '인증코드가 올바르지 않습니다.',
    VERIFICATION_CODE_EXPIRED: '인증코드가 만료되었어요. 다시 받아주세요.',
    RATE_LIMITED: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',
    PROFILE_PRIVATE: '비공개 프로필입니다.',
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    INVALID_INPUT: '입력값을 다시 확인해주세요.',
    UNAUTHORIZED: '로그인이 필요합니다.',
    NETWORK: '네트워크 오류가 발생했습니다.',
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

// ── 새 payload 상수 ────────────────────────────────────────────────────────────
const BASE_PAYLOAD = {
  verificationCode: '123456',
  confirmationPhrase: '탈퇴하겠습니다.',
  deleteOwnQuizzes: false,
  reasonText: '시간이 부족해서요',
};

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
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(mockClearAuthSession).toHaveBeenCalledTimes(1);
    });

    it('성공 시 authStore.logout 을 호출한다', async () => {
      mockWithdrawAccount.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw({ ...BASE_PAYLOAD, deleteOwnQuizzes: true });
      });

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('성공 시 navigate("/login?withdrawn=1", { replace: true }) 를 호출한다', async () => {
      mockWithdrawAccount.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login?withdrawn=1', { replace: true });
    });

    it('성공 시 true 를 반환한다', async () => {
      mockWithdrawAccount.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWithdrawAccount());

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(returned).toBe(true);
    });

    it('실패 시 navigate 를 호출하지 않는다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_VERIFICATION_CODE'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('실패 시 clearAuthSession 을 호출하지 않는다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_VERIFICATION_CODE'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(mockClearAuthSession).not.toHaveBeenCalled();
    });

    it('실패 시 authStore.logout 을 호출하지 않는다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_VERIFICATION_CODE'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('실패 시 false 를 반환한다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_VERIFICATION_CODE'));
      const { result } = renderHook(() => useWithdrawAccount());

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(returned).toBe(false);
    });

    it('INVALID_VERIFICATION_CODE → errorCode=INVALID_VERIFICATION_CODE + error 메시지 세팅', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_VERIFICATION_CODE'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(result.current.errorCode).toBe('INVALID_VERIFICATION_CODE');
      expect(result.current.error).toBeTruthy();
    });

    it('VERIFICATION_CODE_EXPIRED → errorCode=VERIFICATION_CODE_EXPIRED + error 메시지 세팅', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'VERIFICATION_CODE_EXPIRED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(result.current.errorCode).toBe('VERIFICATION_CODE_EXPIRED');
      expect(result.current.error).toBeTruthy();
    });

    it('INVALID_WITHDRAWAL_CONFIRMATION → errorCode=INVALID_WITHDRAWAL_CONFIRMATION + error 메시지 세팅', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(
        makeAxiosError(400, 'INVALID_WITHDRAWAL_CONFIRMATION'),
      );
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(result.current.errorCode).toBe('INVALID_WITHDRAWAL_CONFIRMATION');
      expect(result.current.error).toBeTruthy();
    });

    it('RATE_LIMITED (429 + code) → errorCode=RATE_LIMITED + error 메시지 세팅', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(429, 'RATE_LIMITED'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(result.current.errorCode).toBe('RATE_LIMITED');
      expect(result.current.error).toBeTruthy();
    });

    it('429 status (code 없음) → errorCode=RATE_LIMITED', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(429));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(result.current.errorCode).toBe('RATE_LIMITED');
    });

    it('401 에러 → errorCode=UNAUTHORIZED', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(401));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(result.current.errorCode).toBe('UNAUTHORIZED');
    });

    it('비-axios 에러 → errorCode=NETWORK', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(new Error('network fail'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
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
        result.current.withdraw(BASE_PAYLOAD);
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        resolve();
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('실패 후에도 isSubmitting 이 false 로 복원된다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_VERIFICATION_CODE'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('clearError()', () => {
    it('error 와 errorCode 를 null 로 초기화한다', async () => {
      mockWithdrawAccount.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_VERIFICATION_CODE'));
      const { result } = renderHook(() => useWithdrawAccount());

      await act(async () => {
        await result.current.withdraw(BASE_PAYLOAD);
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
