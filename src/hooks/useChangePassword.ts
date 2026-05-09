import { useState } from 'react';
import axios from 'axios';
import {
  changePassword,
  type ChangePasswordPayload,
  type UserErrorCode,
  mapUserError,
  USER_ERROR_MESSAGES,
} from '@/api/user';

const ERROR_MESSAGES = USER_ERROR_MESSAGES;

export type UseChangePasswordReturn = {
  change: (payload: ChangePasswordPayload) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
  errorCode: UserErrorCode | null;
  clearError: () => void;
};

const useChangePassword = (): UseChangePasswordReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<UserErrorCode | null>(null);

  const clearError = () => {
    setError(null);
    setErrorCode(null);
  };

  const change = async (payload: ChangePasswordPayload): Promise<boolean> => {
    setIsSubmitting(true);
    clearError();
    try {
      await changePassword(payload);
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

  return { change, isSubmitting, error, errorCode, clearError };
};

export default useChangePassword;
