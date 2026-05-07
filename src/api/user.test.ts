import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { User } from '@/types';

vi.mock('./instance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import instance from './instance';
import {
  getMyProfile,
  getUserProfile,
  updateProfile,
  changePassword,
  requestProfileImageUpload,
  applyProfileImage,
  removeProfileImage,
  regenerateDefaultProfileImage,
  mapUserError,
} from './user';

const mockGet = vi.mocked(instance.get);
const mockPatch = vi.mocked(instance.patch);
const mockPost = vi.mocked(instance.post);
const mockDelete = vi.mocked(instance.delete);

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'test@example.com',
  nickname: 'tester',
  profileImageUrl: null,
  isProfilePublic: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  provider: 'LOCAL',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMyProfile', () => {
  it('GET /api/users/me 를 호출한다', async () => {
    const user = makeUser();
    mockGet.mockResolvedValueOnce({ data: { success: true, data: user } });

    await getMyProfile();

    expect(mockGet).toHaveBeenCalledWith('/api/users/me');
  });

  it('ApiResponse 에서 data.data 를 반환한다', async () => {
    const user = makeUser({ nickname: 'woong' });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await getMyProfile();

    expect(result).toEqual(user);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'));

    await expect(getMyProfile()).rejects.toThrow('network');
  });
});

describe('getUserProfile', () => {
  it('GET /api/users/:userId 를 호출한다', async () => {
    const user = makeUser({ id: 42 });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: user } });

    await getUserProfile(42);

    expect(mockGet).toHaveBeenCalledWith('/api/users/42');
  });

  it('ApiResponse 에서 data.data 를 반환한다', async () => {
    const user = makeUser({ id: 99, nickname: 'other' });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await getUserProfile(99);

    expect(result).toEqual(user);
  });

  it('userId 가 다른 경우 각각 다른 URL 로 호출한다', async () => {
    const user = makeUser();
    mockGet.mockResolvedValue({ data: { success: true, data: user } });

    await getUserProfile(1);
    await getUserProfile(2);

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/users/1');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/users/2');
  });
});

describe('updateProfile', () => {
  it('PATCH /api/users/me 를 올바른 페이로드로 호출한다', async () => {
    const user = makeUser({ nickname: 'newNick' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    await updateProfile({ nickname: 'newNick', bio: '안녕' });

    expect(mockPatch).toHaveBeenCalledWith('/api/users/me', { nickname: 'newNick', bio: '안녕' });
  });

  it('ApiResponse 에서 data.data 를 반환한다', async () => {
    const user = makeUser({ bio: '업데이트됨' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await updateProfile({ bio: '업데이트됨' });

    expect(result).toEqual(user);
  });

  it('isProfilePublic 만 담은 페이로드도 전달한다 (visibility 통합)', async () => {
    const user = makeUser({ isProfilePublic: false });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    await updateProfile({ isProfilePublic: false });

    expect(mockPatch).toHaveBeenCalledWith('/api/users/me', { isProfilePublic: false });
  });

  it('빈 페이로드도 전달한다', async () => {
    const user = makeUser();
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    await updateProfile({});

    expect(mockPatch).toHaveBeenCalledWith('/api/users/me', {});
  });
});

describe('requestProfileImageUpload', () => {
  const PAYLOAD = { filename: 'avatar.png', contentType: 'image/png', sizeBytes: 102400 };

  it('POST /api/users/me/profile-image 를 메타 body 와 함께 호출한다', async () => {
    const presigned = { uploadUrl: 'https://s3.example.com/upload', key: 'img/abc.jpg' };
    mockPost.mockResolvedValueOnce({ data: { success: true, data: presigned } });

    await requestProfileImageUpload(PAYLOAD);

    expect(mockPost).toHaveBeenCalledWith('/api/users/me/profile-image', PAYLOAD);
  });

  it('sizeBytes 가 없어도 동작한다 (선택 필드)', async () => {
    const presigned = { uploadUrl: 'https://s3.example.com/upload', key: 'img/abc.jpg' };
    mockPost.mockResolvedValueOnce({ data: { success: true, data: presigned } });

    await requestProfileImageUpload({ filename: 'a.png', contentType: 'image/png' });

    expect(mockPost).toHaveBeenCalledWith('/api/users/me/profile-image', {
      filename: 'a.png',
      contentType: 'image/png',
    });
  });

  it('응답에서 { uploadUrl, key } 를 반환한다', async () => {
    const presigned = { uploadUrl: 'https://s3.example.com/upload', key: 'img/abc.jpg' };
    mockPost.mockResolvedValueOnce({ data: { success: true, data: presigned } });

    const result = await requestProfileImageUpload(PAYLOAD);

    expect(result).toEqual(presigned);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('network'));

    await expect(requestProfileImageUpload(PAYLOAD)).rejects.toThrow('network');
  });
});

describe('applyProfileImage', () => {
  it('PATCH /api/users/me/profile-image 를 { key } body 로 호출한다', async () => {
    const user = makeUser({ profileImageUrl: 'https://cdn.example.com/img/abc.jpg' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    await applyProfileImage('img/abc.jpg');

    expect(mockPatch).toHaveBeenCalledWith('/api/users/me/profile-image', { key: 'img/abc.jpg' });
  });

  it('업데이트된 User 를 반환한다', async () => {
    const user = makeUser({ profileImageUrl: 'https://cdn.example.com/img/abc.jpg' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await applyProfileImage('img/abc.jpg');

    expect(result).toEqual(user);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPatch.mockRejectedValueOnce(new Error('forbidden'));

    await expect(applyProfileImage('img/abc.jpg')).rejects.toThrow('forbidden');
  });
});

describe('removeProfileImage', () => {
  it('DELETE /api/users/me/profile-image 를 호출한다', async () => {
    const user = makeUser({ profileImageUrl: null });
    mockDelete.mockResolvedValueOnce({ data: { success: true, data: user } });

    await removeProfileImage();

    expect(mockDelete).toHaveBeenCalledWith('/api/users/me/profile-image');
  });

  it('업데이트된 User 를 반환한다', async () => {
    const user = makeUser({ profileImageUrl: null });
    mockDelete.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await removeProfileImage();

    expect(result).toEqual(user);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockDelete.mockRejectedValueOnce(new Error('not found'));

    await expect(removeProfileImage()).rejects.toThrow('not found');
  });
});

describe('regenerateDefaultProfileImage', () => {
  it('POST /api/users/me/profile-image/default 를 호출한다', async () => {
    const user = makeUser({ profileImageUrl: 'https://cdn.example.com/default.png' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: user } });

    await regenerateDefaultProfileImage();

    expect(mockPost).toHaveBeenCalledWith('/api/users/me/profile-image/default');
  });

  it('새로운 기본 이미지 URL 이 포함된 User 를 반환한다', async () => {
    const user = makeUser({ profileImageUrl: 'https://cdn.example.com/default.png' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await regenerateDefaultProfileImage();

    expect(result).toEqual(user);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('server error'));

    await expect(regenerateDefaultProfileImage()).rejects.toThrow('server error');
  });
});

describe('changePassword', () => {
  it('PATCH /api/users/me/password 를 페이로드와 함께 호출한다', async () => {
    mockPatch.mockResolvedValueOnce({ data: {} });

    await changePassword({ currentPassword: 'oldPw123!', newPassword: 'newPw456!' });

    expect(mockPatch).toHaveBeenCalledWith('/api/users/me/password', {
      currentPassword: 'oldPw123!',
      newPassword: 'newPw456!',
    });
  });

  it('반환값은 void (undefined) 이다', async () => {
    mockPatch.mockResolvedValueOnce({ data: {} });

    const result = await changePassword({ currentPassword: 'a', newPassword: 'b' });

    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// mapUserError
// ---------------------------------------------------------------------------

const makeAxiosError = (
  status?: number,
  code?: string,
): { response?: { status: number; data?: { error?: { code?: string } } } } => ({
  response:
    status !== undefined
      ? {
          status,
          data: code ? { error: { code } } : undefined,
        }
      : undefined,
});

describe('mapUserError', () => {
  describe('code 기반 매핑', () => {
    it('code NICKNAME_TAKEN → NICKNAME_TAKEN', () => {
      expect(mapUserError(makeAxiosError(409, 'NICKNAME_TAKEN'))).toBe('NICKNAME_TAKEN');
    });

    it('code NICKNAME_ALREADY_EXISTS → NICKNAME_TAKEN', () => {
      expect(mapUserError(makeAxiosError(409, 'NICKNAME_ALREADY_EXISTS'))).toBe('NICKNAME_TAKEN');
    });

    it('code INVALID_PASSWORD → INVALID_PASSWORD', () => {
      expect(mapUserError(makeAxiosError(400, 'INVALID_PASSWORD'))).toBe('INVALID_PASSWORD');
    });

    it('code PROFILE_PRIVATE → PROFILE_PRIVATE', () => {
      expect(mapUserError(makeAxiosError(403, 'PROFILE_PRIVATE'))).toBe('PROFILE_PRIVATE');
    });

    it('code USER_NOT_FOUND → USER_NOT_FOUND', () => {
      expect(mapUserError(makeAxiosError(404, 'USER_NOT_FOUND'))).toBe('USER_NOT_FOUND');
    });

    it('code INVALID_INPUT → INVALID_INPUT', () => {
      expect(mapUserError(makeAxiosError(400, 'INVALID_INPUT'))).toBe('INVALID_INPUT');
    });
  });

  describe('status 기반 매핑 (code 없음)', () => {
    it('status 404 → USER_NOT_FOUND', () => {
      expect(mapUserError(makeAxiosError(404))).toBe('USER_NOT_FOUND');
    });

    it('status 400 → INVALID_INPUT', () => {
      expect(mapUserError(makeAxiosError(400))).toBe('INVALID_INPUT');
    });

    it('status 401 → UNAUTHORIZED', () => {
      expect(mapUserError(makeAxiosError(401))).toBe('UNAUTHORIZED');
    });

    it('status 403 (code 없음) → PROFILE_PRIVATE', () => {
      expect(mapUserError(makeAxiosError(403))).toBe('PROFILE_PRIVATE');
    });
  });

  describe('code 가 status 보다 우선 적용', () => {
    it('status 400 이지만 code INVALID_PASSWORD 이면 INVALID_PASSWORD 를 반환한다', () => {
      expect(mapUserError(makeAxiosError(400, 'INVALID_PASSWORD'))).toBe('INVALID_PASSWORD');
    });

    it('status 400 이지만 code NICKNAME_TAKEN 이면 NICKNAME_TAKEN 을 반환한다', () => {
      expect(mapUserError(makeAxiosError(400, 'NICKNAME_TAKEN'))).toBe('NICKNAME_TAKEN');
    });

    it('status 404 이지만 code PROFILE_PRIVATE 이면 PROFILE_PRIVATE 를 반환한다', () => {
      // code 매핑이 status 매핑보다 먼저 체크됨
      expect(mapUserError(makeAxiosError(404, 'PROFILE_PRIVATE'))).toBe('PROFILE_PRIVATE');
    });

    it('status 403 이지만 code USER_NOT_FOUND 이면 USER_NOT_FOUND 를 반환한다', () => {
      expect(mapUserError(makeAxiosError(403, 'USER_NOT_FOUND'))).toBe('USER_NOT_FOUND');
    });
  });

  describe('NETWORK fallback', () => {
    it('response 없는 에러(네트워크 단절) → NETWORK', () => {
      expect(mapUserError({})).toBe('NETWORK');
    });

    it('response 가 undefined → NETWORK', () => {
      expect(mapUserError({ response: undefined })).toBe('NETWORK');
    });

    it('알 수 없는 status (500) + code 없음 → NETWORK', () => {
      expect(mapUserError(makeAxiosError(500))).toBe('NETWORK');
    });

    it('문자열 에러 → NETWORK', () => {
      expect(mapUserError('some string error')).toBe('NETWORK');
    });
  });
});
