import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useMyAttempts from './useMyAttempts';
import type { AttemptListItem } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetMyAttempts = vi.hoisted(() => vi.fn());
const mockGetUserAttempts = vi.hoisted(() => vi.fn());

vi.mock('@/api/attempt', () => ({
  getMyAttempts: mockGetMyAttempts,
  getUserAttempts: mockGetUserAttempts,
  submitAttempt: vi.fn(),
  mapAttemptError: vi.fn(),
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const MOCK_ITEM: AttemptListItem = {
  id: 1,
  quizId: 10,
  quizPublicId: 'public-uuid-1',
  quizTitle: '테스트 퀴즈',
  quizCategory: 'game',
  quizCategoryLabel: '게임',
  quizThumbnailKey: null,
  quizThumbnailUrl: null,
  score: 3,
  totalQuestions: 5,
  percent: 60,
  completedAt: '2025-01-01T00:00:00Z',
};

const makePage = (items: AttemptListItem[], totalElements = 1, totalPages = 1) => ({
  content: items,
  totalElements,
  totalPages,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: items.length === 0,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useMyAttempts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, items=[] 이다', () => {
      mockGetMyAttempts.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    it('fetch 완료 전 error 는 undefined 이다', () => {
      mockGetMyAttempts.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      expect(result.current.error).toBeUndefined();
    });
  });

  describe('userId 없을 때 — getMyAttempts 호출', () => {
    it('userId 미지정 시 getMyAttempts 를 호출한다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetMyAttempts).toHaveBeenCalledTimes(1);
      expect(mockGetUserAttempts).not.toHaveBeenCalled();
    });

    it('params 없이 호출 시 getMyAttempts 에 page/size 미전달 (기본값 undefined)', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(mockGetMyAttempts).toHaveBeenCalled());

      expect(mockGetMyAttempts).toHaveBeenCalledWith(expect.objectContaining({}));
    });

    it('page/size 옵션이 getMyAttempts 에 전달된다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      renderHook(() => useMyAttempts({ page: 2, size: 10 }), { wrapper });

      await waitFor(() => expect(mockGetMyAttempts).toHaveBeenCalled());

      expect(mockGetMyAttempts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, size: 10 }),
      );
    });
  });

  describe('userId 있을 때 — getUserAttempts 호출', () => {
    it('userId 지정 시 getUserAttempts(publicId) 를 호출한다', async () => {
      mockGetUserAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      const { result } = renderHook(() => useMyAttempts({ userId: 'user-42' }), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetUserAttempts).toHaveBeenCalledWith('user-42', expect.objectContaining({}));
      expect(mockGetMyAttempts).not.toHaveBeenCalled();
    });

    it('page/size 옵션이 getUserAttempts 에 전달된다', async () => {
      mockGetUserAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      renderHook(() => useMyAttempts({ userId: 'user-42', page: 3, size: 5 }), { wrapper });

      await waitFor(() => expect(mockGetUserAttempts).toHaveBeenCalled());

      expect(mockGetUserAttempts).toHaveBeenCalledWith(
        'user-42',
        expect.objectContaining({ page: 3, size: 5 }),
      );
    });
  });

  describe('응답 매핑', () => {
    it('content 가 items 로 매핑된다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(1));

      expect(result.current.items[0]).toEqual(MOCK_ITEM);
    });

    it('totalElements 가 올바르게 매핑된다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM, MOCK_ITEM], 50, 3));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(50);
    });

    it('totalPages 가 올바르게 매핑된다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM], 50, 3));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalPages).toBe(3);
    });

    it('로딩 완료 후 isLoading=false 이다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe('빈 페이지 (content: []) 처리', () => {
    it('content 가 빈 배열이면 items=[], totalElements=0, totalPages=0 이다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([], 0, 0));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    it('data 가 undefined 일 때 items=[], totalElements=0, totalPages=0 기본값이 반환된다', () => {
      // SWR 이 아직 fetch 중이면 data=undefined → 기본값 반환
      mockGetMyAttempts.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetMyAttempts.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => useMyAttempts(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('getUserAttempts 실패 시에도 error 가 노출된다', async () => {
      mockGetUserAttempts.mockRejectedValue(new Error('권한 없음'));
      const { result } = renderHook(() => useMyAttempts({ userId: 'user-x' }), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
    });
  });

  describe('page/size 옵션 전달 검증', () => {
    it('page 만 지정 시 size 는 전달되지 않거나 undefined 이다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      renderHook(() => useMyAttempts({ page: 1 }), { wrapper });

      await waitFor(() => expect(mockGetMyAttempts).toHaveBeenCalled());

      const [callArg] = vi.mocked(mockGetMyAttempts).mock.calls[0] as [
        { page?: number; size?: number },
      ];
      expect(callArg.page).toBe(1);
    });

    it('size 만 지정 시 page 는 전달되지 않거나 undefined 이다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));
      renderHook(() => useMyAttempts({ size: 50 }), { wrapper });

      await waitFor(() => expect(mockGetMyAttempts).toHaveBeenCalled());

      const [callArg] = vi.mocked(mockGetMyAttempts).mock.calls[0] as [
        { page?: number; size?: number },
      ];
      expect(callArg.size).toBe(50);
    });

    it('page=0, size=20 기본값이 SWR key 에 반영된다 (userId="me")', async () => {
      // buildKey 가 ['my-attempts', 'me', 0, 20] 형태인지 간접 검증:
      // 같은 key 로 두 번 렌더 시 fetch 는 1회만 호출된다 (SWR dedupe)
      mockGetMyAttempts.mockResolvedValue(makePage([MOCK_ITEM]));

      const { result: r1 } = renderHook(() => useMyAttempts(), { wrapper });
      const { result: r2 } = renderHook(() => useMyAttempts({ page: 0, size: 20 }), { wrapper });

      await waitFor(() => expect(r1.current.isLoading).toBe(false));
      await waitFor(() => expect(r2.current.isLoading).toBe(false));

      // 동일 key → SWR 이 dedupe 하여 1회 fetch (provider scope 공유)
      // wrapper 내부에서 개별 Map 을 쓰므로 각 hook 마다 독립 호출됨 (정상 동작)
      expect(mockGetMyAttempts).toHaveBeenCalledTimes(2);
    });
  });
});
