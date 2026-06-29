import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  requestWithdrawalCode,
  verifyWithdrawalCode,
  getRetryAfter,
  mapUserError,
} from '@/api/user';

export type WithdrawalCodeErrorCode = 'RATE_LIMITED' | 'UNAUTHORIZED' | 'NETWORK' | null;

export type WithdrawalVerifyErrorCode =
  | 'INVALID_VERIFICATION_CODE'
  | 'VERIFICATION_CODE_EXPIRED'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | null;

export const WITHDRAWAL_CODE_TTL_SECONDS = 300;
export const WITHDRAWAL_CODE_RESEND_COOLDOWN_SECONDS = 60;

const resolveError = (
  err: unknown,
): { code: Exclude<WithdrawalCodeErrorCode, null>; retryAfter: number } => {
  if (axios.isAxiosError(err)) {
    const mapped = mapUserError(err);
    if (mapped === 'RATE_LIMITED') {
      return { code: 'RATE_LIMITED', retryAfter: getRetryAfter(err) };
    }
    if (mapped === 'UNAUTHORIZED') {
      return { code: 'UNAUTHORIZED', retryAfter: 0 };
    }
  }
  return { code: 'NETWORK', retryAfter: 0 };
};

const resolveVerifyError = (err: unknown): Exclude<WithdrawalVerifyErrorCode, null> => {
  if (axios.isAxiosError(err)) {
    const mapped = mapUserError(err);
    if (
      mapped === 'INVALID_VERIFICATION_CODE' ||
      mapped === 'VERIFICATION_CODE_EXPIRED' ||
      mapped === 'RATE_LIMITED' ||
      mapped === 'UNAUTHORIZED'
    ) {
      return mapped;
    }
  }
  return 'NETWORK';
};

export type UseWithdrawalCodeReturn = {
  codeSent: boolean;
  isSending: boolean;
  secondsLeft: number;
  expired: boolean;
  resendIn: number;
  canResend: boolean;
  errorCode: WithdrawalCodeErrorCode;
  retryAfter: number;
  isVerifying: boolean;
  verifyErrorCode: WithdrawalVerifyErrorCode;
  sendCode: () => Promise<boolean>;
  verify: (code: string) => Promise<boolean>;
  clearVerifyError: () => void;
  reset: () => void;
  clearError: () => void;
};

const useWithdrawalCode = (): UseWithdrawalCodeReturn => {
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [errorCode, setErrorCode] = useState<WithdrawalCodeErrorCode>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyErrorCode, setVerifyErrorCode] = useState<WithdrawalVerifyErrorCode>(null);
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

  const sendCode = useCallback(async (): Promise<boolean> => {
    setIsSending(true);
    setErrorCode(null);
    setRetryAfter(0);
    setVerifyErrorCode(null);
    try {
      await requestWithdrawalCode();
      setCodeSent(true);
      setSecondsLeft(WITHDRAWAL_CODE_TTL_SECONDS);
      setResendIn(WITHDRAWAL_CODE_RESEND_COOLDOWN_SECONDS);
      startTimer();
      return true;
    } catch (err) {
      const resolved = resolveError(err);
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
  }, [startTimer]);

  const verify = useCallback(async (code: string): Promise<boolean> => {
    setIsVerifying(true);
    setVerifyErrorCode(null);
    try {
      await verifyWithdrawalCode(code);
      return true;
    } catch (err) {
      setVerifyErrorCode(resolveVerifyError(err));
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    stopTimer();
    setCodeSent(false);
    setIsSending(false);
    setSecondsLeft(0);
    setResendIn(0);
    setErrorCode(null);
    setRetryAfter(0);
    setIsVerifying(false);
    setVerifyErrorCode(null);
  }, [stopTimer]);

  const clearError = useCallback(() => {
    setErrorCode(null);
    setRetryAfter(0);
  }, []);

  const clearVerifyError = useCallback(() => {
    setVerifyErrorCode(null);
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
    isVerifying,
    verifyErrorCode,
    sendCode,
    verify,
    clearVerifyError,
    reset,
    clearError,
  };
};

export default useWithdrawalCode;
