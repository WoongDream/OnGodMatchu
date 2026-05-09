import { useState } from 'react';
import { useSWRConfig } from 'swr';
import axios from 'axios';
import {
  updateProfile,
  type UpdateProfilePayload,
  type UserErrorCode,
  mapUserError,
  USER_ERROR_MESSAGES,
} from '@/api/user';
import useAuthStore from '@/store/authStore';
import type { User } from '@/types';

const ERROR_MESSAGES = USER_ERROR_MESSAGES;

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
