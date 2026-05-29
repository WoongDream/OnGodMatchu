import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useLogin from '@/hooks/useLogin';

// -----------------------------------------------------------------------
// Hoisted mock variables — must be declared before vi.mock() calls
// -----------------------------------------------------------------------
const mockNavigate = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());
const mockSetAuthSession = vi.hoisted(() => vi.fn());
// location.state 를 테스트마다 바꿀 수 있도록 가변 객체로 보관
const mockLocation = vi.hoisted(() => ({ value: { state: null as unknown } }));

// -----------------------------------------------------------------------
// Module mocks
// -----------------------------------------------------------------------
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation.value,
  };
});

vi.mock('@/api/auth', () => ({
  login: mockLogin,
}));

vi.mock('@/lib/auth', () => ({
  setAuthSession: mockSetAuthSession,
}));

// -----------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------
const TOKENS = { accessToken: 'access-token', refreshToken: 'refresh-token' };

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------
describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본값: state 없음
    mockLocation.value = { state: null };
    mockLogin.mockResolvedValue(TOKENS);
    mockSetAuthSession.mockResolvedValue(undefined);
  });

  // =====================================================================
  // 케이스 A — 성공 + location.state.from 존재
  // =====================================================================
  describe('케이스 A: 로그인 성공 + location.state.from 존재', () => {
    beforeEach(() => {
      mockLocation.value = { state: { from: '/protected/page' } };
    });

    it('login 을 email, password 와 함께 호출한다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'pw1234');
    });

    it('setAuthSession 을 login 이 반환한 tokens 로 호출한다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(mockSetAuthSession).toHaveBeenCalledWith(TOKENS);
    });

    it('from 경로로 replace navigate 한다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/protected/page', { replace: true });
    });

    it('/ 로는 navigate 하지 않는다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(mockNavigate).not.toHaveBeenCalledWith('/', { replace: true });
    });

    it('error state 가 null 로 유지된다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(result.current.error).toBeNull();
    });
  });

  // =====================================================================
  // 케이스 B — 성공 + from 없음 (state null)
  // =====================================================================
  describe('케이스 B: 로그인 성공 + from 없음 (state null)', () => {
    it('/ 로 replace navigate 한다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('setAuthSession 호출 후 navigate 한다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(mockSetAuthSession).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('state 객체에 from 필드가 없어도 / 로 navigate 한다', async () => {
      mockLocation.value = { state: { foo: 'bar' } };
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('error state 가 null 로 유지된다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'pw1234');
      });

      expect(result.current.error).toBeNull();
    });
  });

  // =====================================================================
  // 케이스 C — 로그인 실패 (login reject)
  // =====================================================================
  describe('케이스 C: 로그인 실패 (login reject)', () => {
    beforeEach(() => {
      mockLogin.mockRejectedValue(new Error('401 Unauthorized'));
    });

    it('error 를 "이메일 또는 비밀번호가 올바르지 않습니다." 로 세팅한다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'wrong-pw');
      });

      expect(result.current.error).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });

    it('navigate 를 호출하지 않는다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'wrong-pw');
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('setAuthSession 을 호출하지 않는다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'wrong-pw');
      });

      expect(mockSetAuthSession).not.toHaveBeenCalled();
    });

    it('실패 후 isLoading 이 false 로 복귀한다', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleLogin('user@example.com', 'wrong-pw');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // =====================================================================
  // 케이스 D — isLoading 토글
  // =====================================================================
  describe('케이스 D: isLoading 토글', () => {
    it('초기 isLoading 은 false 이다', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.isLoading).toBe(false);
    });

    it('handleLogin 호출 중에는 true, 종료 후 false 가 된다', async () => {
      // login 을 수동으로 resolve 할 수 있도록 deferred promise 사용
      let resolveLogin!: (value: typeof TOKENS) => void;
      mockLogin.mockReturnValue(
        new Promise<typeof TOKENS>((resolve) => {
          resolveLogin = resolve;
        }),
      );

      const { result } = renderHook(() => useLogin());

      let pending: Promise<void>;
      act(() => {
        pending = result.current.handleLogin('user@example.com', 'pw1234');
      });

      // login 이 아직 resolve 되지 않은 상태 — 로딩 중
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // login resolve → 핸들러 완료 대기
      await act(async () => {
        resolveLogin(TOKENS);
        await pending;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // =====================================================================
  // 반환값
  // =====================================================================
  describe('반환값', () => {
    it('{ handleLogin, isLoading, error } 형태의 객체를 반환한다', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current).toHaveProperty('handleLogin');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(typeof result.current.handleLogin).toBe('function');
    });
  });
});
