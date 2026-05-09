import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useChangePassword from './useChangePassword';

// ── API mock ──────────────────────────────────────────────────────────────────
const mockChangePassword = vi.hoisted(() => vi.fn());

vi.mock('@/api/user', () => ({
  changePassword: mockChangePassword,
  mapUserError: (error: unknown) => {
    const err = error as { response?: { status?: number; data?: { error?: { code?: string } } } };
    const code = err.response?.data?.error?.code;
    const status = err.response?.status;
    if (code === 'INVALID_CURRENT_PASSWORD') {
      return 'INVALID_CURRENT_PASSWORD';
    }
    if (code === 'OAUTH_USER_CANNOT_CHANGE_PASSWORD') {
      return 'OAUTH_USER_CANNOT_CHANGE_PASSWORD';
    }
    if (code === 'WITHDRAWAL_FAILED') {
      return 'WITHDRAWAL_FAILED';
    }
    if (code === 'INVALID_PASSWORD') {
      return 'INVALID_PASSWORD';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    return 'NETWORK';
  },
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
describe('useChangePassword', () => {
  beforeEach(() => {
    mockChangePassword.mockReset();
  });

  describe('change()', () => {
    it('성공 시 true 를 반환한다', async () => {
      mockChangePassword.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useChangePassword());

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.change({
          currentPassword: 'oldPw!',
          newPassword: 'newPw!',
        });
      });

      expect(returned).toBe(true);
    });

    it('성공 시 error, errorCode 가 null 을 유지한다', async () => {
      mockChangePassword.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useChangePassword());

      await act(async () => {
        await result.current.change({ currentPassword: 'oldPw!', newPassword: 'newPw!' });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });

    it('INVALID_CURRENT_PASSWORD 에러 시 false 반환 + errorCode 세팅', async () => {
      mockChangePassword.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_CURRENT_PASSWORD'));
      const { result } = renderHook(() => useChangePassword());

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.change({ currentPassword: 'wrong!', newPassword: 'new!' });
      });

      expect(returned).toBe(false);
      expect(result.current.errorCode).toBe('INVALID_CURRENT_PASSWORD');
      expect(result.current.error).toBeTruthy();
    });

    it('OAUTH_USER_CANNOT_CHANGE_PASSWORD 에러 시 false 반환 + errorCode 세팅', async () => {
      mockChangePassword.mockRejectedValueOnce(
        makeAxiosError(403, 'OAUTH_USER_CANNOT_CHANGE_PASSWORD'),
      );
      const { result } = renderHook(() => useChangePassword());

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.change({
          currentPassword: 'any',
          newPassword: 'newPw!',
        });
      });

      expect(returned).toBe(false);
      expect(result.current.errorCode).toBe('OAUTH_USER_CANNOT_CHANGE_PASSWORD');
      expect(result.current.error).toBeTruthy();
    });

    it('비-axios 에러 → errorCode=NETWORK', async () => {
      mockChangePassword.mockRejectedValueOnce(new Error('network fail'));
      const { result } = renderHook(() => useChangePassword());

      await act(async () => {
        await result.current.change({ currentPassword: 'a', newPassword: 'b' });
      });

      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('isSubmitting 이 호출 중 true → 완료 후 false', async () => {
      let resolve!: () => void;
      mockChangePassword.mockReturnValueOnce(
        new Promise<void>((res) => {
          resolve = res;
        }),
      );

      const { result } = renderHook(() => useChangePassword());

      act(() => {
        result.current.change({ currentPassword: 'a', newPassword: 'b' });
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        resolve();
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('실패 후에도 isSubmitting 이 false 로 복원된다', async () => {
      mockChangePassword.mockRejectedValueOnce(makeAxiosError(401));
      const { result } = renderHook(() => useChangePassword());

      await act(async () => {
        await result.current.change({ currentPassword: 'a', newPassword: 'b' });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('clearError()', () => {
    it('error 와 errorCode 를 null 로 초기화한다', async () => {
      mockChangePassword.mockRejectedValueOnce(makeAxiosError(400, 'INVALID_CURRENT_PASSWORD'));
      const { result } = renderHook(() => useChangePassword());

      await act(async () => {
        await result.current.change({ currentPassword: 'wrong!', newPassword: 'new!' });
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
