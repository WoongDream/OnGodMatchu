import type { OAuthProvider } from '@/types';

export const buildOAuthAuthorizationUrl = (provider: OAuthProvider): string =>
  `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/${provider}`;
