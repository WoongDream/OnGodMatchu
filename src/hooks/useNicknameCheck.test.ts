import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useNicknameCheck, { NICKNAME_DEBOUNCE_MS } from './useNicknameCheck';

const mockCheck = vi.hoisted(() => vi.fn());

vi.mock('@/api/auth', () => ({
  checkNicknameAvailability: mockCheck,
}));

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useNicknameCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockCheck.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('정책 사전검증 (네트워크 호출 없음)', () => {
    it('빈 문자열은 idle 이고 fetch 가 일어나지 않는다', async () => {
      const { result } = renderHook(() => useNicknameCheck(''), { wrapper });
      expect(result.current.status).toBe('idle');
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('공백만 있으면 idle (정규화로 빈 문자열이 됨)', () => {
      const { result } = renderHook(() => useNicknameCheck('   '), { wrapper });
      expect(result.current.status).toBe('idle');
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('1자는 invalid (길이 미달)', () => {
      const { result } = renderHook(() => useNicknameCheck('a'), { wrapper });
      expect(result.current.status).toBe('invalid');
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('21자는 invalid (길이 초과)', () => {
      const { result } = renderHook(() => useNicknameCheck('a'.repeat(21)), { wrapper });
      expect(result.current.status).toBe('invalid');
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('금지 문자(예: 하이픈)가 있으면 invalid', () => {
      const { result } = renderHook(() => useNicknameCheck('hong-gil'), { wrapper });
      expect(result.current.status).toBe('invalid');
      expect(mockCheck).not.toHaveBeenCalled();
    });
  });

  describe('디바운스 + SWR', () => {
    it('정책 통과 직후·디바운스 미완료 동안에는 checking', () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });
      expect(result.current.status).toBe('checking');
    });

    it('디바운스 완료 + available true → available', async () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('available'));
      expect(mockCheck).toHaveBeenCalledWith('hong');
    });

    it('디바운스 완료 + reason "taken" → taken', async () => {
      mockCheck.mockResolvedValue({ available: false, reason: 'taken' });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('taken'));
    });

    it('디바운스 완료 + reason "format" → invalid (BE 정책 위반 응답)', async () => {
      mockCheck.mockResolvedValue({ available: false, reason: 'format' });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('invalid'));
    });

    it('디바운스 완료 + reason "forbidden" + matched → forbidden (matched 포함 안내)', async () => {
      mockCheck.mockResolvedValue({ available: false, reason: 'forbidden', matched: '병신' });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('forbidden'));
      expect(result.current.message).toContain('사용할 수 없는 닉네임입니다.');
      expect(result.current.message).toContain('병신');
    });

    it('디바운스 완료 + reason "forbidden" + matched null → forbidden (기본 안내)', async () => {
      mockCheck.mockResolvedValue({ available: false, reason: 'forbidden', matched: null });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('forbidden'));
      expect(result.current.message).toBe('사용할 수 없는 닉네임입니다.');
    });

    it('네트워크 에러 시 error', async () => {
      mockCheck.mockRejectedValue(new Error('boom'));
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('error'));
    });
  });

  describe('enabled 옵션', () => {
    it('enabled=false 면 정책 통과한 닉네임이라도 idle 이고 fetch 가 일어나지 않는다', async () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('hong', { enabled: false }), {
        wrapper,
      });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.message).toBeUndefined();
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('enabled 미지정 시 기본은 true 로 동작한다', async () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('available'));
    });
  });

  describe('message 매핑', () => {
    it('available 상태일 때 message 는 "사용 가능한 닉네임입니다."', async () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('hong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('available'));
      expect(result.current.message).toBe('사용 가능한 닉네임입니다.');
    });

    it('idle 상태에서는 message 가 undefined', () => {
      const { result } = renderHook(() => useNicknameCheck(''), { wrapper });
      expect(result.current.message).toBeUndefined();
    });

    it('invalid 상태에서는 정책 안내 메시지 (2~10자, 한글·영문·숫자·_)', () => {
      const { result } = renderHook(() => useNicknameCheck('a'), { wrapper });
      expect(result.current.message).toContain('2~10자');
      expect(result.current.message).toContain('한글');
    });
  });

  describe('exclude 옵션', () => {
    it('exclude 와 동일한 닉네임 입력 시 fetch skip + status=idle + message=undefined', async () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('woong', { exclude: 'woong' }), {
        wrapper,
      });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.message).toBeUndefined();
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('exclude 와 다른 닉네임 입력 시 정상 검증 (fetch 호출, status=available)', async () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('woong2', { exclude: 'woong' }), {
        wrapper,
      });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('available'));
      expect(mockCheck).toHaveBeenCalledWith('woong2');
    });

    it('exclude 미지정 시 동일 닉네임이라도 정상 검증 진행 (fetch 호출됨)', async () => {
      mockCheck.mockResolvedValue({ available: true });
      const { result } = renderHook(() => useNicknameCheck('woong'), { wrapper });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      await waitFor(() => expect(result.current.status).toBe('available'));
      expect(mockCheck).toHaveBeenCalledWith('woong');
    });

    it('normalize 적용 — exclude 에 앞뒤 공백이 있어도 trim+NFC 후 일치하면 idle', async () => {
      mockCheck.mockResolvedValue({ available: true });
      // exclude=' woong  ' 는 normalize 후 'woong', input='woong' 도 normalize 후 'woong' → 일치
      const { result } = renderHook(() => useNicknameCheck('woong', { exclude: ' woong  ' }), {
        wrapper,
      });

      await act(async () => {
        vi.advanceTimersByTime(NICKNAME_DEBOUNCE_MS);
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.message).toBeUndefined();
      expect(mockCheck).not.toHaveBeenCalled();
    });
  });
});
