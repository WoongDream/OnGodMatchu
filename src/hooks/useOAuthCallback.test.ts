import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import type { User } from '@/types';
import useOAuthCallback from '@/hooks/useOAuthCallback';

// -----------------------------------------------------------------------
// Hoisted mock variables — must be declared before vi.mock() calls
// -----------------------------------------------------------------------
const mockNavigate = vi.hoisted(() => vi.fn());
const mockGetMe = vi.hoisted(() => vi.fn());
const mockSetUser = vi.hoisted(() => vi.fn());

// -----------------------------------------------------------------------
// Module mocks
// -----------------------------------------------------------------------
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/auth', () => ({
  getMe: mockGetMe,
}));

vi.mock('@/store/authStore', () => {
  const store = { setUser: mockSetUser };
  const useAuthStore = ((selector: (s: typeof store) => unknown) => selector(store)) as ((
    selector: (s: typeof store) => unknown,
  ) => unknown) & { getState: () => typeof store };
  useAuthStore.getState = () => store;
  return { default: useAuthStore };
});

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const TEST_USER: User = {
  id: 1,
  email: 'test@example.com',
  nickname: 'testuser',
  provider: 'GOOGLE',
  isProfilePublic: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Wrap renderHook with MemoryRouter so useSearchParams / useNavigate work.
 * initialUrl controls which query string the hook sees.
 */
function renderOAuthHook(initialUrl: string) {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(MemoryRouter, { initialEntries: [initialUrl] }, children);
  return renderHook(() => useOAuthCallback(), { wrapper });
}

/**
 * Flush all pending promise microtasks.
 * Needed after mockGetMe resolves/rejects so catch/then handlers run.
 */
async function flushPromises() {
  // Two rounds to handle chained promises
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------
describe('useOAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // =====================================================================
  // Case A — missing tokens
  // =====================================================================
  describe('케이스 A: 토큰 누락', () => {
    it('accessToken 이 없으면 error 를 "인증 정보가 누락되었습니다." 로 세팅한다', async () => {
      const { result } = renderOAuthHook('/oauth2/callback?refreshToken=r');

      await act(async () => {});

      expect(result.current.error).toBe('인증 정보가 누락되었습니다.');
    });

    it('refreshToken 이 없으면 error 를 "인증 정보가 누락되었습니다." 로 세팅한다', async () => {
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a');

      await act(async () => {});

      expect(result.current.error).toBe('인증 정보가 누락되었습니다.');
    });

    it('두 토큰 모두 없으면 error 를 "인증 정보가 누락되었습니다." 로 세팅한다', async () => {
      const { result } = renderOAuthHook('/oauth2/callback');

      await act(async () => {});

      expect(result.current.error).toBe('인증 정보가 누락되었습니다.');
    });

    it('1.5초 후 /login 으로 replace navigate 한다', async () => {
      vi.useFakeTimers();
      try {
        renderOAuthHook('/oauth2/callback?refreshToken=r');

        await act(async () => {});

        // 아직 navigate 되지 않아야 함
        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      } finally {
        vi.useRealTimers();
      }
    });

    it('1.5초 이전에는 navigate 를 호출하지 않는다', async () => {
      vi.useFakeTimers();
      try {
        renderOAuthHook('/oauth2/callback');

        await act(async () => {});

        act(() => {
          vi.advanceTimersByTime(1499);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it('getMe 를 호출하지 않는다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a');

      await act(async () => {});

      expect(mockGetMe).not.toHaveBeenCalled();
    });

    it('localStorage 에 아무 것도 저장하지 않는다', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      renderOAuthHook('/oauth2/callback');

      await act(async () => {});

      expect(setItemSpy).not.toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });

  // =====================================================================
  // Case B — 정상 흐름
  // =====================================================================
  describe('케이스 B: 두 토큰 모두 존재 (정상)', () => {
    beforeEach(() => {
      mockGetMe.mockResolvedValue(TEST_USER);
    });

    it('localStorage 에 accessToken 을 저장한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=myAccess&refreshToken=myRefresh');

      await flushPromises();

      expect(localStorage.getItem('accessToken')).toBe('myAccess');
    });

    it('localStorage 에 refreshToken 을 저장한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=myAccess&refreshToken=myRefresh');

      await flushPromises();

      expect(localStorage.getItem('refreshToken')).toBe('myRefresh');
    });

    it('localStorage.setItem 을 accessToken, refreshToken 키로 각각 저장한다', async () => {
      // happy-dom 에서 Storage.prototype spy 가 hook 실행 이전을 인터셉트하지 못하는 경우가 있으므로
      // 실제 저장 결과를 통해 setItem 호출을 검증한다
      renderOAuthHook('/oauth2/callback?accessToken=myAccess&refreshToken=myRefresh');

      await flushPromises();

      // setItem('accessToken', ...) 과 setItem('refreshToken', ...) 이 호출된 결과 검증
      expect(localStorage.getItem('accessToken')).toBe('myAccess');
      expect(localStorage.getItem('refreshToken')).toBe('myRefresh');
    });

    it('getMe 를 호출한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockGetMe).toHaveBeenCalledTimes(1);
    });

    it('getMe 성공 시 setUser 를 반환된 user 로 호출한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockSetUser).toHaveBeenCalledWith(TEST_USER);
    });

    it('getMe 성공 시 / 로 replace navigate 한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('정상 흐름에서는 error state 가 null 로 유지된다', async () => {
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(result.current.error).toBeNull();
    });
  });

  // =====================================================================
  // Case C — getMe 실패
  // =====================================================================
  describe('케이스 C: getMe 실패', () => {
    beforeEach(() => {
      mockGetMe.mockRejectedValue(new Error('Network error'));
    });

    it('localStorage 에서 accessToken 을 제거한다', async () => {
      localStorage.setItem('accessToken', 'myAccess');
      localStorage.setItem('refreshToken', 'myRefresh');

      renderOAuthHook('/oauth2/callback?accessToken=myAccess&refreshToken=myRefresh');

      await flushPromises();

      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('localStorage 에서 refreshToken 을 제거한다', async () => {
      localStorage.setItem('accessToken', 'myAccess');
      localStorage.setItem('refreshToken', 'myRefresh');

      renderOAuthHook('/oauth2/callback?accessToken=myAccess&refreshToken=myRefresh');

      await flushPromises();

      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('localStorage.removeItem 을 accessToken 과 refreshToken 키로 각각 제거한다', async () => {
      // 사전에 토큰 세팅
      localStorage.setItem('accessToken', 'myAccess');
      localStorage.setItem('refreshToken', 'myRefresh');

      renderOAuthHook('/oauth2/callback?accessToken=myAccess&refreshToken=myRefresh');

      await flushPromises();

      // removeItem 결과로 실제 삭제됐는지 검증
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('error state 를 "사용자 정보를 불러오지 못했습니다." 로 세팅한다', async () => {
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(result.current.error).toBe('사용자 정보를 불러오지 못했습니다.');
    });

    it('1.5초 후 /login 으로 replace navigate 한다', async () => {
      vi.useFakeTimers();
      try {
        renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

        // getMe rejection + catch 핸들러 완료 대기
        await act(async () => {
          await Promise.resolve();
          await Promise.resolve();
        });

        // navigate 는 아직 호출되지 않아야 함
        expect(mockNavigate).not.toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      } finally {
        vi.useRealTimers();
      }
    });

    it('1.5초 이전에는 navigate 를 호출하지 않는다', async () => {
      vi.useFakeTimers();
      try {
        renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

        await act(async () => {
          await Promise.resolve();
          await Promise.resolve();
        });

        act(() => {
          vi.advanceTimersByTime(1499);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it('setUser 를 호출하지 않는다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  // =====================================================================
  // 반환값 타입
  // =====================================================================
  describe('반환값', () => {
    it('초기 error state 는 null 이다', () => {
      mockGetMe.mockResolvedValue(TEST_USER);
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      // effect 실행 전 초기 상태 확인
      expect(result.current.error).toBeNull();
    });

    it('{ error } 형태의 객체를 반환한다', () => {
      mockGetMe.mockResolvedValue(TEST_USER);
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      expect(result.current).toHaveProperty('error');
    });
  });
});
