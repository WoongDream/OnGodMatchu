import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { AxiosError } from 'axios';
import useCreateQuiz from './useCreateQuiz';
import { ImageUploadError } from './useUploadImage';
import { EMPTY_SLOT, slotFromServer, type ImageSlot } from '@/lib/image/imageSlot';
import { createEmptyQuestion, type DraftQuestion } from '@/features/quiz/create/questionTypes';
import type { ImageTransform } from '@/types';

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

const TRANSFORM: ImageTransform = {
  v: 1,
  flipH: false,
  rotate: 90,
  crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
};

const originalFile = (name: string) => new File(['orig'], name, { type: 'image/png' });
const croppedFile = () => new File(['cropped'], 'cropped.webp', { type: 'image/webp' });

const makeQuestion = (overrides: Partial<DraftQuestion> = {}): DraftQuestion => ({
  ...createEmptyQuestion(),
  questionText: '문제1',
  answer: '정답1',
  image: { ...EMPTY_SLOT },
  answerImage: { ...EMPTY_SLOT },
  answerImageSameAsQuestion: true,
  ...overrides,
});

const baseParams = (): {
  title: string;
  description: string;
  category: 'game';
  thumbnail: ImageSlot;
  isPublic: false;
  questions: DraftQuestion[];
} => ({
  title: '제목',
  description: '설명',
  category: 'game',
  thumbnail: { ...EMPTY_SLOT },
  isPublic: false,
  questions: [makeQuestion()],
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
    it('이미지 없는 빈 슬롯이면 업로드 없이 createQuiz 직접 호출', async () => {
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
        originalThumbnailKey: undefined,
        thumbnailTransform: undefined,
        isPublic: false,
        questions: [
          {
            imageKey: undefined,
            originalImageKey: undefined,
            imageTransform: undefined,
            answerImageKey: undefined,
            originalAnswerImageKey: undefined,
            answerImageTransform: undefined,
            questionText: '문제1',
            answer: '정답1',
          },
        ],
      });
      expect(returned).toEqual({ id: 42 });
    });

    it('크롭 안 한 새 썸네일/문제 이미지(transform=null) → imageKey=원본 업로드 키', async () => {
      const thumbOrig = originalFile('thumb.png');
      const qOrig = originalFile('q1.png');
      mockUploadImage
        .mockResolvedValueOnce('quiz-thumbnails/thumb.png')
        .mockResolvedValueOnce('quiz-questions/q1.png');
      mockCreateQuiz.mockResolvedValue({ id: 7 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.thumbnail = { ...EMPTY_SLOT, originalFile: thumbOrig, transform: null };
      params.questions[0].image = { ...EMPTY_SLOT, originalFile: qOrig, transform: null };

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockUploadImage).toHaveBeenCalledWith(thumbOrig);
      expect(mockUploadImage).toHaveBeenCalledWith(qOrig);
      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          thumbnailKey: 'quiz-thumbnails/thumb.png',
          originalThumbnailKey: 'quiz-thumbnails/thumb.png',
          thumbnailTransform: undefined,
          questions: [
            expect.objectContaining({
              imageKey: 'quiz-questions/q1.png',
              originalImageKey: 'quiz-questions/q1.png',
              imageTransform: undefined,
            }),
          ],
        }),
      );
    });

    it('원본+크롭 둘 다 있는 썸네일 → originalThumbnailKey(원본)+thumbnailKey(크롭)+thumbnailTransform', async () => {
      const thumbOrig = originalFile('thumb.png');
      const thumbCropped = croppedFile();
      // resolveSlot 순서: 원본 먼저 업로드 → 크롭 업로드
      mockUploadImage
        .mockResolvedValueOnce('quiz-thumbnails/original.png')
        .mockResolvedValueOnce('quiz-thumbnails/cropped.webp');
      mockCreateQuiz.mockResolvedValue({ id: 8 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.thumbnail = {
        ...EMPTY_SLOT,
        originalFile: thumbOrig,
        croppedFile: thumbCropped,
        transform: TRANSFORM,
      };

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockUploadImage).toHaveBeenNthCalledWith(1, thumbOrig);
      expect(mockUploadImage).toHaveBeenNthCalledWith(2, thumbCropped);
      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          originalThumbnailKey: 'quiz-thumbnails/original.png',
          thumbnailKey: 'quiz-thumbnails/cropped.webp',
          thumbnailTransform: TRANSFORM,
        }),
      );
    });

    it('원본+크롭 둘 다 있는 문제 이미지 → originalImageKey+imageKey+imageTransform', async () => {
      const qOrig = originalFile('q1.png');
      const qCropped = croppedFile();
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/original.png')
        .mockResolvedValueOnce('quiz-questions/cropped.webp');
      mockCreateQuiz.mockResolvedValue({ id: 9 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].image = {
        ...EMPTY_SLOT,
        originalFile: qOrig,
        croppedFile: qCropped,
        transform: TRANSFORM,
      };

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [
            expect.objectContaining({
              originalImageKey: 'quiz-questions/original.png',
              imageKey: 'quiz-questions/cropped.webp',
              imageTransform: TRANSFORM,
            }),
          ],
        }),
      );
    });

    it('answerImageSameAsQuestion=true 면 answer 키들을 question 키와 동일하게 보낸다', async () => {
      const qOrig = originalFile('q1.png');
      const qCropped = croppedFile();
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/original.png')
        .mockResolvedValueOnce('quiz-questions/cropped.webp');
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].image = {
        ...EMPTY_SLOT,
        originalFile: qOrig,
        croppedFile: qCropped,
        transform: TRANSFORM,
      };
      params.questions[0].answerImageSameAsQuestion = true;

      await act(async () => {
        await result.current.submit(params);
      });

      // 정답 이미지를 별도로 업로드하지 않음 (question 업로드 2회만)
      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [
            expect.objectContaining({
              imageKey: 'quiz-questions/cropped.webp',
              originalImageKey: 'quiz-questions/original.png',
              imageTransform: TRANSFORM,
              answerImageKey: 'quiz-questions/cropped.webp',
              originalAnswerImageKey: 'quiz-questions/original.png',
              answerImageTransform: TRANSFORM,
            }),
          ],
        }),
      );
    });

    it('answerImageSameAsQuestion=false 면 정답 이미지를 별도 업로드한다', async () => {
      const qOrig = originalFile('q1.png');
      const aOrig = originalFile('a1.png');
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/q1.png')
        .mockResolvedValueOnce('quiz-answers/a1.png');
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].image = { ...EMPTY_SLOT, originalFile: qOrig, transform: null };
      params.questions[0].answerImage = { ...EMPTY_SLOT, originalFile: aOrig, transform: null };
      params.questions[0].answerImageSameAsQuestion = false;

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockUploadImage).toHaveBeenCalledWith(qOrig);
      expect(mockUploadImage).toHaveBeenCalledWith(aOrig);
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

    it('기존 서버 이미지 슬롯(slotFromServer, transform=null) → imageKey 그대로 유지', async () => {
      // transform=null + croppedFile 없음 + originalFile 없음 → imageKey = originalImageKey(=null) → undefined
      // slotFromServer 는 imageKey 를 갖지만 transform=null 이라 imageKey 는 원본키로 대체됨.
      // 원본 재업로드가 없으므로 originalImageKey=null → imageKey=undefined.
      mockCreateQuiz.mockResolvedValue({ id: 1 });
      const { result } = renderUseCreateQuiz();

      const params = baseParams();
      params.questions[0].image = slotFromServer({
        imageKey: 'k',
        imageUrl: 'u',
        transform: TRANSFORM,
      });

      await act(async () => {
        await result.current.submit(params);
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      // transform != null, croppedFile 없음 → imageKey = slot.imageKey = 'k'
      expect(mockCreateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: [
            expect.objectContaining({
              imageKey: 'k',
              imageTransform: TRANSFORM,
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
      params.thumbnail = {
        ...EMPTY_SLOT,
        originalFile: originalFile('thumb.png'),
        transform: null,
      };

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
