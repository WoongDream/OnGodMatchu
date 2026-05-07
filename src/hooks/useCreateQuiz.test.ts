import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { AxiosError } from 'axios';
import useCreateQuiz from './useCreateQuiz';
import { ImageUploadError } from './useUploadImage';

const mockNavigate = vi.hoisted(() => vi.fn());
const mockCreateQuiz = vi.hoisted(() => vi.fn());
const mockUploadImage = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/api/quiz', () => ({ createQuiz: mockCreateQuiz }));
vi.mock('@/api/upload', () => ({ uploadImage: mockUploadImage }));

const makeAxiosError = (status: number, data: unknown = {}): AxiosError => {
  const err = new AxiosError('failed');
  err.response = { status, data, headers: {}, config: {} as never, statusText: '' };
  return err;
};

const renderUseCreateQuiz = () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(MemoryRouter, null, children);
  return renderHook(() => useCreateQuiz(), { wrapper });
};

const thumbFile = new File(['a'], 'thumb.png', { type: 'image/png' });
const qFile1 = new File(['b'], 'q1.png', { type: 'image/png' });

type Q = {
  imageFile: File | null;
  answerImageFile?: File | null;
  answerImageSameAsQuestion?: boolean;
  questionText: string;
  answer: string;
};

const baseParams = (): {
  title: string;
  description: string;
  category: 'game';
  thumbnailFile: File | null;
  isPublic: false;
  questions: Q[];
} => ({
  title: '제목',
  description: '설명',
  category: 'game',
  thumbnailFile: null,
  isPublic: false,
  questions: [
    {
      imageFile: null,
      questionText: '문제1',
      answer: '정답1',
    },
  ],
});

describe('useCreateQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('error/errorCode null, isSubmitting false', () => {
      const { result } = renderUseCreateQuiz();
      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('성공 시나리오', () => {
    it('이미지 없이 createQuiz 직접 호출', async () => {
      mockCreateQuiz.mockResolvedValue({ id: 42 });
      const { result } = renderUseCreateQuiz();

      let returned: { id: number } | null = null;
      await act(async () => {
        returned = await result.current.submit(baseParams());
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(mockCreateQuiz).toHaveBeenCalledWith({
        title: '제목',
        description: '설명',
        category: 'game',
        thumbnailKey: undefined,
        isPublic: false,
        questions: [
          {
            imageKey: undefined,
            answerImageKey: undefined,
            questionText: '문제1',
            answer: '정답1',
          },
        ],
      });
      expect(returned).toEqual({ id: 42 });
    });

    it('썸네일 + 문제 이미지 병렬 업로드 후 key 를 payload 에 매핑', async () => {
      mockUploadImage
        .mockResolvedValueOnce('quiz-thumbnails/thumb.png')
        .mockResolvedValueOnce('quiz-questions/q1.png');
      mockCreateQuiz.mockResolvedValue({ id: 7 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.thumbnailFile = thumbFile;
      params.questions[0].imageFile = qFile1;

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockUploadImage).toHaveBeenCalledWith(thumbFile);
      expect(mockUploadImage).toHaveBeenCalledWith(qFile1);
      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          thumbnailKey: 'quiz-thumbnails/thumb.png',
          questions: [expect.objectContaining({ imageKey: 'quiz-questions/q1.png' })],
        }),
      );
    });

    it('answerImageSameAsQuestion=true 면 answerImageKey 를 imageKey 와 동일하게 보낸다', async () => {
      mockUploadImage.mockResolvedValueOnce('quiz-questions/q1.png');
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].imageFile = qFile1;
      params.questions[0].answerImageSameAsQuestion = true;

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(1);
      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [
            expect.objectContaining({
              imageKey: 'quiz-questions/q1.png',
              answerImageKey: 'quiz-questions/q1.png',
            }),
          ],
        }),
      );
    });

    it('answerImageSameAsQuestion=false 면 정답 이미지를 별도 업로드한다', async () => {
      const answerFile = new File(['c'], 'a1.png', { type: 'image/png' });
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/q1.png')
        .mockResolvedValueOnce('quiz-answers/a1.png');
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].imageFile = qFile1;
      params.questions[0].answerImageFile = answerFile;
      params.questions[0].answerImageSameAsQuestion = false;

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [
            expect.objectContaining({
              imageKey: 'quiz-questions/q1.png',
              answerImageKey: 'quiz-answers/a1.png',
            }),
          ],
        }),
      );
    });

    it('description 빈값이면 undefined 로 전송', async () => {
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.description = '   ';

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined }),
      );
    });

    it('questionText 빈값이면 undefined 로 전송', async () => {
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].questionText = '';

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [expect.objectContaining({ questionText: undefined })],
        }),
      );
    });

    it('답 양옆 공백을 trim 한다', async () => {
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].answer = '  정답  ';

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [expect.objectContaining({ answer: '정답' })],
        }),
      );
    });
  });

  describe('에러 매핑', () => {
    it('이미지 업로드 실패 → IMAGE_UPLOAD_FAILED', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('PUT_FAILED'));
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.thumbnailFile = thumbFile;

      let returned: unknown;
      await act(async () => {
        returned = await result.current.submit(params);
      });

      expect(returned).toBeNull();
      expect(result.current.errorCode).toBe('IMAGE_UPLOAD_FAILED');
      expect(mockCreateQuiz).not.toHaveBeenCalled();
    });

    const cases = [
      {
        name: 'INVALID_INPUT via code',
        err: makeAxiosError(400, { error: { code: 'INVALID_INPUT' } }),
        expected: 'INVALID_INPUT',
      },
      {
        name: 'INVALID_INPUT via 400 fallback',
        err: makeAxiosError(400),
        expected: 'INVALID_INPUT',
      },
      {
        name: 'INVALID_CATEGORY via code',
        err: makeAxiosError(400, { error: { code: 'INVALID_CATEGORY' } }),
        expected: 'INVALID_CATEGORY',
      },
      { name: 'UNAUTHORIZED via 401', err: makeAxiosError(401), expected: 'UNAUTHORIZED' },
      { name: 'USER_NOT_FOUND via 404', err: makeAxiosError(404), expected: 'USER_NOT_FOUND' },
      {
        name: 'INTERNAL_SERVER_ERROR via 500',
        err: makeAxiosError(500),
        expected: 'INTERNAL_SERVER_ERROR',
      },
    ];

    cases.forEach((c) => {
      it(`${c.name} → ${c.expected}`, async () => {
        mockCreateQuiz.mockRejectedValue(c.err);
        const { result } = renderUseCreateQuiz();
        await act(async () => {
          await result.current.submit(baseParams());
        });
        expect(result.current.errorCode).toBe(c.expected);
        expect(result.current.error).toBeTruthy();
      });
    });

    it('UNAUTHORIZED 시 /login 으로 navigate', async () => {
      mockCreateQuiz.mockRejectedValue(makeAxiosError(401));
      const { result } = renderUseCreateQuiz();
      await act(async () => {
        await result.current.submit(baseParams());
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('axios 가 아닌 에러는 NETWORK', async () => {
      mockCreateQuiz.mockRejectedValue(new Error('boom'));
      const { result } = renderUseCreateQuiz();
      await act(async () => {
        await result.current.submit(baseParams());
      });
      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('clearError 가 error/errorCode 를 null 로 되돌린다', async () => {
      mockCreateQuiz.mockRejectedValue(makeAxiosError(400));
      const { result } = renderUseCreateQuiz();
      await act(async () => {
        await result.current.submit(baseParams());
      });
      expect(result.current.errorCode).toBe('INVALID_INPUT');

      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
    });
  });

  describe('isSubmitting', () => {
    it('submit 동안 true 가 되고 끝나면 false', async () => {
      let resolveCreate: ((value: { id: number }) => void) | null = null;
      mockCreateQuiz.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          }),
      );
      const { result } = renderUseCreateQuiz();
      expect(result.current.isSubmitting).toBe(false);

      let promise: Promise<unknown>;
      await act(async () => {
        promise = result.current.submit(baseParams());
      });
      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolveCreate?.({ id: 1 });
        await promise!;
      });
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
