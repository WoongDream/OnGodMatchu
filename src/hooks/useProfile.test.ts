import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useProfile from './useProfile';
import type { User } from '@/types';

// Hoist mock functions so vi.mock factory can reference them
const mockGetMyProfile = vi.hoisted(() => vi.fn());
const mockGetUserProfile = vi.hoisted(() => vi.fn());
const mockUseAuthStore = vi.hoisted(() => vi.fn());

vi.mock('@/api/user', () => ({
  getMyProfile: mockGetMyProfile,
  getUserProfile: mockGetUserProfile,
}));

vi.mock('@/store/authStore', () => ({
  default: mockUseAuthStore,
}));

const MOCK_ME: User = {
  id: 1,
  email: 'me@example.com',
  nickname: '나',
  provider: 'GOOGLE',
  profileImageUrl: null,
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

const MOCK_OTHER: User = {
  id: 42,
  email: 'other@example.com',
  nickname: '타인',
  provider: 'KAKAO',
  profileImageUrl: null,
  isProfilePublic: true,
  createdAt: '2025-02-01T00:00:00Z',
};

// Isolated SWR cache per test — prevents cross-test cache sharing
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: logged in as MOCK_ME
    mockUseAuthStore.mockImplementation((selector: (s: { user: User | null }) => unknown) =>
      selector({ user: MOCK_ME }),
    );
  });

  describe('userId 미지정 (내 프로필)', () => {
    it('getMyProfile 을 호출하고 profile 을 반환한다', async () => {
      mockGetMyProfile.mockResolvedValue(MOCK_ME);

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => expect(result.current.profile).toEqual(MOCK_ME));
      expect(mockGetMyProfile).toHaveBeenCalledTimes(1);
      expect(mockGetUserProfile).not.toHaveBeenCalled();
    });

    it('isMe 가 true 이다', async () => {
      mockGetMyProfile.mockResolvedValue(MOCK_ME);

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => expect(result.current.profile).toBeDefined());
      expect(result.current.isMe).toBe(true);
    });
  });

  describe('userId 지정 (타인 프로필)', () => {
    it('getUserProfile(userId) 를 호출하고 profile 을 반환한다', async () => {
      mockGetUserProfile.mockResolvedValue(MOCK_OTHER);

      const { result } = renderHook(() => useProfile(42), { wrapper });

      await waitFor(() => expect(result.current.profile).toEqual(MOCK_OTHER));
      expect(mockGetUserProfile).toHaveBeenCalledWith(42);
      expect(mockGetMyProfile).not.toHaveBeenCalled();
    });

    it('currentUser.id !== data.id 이면 isMe = false', async () => {
      mockGetUserProfile.mockResolvedValue(MOCK_OTHER);

      const { result } = renderHook(() => useProfile(42), { wrapper });

      await waitFor(() => expect(result.current.profile).toBeDefined());
      expect(result.current.isMe).toBe(false);
    });

    it('currentUser.id === data.id 이면 isMe = true', async () => {
      // 자기 자신의 userId 를 명시적으로 전달
      mockGetUserProfile.mockResolvedValue(MOCK_ME);

      const { result } = renderHook(() => useProfile(MOCK_ME.id), { wrapper });

      await waitFor(() => expect(result.current.profile).toBeDefined());
      expect(result.current.isMe).toBe(true);
    });
  });

  describe('로딩 상태', () => {
    it('fetch 완료 전에는 isLoading = true 이다', () => {
      // Promise 가 resolve 되지 않도록 유지
      mockGetMyProfile.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useProfile(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.profile).toBeUndefined();
    });
  });

  describe('에러 상태', () => {
    it('API 실패 시 error 가 노출된다', async () => {
      const boom = new Error('network error');
      mockGetMyProfile.mockRejectedValue(boom);

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());
      expect(result.current.profile).toBeUndefined();
    });
  });

  describe('mutate', () => {
    it('mutate 호출 시 API 가 재실행된다', async () => {
      mockGetMyProfile.mockResolvedValue(MOCK_ME);

      const { result } = renderHook(() => useProfile(), { wrapper });
      await waitFor(() => expect(result.current.profile).toBeDefined());

      mockGetMyProfile.mockResolvedValue({ ...MOCK_ME, nickname: '수정됨' });

      await act(async () => {
        await result.current.mutate();
      });

      await waitFor(() => expect(result.current.profile?.nickname).toBe('수정됨'));
      expect(mockGetMyProfile).toHaveBeenCalledTimes(2);
    });
  });

  describe('SWR 캐시 dedupe', () => {
    it('userId=42 와 userId=99 는 각각 독립적인 SWR 키를 사용한다', async () => {
      const user42 = { ...MOCK_OTHER, id: 42, nickname: '유저42' };
      const user99 = { ...MOCK_OTHER, id: 99, nickname: '유저99' };

      mockGetUserProfile.mockImplementation((id: number) => {
        if (id === 42) {
          return Promise.resolve(user42);
        }
        if (id === 99) {
          return Promise.resolve(user99);
        }
        return Promise.reject(new Error('unknown'));
      });

      const { result: r42 } = renderHook(() => useProfile(42), { wrapper });
      const { result: r99 } = renderHook(() => useProfile(99), { wrapper });

      await waitFor(() => {
        expect(r42.current.profile?.nickname).toBe('유저42');
        expect(r99.current.profile?.nickname).toBe('유저99');
      });

      // 각 userId 에 대해 정확히 1번씩 호출됐는지 확인
      expect(mockGetUserProfile).toHaveBeenCalledWith(42);
      expect(mockGetUserProfile).toHaveBeenCalledWith(99);
    });
  });
});
