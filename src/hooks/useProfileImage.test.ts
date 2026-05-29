import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import { EMPTY_SLOT, type ImageSlot } from '@/lib/image/imageSlot';
import type { ImageTransform, User } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockRequestProfileImageUpload = vi.hoisted(() => vi.fn());
const mockApplyProfileImage = vi.hoisted(() => vi.fn());
const mockRemoveProfileImage = vi.hoisted(() => vi.fn());
const mockRegenerateDefaultProfileImage = vi.hoisted(() => vi.fn());

// ── authStore mock ────────────────────────────────────────────────────────────
const mockSetUser = vi.hoisted(() => vi.fn());

vi.mock('@/store/authStore', () => ({
  default: {
    getState: vi.fn(() => ({ setUser: mockSetUser })),
  },
}));

vi.mock('@/api/user', () => ({
  requestProfileImageUpload: mockRequestProfileImageUpload,
  applyProfileImage: mockApplyProfileImage,
  removeProfileImage: mockRemoveProfileImage,
  regenerateDefaultProfileImage: mockRegenerateDefaultProfileImage,
  mapUserError: (error: unknown) => {
    const err = error as { response?: { status?: number; data?: { error?: { code?: string } } } };
    const status = err.response?.status;
    const code = err.response?.data?.error?.code;
    if (code === 'NICKNAME_TAKEN' || code === 'NICKNAME_ALREADY_EXISTS') {
      return 'NICKNAME_TAKEN';
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
  },
  USER_ERROR_MESSAGES: {
    NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
    INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
    INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
    INVALID_WITHDRAWAL_CONFIRMATION: '확인 문구가 일치하지 않습니다.',
    INVALID_VERIFICATION_CODE: '인증코드가 올바르지 않습니다.',
    VERIFICATION_CODE_EXPIRED: '인증코드가 만료되었어요. 다시 받아주세요.',
    RATE_LIMITED: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',
    PROFILE_PRIVATE: '비공개 프로필입니다.',
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    INVALID_INPUT: '입력값을 다시 확인해주세요.',
    UNAUTHORIZED: '로그인이 필요합니다.',
    NETWORK: '이미지 처리에 실패했어요.',
  },
}));

// ── axios.put mock ────────────────────────────────────────────────────────────
// axios default export 는 객체이므로 vi.mock 으로 put 만 stub
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      put: vi.fn(),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

import axios from 'axios';
import useProfileImage from './useProfileImage';

const mockAxiosPut = vi.mocked(axios.put);

// ── 가짜 axios 에러 생성 헬퍼 ─────────────────────────────────────────────
const makeAxiosError = (status: number, code?: string) =>
  Object.assign(new Error('AxiosError'), {
    isAxiosError: true,
    response: {
      status,
      data: code ? { error: { code } } : {},
    },
  });

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const MOCK_USER: User = {
  id: 1,
  email: 'test@example.com',
  nickname: 'woong',
  provider: 'LOCAL',
  profileImageUrl: 'https://cdn.example.com/avatar.jpg',
  bio: '안녕',
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

const ORIGINAL_PRESIGNED = {
  uploadUrl: 'https://s3.example.com/put-original',
  key: 'profile/original.png',
};
const CROPPED_PRESIGNED = {
  uploadUrl: 'https://s3.example.com/put-cropped',
  key: 'profile/cropped.webp',
};

const TRANSFORM: ImageTransform = {
  v: 1,
  flipH: false,
  rotate: 0,
  crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
};

const makeOriginalFile = () => new File(['original-data'], 'o.png', { type: 'image/png' });
const makeCroppedFile = () => new File(['cropped-data'], 'cropped.webp', { type: 'image/webp' });

/** 새 원본 + 크롭 결과를 모두 가진 슬롯 (재편집 후 제출). */
const makeEditedSlot = (): ImageSlot => ({
  ...EMPTY_SLOT,
  previewUrl: 'blob:preview',
  originalFile: makeOriginalFile(),
  croppedFile: makeCroppedFile(),
  transform: TRANSFORM,
});

/** 크롭 없이 원본만 (identity) — croppedKey === originalKey. */
const makeIdentitySlot = (): ImageSlot => ({
  ...EMPTY_SLOT,
  originalFile: makeOriginalFile(),
  transform: null,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, { value: { provider: () => new Map() } }, children);

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useProfileImage', () => {
  beforeEach(() => {
    mockRequestProfileImageUpload.mockReset();
    mockApplyProfileImage.mockReset();
    mockRemoveProfileImage.mockReset();
    mockRegenerateDefaultProfileImage.mockReset();
    mockAxiosPut.mockReset();
    mockSetUser.mockReset();
  });

  describe('applyEdited(slot) — 새 원본 + 크롭', () => {
    it('requestProfileImageUpload(원본·크롭) → axios.put(원본·크롭) → applyProfileImage 순서로 호출된다', async () => {
      const callOrder: string[] = [];
      mockRequestProfileImageUpload
        .mockImplementationOnce(async () => {
          callOrder.push('request:original');
          return ORIGINAL_PRESIGNED;
        })
        .mockImplementationOnce(async () => {
          callOrder.push('request:cropped');
          return CROPPED_PRESIGNED;
        });
      mockAxiosPut.mockImplementation(async () => {
        callOrder.push('axios.put');
        return { data: {} };
      });
      mockApplyProfileImage.mockImplementation(async () => {
        callOrder.push('applyProfileImage');
        return MOCK_USER;
      });

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(makeEditedSlot());
      });

      expect(callOrder).toEqual([
        'request:original',
        'axios.put',
        'request:cropped',
        'axios.put',
        'applyProfileImage',
      ]);
    });

    it('원본·크롭 각각 requestProfileImageUpload + axios.put 을 2회씩 호출한다', async () => {
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(makeEditedSlot());
      });

      expect(mockRequestProfileImageUpload).toHaveBeenCalledTimes(2);
      expect(mockAxiosPut).toHaveBeenCalledTimes(2);
    });

    it('requestProfileImageUpload 에 각 파일 메타({filename, contentType, sizeBytes}) 를 전달한다', async () => {
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const original = makeOriginalFile();
      const cropped = makeCroppedFile();
      const slot: ImageSlot = {
        ...EMPTY_SLOT,
        originalFile: original,
        croppedFile: cropped,
        transform: TRANSFORM,
      };

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(slot);
      });

      expect(mockRequestProfileImageUpload).toHaveBeenNthCalledWith(1, {
        filename: 'o.png',
        contentType: 'image/png',
        sizeBytes: original.size,
      });
      expect(mockRequestProfileImageUpload).toHaveBeenNthCalledWith(2, {
        filename: 'cropped.webp',
        contentType: 'image/webp',
        sizeBytes: cropped.size,
      });
    });

    it('응답에 requiredHeaders 가 없으면 기본 헤더(Content-Type + x-amz-tagging)로 PUT 한다', async () => {
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const original = makeOriginalFile();
      const cropped = makeCroppedFile();
      const slot: ImageSlot = {
        ...EMPTY_SLOT,
        originalFile: original,
        croppedFile: cropped,
        transform: TRANSFORM,
      };

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(slot);
      });

      expect(mockAxiosPut).toHaveBeenNthCalledWith(1, ORIGINAL_PRESIGNED.uploadUrl, original, {
        headers: { 'Content-Type': 'image/png', 'x-amz-tagging': 'status=pending' },
      });
      expect(mockAxiosPut).toHaveBeenNthCalledWith(2, CROPPED_PRESIGNED.uploadUrl, cropped, {
        headers: { 'Content-Type': 'image/webp', 'x-amz-tagging': 'status=pending' },
      });
    });

    it('응답에 requiredHeaders 가 있으면 그대로 PUT 헤더로 사용한다', async () => {
      const customHeaders = {
        'Content-Type': 'image/webp',
        'x-amz-tagging': 'status=pending',
        'x-extra-be-header': 'value',
      };
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce({ ...CROPPED_PRESIGNED, requiredHeaders: customHeaders });
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const slot = makeEditedSlot();

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(slot);
      });

      expect(mockAxiosPut).toHaveBeenNthCalledWith(
        2,
        CROPPED_PRESIGNED.uploadUrl,
        expect.any(File),
        {
          headers: customHeaders,
        },
      );
    });

    it('applyProfileImage 에 (croppedKey, originalKey, transform) 를 전달한다', async () => {
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(makeEditedSlot());
      });

      expect(mockApplyProfileImage).toHaveBeenCalledWith(
        CROPPED_PRESIGNED.key,
        ORIGINAL_PRESIGNED.key,
        TRANSFORM,
      );
    });

    it('성공 시 User 를 반환한다', async () => {
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = null;
      await act(async () => {
        returned = await result.current.applyEdited(makeEditedSlot());
      });

      expect(returned).toEqual(MOCK_USER);
    });

    it('requestProfileImageUpload 실패 → null 반환 + error 세팅', async () => {
      mockRequestProfileImageUpload.mockRejectedValue(makeAxiosError(401));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.applyEdited(makeEditedSlot());
      });

      expect(returned).toBeNull();
      expect(result.current.errorCode).toBe('UNAUTHORIZED');
      expect(result.current.error).toBeTruthy();
    });

    it('axios.put 실패 → null 반환 + error 세팅, applyProfileImage 미호출', async () => {
      mockRequestProfileImageUpload.mockResolvedValue(ORIGINAL_PRESIGNED);
      mockAxiosPut.mockRejectedValue(new Error('S3 error'));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.applyEdited(makeEditedSlot());
      });

      expect(returned).toBeNull();
      expect(mockApplyProfileImage).not.toHaveBeenCalled();
      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('applyProfileImage 실패 → null 반환 + errorCode 세팅', async () => {
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockRejectedValue(makeAxiosError(404));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.applyEdited(makeEditedSlot());
      });

      expect(returned).toBeNull();
      expect(result.current.errorCode).toBe('USER_NOT_FOUND');
    });

    it('applyEdited 성공 후 setUser 가 응답 user 로 호출된다', async () => {
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(makeEditedSlot());
      });

      expect(mockSetUser).toHaveBeenCalledTimes(1);
      expect(mockSetUser).toHaveBeenCalledWith(MOCK_USER);
    });

    it('applyEdited 실패 시 setUser 가 호출되지 않는다', async () => {
      mockRequestProfileImageUpload.mockRejectedValue(makeAxiosError(401));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.applyEdited(makeEditedSlot());
      });

      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('isProcessing 이 호출 중 true → 완료 후 false', async () => {
      let resolveApply!: (v: User) => void;
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockReturnValue(
        new Promise<User>((res) => {
          resolveApply = res;
        }),
      );

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      act(() => {
        result.current.applyEdited(makeEditedSlot());
      });

      // 비동기 진행 중 isProcessing=true 확인
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        resolveApply(MOCK_USER);
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('업로드 진행 중 isUploading 만 true (isRegenerating/isRemoving 는 false)', async () => {
      let resolveApply!: (v: User) => void;
      mockRequestProfileImageUpload
        .mockResolvedValueOnce(ORIGINAL_PRESIGNED)
        .mockResolvedValueOnce(CROPPED_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockReturnValue(
        new Promise<User>((res) => {
          resolveApply = res;
        }),
      );

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      act(() => {
        result.current.applyEdited(makeEditedSlot());
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isUploading).toBe(true);
      expect(result.current.isRegenerating).toBe(false);
      expect(result.current.isRemoving).toBe(false);
      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        resolveApply(MOCK_USER);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('applyEdited(slot) — 크롭 없음(identity) / 빈 슬롯', () => {
    it('크롭 안 함(transform=null) → upload 1회, applyProfileImage(key, key, null)', async () => {
      mockRequestProfileImageUpload.mockResolvedValue(ORIGINAL_PRESIGNED);
      mockAxiosPut.mockResolvedValue({ data: {} });
      mockApplyProfileImage.mockResolvedValue(MOCK_USER);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = null;
      await act(async () => {
        returned = await result.current.applyEdited(makeIdentitySlot());
      });

      expect(mockRequestProfileImageUpload).toHaveBeenCalledTimes(1);
      expect(mockAxiosPut).toHaveBeenCalledTimes(1);
      // resolveSlot 은 transform=null 을 undefined 로 정규화한다 (imageKey === originalKey).
      expect(mockApplyProfileImage).toHaveBeenCalledWith(
        ORIGINAL_PRESIGNED.key,
        ORIGINAL_PRESIGNED.key,
        undefined,
      );
      expect(returned).toEqual(MOCK_USER);
    });

    it('빈 슬롯 → null 반환, 업로드/applyProfileImage 미호출', async () => {
      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.applyEdited(EMPTY_SLOT);
      });

      expect(returned).toBeNull();
      expect(mockRequestProfileImageUpload).not.toHaveBeenCalled();
      expect(mockAxiosPut).not.toHaveBeenCalled();
      expect(mockApplyProfileImage).not.toHaveBeenCalled();
    });
  });

  describe('removeImage()', () => {
    it('removeProfileImage 를 호출한다', async () => {
      mockRemoveProfileImage.mockResolvedValue({ ...MOCK_USER, profileImageUrl: null });

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.removeImage();
      });

      expect(mockRemoveProfileImage).toHaveBeenCalledTimes(1);
    });

    it('성공 시 User 를 반환한다', async () => {
      const userWithoutImage = { ...MOCK_USER, profileImageUrl: null };
      mockRemoveProfileImage.mockResolvedValue(userWithoutImage);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = null;
      await act(async () => {
        returned = await result.current.removeImage();
      });

      expect(returned).toEqual(userWithoutImage);
    });

    it('실패 시 null 반환 + errorCode 세팅', async () => {
      mockRemoveProfileImage.mockRejectedValue(makeAxiosError(401));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.removeImage();
      });

      expect(returned).toBeNull();
      expect(result.current.errorCode).toBe('UNAUTHORIZED');
    });

    it('removeImage 성공 후 setUser 가 응답 user 로 호출된다', async () => {
      const userWithoutImage = { ...MOCK_USER, profileImageUrl: null };
      mockRemoveProfileImage.mockResolvedValue(userWithoutImage);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.removeImage();
      });

      expect(mockSetUser).toHaveBeenCalledTimes(1);
      expect(mockSetUser).toHaveBeenCalledWith(userWithoutImage);
    });

    it('removeImage 실패 시 setUser 가 호출되지 않는다', async () => {
      mockRemoveProfileImage.mockRejectedValue(makeAxiosError(401));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.removeImage();
      });

      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('removeImage 진행 중 isRemoving 만 true (isUploading/isRegenerating 는 false)', async () => {
      let resolveRemove!: (v: User) => void;
      mockRemoveProfileImage.mockReturnValue(
        new Promise<User>((res) => {
          resolveRemove = res;
        }),
      );

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      act(() => {
        result.current.removeImage();
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isRemoving).toBe(true);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.isRegenerating).toBe(false);
      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        resolveRemove({ ...MOCK_USER, profileImageUrl: null });
      });

      expect(result.current.isRemoving).toBe(false);
    });
  });

  describe('regenerateDefault()', () => {
    it('regenerateDefaultProfileImage 를 호출한다', async () => {
      mockRegenerateDefaultProfileImage.mockResolvedValue({
        ...MOCK_USER,
        profileImageUrl: 'https://cdn.example.com/default-new.png',
      });

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.regenerateDefault();
      });

      expect(mockRegenerateDefaultProfileImage).toHaveBeenCalledTimes(1);
    });

    it('성공 시 새 기본 이미지 URL 이 담긴 User 를 반환한다', async () => {
      const newDefaultUser = {
        ...MOCK_USER,
        profileImageUrl: 'https://cdn.example.com/default-new.png',
      };
      mockRegenerateDefaultProfileImage.mockResolvedValue(newDefaultUser);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = null;
      await act(async () => {
        returned = await result.current.regenerateDefault();
      });

      expect(returned).toEqual(newDefaultUser);
    });

    it('실패 시 null 반환 + errorCode 세팅', async () => {
      mockRegenerateDefaultProfileImage.mockRejectedValue(makeAxiosError(404));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      let returned: User | null = MOCK_USER;
      await act(async () => {
        returned = await result.current.regenerateDefault();
      });

      expect(returned).toBeNull();
      expect(result.current.errorCode).toBe('USER_NOT_FOUND');
    });

    it('regenerateDefault 성공 후 setUser 가 응답 user 로 호출된다', async () => {
      const newDefaultUser = {
        ...MOCK_USER,
        profileImageUrl: 'https://cdn.example.com/default-new.png',
      };
      mockRegenerateDefaultProfileImage.mockResolvedValue(newDefaultUser);

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.regenerateDefault();
      });

      expect(mockSetUser).toHaveBeenCalledTimes(1);
      expect(mockSetUser).toHaveBeenCalledWith(newDefaultUser);
    });

    it('regenerateDefault 실패 시 setUser 가 호출되지 않는다', async () => {
      mockRegenerateDefaultProfileImage.mockRejectedValue(makeAxiosError(404));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.regenerateDefault();
      });

      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('regenerateDefault 진행 중 isRegenerating 만 true (isUploading/isRemoving 는 false)', async () => {
      let resolveRegen!: (v: User) => void;
      mockRegenerateDefaultProfileImage.mockReturnValue(
        new Promise<User>((res) => {
          resolveRegen = res;
        }),
      );

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      act(() => {
        result.current.regenerateDefault();
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isRegenerating).toBe(true);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.isRemoving).toBe(false);
      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        resolveRegen({ ...MOCK_USER, profileImageUrl: 'new' });
      });

      expect(result.current.isRegenerating).toBe(false);
    });
  });

  describe('clearError()', () => {
    it('error 와 errorCode 를 null 로 초기화한다', async () => {
      mockRemoveProfileImage.mockRejectedValue(makeAxiosError(401));

      const { result } = renderHook(() => useProfileImage(), { wrapper });

      await act(async () => {
        await result.current.removeImage();
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.errorCode).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });
  });
});
