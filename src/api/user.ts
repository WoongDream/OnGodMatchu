import instance from './instance';
import type { User } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type UpdateProfilePayload = {
  nickname?: string;
  bio?: string;
  profileImageKey?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type UserErrorCode =
  | 'NICKNAME_TAKEN'
  | 'INVALID_PASSWORD'
  | 'PROFILE_PRIVATE'
  | 'USER_NOT_FOUND'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'NETWORK';

export const getMyProfile = async (): Promise<User> => {
  const res = await instance.get<ApiResponse<User>>('/api/users/me');
  return res.data.data;
};

export const getUserProfile = async (userId: number): Promise<User> => {
  const res = await instance.get<ApiResponse<User>>(`/api/users/${userId}`);
  return res.data.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const res = await instance.patch<ApiResponse<User>>('/api/users/me', payload);
  return res.data.data;
};

export const updateProfileVisibility = async (isPublic: boolean): Promise<User> => {
  const res = await instance.patch<ApiResponse<User>>('/api/users/me/visibility', { isPublic });
  return res.data.data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await instance.patch('/api/users/me/password', payload);
};

type ErrorResponseBody = {
  error?: { code?: string };
};

export const mapUserError = (error: unknown): UserErrorCode => {
  const err = error as { response?: { status?: number; data?: ErrorResponseBody } };
  const status = err.response?.status;
  const code = err.response?.data?.error?.code;

  if (code === 'NICKNAME_TAKEN' || code === 'NICKNAME_ALREADY_EXISTS') {
    return 'NICKNAME_TAKEN';
  }
  if (code === 'INVALID_PASSWORD') {
    return 'INVALID_PASSWORD';
  }
  if (code === 'PROFILE_PRIVATE') {
    return 'PROFILE_PRIVATE';
  }
  if (code === 'USER_NOT_FOUND' || status === 404) {
    return 'USER_NOT_FOUND';
  }
  if (code === 'INVALID_INPUT' || status === 400) {
    return 'INVALID_INPUT';
  }
  if (status === 401) {
    return 'UNAUTHORIZED';
  }
  if (status === 403) {
    return 'PROFILE_PRIVATE';
  }
  return 'NETWORK';
};
