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

export type WithdrawAccountPayload = {
  verificationCode: string;
  confirmationPhrase: string;
  deleteOwnQuizzes?: boolean;
  reasonText?: string;
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
  | 'INVALID_WITHDRAWAL_CONFIRMATION'
  | 'INVALID_VERIFICATION_CODE'
  | 'VERIFICATION_CODE_EXPIRED'
  | 'RATE_LIMITED'
  | 'TERMS_AGREEMENT_OUTDATED'
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

export const requestWithdrawalCode = async (): Promise<void> => {
  await instance.post('/api/users/me/withdrawal-code');
};

export type AgreeTermsPayload = {
  agreedToMarketing?: boolean;
};

export const agreeTerms = async (payload: AgreeTermsPayload = {}): Promise<User> => {
  const res = await instance.post<ApiResponse<User>>('/api/users/me/terms-agreement', payload);
  return res.data.data;
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
  error?: { code?: string; retryAfter?: number };
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
  if (code === 'INVALID_WITHDRAWAL_CONFIRMATION') {
    return 'INVALID_WITHDRAWAL_CONFIRMATION';
  }
  if (code === 'INVALID_VERIFICATION_CODE') {
    return 'INVALID_VERIFICATION_CODE';
  }
  if (code === 'VERIFICATION_CODE_EXPIRED') {
    return 'VERIFICATION_CODE_EXPIRED';
  }
  if (code === 'RATE_LIMITED' || status === 429) {
    return 'RATE_LIMITED';
  }
  if (code === 'TERMS_AGREEMENT_OUTDATED') {
    return 'TERMS_AGREEMENT_OUTDATED';
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

export const getRetryAfter = (error: unknown): number => {
  const err = error as { response?: { data?: ErrorResponseBody } };
  return err.response?.data?.error?.retryAfter ?? 0;
};

export const USER_ERROR_MESSAGES: Record<UserErrorCode, string> = {
  NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
  INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
  INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
  INVALID_WITHDRAWAL_CONFIRMATION: '확인 문구가 일치하지 않습니다.',
  INVALID_VERIFICATION_CODE: '인증코드가 올바르지 않습니다.',
  VERIFICATION_CODE_EXPIRED: '인증코드가 만료되었어요. 다시 받아주세요.',
  RATE_LIMITED: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',
  TERMS_AGREEMENT_OUTDATED: '약관 동의가 필요합니다.',
  PROFILE_PRIVATE: '비공개 프로필입니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  INVALID_INPUT: '입력값을 다시 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  NETWORK: '네트워크 오류가 발생했습니다.',
};
