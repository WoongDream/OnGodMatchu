import { getMe } from '@/api/auth';
import useAuthStore from '@/store/authStore';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const setAuthSession = async ({ accessToken, refreshToken }: AuthTokens): Promise<void> => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  const user = await getMe();
  useAuthStore.getState().setUser(user);
};

export const clearAuthSession = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
