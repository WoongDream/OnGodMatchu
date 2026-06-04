import { describe, it, expect } from 'vitest';
import { buildOAuthAuthorizationUrl } from './oauth';
import { SUPPORTED_OAUTH_PROVIDERS } from '@/types';

describe('buildOAuthAuthorizationUrl', () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  it('builds Google authorization URL', () => {
    expect(buildOAuthAuthorizationUrl('google')).toBe(`${baseUrl}/oauth2/authorization/google`);
  });

  it('builds Naver authorization URL', () => {
    expect(buildOAuthAuthorizationUrl('naver')).toBe(`${baseUrl}/oauth2/authorization/naver`);
  });

  it('uses VITE_API_BASE_URL as base for all providers', () => {
    SUPPORTED_OAUTH_PROVIDERS.forEach((provider) => {
      expect(buildOAuthAuthorizationUrl(provider)).toMatch(/^https?:\/\//);
      expect(buildOAuthAuthorizationUrl(provider)).toContain(`/oauth2/authorization/${provider}`);
    });
  });
});
