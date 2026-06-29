import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AxiosError } from 'axios';
import useWithdrawalCode, {
  WITHDRAWAL_CODE_TTL_SECONDS,
  WITHDRAWAL_CODE_RESEND_COOLDOWN_SECONDS,
} from './useWithdrawalCode';

const mockRequestWithdrawalCode = vi.hoisted(() => vi.fn());
const mockVerifyWithdrawalCode = vi.hoisted(() => vi.fn());
const mockMapUserError = vi.hoisted(() => vi.fn());
const mockGetRetryAfter = vi.hoisted(() => vi.fn());

vi.mock('@/api/user', () => ({
  requestWithdrawalCode: mockRequestWithdrawalCode,
  verifyWithdrawalCode: mockVerifyWithdrawalCode,
  mapUserError: mockMapUserError,
  getRetryAfter: mockGetRetryAfter,
}));

function makeAxiosError(status: number, data: unknown = {}): AxiosError {
  const err = new AxiosError('Request failed');
  err.response = { status, data, headers: {}, config: {} as never, statusText: '' };
  return err;
}

describe('useWithdrawalCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('초기 상태', () => {
    it('codeSent 는 false', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.codeSent).toBe(false);
    });

    it('isSending 는 false', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.isSending).toBe(false);
    });

    it('secondsLeft 는 0', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.secondsLeft).toBe(0);
    });

    it('resendIn 는 0', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.resendIn).toBe(0);
    });

    it('expired 는 false', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.expired).toBe(false);
    });

    it('canResend 는 false', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.canResend).toBe(false);
    });

    it('errorCode 는 null', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.errorCode).toBeNull();
    });

    it('retryAfter 는 0', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.retryAfter).toBe(0);
    });
  });

  describe('sendCode 성공', () => {
    beforeEach(() => {
      mockRequestWithdrawalCode.mockResolvedValue(undefined);
    });

    it('requestWithdrawalCode API 를 호출한다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(mockRequestWithdrawalCode).toHaveBeenCalledTimes(1);
    });

    it('성공 시 codeSent 가 true', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.codeSent).toBe(true);
    });

    it('성공 시 secondsLeft 가 300초로 설정된다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.secondsLeft).toBe(WITHDRAWAL_CODE_TTL_SECONDS);
    });

    it('성공 시 resendIn 이 60초로 설정된다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.resendIn).toBe(WITHDRAWAL_CODE_RESEND_COOLDOWN_SECONDS);
    });

    it('성공 시 sendCode 는 true 를 반환한다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      let returned = false;
      await act(async () => {
        returned = await result.current.sendCode();
      });
      expect(returned).toBe(true);
    });

    it('성공 시 isSending 은 완료 후 false', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.isSending).toBe(false);
    });

    it('성공 시 errorCode 는 null 로 유지된다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.errorCode).toBeNull();
    });
  });

  describe('카운트다운', () => {
    beforeEach(() => {
      mockRequestWithdrawalCode.mockResolvedValue(undefined);
    });

    it('1초마다 secondsLeft 가 1씩 줄어든다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.secondsLeft).toBe(WITHDRAWAL_CODE_TTL_SECONDS - 1);
    });

    it('1초마다 resendIn 도 1씩 줄어든다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.resendIn).toBe(WITHDRAWAL_CODE_RESEND_COOLDOWN_SECONDS - 1);
    });

    it('60초 후 resendIn 이 0 이고 canResend 가 true 가 된다', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(result.current.resendIn).toBe(0);
      expect(result.current.canResend).toBe(true);
    });

    it('300초 경과 후 secondsLeft 가 0 이고 expired 가 true', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      act(() => {
        vi.advanceTimersByTime(WITHDRAWAL_CODE_TTL_SECONDS * 1000);
      });
      expect(result.current.secondsLeft).toBe(0);
      expect(result.current.expired).toBe(true);
    });

    it('카운트다운 중에는 canResend 가 false', async () => {
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      act(() => {
        vi.advanceTimersByTime(30_000);
      });
      expect(result.current.canResend).toBe(false);
    });
  });

  describe('에러 — RATE_LIMITED (429)', () => {
    it('RATE_LIMITED + retryAfter=120 이면 errorCode=RATE_LIMITED, retryAfter=120, resendIn=120', async () => {
      const axiosErr = makeAxiosError(429, { error: { code: 'RATE_LIMITED', retryAfter: 120 } });
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(120);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });

      expect(result.current.errorCode).toBe('RATE_LIMITED');
      expect(result.current.retryAfter).toBe(120);
      expect(result.current.resendIn).toBe(120);
    });

    it('RATE_LIMITED 발생 시 sendCode 는 false 를 반환한다', async () => {
      const axiosErr = makeAxiosError(429);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(60);

      const { result } = renderHook(() => useWithdrawalCode());
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.sendCode();
      });
      expect(returned).toBe(false);
    });

    it('RATE_LIMITED + retryAfter=120 이면 타이머가 시작되어 resendIn 이 감소한다', async () => {
      const axiosErr = makeAxiosError(429);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(120);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.resendIn).toBe(118);
    });

    it('RATE_LIMITED 이지만 retryAfter=0 이면 resendIn 은 변경되지 않는다', async () => {
      const axiosErr = makeAxiosError(429);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(0);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      // resendIn 은 초기 0 에서 변하지 않아야 한다
      expect(result.current.resendIn).toBe(0);
    });

    it('RATE_LIMITED 이면 codeSent 는 false 를 유지한다', async () => {
      const axiosErr = makeAxiosError(429);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(30);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.codeSent).toBe(false);
    });
  });

  describe('에러 — UNAUTHORIZED (401)', () => {
    it('401 응답은 errorCode=UNAUTHORIZED, retryAfter=0', async () => {
      const axiosErr = makeAxiosError(401);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('UNAUTHORIZED');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.errorCode).toBe('UNAUTHORIZED');
      expect(result.current.retryAfter).toBe(0);
    });

    it('UNAUTHORIZED 이면 sendCode 는 false 를 반환한다', async () => {
      const axiosErr = makeAxiosError(401);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('UNAUTHORIZED');

      const { result } = renderHook(() => useWithdrawalCode());
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.sendCode();
      });
      expect(returned).toBe(false);
    });

    it('UNAUTHORIZED 이면 codeSent 는 false 를 유지한다', async () => {
      const axiosErr = makeAxiosError(401);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('UNAUTHORIZED');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.codeSent).toBe(false);
    });
  });

  describe('에러 — 비-axios / NETWORK', () => {
    it('axios 외 에러는 errorCode=NETWORK', async () => {
      mockRequestWithdrawalCode.mockRejectedValueOnce(new Error('네트워크 단절'));

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('NETWORK 에러이면 sendCode 는 false 를 반환한다', async () => {
      mockRequestWithdrawalCode.mockRejectedValueOnce(new Error('boom'));

      const { result } = renderHook(() => useWithdrawalCode());
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.sendCode();
      });
      expect(returned).toBe(false);
    });

    it('axios 에러인데 mapUserError 가 NETWORK 를 반환하면 errorCode=NETWORK', async () => {
      const axiosErr = makeAxiosError(500);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      // RATE_LIMITED·UNAUTHORIZED 에 해당하지 않는 경우 NETWORK 분기
      mockMapUserError.mockReturnValueOnce('NETWORK');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.errorCode).toBe('NETWORK');
    });
  });

  describe('clearError', () => {
    it('clearError 는 errorCode 를 null 로 초기화한다', async () => {
      const axiosErr = makeAxiosError(429);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(10);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.errorCode).toBe('RATE_LIMITED');

      act(() => {
        result.current.clearError();
      });
      expect(result.current.errorCode).toBeNull();
    });

    it('clearError 는 retryAfter 를 0 으로 초기화한다', async () => {
      const axiosErr = makeAxiosError(429);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(10);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.retryAfter).toBe(10);

      act(() => {
        result.current.clearError();
      });
      expect(result.current.retryAfter).toBe(0);
    });

    it('clearError 는 codeSent 등 다른 상태는 유지한다', async () => {
      mockRequestWithdrawalCode.mockResolvedValue(undefined);
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.codeSent).toBe(true);

      act(() => {
        result.current.clearError();
      });
      expect(result.current.codeSent).toBe(true);
      expect(result.current.secondsLeft).toBe(WITHDRAWAL_CODE_TTL_SECONDS);
    });
  });

  describe('reset', () => {
    it('reset 은 codeSent 를 false 로 초기화한다', async () => {
      mockRequestWithdrawalCode.mockResolvedValue(undefined);
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.codeSent).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.codeSent).toBe(false);
    });

    it('reset 은 secondsLeft / resendIn 을 0 으로 초기화한다', async () => {
      mockRequestWithdrawalCode.mockResolvedValue(undefined);
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });

      act(() => {
        result.current.reset();
      });
      expect(result.current.secondsLeft).toBe(0);
      expect(result.current.resendIn).toBe(0);
    });

    it('reset 은 errorCode / retryAfter 를 초기화한다', async () => {
      const axiosErr = makeAxiosError(429);
      mockRequestWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');
      mockGetRetryAfter.mockReturnValueOnce(30);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.errorCode).toBe('RATE_LIMITED');

      act(() => {
        result.current.reset();
      });
      expect(result.current.errorCode).toBeNull();
      expect(result.current.retryAfter).toBe(0);
    });

    it('reset 이후 타이머가 정지되어 secondsLeft 가 더 줄어들지 않는다', async () => {
      mockRequestWithdrawalCode.mockResolvedValue(undefined);
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });

      act(() => {
        result.current.reset();
      });
      // 타이머가 멈췄으므로 10초가 지나도 secondsLeft 는 0 그대로
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(result.current.secondsLeft).toBe(0);
    });

    it('reset 후 expired 와 canResend 는 false', async () => {
      mockRequestWithdrawalCode.mockResolvedValue(undefined);
      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.sendCode();
      });
      act(() => {
        vi.advanceTimersByTime(WITHDRAWAL_CODE_TTL_SECONDS * 1000);
      });
      expect(result.current.expired).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.expired).toBe(false);
      expect(result.current.canResend).toBe(false);
    });
  });

  describe('derived state — expired / canResend', () => {
    it('codeSent=false 이면 secondsLeft=0 이어도 expired 는 false', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      // 초기 상태: codeSent=false, secondsLeft=0
      expect(result.current.expired).toBe(false);
    });

    it('codeSent=false 이면 resendIn=0 이어도 canResend 는 false', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.canResend).toBe(false);
    });

    it('sendCode 호출 직후 isSending 이 true 가 된다', async () => {
      // pending promise 로 isSending=true 구간을 확인
      let resolveApi!: () => void;
      const pending = new Promise<void>((res) => {
        resolveApi = res;
      });
      mockRequestWithdrawalCode.mockReturnValueOnce(pending);

      const { result } = renderHook(() => useWithdrawalCode());

      // sendCode 를 await 없이 시작하여 isSending=true 구간 캡처
      let sendPromise: Promise<boolean>;
      act(() => {
        sendPromise = result.current.sendCode();
      });
      expect(result.current.isSending).toBe(true);

      // API resolve 후 정리
      await act(async () => {
        resolveApi();
        await sendPromise;
      });
      expect(result.current.isSending).toBe(false);
    });
  });

  describe('verify', () => {
    it('초기 상태에서 isVerifying 은 false, verifyErrorCode 는 null', () => {
      const { result } = renderHook(() => useWithdrawalCode());
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.verifyErrorCode).toBeNull();
    });

    it('성공 시 verifyWithdrawalCode 를 입력 코드로 호출하고 true 를 반환한다', async () => {
      mockVerifyWithdrawalCode.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useWithdrawalCode());
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.verify('123456');
      });

      expect(mockVerifyWithdrawalCode).toHaveBeenCalledTimes(1);
      expect(mockVerifyWithdrawalCode).toHaveBeenCalledWith('123456');
      expect(returned).toBe(true);
    });

    it('성공 시 verifyErrorCode 는 null 로 유지된다', async () => {
      mockVerifyWithdrawalCode.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('123456');
      });
      expect(result.current.verifyErrorCode).toBeNull();
    });

    it('실패(INVALID_VERIFICATION_CODE) 시 false 반환, verifyErrorCode=INVALID_VERIFICATION_CODE', async () => {
      const axiosErr = makeAxiosError(400);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('INVALID_VERIFICATION_CODE');

      const { result } = renderHook(() => useWithdrawalCode());
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.verify('000000');
      });

      expect(returned).toBe(false);
      expect(result.current.verifyErrorCode).toBe('INVALID_VERIFICATION_CODE');
    });

    it('실패(VERIFICATION_CODE_EXPIRED) 시 verifyErrorCode=VERIFICATION_CODE_EXPIRED', async () => {
      const axiosErr = makeAxiosError(410);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('VERIFICATION_CODE_EXPIRED');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('123456');
      });
      expect(result.current.verifyErrorCode).toBe('VERIFICATION_CODE_EXPIRED');
    });

    it('실패(RATE_LIMITED) 시 verifyErrorCode=RATE_LIMITED', async () => {
      const axiosErr = makeAxiosError(429);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('RATE_LIMITED');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('123456');
      });
      expect(result.current.verifyErrorCode).toBe('RATE_LIMITED');
    });

    it('실패(UNAUTHORIZED) 시 verifyErrorCode=UNAUTHORIZED', async () => {
      const axiosErr = makeAxiosError(401);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('UNAUTHORIZED');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('123456');
      });
      expect(result.current.verifyErrorCode).toBe('UNAUTHORIZED');
    });

    it('axios 외 에러는 verifyErrorCode=NETWORK', async () => {
      mockVerifyWithdrawalCode.mockRejectedValueOnce(new Error('네트워크 단절'));

      const { result } = renderHook(() => useWithdrawalCode());
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.verify('123456');
      });
      expect(returned).toBe(false);
      expect(result.current.verifyErrorCode).toBe('NETWORK');
    });

    it('axios 에러이지만 매핑되지 않는 코드면 verifyErrorCode=NETWORK', async () => {
      const axiosErr = makeAxiosError(500);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('NETWORK');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('123456');
      });
      expect(result.current.verifyErrorCode).toBe('NETWORK');
    });

    it('verify 호출 직후 isVerifying 이 true 가 되고 끝나면 false 가 된다', async () => {
      let resolveApi!: () => void;
      const pending = new Promise<void>((res) => {
        resolveApi = res;
      });
      mockVerifyWithdrawalCode.mockReturnValueOnce(pending);

      const { result } = renderHook(() => useWithdrawalCode());

      let verifyPromise: Promise<boolean>;
      act(() => {
        verifyPromise = result.current.verify('123456');
      });
      expect(result.current.isVerifying).toBe(true);

      await act(async () => {
        resolveApi();
        await verifyPromise;
      });
      expect(result.current.isVerifying).toBe(false);
    });

    it('verify 시작 시 이전 verifyErrorCode 가 초기화된다', async () => {
      const axiosErr = makeAxiosError(400);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('INVALID_VERIFICATION_CODE');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('000000');
      });
      expect(result.current.verifyErrorCode).toBe('INVALID_VERIFICATION_CODE');

      mockVerifyWithdrawalCode.mockResolvedValueOnce(undefined);
      await act(async () => {
        await result.current.verify('123456');
      });
      expect(result.current.verifyErrorCode).toBeNull();
    });
  });

  describe('clearVerifyError', () => {
    it('clearVerifyError 는 verifyErrorCode 를 null 로 초기화한다', async () => {
      const axiosErr = makeAxiosError(400);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('INVALID_VERIFICATION_CODE');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('000000');
      });
      expect(result.current.verifyErrorCode).toBe('INVALID_VERIFICATION_CODE');

      act(() => {
        result.current.clearVerifyError();
      });
      expect(result.current.verifyErrorCode).toBeNull();
    });
  });

  describe('sendCode / reset 와 verify 상태 연동', () => {
    it('sendCode 시작 시 verifyErrorCode 가 초기화된다', async () => {
      const axiosErr = makeAxiosError(400);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('INVALID_VERIFICATION_CODE');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('000000');
      });
      expect(result.current.verifyErrorCode).toBe('INVALID_VERIFICATION_CODE');

      mockRequestWithdrawalCode.mockResolvedValueOnce(undefined);
      await act(async () => {
        await result.current.sendCode();
      });
      expect(result.current.verifyErrorCode).toBeNull();
    });

    it('reset 은 isVerifying / verifyErrorCode 를 초기화한다', async () => {
      const axiosErr = makeAxiosError(400);
      mockVerifyWithdrawalCode.mockRejectedValueOnce(axiosErr);
      mockMapUserError.mockReturnValueOnce('INVALID_VERIFICATION_CODE');

      const { result } = renderHook(() => useWithdrawalCode());
      await act(async () => {
        await result.current.verify('000000');
      });
      expect(result.current.verifyErrorCode).toBe('INVALID_VERIFICATION_CODE');

      act(() => {
        result.current.reset();
      });
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.verifyErrorCode).toBeNull();
    });
  });
});
