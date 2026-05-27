import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import useUpdateQuiz from './useUpdateQuiz';
import { ImageUploadError } from './useUploadImage';
import type { DraftQuestion } from '@/features/quiz/create/QuestionList';
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

  describe('questions 처리', () => {
    const makeDraft = (overrides: Partial<DraftQuestion> = {}): DraftQuestion => ({
      id: 'draft-1',
      questionText: '문제',
      answer: '정답',
      imageKey: null,
      imageFile: null,
      imagePreviewUrl: null,
      answerImageKey: null,
      answerImageFile: null,
      answerImagePreviewUrl: null,
      answerImageSameAsQuestion: true,
      ...overrides,
    });

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

    it('기존 question (serverId 있음, imageFile=null, imagePreviewUrl 보존, imageKey 보존) → payload 에 imageKey/answerImageKey 그대로', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        id: 'draft-1',
        serverId: 101,
        questionText: '기존 문제',
        answer: '기존 정답',
        imageKey: 'quiz-questions/existing.png',
        imagePreviewUrl: 'https://cdn/existing.png',
        answerImageKey: 'quiz-questions/existing.png',
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
            answerImageKey: 'quiz-questions/existing.png',
            questionText: '기존 문제',
            answer: '기존 정답',
          },
        ],
      });
    });

    it('신규 question (serverId undefined, imageFile 있음) → uploadImage 호출 후 새 imageKey, payload.id=undefined', async () => {
      mockUploadImage.mockResolvedValueOnce('quiz-questions/new.png');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const newFile = new File(['x'], 'new.png', { type: 'image/png' });
      const draft = makeDraft({
        id: 'draft-new',
        questionText: '신규',
        answer: '신규답',
        imageFile: newFile,
        imagePreviewUrl: 'blob:new',
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
        answerImageKey: 'quiz-questions/new.png',
        questionText: '신규',
        answer: '신규답',
      });
    });

    it('이미지 제거 (imageFile=null, imagePreviewUrl=null, imageKey 는 hydrate 시점 값) → payload imageKey: null', async () => {
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const draft = makeDraft({
        serverId: 11,
        imageKey: 'quiz-questions/old.png',
        imageFile: null,
        imagePreviewUrl: null,
        answerImageKey: 'quiz-questions/old.png',
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

    it('answerImageSameAsQuestion=true → payload answerImageKey === imageKey (답 이미지 업로드 안 함)', async () => {
      mockUploadImage.mockResolvedValueOnce('quiz-questions/new.png');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const qFile = new File(['q'], 'q.png', { type: 'image/png' });
      const draft = makeDraft({
        serverId: 22,
        imageFile: qFile,
        imagePreviewUrl: 'blob:q',
        answerImageSameAsQuestion: true,
        // answerImageFile 는 무시돼야 함
        answerImageFile: new File(['a'], 'a.png', { type: 'image/png' }),
        answerImagePreviewUrl: 'blob:a',
      });

      await act(async () => {
        await result.current.submit(1, { questions: [draft] });
      });

      expect(mockUploadImage).toHaveBeenCalledTimes(1);
      expect(mockUploadImage).toHaveBeenCalledWith(qFile);
      const callArg = mockUpdateQuiz.mock.calls[0][1];
      expect(callArg.questions[0].imageKey).toBe('quiz-questions/new.png');
      expect(callArg.questions[0].answerImageKey).toBe('quiz-questions/new.png');
    });

    it('answerImageSameAsQuestion=false, answerImageFile 있음 → answer 이미지 별도 업로드', async () => {
      mockUploadImage
        .mockResolvedValueOnce('quiz-questions/q1.png')
        .mockResolvedValueOnce('quiz-answers/a1.png');
      mockUpdateQuiz.mockResolvedValue(MOCK_QUIZ);
      const { result } = renderHook(() => useUpdateQuiz());

      const qFile = new File(['q'], 'q.png', { type: 'image/png' });
      const aFile = new File(['a'], 'a.png', { type: 'image/png' });
      const draft = makeDraft({
        serverId: 33,
        imageFile: qFile,
        imagePreviewUrl: 'blob:q',
        answerImageFile: aFile,
        answerImagePreviewUrl: 'blob:a',
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

    it('여러 questions 병렬 업로드 — uploadImage 호출 횟수 = 새 이미지 파일 수', async () => {
      // 파일별로 매핑하여 호출 순서에 무관하게 동작
      const q1File = new File(['1'], 'q1.png', { type: 'image/png' });
      const a1File = new File(['a1'], 'a1.png', { type: 'image/png' });
      const q2File = new File(['2'], 'q2.png', { type: 'image/png' });
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
          id: 'd1',
          imageFile: q1File,
          imagePreviewUrl: 'blob:q1',
          answerImageFile: a1File,
          answerImagePreviewUrl: 'blob:a1',
          answerImageSameAsQuestion: false,
          answer: 'a',
        }),
        makeDraft({
          id: 'd2',
          imageFile: q2File,
          imagePreviewUrl: 'blob:q2',
          answerImageSameAsQuestion: true,
          answer: 'b',
        }),
        makeDraft({
          id: 'd3',
          serverId: 9,
          imageKey: 'existing.png',
          imagePreviewUrl: 'https://cdn/exist.png',
          answerImageKey: 'existing.png',
          answerImageSameAsQuestion: true,
          answer: 'c',
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
        makeDraft({ id: 'd1', questionText: '', answer: 'a' }),
        makeDraft({ id: 'd2', questionText: '   ', answer: 'b' }),
        makeDraft({ id: 'd3', questionText: '  trim me  ', answer: 'c' }),
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
        imageFile: new File(['x'], 'q.png', { type: 'image/png' }),
        imagePreviewUrl: 'blob:q',
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
