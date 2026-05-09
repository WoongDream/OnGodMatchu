import instance from './instance';
import type { User, MyQuizzesAggregate } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type UpdateProfilePayload = {
  nickname?: string;
  bio?: string;
  isProfilePublic?: boolean;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type WithdrawReason =
  | 'no_time'
  | 'low_quality_quizzes'
  | 'privacy_concern'
  | 'will_recreate'
  | 'other';

export type WithdrawAccountPayload = {
  reason?: WithdrawReason;
  deleteMyQuizzes: boolean;
};

export type ProfileImagePresigned = {
  uploadUrl: string;
  key: string;
  expiresIn?: number;
  requiredHeaders?: Record<string, string>;
};

export type ProfileImageUploadRequest = {
  filename: string;
  contentType: string;
  sizeBytes?: number;
};

export type UserErrorCode =
  | 'NICKNAME_TAKEN'
  | 'INVALID_PASSWORD'
  | 'INVALID_CURRENT_PASSWORD'
  | 'OAUTH_USER_CANNOT_CHANGE_PASSWORD'
  | 'WITHDRAWAL_FAILED'
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

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await instance.patch('/api/users/me/password', payload);
};

export const withdrawAccount = async (payload: WithdrawAccountPayload): Promise<void> => {
  await instance.delete('/api/users/me', { data: payload });
};

export const requestProfileImageUpload = async (
  payload: ProfileImageUploadRequest,
): Promise<ProfileImagePresigned> => {
  const res = await instance.post<ApiResponse<ProfileImagePresigned>>(
    '/api/users/me/profile-image',
    payload,
  );
  return res.data.data;
};

export const applyProfileImage = async (key: string): Promise<User> => {
  const res = await instance.patch<ApiResponse<User>>('/api/users/me/profile-image', { key });
  return res.data.data;
};

export const removeProfileImage = async (): Promise<User> => {
  const res = await instance.delete<ApiResponse<User>>('/api/users/me/profile-image');
  return res.data.data;
};

export const regenerateDefaultProfileImage = async (): Promise<User> => {
  const res = await instance.post<ApiResponse<User>>('/api/users/me/profile-image/default');
  return res.data.data;
};

export const getMyProfileStats = async (): Promise<MyQuizzesAggregate> => {
  const res = await instance.get<ApiResponse<MyQuizzesAggregate>>('/api/users/me/profile/stats');
  return res.data.data;
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
  if (code === 'INVALID_CURRENT_PASSWORD') {
    return 'INVALID_CURRENT_PASSWORD';
  }
  if (code === 'OAUTH_USER_CANNOT_CHANGE_PASSWORD') {
    return 'OAUTH_USER_CANNOT_CHANGE_PASSWORD';
  }
  if (code === 'WITHDRAWAL_FAILED') {
    return 'WITHDRAWAL_FAILED';
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
