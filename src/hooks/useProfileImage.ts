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
  USER_ERROR_MESSAGES,
} from '@/api/user';
import { resolveSlot, type ImageSlot } from '@/lib/image/imageSlot';
import useAuthStore from '@/store/authStore';
import type { User } from '@/types';

const ERROR_MESSAGES: Record<UserErrorCode, string> = {
  ...USER_ERROR_MESSAGES,
  NETWORK: '이미지 처리에 실패했어요.',
};

const MY_PROFILE_KEY = ['profile', 'me'] as const;

export type UseProfileImageReturn = {
  /** 편집 모달 결과가 병합된 슬롯을 받아 원본+크롭 업로드 후 적용. */
  applyEdited: (slot: ImageSlot) => Promise<User | null>;
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
    // 댓글 목록 등에 내 아바타가 presigned URL 로 박혀 캐시돼 있으므로, 이미지 변경 후 재검증해
    // 내 화면에서도 즉시 새 이미지가 반영되게 한다. (다른 사용자 세션은 각자 revalidate 시 갱신)
    await mutate((key) => Array.isArray(key) && key[0] === 'comments');
    return updated ?? null;
  };

  // 프로필 prefix presigned PUT 1건. /complete 는 applyProfileImage(BE)가 수행하므로 여기선 PUT 만.
  const uploadProfileFile = async (file: File): Promise<string> => {
    const { uploadUrl, key, requiredHeaders } = await requestProfileImageUpload({
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });
    const putHeaders = requiredHeaders ?? {
      'Content-Type': file.type,
      'x-amz-tagging': 'status=pending',
    };
    await axios.put(uploadUrl, file, { headers: putHeaders });
    return key;
  };

  const applyEdited = async (slot: ImageSlot): Promise<User | null> => {
    setIsUploading(true);
    clearError();
    try {
      const resolved = await resolveSlot(slot, uploadProfileFile);
      if (!resolved.imageKey) {
        return null;
      }
      const user = await applyProfileImage(
        resolved.imageKey,
        resolved.originalImageKey,
        resolved.transform,
      );
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
    applyEdited,
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
