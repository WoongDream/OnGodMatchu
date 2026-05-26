import { getMe } from '@/api/auth';
import useAuthStore from '@/store/authStore';
import type { User } from '@/types';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const setAuthSession = async ({ accessToken, refreshToken }: AuthTokens): Promise<User> => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  const user = await getMe();
  useAuthStore.getState().setUser(user);
  return user;
};

export const clearAuthSession = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
