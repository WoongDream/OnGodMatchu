import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useProfileSummary from './useProfileSummary';
import type { PublicProfileSummary } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetPublicProfileSummary = vi.hoisted(() => vi.fn());

vi.mock('@/api/user', () => ({
  getPublicProfileSummary: mockGetPublicProfileSummary,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const MOCK_SUMMARY: PublicProfileSummary = {
  userId: 'u1',
  nickname: '지호',
  profileImageUrl: '',
  bio: '소개',
  isProfilePublic: true,
  solvedCount: 209,
  avgSolveRate: 71,
  quizCount: 27,
  totalPlayCount: 23104,
  totalStarCount: 1840,
};

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useProfileSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('publicId 지정', () => {
    it('fetch 완료 전에는 isLoading=true, summary=undefined', () => {
      mockGetPublicProfileSummary.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useProfileSummary('u1'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.summary).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });

    it('getPublicProfileSummary(publicId) 를 호출하고 summary 를 반환한다', async () => {
      mockGetPublicProfileSummary.mockResolvedValue(MOCK_SUMMARY);

      const { result } = renderHook(() => useProfileSummary('u1'), { wrapper });

      await waitFor(() => expect(result.current.summary).toEqual(MOCK_SUMMARY));
      expect(mockGetPublicProfileSummary).toHaveBeenCalledWith('u1');
      expect(result.current.isLoading).toBe(false);
    });

    it('API 실패 시 error 가 노출되고 summary 는 undefined 이다', async () => {
      mockGetPublicProfileSummary.mockRejectedValue(new Error('forbidden'));

      const { result } = renderHook(() => useProfileSummary('u1'), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());
      expect(result.current.summary).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('publicId 미지정 (key null → 요청 안 함)', () => {
    it('publicId 가 undefined 면 getPublicProfileSummary 를 호출하지 않는다', () => {
      const { result } = renderHook(() => useProfileSummary(undefined), { wrapper });

      expect(mockGetPublicProfileSummary).not.toHaveBeenCalled();
      expect(result.current.summary).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('publicId 가 null 이면 getPublicProfileSummary 를 호출하지 않는다', () => {
      const { result } = renderHook(() => useProfileSummary(null), { wrapper });

      expect(mockGetPublicProfileSummary).not.toHaveBeenCalled();
      expect(result.current.summary).toBeUndefined();
    });

    it('publicId 가 빈 문자열이면 getPublicProfileSummary 를 호출하지 않는다', () => {
      renderHook(() => useProfileSummary(''), { wrapper });

      expect(mockGetPublicProfileSummary).not.toHaveBeenCalled();
    });
  });

  describe('SWR 캐시 키', () => {
    it('publicId 가 다르면 각각 독립적인 SWR 키를 사용한다', async () => {
      mockGetPublicProfileSummary.mockImplementation((id: string) =>
        Promise.resolve({ ...MOCK_SUMMARY, userId: id, nickname: `유저-${id}` }),
      );

      const { result: rA } = renderHook(() => useProfileSummary('a'), { wrapper });
      const { result: rB } = renderHook(() => useProfileSummary('b'), { wrapper });

      await waitFor(() => {
        expect(rA.current.summary?.nickname).toBe('유저-a');
        expect(rB.current.summary?.nickname).toBe('유저-b');
      });

      expect(mockGetPublicProfileSummary).toHaveBeenCalledWith('a');
      expect(mockGetPublicProfileSummary).toHaveBeenCalledWith('b');
    });
  });
});
