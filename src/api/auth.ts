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

export const signup = async (email: string, nickname: string, password: string): Promise<void> => {
  await instance.post('/api/auth/signup', { email, nickname, password });
};

export const verifyEmail = async (email: string, code: string): Promise<void> => {
  await instance.post('/api/auth/verify-email', { email, code });
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
