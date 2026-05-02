export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export type ImageValidationError = 'INVALID_TYPE' | 'TOO_LARGE';

export const validateImageFile = (file: File): ImageValidationError | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return 'INVALID_TYPE';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'TOO_LARGE';
  }
  return null;
};

export const getValidationMessage = (error: ImageValidationError): string => {
  switch (error) {
    case 'INVALID_TYPE':
      return 'JPG, PNG, WEBP 파일만 업로드할 수 있어요.';
    case 'TOO_LARGE':
      return '파일 용량은 5MB 이하만 업로드할 수 있어요.';
  }
};
