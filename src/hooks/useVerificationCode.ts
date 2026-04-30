import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { sendVerificationCode } from '@/api/auth';

export type VerificationCodeErrorCode =
  | 'EMAIL_ALREADY_EXISTS'
  | 'RATE_LIMITED'
  | 'INVALID_EMAIL_FORMAT'
  | 'NETWORK'
  | null;

export const VERIFICATION_CODE_TTL_SECONDS = 300;
export const RESEND_COOLDOWN_SECONDS = 60;

type SendErrorBody = {
  error?: { code?: string; retryAfter?: number };
};

type ResolvedError = {
  code: Exclude<VerificationCodeErrorCode, null>;
  retryAfter: number;
};

const resolveSendError = (err: unknown): ResolvedError => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data as SendErrorBody | undefined;
    const apiCode = body?.error?.code;
    const retryAfter = body?.error?.retryAfter ?? 0;

    if (apiCode === 'RATE_LIMITED' || status === 429) {
      return { code: 'RATE_LIMITED', retryAfter };
    }
    if (apiCode === 'EMAIL_ALREADY_EXISTS' || status === 409) {
      return { code: 'EMAIL_ALREADY_EXISTS', retryAfter: 0 };
    }
    if (apiCode === 'INVALID_EMAIL_FORMAT' || status === 400) {
      return { code: 'INVALID_EMAIL_FORMAT', retryAfter: 0 };
    }
  }
  return { code: 'NETWORK', retryAfter: 0 };
};

export type UseVerificationCodeReturn = {
  codeSent: boolean;
  isSending: boolean;
  secondsLeft: number;
  expired: boolean;
  resendIn: number;
  canResend: boolean;
  errorCode: VerificationCodeErrorCode;
  retryAfter: number;
  sendCode: (email: string) => Promise<boolean>;
  reset: () => void;
  clearError: () => void;
};

const useVerificationCode = (): UseVerificationCodeReturn => {
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [errorCode, setErrorCode] = useState<VerificationCodeErrorCode>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, [stopTimer]);

  useEffect(() => stopTimer, [stopTimer]);

  const sendCode = useCallback(
    async (email: string): Promise<boolean> => {
      setIsSending(true);
      setErrorCode(null);
      setRetryAfter(0);
      try {
        await sendVerificationCode(email);
        setCodeSent(true);
        setSecondsLeft(VERIFICATION_CODE_TTL_SECONDS);
        setResendIn(RESEND_COOLDOWN_SECONDS);
        startTimer();
        return true;
      } catch (err) {
        const resolved = resolveSendError(err);
        setErrorCode(resolved.code);
        setRetryAfter(resolved.retryAfter);
        if (resolved.code === 'RATE_LIMITED' && resolved.retryAfter > 0) {
          setResendIn(resolved.retryAfter);
          startTimer();
        }
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [startTimer],
  );

  const reset = useCallback(() => {
    stopTimer();
    setCodeSent(false);
    setIsSending(false);
    setSecondsLeft(0);
    setResendIn(0);
    setErrorCode(null);
    setRetryAfter(0);
  }, [stopTimer]);

  const clearError = useCallback(() => {
    setErrorCode(null);
    setRetryAfter(0);
  }, []);

  const expired = codeSent && secondsLeft === 0;
  const canResend = codeSent && !isSending && resendIn === 0;

  return {
    codeSent,
    isSending,
    secondsLeft,
    expired,
    resendIn,
    canResend,
    errorCode,
    retryAfter,
    sendCode,
    reset,
    clearError,
  };
};

export default useVerificationCode;
