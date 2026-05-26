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
const mockSetAuthSession = vi.hoisted(() => vi.fn());
const mockClearAuthSession = vi.hoisted(() => vi.fn());

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

vi.mock('@/lib/auth', () => ({
  setAuthSession: mockSetAuthSession,
  clearAuthSession: mockClearAuthSession,
}));

// -----------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------
const BASE_USER: User = {
  id: 1,
  email: 'test@example.com',
  nickname: 'testuser',
  provider: 'GOOGLE',
  isProfilePublic: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** needsTermsAgreement: false — 바로 홈으로 */
const USER_NO_TERMS: User = { ...BASE_USER, needsTermsAgreement: false };

/** needsTermsAgreement: true — 약관 동의 페이지로 */
const USER_NEEDS_TERMS: User = { ...BASE_USER, needsTermsAgreement: true };

/** needsTermsAgreement 필드 없음(undefined) — false 와 동일하게 홈으로 */
const USER_MISSING_TERMS: User = { ...BASE_USER };

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
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
 * Needed after setAuthSession resolves/rejects so then/catch handlers run.
 */
async function flushPromises() {
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
  // 케이스 A — 토큰 누락
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

    it('setAuthSession 을 호출하지 않는다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a');

      await act(async () => {});

      expect(mockSetAuthSession).not.toHaveBeenCalled();
    });
  });

  // =====================================================================
  // 케이스 B — 정상 흐름 (needsTermsAgreement: false)
  // =====================================================================
  describe('케이스 B: 토큰 존재 — needsTermsAgreement: false → / 로 이동', () => {
    beforeEach(() => {
      mockSetAuthSession.mockResolvedValue(USER_NO_TERMS);
    });

    it('setAuthSession 을 accessToken, refreshToken 과 함께 호출한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=myAccess&refreshToken=myRefresh');

      await flushPromises();

      expect(mockSetAuthSession).toHaveBeenCalledWith({
        accessToken: 'myAccess',
        refreshToken: 'myRefresh',
      });
    });

    it('setAuthSession 을 한 번만 호출한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockSetAuthSession).toHaveBeenCalledTimes(1);
    });

    it('/ 로 replace navigate 한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('정상 흐름에서는 error state 가 null 로 유지된다', async () => {
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(result.current.error).toBeNull();
    });

    it('clearAuthSession 을 호출하지 않는다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockClearAuthSession).not.toHaveBeenCalled();
    });
  });

  // =====================================================================
  // 케이스 C — needsTermsAgreement: true → /terms-agreement 로 이동
  // =====================================================================
  describe('케이스 C: 토큰 존재 — needsTermsAgreement: true → /terms-agreement 로 이동', () => {
    beforeEach(() => {
      mockSetAuthSession.mockResolvedValue(USER_NEEDS_TERMS);
    });

    it('/terms-agreement 로 replace navigate 한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockNavigate).toHaveBeenCalledWith('/terms-agreement', { replace: true });
    });

    it('/ 로는 navigate 하지 않는다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockNavigate).not.toHaveBeenCalledWith('/', { replace: true });
    });

    it('error state 가 null 로 유지된다', async () => {
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(result.current.error).toBeNull();
    });

    it('clearAuthSession 을 호출하지 않는다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockClearAuthSession).not.toHaveBeenCalled();
    });
  });

  // =====================================================================
  // 케이스 D — needsTermsAgreement 필드 없음(undefined) → / 로 분기
  // =====================================================================
  describe('케이스 D: needsTermsAgreement undefined/missing → / 로 이동 (false 동일)', () => {
    beforeEach(() => {
      mockSetAuthSession.mockResolvedValue(USER_MISSING_TERMS);
    });

    it('needsTermsAgreement 가 undefined 이면 / 로 replace navigate 한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('/terms-agreement 로는 navigate 하지 않는다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockNavigate).not.toHaveBeenCalledWith('/terms-agreement', { replace: true });
    });
  });

  // =====================================================================
  // 케이스 E — setAuthSession 실패
  // =====================================================================
  describe('케이스 E: setAuthSession 실패', () => {
    beforeEach(() => {
      mockSetAuthSession.mockRejectedValue(new Error('Network error'));
    });

    it('clearAuthSession 을 호출한다', async () => {
      renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      await flushPromises();

      expect(mockClearAuthSession).toHaveBeenCalledTimes(1);
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

        // setAuthSession rejection + catch 핸들러 완료 대기
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
  });

  // =====================================================================
  // 반환값 타입
  // =====================================================================
  describe('반환값', () => {
    it('초기 error state 는 null 이다', () => {
      mockSetAuthSession.mockResolvedValue(USER_NO_TERMS);
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      // effect 실행 전 초기 상태 확인
      expect(result.current.error).toBeNull();
    });

    it('{ error } 형태의 객체를 반환한다', () => {
      mockSetAuthSession.mockResolvedValue(USER_NO_TERMS);
      const { result } = renderOAuthHook('/oauth2/callback?accessToken=a&refreshToken=b');

      expect(result.current).toHaveProperty('error');
    });
  });
});
