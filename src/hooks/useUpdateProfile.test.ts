import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useUpdateProfile from './useUpdateProfile';
import type { User } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockUpdateProfile = vi.hoisted(() => vi.fn());

// ── authStore mock ────────────────────────────────────────────────────────────
const mockSetUser = vi.hoisted(() => vi.fn());

vi.mock('@/store/authStore', () => ({
  default: {
    getState: vi.fn(() => ({ setUser: mockSetUser })),
  },
}));

vi.mock('@/api/user', () => ({
  updateProfile: mockUpdateProfile,
  // mapUserError 는 실제 구현 인라인으로 제공
  mapUserError: (error: unknown) => {
    const err = error as { response?: { status?: number; data?: { error?: { code?: string } } } };
    const status = err.response?.status;
    const code = err.response?.data?.error?.code;
    if (code === 'NICKNAME_TAKEN' || code === 'NICKNAME_ALREADY_EXISTS') {
      return 'NICKNAME_TAKEN';
    }
    if (code === 'INVALID_PASSWORD') {
      return 'INVALID_PASSWORD';
    }
    if (code === 'PROFILE_PRIVATE') {
      return 'PROFILE_PRIVATE';
    }
    if (code === 'USER_NOT_FOUND' || status === 404) {
      return 'USER_NOT_FOUND';
    }
    if (code === 'INVALID_INPUT' || status === 400) {
      return 'INVALID_INPUT';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    if (status === 403) {
      return 'PROFILE_PRIVATE';
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

// ── 가짜 axios 에러 생성 헬퍼 ─────────────────────────────────────────────
const makeAxiosError = (status: number, code?: string) =>
  Object.assign(new Error('AxiosError'), {
    isAxiosError: true,
    response: {
      status,
      data: code ? { error: { code } } : {},
    },
  });

// ── 샘플 User ────────────────────────────────────────────────────────────────
const MOCK_USER: User = {
  id: 1,
  email: 'test@example.com',
  nickname: 'woong',
  provider: 'LOCAL',
  profileImageUrl: null,
  bio: '안녕',
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, { value: { provider: () => new Map() } }, children);

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useUpdateProfile', () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset();
    mockSetUser.mockReset();
  });

  describe('update()', () => {
    it('updateProfile 이 같은 payload 로 호출된다', async () => {
      mockUpdateProfile.mockResolvedValue(MOCK_USER);
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'new' });
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({ nickname: 'new' });
    });

    it('성공 시 User 를 반환한다', async () => {
      mockUpdateProfile.mockResolvedValue(MOCK_USER);
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      let returned: User | null = null;
      await act(async () => {
        returned = await result.current.update({ nickname: 'new' });
      });

      expect(returned).toEqual(MOCK_USER);
    });

    it('실패 시 null 을 반환한다', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(404));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.update({ nickname: 'bad' });
      });

      expect(returned).toBeNull();
    });

    it('404 → errorCode=USER_NOT_FOUND + error 메시지 세팅', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(404));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'bad' });
      });

      expect(result.current.errorCode).toBe('USER_NOT_FOUND');
      expect(result.current.error).toBeTruthy();
    });

    it('401 → errorCode=UNAUTHORIZED', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(401));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'bad' });
      });

      expect(result.current.errorCode).toBe('UNAUTHORIZED');
    });

    it('code=NICKNAME_TAKEN → errorCode=NICKNAME_TAKEN', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(409, 'NICKNAME_TAKEN'));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'taken' });
      });

      expect(result.current.errorCode).toBe('NICKNAME_TAKEN');
    });

    it('비-axios 에러(isAxiosError 없음) → errorCode=NETWORK', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('network fail'));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'bad' });
      });

      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('update 성공 후 setUser 가 갱신된 user 로 호출된다', async () => {
      const updated = { ...MOCK_USER, nickname: 'new' };
      mockUpdateProfile.mockResolvedValue(updated);
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'new' });
      });

      expect(mockSetUser).toHaveBeenCalledTimes(1);
      expect(mockSetUser).toHaveBeenCalledWith(updated);
    });

    it('update 실패 시 setUser 가 호출되지 않는다', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(401));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'bad' });
      });

      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('isSaving 이 호출 중 true → 완료 후 false', async () => {
      let resolveUpdate!: (v: User) => void;
      mockUpdateProfile.mockReturnValue(
        new Promise<User>((res) => {
          resolveUpdate = res;
        }),
      );

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      act(() => {
        result.current.update({ nickname: 'async' });
      });

      await waitFor(() => expect(result.current.isSaving).toBe(true));
      // isToggling 은 영향 없음
      expect(result.current.isToggling).toBe(false);

      await act(async () => {
        resolveUpdate(MOCK_USER);
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('toggleVisibility()', () => {
    it('toggleVisibility(true) → updateProfile({ isProfilePublic: true }) 호출', async () => {
      mockUpdateProfile.mockResolvedValue({ ...MOCK_USER, isProfilePublic: true });
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.toggleVisibility(true);
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({ isProfilePublic: true });
    });

    it('toggleVisibility(false) → updateProfile({ isProfilePublic: false }) 호출', async () => {
      mockUpdateProfile.mockResolvedValue({ ...MOCK_USER, isProfilePublic: false });
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.toggleVisibility(false);
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({ isProfilePublic: false });
    });

    it('성공 시 User 반환', async () => {
      const updated = { ...MOCK_USER, isProfilePublic: false };
      mockUpdateProfile.mockResolvedValue(updated);
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      let returned: User | null = null;
      await act(async () => {
        returned = await result.current.toggleVisibility(false);
      });

      expect(returned).toEqual(updated);
    });

    it('실패 시 null 반환 + errorCode 세팅', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(401));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.toggleVisibility(true);
      });

      expect(returned).toBeNull();
      expect(result.current.errorCode).toBe('UNAUTHORIZED');
    });

    it('toggleVisibility 성공 후 setUser 가 갱신된 user 로 호출된다', async () => {
      const updated = { ...MOCK_USER, isProfilePublic: false };
      mockUpdateProfile.mockResolvedValue(updated);
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.toggleVisibility(false);
      });

      expect(mockSetUser).toHaveBeenCalledTimes(1);
      expect(mockSetUser).toHaveBeenCalledWith(updated);
    });

    it('toggleVisibility 실패 시 setUser 가 호출되지 않는다', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(401));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.toggleVisibility(true);
      });

      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('isToggling 이 호출 중 true → 완료 후 false, isSaving 은 영향 없음', async () => {
      let resolveToggle!: (v: User) => void;
      mockUpdateProfile.mockReturnValue(
        new Promise<User>((res) => {
          resolveToggle = res;
        }),
      );

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      act(() => {
        result.current.toggleVisibility(true);
      });

      await waitFor(() => expect(result.current.isToggling).toBe(true));
      // isSaving 은 영향 없음
      expect(result.current.isSaving).toBe(false);

      await act(async () => {
        resolveToggle(MOCK_USER);
      });

      expect(result.current.isToggling).toBe(false);
    });
  });

  describe('clearError()', () => {
    it('error 와 errorCode 를 null 로 초기화한다', async () => {
      mockUpdateProfile.mockRejectedValue(makeAxiosError(404));
      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      await act(async () => {
        await result.current.update({ nickname: 'bad' });
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
