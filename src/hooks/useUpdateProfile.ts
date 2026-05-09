import { useState } from 'react';
import { useSWRConfig } from 'swr';
import axios from 'axios';
import {
  updateProfile,
  type UpdateProfilePayload,
  type UserErrorCode,
  mapUserError,
} from '@/api/user';
import useAuthStore from '@/store/authStore';
import type { User } from '@/types';

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

const MY_PROFILE_KEY = ['profile', 'me'] as const;

export type UseUpdateProfileReturn = {
  update: (payload: UpdateProfilePayload) => Promise<User | null>;
  toggleVisibility: (isProfilePublic: boolean) => Promise<User | null>;
  isSaving: boolean;
  isToggling: boolean;
  error: string | null;
  errorCode: UserErrorCode | null;
  clearError: () => void;
};

const useUpdateProfile = (): UseUpdateProfileReturn => {
  const { mutate } = useSWRConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<UserErrorCode | null>(null);

  const clearError = () => {
    setError(null);
    setErrorCode(null);
  };

  const handleError = (err: unknown): UserErrorCode => {
    const code = axios.isAxiosError(err) ? mapUserError(err) : 'NETWORK';
    setErrorCode(code);
    setError(ERROR_MESSAGES[code]);
    return code;
  };

  const runUpdate = async (
    payload: UpdateProfilePayload,
    setBusy: (busy: boolean) => void,
  ): Promise<User | null> => {
    setBusy(true);
    clearError();
    try {
      const updated = await mutate<User>(MY_PROFILE_KEY, async () => updateProfile(payload), {
        optimisticData: (current) =>
          current ? { ...current, ...payload } : (current as unknown as User),
        rollbackOnError: true,
        revalidate: false,
      });
      if (updated) {
        useAuthStore.getState().setUser(updated);
      }
      return updated ?? null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const update = (payload: UpdateProfilePayload) => runUpdate(payload, setIsSaving);

  const toggleVisibility = (isProfilePublic: boolean) =>
    runUpdate({ isProfilePublic }, setIsToggling);

  return { update, toggleVisibility, isSaving, isToggling, error, errorCode, clearError };
};

export default useUpdateProfile;
