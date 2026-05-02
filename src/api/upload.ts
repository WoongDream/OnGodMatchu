import axios from 'axios';
import instance from './instance';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// BE 가 presigned URL 서명에 포함시키는 태깅. PUT 요청 헤더에서 빠지면 S3 가 403 반환.
// 값 변경은 운영 S3 라이프사이클 룰과 1:1 매칭되어 사실상 고정. 변경 시 BE 와 동시 작업 필요.
export const PRESIGNED_PUT_TAGGING = 'status=pending';

export type PresignedPutResponse = {
  uploadUrl: string;
  key: string;
  expiresIn: number;
};

export type PresignedGetResponse = {
  viewUrl: string;
  key: string;
  expiresIn: number;
  expiresAt: string;
};

export const requestUploadUrl = async (file: File): Promise<PresignedPutResponse> => {
  const res = await instance.post<ApiResponse<PresignedPutResponse>>('/api/upload/presigned', {
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });
  return res.data.data;
};

export const uploadFileToPresignedUrl = async (file: File, uploadUrl: string): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
      'x-amz-tagging': PRESIGNED_PUT_TAGGING,
    },
    timeout: 30000,
  });
};

export const notifyUploadComplete = async (key: string): Promise<void> => {
  await instance.patch('/api/upload/complete', { key });
};

export const getViewUrl = async (key: string): Promise<PresignedGetResponse> => {
  const res = await instance.get<ApiResponse<PresignedGetResponse>>('/api/upload/signed', {
    params: { key },
  });
  return res.data.data;
};

export const uploadImage = async (file: File): Promise<string> => {
  const { uploadUrl, key } = await requestUploadUrl(file);
  await uploadFileToPresignedUrl(file, uploadUrl);
  await notifyUploadComplete(key);
  return key;
};
