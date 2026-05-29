import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { User } from '@/types';
import { getMe } from '@/api/auth';
import useAuthStore from '@/store/authStore';
import useBootstrapAuth from './useBootstrapAuth';

// -----------------------------------------------------------------------
// Module mocks — getMe 는 @/api/auth 에서 import
// -----------------------------------------------------------------------
vi.mock('@/api/auth', () => ({
  getMe: vi.fn(),
}));

const mockedGetMe = vi.mocked(getMe);

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

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------
describe('useBootstrapAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // 실제 store 를 깨끗한 상태로 리셋
    useAuthStore.setState({ user: null, isLoggedIn: false, status: 'ready' });
  });

  describe('토큰 없음', () => {
    it('accessToken 이 없으면 getMe 를 호출하지 않는다', async () => {
      renderHook(() => useBootstrapAuth());

      // effect 가 실행될 시간을 준 뒤에도 호출되지 않아야 한다
      await Promise.resolve();
      expect(mockedGetMe).not.toHaveBeenCalled();
    });

    it('토큰이 없으면 user/isLoggedIn 이 변하지 않는다', async () => {
      renderHook(() => useBootstrapAuth());

      await Promise.resolve();
      const store = useAuthStore.getState();
      expect(store.user).toBeNull();
      expect(store.isLoggedIn).toBe(false);
    });
  });

  describe('토큰 있음 + getMe 성공', () => {
    beforeEach(() => {
      localStorage.setItem('accessToken', 'valid-token');
      mockedGetMe.mockResolvedValue(BASE_USER);
    });

    it('getMe 를 호출한다', async () => {
      renderHook(() => useBootstrapAuth());

      await waitFor(() => {
        expect(mockedGetMe).toHaveBeenCalledTimes(1);
      });
    });

    it('성공 시 store 에 user 를 세팅한다 (setUser → isLoggedIn true)', async () => {
      renderHook(() => useBootstrapAuth());

      await waitFor(() => {
        expect(useAuthStore.getState().user).toEqual(BASE_USER);
      });
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
    });

    it('성공 시 status 가 ready 가 된다', async () => {
      useAuthStore.setState({ status: 'bootstrapping' });
      renderHook(() => useBootstrapAuth());

      await waitFor(() => {
        expect(useAuthStore.getState().status).toBe('ready');
      });
    });
  });

  describe('토큰 있음 + getMe 실패(reject)', () => {
    beforeEach(() => {
      localStorage.setItem('accessToken', 'valid-token');
      mockedGetMe.mockRejectedValue(new Error('401'));
    });

    it('getMe 를 호출한다', async () => {
      renderHook(() => useBootstrapAuth());

      await waitFor(() => {
        expect(mockedGetMe).toHaveBeenCalledTimes(1);
      });
    });

    it('실패 시 user 를 세팅하지 않는다 (미로그인 유지)', async () => {
      renderHook(() => useBootstrapAuth());

      // status 가 ready 로 settle 될 때까지 대기 후 user 검증
      await waitFor(() => {
        expect(useAuthStore.getState().status).toBe('ready');
      });
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
    });

    it('실패 시 finishBootstrap 으로 status 를 ready 로 전환한다', async () => {
      useAuthStore.setState({ status: 'bootstrapping' });
      renderHook(() => useBootstrapAuth());

      await waitFor(() => {
        expect(useAuthStore.getState().status).toBe('ready');
      });
    });
  });

  describe('이미 user 가 있는 경우', () => {
    beforeEach(() => {
      localStorage.setItem('accessToken', 'valid-token');
      useAuthStore.setState({ user: BASE_USER, isLoggedIn: true, status: 'ready' });
    });

    it('getMe 를 호출하지 않는다', async () => {
      renderHook(() => useBootstrapAuth());

      await Promise.resolve();
      expect(mockedGetMe).not.toHaveBeenCalled();
    });
  });
});
