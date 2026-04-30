import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AxiosError } from 'axios';
import useVerificationCode, {
  RESEND_COOLDOWN_SECONDS,
  VERIFICATION_CODE_TTL_SECONDS,
} from './useVerificationCode';

const mockSendVerificationCode = vi.hoisted(() => vi.fn());

vi.mock('@/api/auth', () => ({
  sendVerificationCode: mockSendVerificationCode,
}));

function makeAxiosError(status: number, data: unknown = {}): AxiosError {
  const err = new AxiosError('Request failed');
  err.response = { status, data, headers: {}, config: {} as never, statusText: '' };
  return err;
}

describe('useVerificationCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('초기 상태', () => {
    it('codeSent 는 false', () => {
      const { result } = renderHook(() => useVerificationCode());
      expect(result.current.codeSent).toBe(false);
    });

    it('secondsLeft 는 0', () => {
      const { result } = renderHook(() => useVerificationCode());
      expect(result.current.secondsLeft).toBe(0);
    });

    it('expired 는 false', () => {
      const { result } = renderHook(() => useVerificationCode());
      expect(result.current.expired).toBe(false);
    });

    it('errorCode 는 null', () => {
      const { result } = renderHook(() => useVerificationCode());
      expect(result.current.errorCode).toBeNull();
    });
  });

  describe('sendCode 성공', () => {
    beforeEach(() => {
      mockSendVerificationCode.mockResolvedValue(undefined);
    });

    it('sendVerificationCode API 를 email 로 호출한다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(mockSendVerificationCode).toHaveBeenCalledWith('a@b.com');
    });

    it('성공 시 codeSent 가 true', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.codeSent).toBe(true);
    });

    it('성공 시 secondsLeft 가 5분(300초)으로 설정된다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.secondsLeft).toBe(VERIFICATION_CODE_TTL_SECONDS);
    });

    it('성공 시 resendIn 이 60초로 설정된다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.resendIn).toBe(RESEND_COOLDOWN_SECONDS);
    });

    it('성공 시 sendCode 는 true 를 반환한다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      let returned = false;
      await act(async () => {
        returned = await result.current.sendCode('a@b.com');
      });
      expect(returned).toBe(true);
    });
  });

  describe('카운트다운', () => {
    beforeEach(() => {
      mockSendVerificationCode.mockResolvedValue(undefined);
    });

    it('1초마다 secondsLeft 가 1씩 줄어든다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.secondsLeft).toBe(VERIFICATION_CODE_TTL_SECONDS - 1);
    });

    it('1초마다 resendIn 도 1씩 줄어든다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.resendIn).toBe(RESEND_COOLDOWN_SECONDS - 1);
    });

    it('60초 후 resendIn 이 0 이고 canResend 가 true 가 된다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(result.current.resendIn).toBe(0);
      expect(result.current.canResend).toBe(true);
    });

    it('300초 경과 후 secondsLeft 가 0 이고 expired 가 true', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      act(() => {
        vi.advanceTimersByTime(VERIFICATION_CODE_TTL_SECONDS * 1000);
      });
      expect(result.current.secondsLeft).toBe(0);
      expect(result.current.expired).toBe(true);
    });

    it('카운트다운 중에는 canResend 가 false', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      act(() => {
        vi.advanceTimersByTime(30_000);
      });
      expect(result.current.canResend).toBe(false);
    });
  });

  describe('재발송', () => {
    beforeEach(() => {
      mockSendVerificationCode.mockResolvedValue(undefined);
    });

    it('재발송 후 secondsLeft 가 다시 300초로 리셋된다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.secondsLeft).toBe(VERIFICATION_CODE_TTL_SECONDS);
    });

    it('만료 후 재발송하면 expired 가 false 가 된다', async () => {
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      act(() => {
        vi.advanceTimersByTime(VERIFICATION_CODE_TTL_SECONDS * 1000);
      });
      expect(result.current.expired).toBe(true);

      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.expired).toBe(false);
    });
  });

  describe('에러 코드 매핑', () => {
    it('409 응답은 EMAIL_ALREADY_EXISTS', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(makeAxiosError(409));
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.errorCode).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('error.code === EMAIL_ALREADY_EXISTS 도 EMAIL_ALREADY_EXISTS', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(
        makeAxiosError(400, { error: { code: 'EMAIL_ALREADY_EXISTS' } }),
      );
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.errorCode).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('429 응답은 RATE_LIMITED 이고 retryAfter 를 보존한다', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(
        makeAxiosError(429, { error: { code: 'RATE_LIMITED', retryAfter: 30 } }),
      );
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.errorCode).toBe('RATE_LIMITED');
      expect(result.current.retryAfter).toBe(30);
    });

    it('RATE_LIMITED 발생 시 resendIn 이 retryAfter 로 설정되어 카운트다운한다', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(
        makeAxiosError(429, { error: { code: 'RATE_LIMITED', retryAfter: 5 } }),
      );
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.resendIn).toBe(5);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.resendIn).toBe(3);
    });

    it('400 응답은 INVALID_EMAIL_FORMAT', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(makeAxiosError(400));
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.errorCode).toBe('INVALID_EMAIL_FORMAT');
    });

    it('axios 외 에러는 NETWORK', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('실패 시 codeSent 는 false 를 유지한다', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(makeAxiosError(400));
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.codeSent).toBe(false);
    });

    it('실패 시 sendCode 는 false 를 반환한다', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(makeAxiosError(400));
      const { result } = renderHook(() => useVerificationCode());
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.sendCode('a@b.com');
      });
      expect(returned).toBe(false);
    });
  });

  describe('clearError / reset', () => {
    it('clearError 는 errorCode 와 retryAfter 를 초기화한다', async () => {
      mockSendVerificationCode.mockRejectedValueOnce(
        makeAxiosError(429, { error: { code: 'RATE_LIMITED', retryAfter: 10 } }),
      );
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.errorCode).toBe('RATE_LIMITED');

      act(() => {
        result.current.clearError();
      });
      expect(result.current.errorCode).toBeNull();
      expect(result.current.retryAfter).toBe(0);
    });

    it('reset 은 codeSent / secondsLeft / resendIn 을 초기화한다', async () => {
      mockSendVerificationCode.mockResolvedValue(undefined);
      const { result } = renderHook(() => useVerificationCode());
      await act(async () => {
        await result.current.sendCode('a@b.com');
      });
      expect(result.current.codeSent).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.codeSent).toBe(false);
      expect(result.current.secondsLeft).toBe(0);
      expect(result.current.resendIn).toBe(0);
    });
  });
});
