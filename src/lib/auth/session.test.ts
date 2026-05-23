import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@/types';
import { setAuthSession, clearAuthSession } from './session';

const mockGetMe = vi.hoisted(() => vi.fn());
const mockSetUser = vi.hoisted(() => vi.fn());

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

const TEST_USER: User = {
  id: 1,
  email: 'a@b.com',
  nickname: 'nick',
  provider: 'LOCAL',
  isProfilePublic: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('setAuthSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetMe.mockResolvedValue(TEST_USER);
  });

  it('localStorage 에 accessToken 을 저장한다', async () => {
    await setAuthSession({ accessToken: 'a', refreshToken: 'r' });
    expect(localStorage.getItem('accessToken')).toBe('a');
  });

  it('localStorage 에 refreshToken 을 저장한다', async () => {
    await setAuthSession({ accessToken: 'a', refreshToken: 'r' });
    expect(localStorage.getItem('refreshToken')).toBe('r');
  });

  it('getMe 를 한 번 호출한다', async () => {
    await setAuthSession({ accessToken: 'a', refreshToken: 'r' });
    expect(mockGetMe).toHaveBeenCalledTimes(1);
  });

  it('store.setUser 를 getMe 응답으로 호출한다', async () => {
    await setAuthSession({ accessToken: 'a', refreshToken: 'r' });
    expect(mockSetUser).toHaveBeenCalledWith(TEST_USER);
  });

  it('getMe 실패 시 예외를 그대로 전파한다', async () => {
    mockGetMe.mockRejectedValueOnce(new Error('boom'));
    await expect(setAuthSession({ accessToken: 'a', refreshToken: 'r' })).rejects.toThrow('boom');
  });
});

describe('clearAuthSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('accessToken 을 제거한다', () => {
    localStorage.setItem('accessToken', 'a');
    clearAuthSession();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('refreshToken 을 제거한다', () => {
    localStorage.setItem('refreshToken', 'r');
    clearAuthSession();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
