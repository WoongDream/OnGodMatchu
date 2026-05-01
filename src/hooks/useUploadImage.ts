import { useCallback, useState } from 'react';
import { uploadImage } from '@/api/upload';

export type UploadErrorCode =
  | 'PRESIGNED_FAILED'
  | 'PUT_FAILED'
  | 'COMPLETE_NOTIFY_FAILED'
  | 'NETWORK';

const ERROR_MESSAGES: Record<UploadErrorCode, string> = {
  PRESIGNED_FAILED: '이미지 업로드 URL 발급에 실패했어요.',
  PUT_FAILED: '이미지 업로드 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
  COMPLETE_NOTIFY_FAILED: '이미지 업로드 처리 중 문제가 발생했어요.',
  NETWORK: '이미지 업로드 요청에 실패했어요.',
};

export class ImageUploadError extends Error {
  code: UploadErrorCode;
  constructor(code: UploadErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.code = code;
  }
}

const resolveUploadErrorCode = (err: unknown): UploadErrorCode => {
  if (typeof err === 'object' && err !== null && 'config' in err) {
    const url = (err as { config?: { url?: string } }).config?.url ?? '';
    if (url.includes('/api/upload/presigned')) {
      return 'PRESIGNED_FAILED';
    }
    if (url.includes('/api/upload/complete')) {
      return 'COMPLETE_NOTIFY_FAILED';
    }
    return 'PUT_FAILED';
  }
  return 'NETWORK';
};

type UseUploadImageReturn = {
  upload: (file: File) => Promise<string>;
  isUploading: boolean;
};

const useUploadImage = (): UseUploadImageReturn => {
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      return await uploadImage(file);
    } catch (err) {
      throw new ImageUploadError(resolveUploadErrorCode(err));
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading };
};

export default useUploadImage;
