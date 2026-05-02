import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AxiosError } from 'axios';
import useUploadImage, { ImageUploadError } from './useUploadImage';

const mockRequestUploadUrl = vi.hoisted(() => vi.fn());
const mockUploadFileToPresignedUrl = vi.hoisted(() => vi.fn());
const mockNotifyUploadComplete = vi.hoisted(() => vi.fn());

vi.mock('@/api/upload', async () => {
  const actual = await vi.importActual<typeof import('@/api/upload')>('@/api/upload');
  return {
    ...actual,
    requestUploadUrl: mockRequestUploadUrl,
    uploadFileToPresignedUrl: mockUploadFileToPresignedUrl,
    notifyUploadComplete: mockNotifyUploadComplete,
    uploadImage: async (file: File) => {
      const { uploadUrl, key } = await mockRequestUploadUrl(file);
      await mockUploadFileToPresignedUrl(file, uploadUrl);
      await mockNotifyUploadComplete(key);
      return key;
    },
  };
});

const makeAxiosError = (config: { url?: string } = {}): AxiosError => {
  const err = new AxiosError('boom');
  err.config = config as never;
  return err;
};

const file = new File(['data'], 'sample.png', { type: 'image/png' });

describe('useUploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns key on success', async () => {
    mockRequestUploadUrl.mockResolvedValue({
      uploadUrl: 'https://s3/upload',
      key: 'quiz-images/abc.png',
      expiresIn: 600,
    });
    mockUploadFileToPresignedUrl.mockResolvedValue(undefined);
    mockNotifyUploadComplete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUploadImage());
    let key: string | undefined;
    await act(async () => {
      key = await result.current.upload(file);
    });

    expect(key).toBe('quiz-images/abc.png');
    expect(mockRequestUploadUrl).toHaveBeenCalledWith(file);
    expect(mockUploadFileToPresignedUrl).toHaveBeenCalledWith(file, 'https://s3/upload');
    expect(mockNotifyUploadComplete).toHaveBeenCalledWith('quiz-images/abc.png');
  });

  it('throws ImageUploadError(PRESIGNED_FAILED) when presigned call fails', async () => {
    mockRequestUploadUrl.mockRejectedValue(makeAxiosError({ url: '/api/upload/presigned' }));

    const { result } = renderHook(() => useUploadImage());
    await act(async () => {
      await expect(result.current.upload(file)).rejects.toMatchObject({
        code: 'PRESIGNED_FAILED',
      });
    });
  });

  it('throws ImageUploadError(PUT_FAILED) when PUT to S3 fails', async () => {
    mockRequestUploadUrl.mockResolvedValue({
      uploadUrl: 'https://s3/upload',
      key: 'k',
      expiresIn: 600,
    });
    mockUploadFileToPresignedUrl.mockRejectedValue(makeAxiosError({ url: 'https://s3/upload' }));

    const { result } = renderHook(() => useUploadImage());
    await act(async () => {
      await expect(result.current.upload(file)).rejects.toMatchObject({
        code: 'PUT_FAILED',
      });
    });
  });

  it('throws ImageUploadError(COMPLETE_NOTIFY_FAILED) when complete call fails', async () => {
    mockRequestUploadUrl.mockResolvedValue({
      uploadUrl: 'https://s3/upload',
      key: 'k',
      expiresIn: 600,
    });
    mockUploadFileToPresignedUrl.mockResolvedValue(undefined);
    mockNotifyUploadComplete.mockRejectedValue(makeAxiosError({ url: '/api/upload/complete' }));

    const { result } = renderHook(() => useUploadImage());
    await act(async () => {
      await expect(result.current.upload(file)).rejects.toMatchObject({
        code: 'COMPLETE_NOTIFY_FAILED',
      });
    });
  });

  it('throws ImageUploadError(NETWORK) for non-axios errors', async () => {
    mockRequestUploadUrl.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useUploadImage());
    await act(async () => {
      await expect(result.current.upload(file)).rejects.toBeInstanceOf(ImageUploadError);
    });
  });

  it('toggles isUploading around the request', async () => {
    let resolveFn: ((value: { uploadUrl: string; key: string; expiresIn: number }) => void) | null =
      null;
    mockRequestUploadUrl.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve;
        }),
    );
    mockUploadFileToPresignedUrl.mockResolvedValue(undefined);
    mockNotifyUploadComplete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUploadImage());
    expect(result.current.isUploading).toBe(false);

    let promise: Promise<string>;
    await act(async () => {
      promise = result.current.upload(file);
    });
    expect(result.current.isUploading).toBe(true);

    await act(async () => {
      resolveFn?.({ uploadUrl: 'u', key: 'k', expiresIn: 600 });
      await promise!;
    });
    expect(result.current.isUploading).toBe(false);
  });
});
