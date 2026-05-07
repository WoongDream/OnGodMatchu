import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import useUpdateQuiz from './useUpdateQuiz';
import { ImageUploadError } from './useUploadImage';
import type { Quiz } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockUpdateQuiz = vi.hoisted(() => vi.fn());
const mockUploadImage = vi.hoisted(() => vi.fn());

vi.mock('@/api/quiz', () => ({
  updateQuiz: mockUpdateQuiz,
  mapQuizError: (error: unknown): string => {
    const err = error as { response?: { status?: number; data?: { error?: { code?: string } } } };
    const status = err.response?.status;
    const code = err.response?.data?.error?.code;
    if (code === 'QUIZ_NOT_FOUND' || status === 404) {
      return 'QUIZ_NOT_FOUND';
    }
    if (code === 'QUIZ_FORBIDDEN' || code === 'FORBIDDEN' || status === 403) {
      return 'FORBIDDEN';
    }
    if (code === 'INVALID_INPUT' || status === 400) {
      return 'INVALID_INPUT';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    return 'NETWORK';
  },
}));

vi.mock('@/api/upload', () => ({
  uploadImage: mockUploadImage,
}));

// ── 가짜 axios 에러 생성 헬퍼 ─────────────────────────────────────────────
const makeAxiosError = (status: number, code?: string): AxiosError => {
  const err = new AxiosError('failed');
  err.response = {
    status,
    data: code ? { error: { code } } : {},
    headers: {},
    config: {} as never,
    statusText: '',
  };
  return err;
};

// ── 샘플 Quiz ─────────────────────────────────────────────────────────────────
const MOCK_QUIZ: Quiz = {
  id: 1,
  authorNickname: 'woong',
  title: '테스트 퀴즈',
  description: '설명',
  category: 'game',
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 0,
  isPublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

const thumbFile = new File(['img'], 'thumb.png', { type: 'image/png' });

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useUpdateQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('error/errorCode null, isSubmitting false', () => {
      const { result } = renderHook(() => useUpdateQuiz());

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('thumbnailFile 없을 때', () => {
    it('uploadImage 를 호출하지 않고 updateQuiz 를 직접 호출한다', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: '새 제목' });
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(mockUpdateQuiz).toHaveBeenCalledWith(1, { title: '새 제목' });
    });

    it('성공 시 Quiz 를 반환한다', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      let returned: Quiz | null = null;
      await act(async () => {
        returned = await result.current.submit(1, { title: '새 제목' });
      });

      expect(returned).toEqual(MOCK_QUIZ);
    });

    it('thumbnailFile=null 일 때도 uploadImage 를 호출하지 않는다', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: '제목', thumbnailFile: null });
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
    });
  });

  describe('thumbnailFile 있을 때', () => {
    it('uploadImage 를 먼저 호출한 후 thumbnailKey 를 포함해 updateQuiz 를 호출한다', async () => {
      mockUploadImage.mockResolvedValue('quiz-thumbnails/thumb.png');
      mockUpdateQuiz.mockResolvedValue({ ...MOCK_QUIZ, thumbnailKey: 'quiz-thumbnails/thumb.png' });
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: '새 제목', thumbnailFile: thumbFile });
      });

      expect(mockUploadImage).toHaveBeenCalledWith(thumbFile);
      expect(mockUpdateQuiz).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ thumbnailKey: 'quiz-thumbnails/thumb.png' }),
      );
    });

    it('성공 시 업로드된 thumbnailKey 가 포함된 Quiz 를 반환한다', async () => {
      const updatedQuiz = { ...MOCK_QUIZ, thumbnailKey: 'quiz-thumbnails/thumb.png' };
      mockUploadImage.mockResolvedValue('quiz-thumbnails/thumb.png');
      mockUpdateQuiz.mockResolvedValue(updatedQuiz);
      const { result } = renderHook(() => useUpdateQuiz());

      let returned: Quiz | null = null;
      await act(async () => {
        returned = await result.current.submit(1, { thumbnailFile: thumbFile });
      });

      expect(returned).toEqual(updatedQuiz);
    });

    it('thumbnailFile 은 updateQuiz payload 에서 제외된다', async () => {
      mockUploadImage.mockResolvedValue('key/thumb.png');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: '제목', thumbnailFile: thumbFile });
      });

      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg).not.toHaveProperty('thumbnailFile');
    });
  });

  describe('ImageUploadError 시', () => {
    it('errorCode=IMAGE_UPLOAD_FAILED 로 세팅된다', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('PUT_FAILED'));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { thumbnailFile: thumbFile });
      });

      expect(result.current.errorCode).toBe('IMAGE_UPLOAD_FAILED');
    });

    it('null 을 반환하고 updateQuiz 는 호출하지 않는다', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('PRESIGNED_FAILED'));
      const { result } = renderHook(() => useUpdateQuiz());

      let returned: Quiz | null = MOCK_QUIZ;
      await act(async () => {
        returned = await result.current.submit(1, { thumbnailFile: thumbFile });
      });

      expect(returned).toBeNull();
      expect(mockUpdateQuiz).not.toHaveBeenCalled();
    });

    it('error 메시지가 세팅된다', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('NETWORK'));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { thumbnailFile: thumbFile });
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('axios 에러 매핑', () => {
    it('401 → errorCode=UNAUTHORIZED', async () => {
      mockUpdateQuiz.mockRejectedValue(makeAxiosError(401));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: 'x' });
      });

      expect(result.current.errorCode).toBe('UNAUTHORIZED');
      expect(result.current.error).toBeTruthy();
    });

    it('404 → errorCode=QUIZ_NOT_FOUND', async () => {
      mockUpdateQuiz.mockRejectedValue(makeAxiosError(404));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: 'x' });
      });

      expect(result.current.errorCode).toBe('QUIZ_NOT_FOUND');
    });

    it('403 → errorCode=FORBIDDEN', async () => {
      mockUpdateQuiz.mockRejectedValue(makeAxiosError(403));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: 'x' });
      });

      expect(result.current.errorCode).toBe('FORBIDDEN');
    });

    it('400 → errorCode=INVALID_INPUT', async () => {
      mockUpdateQuiz.mockRejectedValue(makeAxiosError(400));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: 'x' });
      });

      expect(result.current.errorCode).toBe('INVALID_INPUT');
    });

    it('일반 axios 에러는 mapQuizError 결과를 사용한다', async () => {
      // status 없는 axios 에러 → mapQuizError → NETWORK
      const err = new AxiosError('axios no status');
      mockUpdateQuiz.mockRejectedValue(err);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: 'x' });
      });

      expect(result.current.errorCode).toBe('NETWORK');
    });
  });

  describe('비-axios 에러', () => {
    it('비-axios 에러 → errorCode=NETWORK', async () => {
      mockUpdateQuiz.mockRejectedValue(new TypeError('boom'));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: 'x' });
      });

      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('null 을 반환한다', async () => {
      mockUpdateQuiz.mockRejectedValue(new Error('unknown'));
      const { result } = renderHook(() => useUpdateQuiz());

      let returned: Quiz | null = MOCK_QUIZ;
      await act(async () => {
        returned = await result.current.submit(1, { title: 'x' });
      });

      expect(returned).toBeNull();
    });
  });

  describe('isSubmitting', () => {
    it('submit 동안 true 가 되고 완료 후 false 가 된다', async () => {
      let resolveUpdate!: (v: Quiz) => void;
      mockUpdateQuiz.mockReturnValue(
        new Promise<Quiz>((res) => {
          resolveUpdate = res;
        }),
      );

      const { result } = renderHook(() => useUpdateQuiz());
      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.submit(1, { title: 'x' });
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => {
        resolveUpdate(MOCK_QUIZ);
      });
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('clearError()', () => {
    it('error 와 errorCode 를 null 로 초기화한다', async () => {
      mockUpdateQuiz.mockRejectedValue(makeAxiosError(401));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: 'x' });
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.errorCode).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });

    it('성공 후 errorCode 는 null 이다', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: '성공' });
      });

      expect(result.current.errorCode).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
