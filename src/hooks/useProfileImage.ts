import { useState } from 'react';
import { useSWRConfig } from 'swr';
import axios from 'axios';
import {
  requestProfileImageUpload,
  applyProfileImage,
  removeProfileImage,
  regenerateDefaultProfileImage,
  mapUserError,
  type UserErrorCode,
} from '@/api/user';
import useAuthStore from '@/store/authStore';
import type { User } from '@/types';

const ERROR_MESSAGES: Record<UserErrorCode, string> = {
  NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
  INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
  PROFILE_PRIVATE: '비공개 프로필입니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  INVALID_INPUT: '입력값을 다시 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  NETWORK: '이미지 처리에 실패했어요.',
};

const MY_PROFILE_KEY = ['profile', 'me'] as const;

export type UseProfileImageReturn = {
  upload: (file: File) => Promise<User | null>;
  removeImage: () => Promise<User | null>;
  regenerateDefault: () => Promise<User | null>;
  isUploading: boolean;
  isRegenerating: boolean;
  isRemoving: boolean;
  isProcessing: boolean;
  error: string | null;
  errorCode: UserErrorCode | null;
  clearError: () => void;
};

const useProfileImage = (): UseProfileImageReturn => {
  const { mutate } = useSWRConfig();
  const [isUploading, setIsUploading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<UserErrorCode | null>(null);

  const isProcessing = isUploading || isRegenerating || isRemoving;

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

  const setProfileCache = async (user: User): Promise<User | null> => {
    const updated = await mutate<User>(MY_PROFILE_KEY, user, { revalidate: false });
    useAuthStore.getState().setUser(user);
    return updated ?? null;
  };

  const upload = async (file: File): Promise<User | null> => {
    setIsUploading(true);
    clearError();
    try {
      const { uploadUrl, key, requiredHeaders } = await requestProfileImageUpload({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });
      // BE 가 presigned 서명에 포함시킨 헤더 그대로 사용. 응답에 없으면 퀴즈 흐름과 동일한
      // 기본값으로 fallback (s3 SignedHeaders=content-type;host;x-amz-tagging).
      const putHeaders = requiredHeaders ?? {
        'Content-Type': file.type,
        'x-amz-tagging': 'status=pending',
      };
      await axios.put(uploadUrl, file, { headers: putHeaders });
      const user = await applyProfileImage(key);
      return await setProfileCache(user);
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (): Promise<User | null> => {
    setIsRemoving(true);
    clearError();
    try {
      const user = await removeProfileImage();
      return await setProfileCache(user);
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsRemoving(false);
    }
  };

  const regenerateDefault = async (): Promise<User | null> => {
    setIsRegenerating(true);
    clearError();
    try {
      const user = await regenerateDefaultProfileImage();
      return await setProfileCache(user);
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    upload,
    removeImage,
    regenerateDefault,
    isUploading,
    isRegenerating,
    isRemoving,
    isProcessing,
    error,
    errorCode,
    clearError,
  };
};

export default useProfileImage;
