import { beforeEach, describe, it, expect, vi } from 'vitest';
import useAuthStore from './authStore';
import type { User } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state and localStorage before each test
    useAuthStore.setState({ user: null, isLoggedIn: false, status: 'ready' });
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('initializes with null user and isLoggedIn false', () => {
      const store = useAuthStore.getState();
      expect(store.user).toBeNull();
      expect(store.isLoggedIn).toBe(false);
    });
  });

  describe('setUser action', () => {
    it('sets user and sets isLoggedIn to true', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);

      const store = useAuthStore.getState();
      expect(store.user).toEqual(testUser);
      expect(store.isLoggedIn).toBe(true);
    });

    it('status 를 bootstrapping 에서 ready 로 전환한다', () => {
      // 복원 진행 중 상태를 시뮬레이션
      useAuthStore.setState({ status: 'bootstrapping' });

      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);

      expect(useAuthStore.getState().status).toBe('ready');
    });

    it('overwrites existing user when called multiple times', () => {
      const user1: User = {
        id: 1,
        email: 'user1@example.com',
        nickname: 'user1',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      const user2: User = {
        id: 2,
        email: 'user2@example.com',
        nickname: 'user2',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(user1);
      expect(useAuthStore.getState().user).toEqual(user1);

      useAuthStore.getState().setUser(user2);
      expect(useAuthStore.getState().user).toEqual(user2);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
    });

    it('maintains all user properties when setting user', () => {
      const testUser: User = {
        id: 42,
        email: 'complex@example.com',
        nickname: 'complexuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);

      const { user } = useAuthStore.getState();
      expect(user?.id).toBe(42);
      expect(user?.email).toBe('complex@example.com');
      expect(user?.nickname).toBe('complexuser');
      expect(user?.provider).toBe('LOCAL');
    });

    it('triggers store subscribers on setUser', () => {
      const subscriber = vi.fn();
      useAuthStore.subscribe(subscriber);

      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);

      expect(subscriber).toHaveBeenCalled();
    });
  });

  describe('logout action', () => {
    it('clears user and sets isLoggedIn to false', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);

      useAuthStore.getState().logout();

      const store = useAuthStore.getState();
      expect(store.user).toBeNull();
      expect(store.isLoggedIn).toBe(false);
    });

    it('removes accessToken from localStorage', () => {
      localStorage.setItem('accessToken', 'test-token');
      expect(localStorage.getItem('accessToken')).toBe('test-token');

      useAuthStore.getState().logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('removes refreshToken from localStorage', () => {
      localStorage.setItem('refreshToken', 'test-refresh');
      expect(localStorage.getItem('refreshToken')).toBe('test-refresh');

      useAuthStore.getState().logout();

      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('status 를 ready 로 전환한다', () => {
      useAuthStore.setState({ status: 'bootstrapping' });

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().status).toBe('ready');
    });

    it('clears localStorage even when no user is set', () => {
      localStorage.setItem('accessToken', 'test-token');
      useAuthStore.getState().logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('is safe to call multiple times', () => {
      localStorage.setItem('accessToken', 'test-token');

      useAuthStore.getState().logout();
      expect(localStorage.getItem('accessToken')).toBeNull();

      useAuthStore.getState().logout();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('triggers store subscribers on logout', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);

      const subscriber = vi.fn();
      useAuthStore.subscribe(subscriber);

      useAuthStore.getState().logout();

      expect(subscriber).toHaveBeenCalled();
    });
  });

  describe('isLoggedIn derived state', () => {
    it('is false when user is null', () => {
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
    });

    it('is true when user is set', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
    });

    it('reflects state changes immediately after setUser', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      useAuthStore.getState().setUser(testUser);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
    });

    it('reflects state changes immediately after logout', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);

      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
    });
  });

  describe('localStorage interactions', () => {
    it('does not set localStorage when setUser is called', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);

      // setUser should not directly interact with localStorage
      // (token management is external concern)
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('only removes accessToken, not other localStorage items on logout', () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('otherData', 'should-remain');

      useAuthStore.getState().logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('otherData')).toBe('should-remain');
    });
  });

  describe('store subscription', () => {
    it('allows multiple subscribers', () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      useAuthStore.subscribe(subscriber1);
      useAuthStore.subscribe(subscriber2);

      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);

      expect(subscriber1).toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalled();
    });

    it('can unsubscribe from state changes', () => {
      const subscriber = vi.fn();
      const unsubscribe = useAuthStore.subscribe(subscriber);

      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();

      useAuthStore.getState().logout();
      expect(subscriber).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe('edge cases', () => {
    it('handles rapid consecutive setUser calls', () => {
      const users: User[] = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        email: `user${i}@example.com`,
        nickname: `user${i}`,
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      }));

      users.forEach((user) => useAuthStore.getState().setUser(user));

      expect(useAuthStore.getState().user).toEqual(users[4]);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
    });

    it('handles rapid consecutive logout calls', () => {
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        nickname: 'testuser',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(testUser);
      useAuthStore.getState().logout();
      useAuthStore.getState().logout();
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
    });

    it('maintains consistency after alternating setUser and logout', () => {
      const user1: User = {
        id: 1,
        email: 'user1@example.com',
        nickname: 'user1',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      const user2: User = {
        id: 2,
        email: 'user2@example.com',
        nickname: 'user2',
        provider: 'LOCAL',
        isProfilePublic: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useAuthStore.getState().setUser(user1);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);

      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);

      useAuthStore.getState().setUser(user2);
      expect(useAuthStore.getState().user?.id).toBe(2);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);

      useAuthStore.getState().logout();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
    });
  });

  describe('status / finishBootstrap action', () => {
    it('finishBootstrap 은 status 를 ready 로 전환한다', () => {
      useAuthStore.setState({ status: 'bootstrapping' });
      expect(useAuthStore.getState().status).toBe('bootstrapping');

      useAuthStore.getState().finishBootstrap();

      expect(useAuthStore.getState().status).toBe('ready');
    });

    it('finishBootstrap 은 user/isLoggedIn 을 변경하지 않는다', () => {
      useAuthStore.setState({ status: 'bootstrapping' });

      useAuthStore.getState().finishBootstrap();

      const store = useAuthStore.getState();
      expect(store.user).toBeNull();
      expect(store.isLoggedIn).toBe(false);
    });

    it('이미 ready 인 상태에서 finishBootstrap 을 호출해도 ready 로 유지된다', () => {
      expect(useAuthStore.getState().status).toBe('ready');

      useAuthStore.getState().finishBootstrap();

      expect(useAuthStore.getState().status).toBe('ready');
    });

    it('finishBootstrap 은 구독자에게 알린다', () => {
      useAuthStore.setState({ status: 'bootstrapping' });

      const subscriber = vi.fn();
      useAuthStore.subscribe(subscriber);

      useAuthStore.getState().finishBootstrap();

      expect(subscriber).toHaveBeenCalled();
    });
  });

  // hasStoredToken 분기는 모듈 초기화 시점에 평가되므로, 모듈을 격리(resetModules)해
  // 토큰 유무에 따른 초기 status 분기를 검증한다.
  describe('초기 status 분기 (hasStoredToken)', () => {
    beforeEach(() => {
      vi.resetModules();
      localStorage.clear();
    });

    it('accessToken 이 있으면 초기 status 가 bootstrapping 이다', async () => {
      localStorage.setItem('accessToken', 'stored-token');

      const freshStore = (await import('./authStore')).default;

      expect(freshStore.getState().status).toBe('bootstrapping');
    });

    it('accessToken 이 없으면 초기 status 가 ready 이다', async () => {
      const freshStore = (await import('./authStore')).default;

      expect(freshStore.getState().status).toBe('ready');
    });
  });
});
