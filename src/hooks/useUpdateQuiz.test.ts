import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import useUpdateQuiz from './useUpdateQuiz';
import { ImageUploadError } from './useUploadImage';
import { EMPTY_SLOT, slotFromServer } from '@/lib/image/imageSlot';
import { createEmptyQuestion, type DraftQuestion } from '@/features/quiz/create/questionTypes';
import type { ImageTransform, Quiz } from '@/types';

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
  starCount: 0,
  commentCount: 0,
  shareCount: 0,
  isStarred: null,
  isPublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

const TRANSFORM: ImageTransform = {
  v: 1,
  flipH: false,
  rotate: 90,
  crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
};

const originalFile = (name: string) => new File(['orig'], name, { type: 'image/png' });
const croppedFile = () => new File(['cropped'], 'cropped.webp', { type: 'image/webp' });

const makeDraft = (overrides: Partial<DraftQuestion> = {}): DraftQuestion => ({
  ...createEmptyQuestion(),
  questionText: '문제',
  answer: '정답',
  image: { ...EMPTY_SLOT },
  answerImage: { ...EMPTY_SLOT },
  answerImageSameAsQuestion: true,
  ...overrides,
});

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

  describe('thumbnail 없을 때', () => {
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

    it('빈 슬롯 thumbnail 이면 uploadImage 를 호출하지 않고 키들은 undefined', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: '제목', thumbnail: { ...EMPTY_SLOT } });
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.thumbnailKey).toBeUndefined();
      expect(callArg.originalThumbnailKey).toBeUndefined();
    });
  });

  describe('thumbnail 있을 때', () => {
    it('크롭 안 한 새 썸네일(transform=null) → thumbnailKey=원본 업로드 키', async () => {
      const orig = originalFile('thumb.png');
      mockUploadImage.mockResolvedValue('quiz-thumbnails/thumb.png');
      mockUpdateQuiz.mockResolvedValue({ ...MOCK_QUIZ, thumbnailKey: 'quiz-thumbnails/thumb.png' });
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, {
          title: '새 제목',
          thumbnail: { ...EMPTY_SLOT, originalFile: orig, transform: null },
        });
      });

      expect(mockUploadImage).toHaveBeenCalledWith(orig);
      expect(mockUpdateQuiz).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          thumbnailKey: 'quiz-thumbnails/thumb.png',
          originalThumbnailKey: 'quiz-thumbnails/thumb.png',
        }),
      );
    });

    it('원본+크롭 둘 다 → originalThumbnailKey(원본)+thumbnailKey(크롭)+thumbnailTransform', async () => {
      const orig = originalFile('thumb.png');
      const cropped = croppedFile();
      mockUploadImage
        .mockResolvedValueOnce('quiz-thumbnails/original.png')
        .mockResolvedValueOnce('quiz-thumbnails/cropped.webp');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, {
          thumbnail: {
            ...EMPTY_SLOT,
            originalFile: orig,
            croppedFile: cropped,
            transform: TRANSFORM,
          },
        });
      });

      expect(mockUploadImage).toHaveBeenNthCalledWith(1, orig);
      expect(mockUploadImage).toHaveBeenNthCalledWith(2, cropped);
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.originalThumbnailKey).toBe('quiz-thumbnails/original.png');
      expect(callArg.thumbnailKey).toBe('quiz-thumbnails/cropped.webp');
      expect(callArg.thumbnailTransform).toEqual(TRANSFORM);
    });

    it('성공 시 업데이트된 Quiz 를 반환한다', async () => {
      const updatedQuiz = { ...MOCK_QUIZ, thumbnailKey: 'quiz-thumbnails/thumb.png' };
      mockUploadImage.mockResolvedValue('quiz-thumbnails/thumb.png');
      mockUpdateQuiz.mockResolvedValue(updatedQuiz);
      const { result } = renderHook(() => useUpdateQuiz());

      let returned: Quiz | null = null;
      await act(async () => {
        returned = await result.current.submit(1, {
          thumbnail: { ...EMPTY_SLOT, originalFile: originalFile('thumb.png'), transform: null },
        });
      });

      expect(returned).toEqual(updatedQuiz);
    });

    it('thumbnail 슬롯 자체는 updateQuiz payload 에서 제외된다', async () => {
      mockUploadImage.mockResolvedValue('key/thumb.png');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, {
          title: '제목',
          thumbnail: { ...EMPTY_SLOT, originalFile: originalFile('thumb.png'), transform: null },
        });
      });

      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg).not.toHaveProperty('thumbnail');
    });
  });

  describe('ImageUploadError 시', () => {
    it('errorCode=IMAGE_UPLOAD_FAILED 로 세팅된다', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('PUT_FAILED'));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, {
          thumbnail: { ...EMPTY_SLOT, originalFile: originalFile('thumb.png'), transform: null },
        });
      });

      expect(result.current.errorCode).toBe('IMAGE_UPLOAD_FAILED');
    });

    it('null 을 반환하고 updateQuiz 는 호출하지 않는다', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('PRESIGNED_FAILED'));
      const { result } = renderHook(() => useUpdateQuiz());

      let returned: Quiz | null = MOCK_QUIZ;
      await act(async () => {
        returned = await result.current.submit(1, {
          thumbnail: { ...EMPTY_SLOT, originalFile: originalFile('thumb.png'), transform: null },
        });
      });

      expect(returned).toBeNull();
      expect(mockUpdateQuiz).not.toHaveBeenCalled();
    });

    it('error 메시지가 세팅된다', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('NETWORK'));
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, {
          thumbnail: { ...EMPTY_SLOT, originalFile: originalFile('thumb.png'), transform: null },
        });
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

  describe('questions 처리', () => {
    it('questions undefined → payload 에 questions 키 없음 (회귀 가드)', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      await act(async () => {
        await result.current.submit(1, { title: '새 제목' });
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg).not.toHaveProperty('questions');
    });

    it('기존 서버 이미지 유지(slotFromServer, transform 있음) → imageKey/answerImageKey 그대로, 업로드 없음', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const existing = slotFromServer({
        imageKey: 'quiz-questions/existing.png',
        imageUrl: 'https://cdn/existing.png',
        transform: TRANSFORM,
      });
      const draft = makeDraft({
        serverId: 101,
        questionText: '기존 문제',
        answer: '기존 정답',
        image: existing,
        answerImageSameAsQuestion: true,
      });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(mockUpdateQuiz).toHaveBeenCalledWith(1, {
        questions: [
          {
            id: 101,
            imageKey: 'quiz-questions/existing.png',
            originalImageKey: null,
            imageTransform: TRANSFORM,
            answerImageKey: 'quiz-questions/existing.png',
            originalAnswerImageKey: null,
            answerImageTransform: TRANSFORM,
            questionText: '기존 문제',
            answer: '기존 정답',
          },
        ],
      });
    });

    it('신규 question (serverId undefined, 새 원본 이미지) → 업로드 후 새 키, payload.id=undefined', async () => {
      const newFile = originalFile('new.png');
      mockUploadImage.mockResolvedValueOnce('quiz-questions/new.png');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        questionText: '신규',
        answer: '신규답',
        image: { ...EMPTY_SLOT, originalFile: newFile, transform: null },
        answerImageSameAsQuestion: true,
      });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(1);
      expect(mockUploadImage).toHaveBeenCalledWith(newFile);
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions).toHaveLength(1);
      expect(callArg.questions[0]).toEqual({
        id: undefined,
        imageKey: 'quiz-questions/new.png',
        originalImageKey: 'quiz-questions/new.png',
        imageTransform: null,
        answerImageKey: 'quiz-questions/new.png',
        originalAnswerImageKey: 'quiz-questions/new.png',
        answerImageTransform: null,
        questionText: '신규',
        answer: '신규답',
      });
    });

    it('이미지 제거 (EMPTY_SLOT) → payload imageKey/answerImageKey: null', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        serverId: 11,
        image: { ...EMPTY_SLOT },
        answerImage: { ...EMPTY_SLOT },
        answerImageSameAsQuestion: true,
      });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions[0].imageKey).toBeNull();
      expect(callArg.questions[0].answerImageKey).toBeNull();
    });

    it('원본+크롭 둘 다 → originalImageKey+imageKey+imageTransform 채워짐', async () => {
      const orig = originalFile('q.png');
      const cropped = croppedFile();
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/original.png')
        .mockResolvedValueOnce('quiz-questions/cropped.webp');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        serverId: 22,
        image: { ...EMPTY_SLOT, originalFile: orig, croppedFile: cropped, transform: TRANSFORM },
        answerImageSameAsQuestion: true,
      });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions[0].originalImageKey).toBe('quiz-questions/original.png');
      expect(callArg.questions[0].imageKey).toBe('quiz-questions/cropped.webp');
      expect(callArg.questions[0].imageTransform).toEqual(TRANSFORM);
    });

    it('answerImageSameAsQuestion=true → answer 키들이 question 키와 동일 (답 이미지 업로드 안 함)', async () => {
      const orig = originalFile('q.png');
      const cropped = croppedFile();
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/original.png')
        .mockResolvedValueOnce('quiz-questions/cropped.webp');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        serverId: 22,
        image: { ...EMPTY_SLOT, originalFile: orig, croppedFile: cropped, transform: TRANSFORM },
        answerImageSameAsQuestion: true,
        // 무시돼야 함
        answerImage: { ...EMPTY_SLOT, originalFile: originalFile('a.png'), transform: null },
      });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      // question 원본+크롭 2회만 업로드
      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions[0].imageKey).toBe('quiz-questions/cropped.webp');
      expect(callArg.questions[0].answerImageKey).toBe('quiz-questions/cropped.webp');
      expect(callArg.questions[0].originalImageKey).toBe('quiz-questions/original.png');
      expect(callArg.questions[0].originalAnswerImageKey).toBe('quiz-questions/original.png');
      expect(callArg.questions[0].answerImageTransform).toEqual(TRANSFORM);
    });

    it('answerImageSameAsQuestion=false, 별도 정답 이미지 → answer 이미지 별도 업로드', async () => {
      const qFile = originalFile('q.png');
      const aFile = originalFile('a.png');
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/q1.png')
        .mockResolvedValueOnce('quiz-answers/a1.png');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        serverId: 33,
        image: { ...EMPTY_SLOT, originalFile: qFile, transform: null },
        answerImage: { ...EMPTY_SLOT, originalFile: aFile, transform: null },
        answerImageSameAsQuestion: false,
      });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockUploadImage).toHaveBeenCalledWith(qFile);
      expect(mockUploadImage).toHaveBeenCalledWith(aFile);
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions[0].imageKey).toBe('quiz-questions/q1.png');
      expect(callArg.questions[0].answerImageKey).toBe('quiz-answers/a1.png');
    });

    it('여러 questions 병렬 업로드 — 파일별 키 매핑', async () => {
      const q1File = originalFile('q1.png');
      const a1File = originalFile('a1.png');
      const q2File = originalFile('q2.png');
      const keyByFile = new Map<File, string>([
        [q1File, 'q1.png'],
        [a1File, 'a1.png'],
        [q2File, 'q2.png'],
      ]);
      mockUploadImage.mockImplementation((file: File) =>
        Promise.resolve(keyByFile.get(file) ?? 'unknown'),
      );
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const drafts: DraftQuestion[] = [
        makeDraft({
          answer: 'a',
          image: { ...EMPTY_SLOT, originalFile: q1File, transform: null },
          answerImage: { ...EMPTY_SLOT, originalFile: a1File, transform: null },
          answerImageSameAsQuestion: false,
        }),
        makeDraft({
          answer: 'b',
          image: { ...EMPTY_SLOT, originalFile: q2File, transform: null },
          answerImageSameAsQuestion: true,
        }),
        makeDraft({
          serverId: 9,
          answer: 'c',
          image: slotFromServer({
            imageKey: 'existing.png',
            imageUrl: 'https://cdn/exist.png',
            transform: TRANSFORM,
          }),
          answerImageSameAsQuestion: true,
        }),
      ];

      await act(async () => {
        await result.current.submit(1, { questions: drafts });
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(3);
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions).toHaveLength(3);
      expect(callArg.questions[0].imageKey).toBe('q1.png');
      expect(callArg.questions[0].answerImageKey).toBe('a1.png');
      expect(callArg.questions[1].imageKey).toBe('q2.png');
      expect(callArg.questions[1].answerImageKey).toBe('q2.png');
      expect(callArg.questions[2].imageKey).toBe('existing.png');
      expect(callArg.questions[2].answerImageKey).toBe('existing.png');
    });

    it('questionText 빈문자열 → null, 공백만 → null, 비공백 → trim', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const drafts: DraftQuestion[] = [
        makeDraft({ questionText: '', answer: 'a' }),
        makeDraft({ questionText: '   ', answer: 'b' }),
        makeDraft({ questionText: '  trim me  ', answer: 'c' }),
      ];

      await act(async () => {
        await result.current.submit(1, { questions: drafts });
      });

      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions[0].questionText).toBeNull();
      expect(callArg.questions[1].questionText).toBeNull();
      expect(callArg.questions[2].questionText).toBe('trim me');
    });

    it('answer trim 적용', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({ answer: '  정답  ' });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions[0].answer).toBe('정답');
    });

    it('이미지 업로드 중 ImageUploadError → errorCode=IMAGE_UPLOAD_FAILED, updateQuiz 호출 안 함', async () => {
      mockUploadImage.mockRejectedValue(new ImageUploadError('PUT_FAILED'));
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        image: { ...EMPTY_SLOT, originalFile: originalFile('q.png'), transform: null },
      });

      let returned: Quiz | null = MOCK_QUIZ;
      await act(async () => {
        returned = await result.current.submit(1, { questions: [draft] });
      });

      expect(returned).toBeNull();
      expect(result.current.errorCode).toBe('IMAGE_UPLOAD_FAILED');
      expect(mockUpdateQuiz).not.toHaveBeenCalled();
    });
  });
});
