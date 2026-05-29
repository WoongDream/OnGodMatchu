import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./instance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import instance from './instance';
import { submitAttempt, getMyAttempts, getUserAttempts, mapAttemptError } from './attempt';
import type { AttemptAnswerInput, AttemptResponse, AttemptListItem } from '@/types';

const mockPost = vi.mocked(instance.post);
const mockGet = vi.mocked(instance.get);

const makeAttemptResponse = (overrides: Partial<AttemptResponse> = {}): AttemptResponse => ({
  id: 1,
  quizId: 42,
  score: 3,
  totalQuestions: 5,
  percent: 60,
  topPercentile: null,
  completedAt: '2026-05-07T10:00:00+09:00',
  results: [],
  ...overrides,
});

const makeAttemptListItem = (overrides: Partial<AttemptListItem> = {}): AttemptListItem => ({
  id: 1,
  quizId: 42,
  quizPublicId: 'uuid-quiz-1',
  quizTitle: '테스트 퀴즈',
  quizCategory: 'culture',
  quizCategoryLabel: '문화',
  quizThumbnailKey: null,
  quizThumbnailUrl: null,
  score: 4,
  totalQuestions: 5,
  percent: 80,
  completedAt: '2026-05-07T10:00:00+09:00',
  ...overrides,
});

const makePage = (content: AttemptListItem[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: content.length === 0,
});

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

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// submitAttempt
// ---------------------------------------------------------------------------

describe('submitAttempt', () => {
  const answers: AttemptAnswerInput[] = [
    { questionId: 1, userAnswer: '답변1' },
    { questionId: 2, userAnswer: '답변2' },
  ];

  it('POST /api/quizzes/{quizId}/attempts 를 { answers } 본문으로 호출한다', async () => {
    const response = makeAttemptResponse();
    mockPost.mockResolvedValueOnce({ data: { success: true, data: response } });

    await submitAttempt(42, answers);

    expect(mockPost).toHaveBeenCalledWith('/api/quizzes/42/attempts', { answers });
  });

  it('ApiResponse 에서 data.data 를 반환한다', async () => {
    const response = makeAttemptResponse({ score: 5, percent: 100 });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: response } });

    const result = await submitAttempt(42, answers);

    expect(result).toEqual(response);
  });

  it('quizId 가 다르면 경로도 다르다', async () => {
    const response = makeAttemptResponse();
    mockPost.mockResolvedValue({ data: { success: true, data: response } });

    await submitAttempt(1, answers);
    await submitAttempt(999, answers);

    expect(mockPost).toHaveBeenNthCalledWith(1, '/api/quizzes/1/attempts', { answers });
    expect(mockPost).toHaveBeenNthCalledWith(2, '/api/quizzes/999/attempts', { answers });
  });

  it('answers 배열이 빈 경우에도 호출된다', async () => {
    const response = makeAttemptResponse({ score: 0, totalQuestions: 0 });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: response } });

    await submitAttempt(42, []);

    expect(mockPost).toHaveBeenCalledWith('/api/quizzes/42/attempts', { answers: [] });
  });

  it('answers 배열이 단일 항목인 경우 정상 동작한다', async () => {
    const singleAnswer: AttemptAnswerInput[] = [{ questionId: 1, userAnswer: '단일 답변' }];
    const response = makeAttemptResponse({ score: 1, totalQuestions: 1 });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: response } });

    const result = await submitAttempt(10, singleAnswer);

    expect(mockPost).toHaveBeenCalledWith('/api/quizzes/10/attempts', { answers: singleAnswer });
    expect(result).toEqual(response);
  });

  it('answers 배열이 많은 항목인 경우 그대로 전달된다', async () => {
    const manyAnswers: AttemptAnswerInput[] = Array.from({ length: 20 }, (_, i) => ({
      questionId: i + 1,
      userAnswer: `답변${i + 1}`,
    }));
    const response = makeAttemptResponse({ score: 20, totalQuestions: 20 });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: response } });

    await submitAttempt(5, manyAnswers);

    expect(mockPost).toHaveBeenCalledWith('/api/quizzes/5/attempts', { answers: manyAnswers });
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('network error'));

    await expect(submitAttempt(42, answers)).rejects.toThrow('network error');
  });

  it('axios 400 에러를 그대로 throw 한다', async () => {
    const axiosError = Object.assign(new Error('Bad Request'), {
      response: { status: 400, data: { error: { code: 'INVALID_INPUT' } } },
    });
    mockPost.mockRejectedValueOnce(axiosError);

    await expect(submitAttempt(42, answers)).rejects.toThrow('Bad Request');
  });
});

// ---------------------------------------------------------------------------
// getMyAttempts
// ---------------------------------------------------------------------------

describe('getMyAttempts', () => {
  it('GET /api/users/me/attempts 를 page/size 기본값으로 호출한다 (인수 없음)', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyAttempts();

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/attempts', {
      params: { page: 0, size: 20 },
    });
  });

  it('GET /api/users/me/attempts 를 page/size 기본값으로 호출한다 (빈 객체)', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyAttempts({});

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/attempts', {
      params: { page: 0, size: 20 },
    });
  });

  it('커스텀 page/size 를 그대로 전달한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyAttempts({ page: 2, size: 5 });

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/attempts', {
      params: { page: 2, size: 5 },
    });
  });

  it('page 만 커스텀하면 size 는 기본값 20 이다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyAttempts({ page: 3 });

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/attempts', {
      params: { page: 3, size: 20 },
    });
  });

  it('size 만 커스텀하면 page 는 기본값 0 이다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyAttempts({ size: 50 });

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/attempts', {
      params: { page: 0, size: 50 },
    });
  });

  it('Page<AttemptListItem> 를 그대로 반환한다', async () => {
    const item = makeAttemptListItem();
    const page = makePage([item]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getMyAttempts();

    expect(result).toEqual(page);
    expect(result.content[0]).toEqual(item);
  });

  it('빈 페이지도 정상적으로 반환한다', async () => {
    const page = makePage([]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getMyAttempts();

    expect(result.content).toEqual([]);
    expect(result.empty).toBe(true);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('unauthorized'));

    await expect(getMyAttempts()).rejects.toThrow('unauthorized');
  });
});

// ---------------------------------------------------------------------------
// getUserAttempts
// ---------------------------------------------------------------------------

describe('getUserAttempts', () => {
  const publicId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  it('GET /api/users/{publicId}/attempts 를 UUID 그대로 path 에 포함한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getUserAttempts(publicId);

    expect(mockGet).toHaveBeenCalledWith(`/api/users/${publicId}/attempts`, {
      params: { page: 0, size: 20 },
    });
  });

  it('page/size 기본값으로 호출한다 (인수 없음)', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getUserAttempts(publicId);

    expect(mockGet).toHaveBeenCalledWith(`/api/users/${publicId}/attempts`, {
      params: { page: 0, size: 20 },
    });
  });

  it('커스텀 page/size 를 그대로 전달한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getUserAttempts(publicId, { page: 1, size: 10 });

    expect(mockGet).toHaveBeenCalledWith(`/api/users/${publicId}/attempts`, {
      params: { page: 1, size: 10 },
    });
  });

  it('publicId 가 다른 경우 각각 다른 URL 로 호출한다', async () => {
    const page = makePage([]);
    mockGet.mockResolvedValue({ data: { success: true, data: page } });

    const id1 = 'aaaaaaaa-0000-0000-0000-000000000001';
    const id2 = 'bbbbbbbb-0000-0000-0000-000000000002';

    await getUserAttempts(id1);
    await getUserAttempts(id2);

    expect(mockGet).toHaveBeenNthCalledWith(1, `/api/users/${id1}/attempts`, {
      params: { page: 0, size: 20 },
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, `/api/users/${id2}/attempts`, {
      params: { page: 0, size: 20 },
    });
  });

  it('Page<AttemptListItem> 를 그대로 반환한다', async () => {
    const item = makeAttemptListItem({ quizPublicId: publicId });
    const page = makePage([item]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getUserAttempts(publicId);

    expect(result).toEqual(page);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getUserAttempts(publicId)).rejects.toThrow('not found');
  });
});

// ---------------------------------------------------------------------------
// mapAttemptError
// ---------------------------------------------------------------------------

describe('mapAttemptError', () => {
  describe('code 기반 매핑', () => {
    it('code QUESTION_NOT_FOUND → QUESTION_NOT_FOUND', () => {
      expect(mapAttemptError(makeAxiosError(404, 'QUESTION_NOT_FOUND'))).toBe('QUESTION_NOT_FOUND');
    });

    it('code QUIZ_NOT_FOUND → QUIZ_NOT_FOUND', () => {
      expect(mapAttemptError(makeAxiosError(404, 'QUIZ_NOT_FOUND'))).toBe('QUIZ_NOT_FOUND');
    });

    it('code INVALID_INPUT → INVALID_INPUT', () => {
      expect(mapAttemptError(makeAxiosError(400, 'INVALID_INPUT'))).toBe('INVALID_INPUT');
    });
  });

  describe('status 기반 매핑 (code 없음)', () => {
    it('status 404 → QUIZ_NOT_FOUND', () => {
      expect(mapAttemptError(makeAxiosError(404))).toBe('QUIZ_NOT_FOUND');
    });

    it('status 400 → INVALID_INPUT', () => {
      expect(mapAttemptError(makeAxiosError(400))).toBe('INVALID_INPUT');
    });

    it('status 401 → UNAUTHORIZED', () => {
      expect(mapAttemptError(makeAxiosError(401))).toBe('UNAUTHORIZED');
    });
  });

  describe('code 가 status 보다 우선 적용', () => {
    it('status 404 이지만 code QUESTION_NOT_FOUND 이면 QUESTION_NOT_FOUND 를 반환한다', () => {
      // QUESTION_NOT_FOUND 는 status 와 무관하게 가장 먼저 검사됨
      expect(mapAttemptError(makeAxiosError(404, 'QUESTION_NOT_FOUND'))).toBe('QUESTION_NOT_FOUND');
    });

    it('status 400 이지만 code QUESTION_NOT_FOUND 이면 QUESTION_NOT_FOUND 를 반환한다', () => {
      expect(mapAttemptError(makeAxiosError(400, 'QUESTION_NOT_FOUND'))).toBe('QUESTION_NOT_FOUND');
    });

    it('status 200 이지만 code QUESTION_NOT_FOUND 이면 QUESTION_NOT_FOUND 를 반환한다', () => {
      expect(mapAttemptError(makeAxiosError(200, 'QUESTION_NOT_FOUND'))).toBe('QUESTION_NOT_FOUND');
    });

    it('status 400 이지만 code QUIZ_NOT_FOUND 이면 QUIZ_NOT_FOUND 를 반환한다', () => {
      expect(mapAttemptError(makeAxiosError(400, 'QUIZ_NOT_FOUND'))).toBe('QUIZ_NOT_FOUND');
    });

    it('status 400 이지만 code INVALID_INPUT 이면 INVALID_INPUT 을 반환한다', () => {
      expect(mapAttemptError(makeAxiosError(400, 'INVALID_INPUT'))).toBe('INVALID_INPUT');
    });
  });

  describe('NETWORK fallback', () => {
    it('response 없는 에러(네트워크 단절) → NETWORK', () => {
      expect(mapAttemptError({})).toBe('NETWORK');
    });

    it('response 가 undefined → NETWORK', () => {
      expect(mapAttemptError({ response: undefined })).toBe('NETWORK');
    });

    it('알 수 없는 status (500) + code 없음 → NETWORK', () => {
      expect(mapAttemptError(makeAxiosError(500))).toBe('NETWORK');
    });

    it('문자열 에러 → NETWORK', () => {
      expect(mapAttemptError('some string error')).toBe('NETWORK');
    });
  });
});
