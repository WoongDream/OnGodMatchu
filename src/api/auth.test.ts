import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./instance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import instance from './instance';
import {
  login,
  sendVerificationCode,
  signup,
  checkNicknameAvailability,
  refreshToken,
  logout,
  getMe,
} from './auth';
import type { SignupPayload } from './auth';

const mockGet = vi.mocked(instance.get);
const mockPost = vi.mocked(instance.post);

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

describe('login', () => {
  it('POST /api/auth/login 을 email, password body 로 호출한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'A', refreshToken: 'R' } },
    });

    await login('user@example.com', 'Pass1!');

    expect(mockPost).toHaveBeenCalledWith('/api/auth/login', {
      email: 'user@example.com',
      password: 'Pass1!',
    });
  });

  it('ApiResponse 에서 data.data 를 반환한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'access', refreshToken: 'refresh' } },
    });

    const result = await login('user@example.com', 'Pass1!');

    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('에러 시 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('unauthorized'));

    await expect(login('bad@user.com', 'wrong')).rejects.toThrow('unauthorized');
  });
});

// ---------------------------------------------------------------------------
// sendVerificationCode
// ---------------------------------------------------------------------------

describe('sendVerificationCode', () => {
  it('POST /api/auth/send-verification-code 를 { email } body 로 호출한다', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await sendVerificationCode('user@example.com');

    expect(mockPost).toHaveBeenCalledWith('/api/auth/send-verification-code', {
      email: 'user@example.com',
    });
  });

  it('반환값은 void (undefined) 이다', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    const result = await sendVerificationCode('user@example.com');

    expect(result).toBeUndefined();
  });

  it('에러 시 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('rate limited'));

    await expect(sendVerificationCode('x@x.com')).rejects.toThrow('rate limited');
  });
});

// ---------------------------------------------------------------------------
// signup
// ---------------------------------------------------------------------------

describe('signup', () => {
  const BASE_PAYLOAD: SignupPayload = {
    email: 'new@user.com',
    password: 'StrongPass1!',
    nickname: 'newUser',
    code: '654321',
    agreedToTerms: true,
    agreedToPrivacy: true,
    agreedToAge14: true,
  };

  it('POST /api/auth/signup 을 payload 그대로 호출한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'A', refreshToken: 'R' } },
    });

    await signup(BASE_PAYLOAD);

    expect(mockPost).toHaveBeenCalledWith('/api/auth/signup', BASE_PAYLOAD);
  });

  it('POST body 에 agreedToAge14 를 포함해 전송한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'A', refreshToken: 'R' } },
    });

    await signup({ ...BASE_PAYLOAD, agreedToAge14: false });

    expect(mockPost).toHaveBeenCalledWith(
      '/api/auth/signup',
      expect.objectContaining({ agreedToAge14: false }),
    );
  });

  it('ApiResponse 에서 data.data (토큰) 를 반환한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'tok', refreshToken: 'ref' } },
    });

    const result = await signup(BASE_PAYLOAD);

    expect(result).toEqual({ accessToken: 'tok', refreshToken: 'ref' });
  });

  it('에러 시 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('server error'));

    await expect(signup(BASE_PAYLOAD)).rejects.toThrow('server error');
  });
});

// ---------------------------------------------------------------------------
// checkNicknameAvailability
// ---------------------------------------------------------------------------

describe('checkNicknameAvailability', () => {
  it('GET /api/auth/check-nickname 을 nickname 파라미터로 호출한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { available: true } },
    });

    await checkNicknameAvailability('newNick');

    expect(mockGet).toHaveBeenCalledWith('/api/auth/check-nickname', {
      params: { nickname: 'newNick' },
    });
  });

  it('사용 가능한 닉네임이면 { available: true } 를 반환한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { available: true } },
    });

    const result = await checkNicknameAvailability('freeNick');

    expect(result).toEqual({ available: true });
  });

  it('중복 닉네임이면 { available: false, reason: taken } 을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { available: false, reason: 'taken' } },
    });

    const result = await checkNicknameAvailability('takenNick');

    expect(result).toEqual({ available: false, reason: 'taken' });
  });

  it('금지 닉네임이면 { available: false, reason: forbidden, matched } 를 반환한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { available: false, reason: 'forbidden', matched: '병신' } },
    });

    const result = await checkNicknameAvailability('badNick');

    expect(result).toEqual({ available: false, reason: 'forbidden', matched: '병신' });
    expect(mockGet).toHaveBeenCalledWith('/api/auth/check-nickname', {
      params: { nickname: 'badNick' },
    });
  });

  it('에러 시 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'));

    await expect(checkNicknameAvailability('x')).rejects.toThrow('network');
  });
});

// ---------------------------------------------------------------------------
// refreshToken
// ---------------------------------------------------------------------------

describe('refreshToken', () => {
  it('POST /api/auth/refresh 를 token body 와 text/plain 헤더로 호출한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'newA', refreshToken: 'newR' } },
    });

    await refreshToken('old-refresh-token');

    expect(mockPost).toHaveBeenCalledWith('/api/auth/refresh', 'old-refresh-token', {
      headers: { 'Content-Type': 'text/plain' },
    });
  });

  it('새 토큰을 반환한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'newA', refreshToken: 'newR' } },
    });

    const result = await refreshToken('old-refresh-token');

    expect(result).toEqual({ accessToken: 'newA', refreshToken: 'newR' });
  });
});

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

describe('logout', () => {
  it('POST /api/auth/logout 을 호출한다', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await logout();

    expect(mockPost).toHaveBeenCalledWith('/api/auth/logout');
  });

  it('반환값은 void (undefined) 이다', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    const result = await logout();

    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getMe
// ---------------------------------------------------------------------------

describe('getMe', () => {
  const mockUser = {
    id: 1,
    email: 'me@example.com',
    nickname: 'me',
    profileImageUrl: null,
    isProfilePublic: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    provider: 'LOCAL' as const,
  };

  it('GET /api/users/me 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: mockUser } });

    await getMe();

    expect(mockGet).toHaveBeenCalledWith('/api/users/me');
  });

  it('ApiResponse 에서 data.data 를 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: mockUser } });

    const result = await getMe();

    expect(result).toEqual(mockUser);
  });

  it('에러 시 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('unauthorized'));

    await expect(getMe()).rejects.toThrow('unauthorized');
  });
});
