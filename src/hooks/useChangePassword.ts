import { useState } from 'react';
import axios from 'axios';
import {
  changePassword,
  type ChangePasswordPayload,
  type UserErrorCode,
  mapUserError,
} from '@/api/user';

const ERROR_MESSAGES: Record<UserErrorCode, string> = {
  NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
  INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
  INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
  OAUTH_USER_CANNOT_CHANGE_PASSWORD: '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.',
  WITHDRAWAL_FAILED: '회원 탈퇴 처리에 실패했습니다.',
  PROFILE_PRIVATE: '비공개 프로필입니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  INVALID_INPUT: '입력값을 다시 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  NETWORK: '네트워크 오류가 발생했습니다.',
};

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
