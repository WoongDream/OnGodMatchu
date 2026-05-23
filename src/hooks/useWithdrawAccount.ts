import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  withdrawAccount,
  type WithdrawAccountPayload,
  type UserErrorCode,
  mapUserError,
  USER_ERROR_MESSAGES,
} from '@/api/user';
import { clearAuthSession } from '@/lib/auth';
import useAuthStore from '@/store/authStore';

const ERROR_MESSAGES = USER_ERROR_MESSAGES;

export type UseWithdrawAccountReturn = {
  withdraw: (payload: WithdrawAccountPayload) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
  errorCode: UserErrorCode | null;
  clearError: () => void;
};

const useWithdrawAccount = (): UseWithdrawAccountReturn => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<UserErrorCode | null>(null);

  const clearError = () => {
    setError(null);
    setErrorCode(null);
  };

  const withdraw = async (payload: WithdrawAccountPayload): Promise<boolean> => {
    setIsSubmitting(true);
    clearError();
    try {
      await withdrawAccount(payload);
      clearAuthSession();
      useAuthStore.getState().logout();
      navigate('/login?withdrawn=1', { replace: true });
      return true;
    } catch (err) {
      const code = axios.isAxiosError(err) ? mapUserError(err) : 'NETWORK';
      setErrorCode(code);
      setError(ERROR_MESSAGES[code]);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { withdraw, isSubmitting, error, errorCode, clearError };
};

export default useWithdrawAccount;
