import instance from './instance';
import type { User } from '@/types';

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const res = await instance.post<ApiResponse<TokenResponse>>('/api/auth/login', {
    email,
    password,
  });
  return res.data.data;
};

export const sendVerificationCode = async (email: string): Promise<void> => {
  await instance.post('/api/auth/send-verification-code', { email });
};

export type SignupPayload = {
  email: string;
  password: string;
  nickname: string;
  code: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToMarketing?: boolean;
};

export const signup = async (payload: SignupPayload): Promise<TokenResponse> => {
  const res = await instance.post<ApiResponse<TokenResponse>>('/api/auth/signup', payload);
  return res.data.data;
};

export type NicknameAvailability = {
  available: boolean;
  reason?: 'taken' | 'format';
};

export const checkNicknameAvailability = async (
  nickname: string,
): Promise<NicknameAvailability> => {
  const res = await instance.get<ApiResponse<NicknameAvailability>>('/api/auth/check-nickname', {
    params: { nickname },
  });
  return res.data.data;
};

export const refreshToken = async (token: string): Promise<TokenResponse> => {
  const res = await instance.post<ApiResponse<TokenResponse>>('/api/auth/refresh', token, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return res.data.data;
};

export const logout = async (): Promise<void> => {
  await instance.post('/api/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const res = await instance.get<ApiResponse<User>>('/api/users/me');
  return res.data.data;
};
