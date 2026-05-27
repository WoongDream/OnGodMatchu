import { vi, describe, it, expect, beforeEach } from 'vitest';

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
  getMyQuizzes,
  getUserQuizzes,
  getQuizDetail,
  updateQuiz,
  updateQuizVisibility,
  deleteQuiz,
  mapQuizError,
} from './quiz';

const mockGet = vi.mocked(instance.get);
const mockPatch = vi.mocked(instance.patch);
const mockDelete = vi.mocked(instance.delete);

const makeRawItem = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  quizId: 'uuid-1',
  title: '테스트 퀴즈',
  category: 'movie',
  categoryLabel: '영화',
  visibility: 'PUBLIC',
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 0,
  shareCount: 0,
  starCount: 0,
  commentCount: 0,
  correctRate: null,
  createdAt: '2026-05-01T00:00:00+09:00',
  updatedAt: '2026-05-01T00:00:00+09:00',
  ...overrides,
});

const makePage = (content: unknown[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: content.length === 0,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMyQuizzes', () => {
  it('GET /api/users/me/quizzes 를 page/size 기본값으로 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyQuizzes();
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/quizzes', {
      params: { page: 0, size: 10 },
    });
  });

  it('visibility 가 all 이면 쿼리에서 제외한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyQuizzes({ visibility: 'all' });
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/quizzes', {
      params: { page: 0, size: 10 },
    });
  });

  it('visibility public 과 sort 를 쿼리에 포함한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyQuizzes({ visibility: 'public', sort: 'plays', page: 1, size: 5 });
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/quizzes', {
      params: { page: 1, size: 5, visibility: 'public', sort: 'plays' },
    });
  });

  it('visibility PUBLIC 응답은 isPublic true 로 변환한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makePage([makeRawItem({ visibility: 'PUBLIC' })]) },
    });
    const res = await getMyQuizzes();
    expect(res.content[0].isPublic).toBe(true);
    expect(res.content[0]).not.toHaveProperty('visibility');
  });

  it('visibility PRIVATE 응답은 isPublic false 로 변환한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makePage([makeRawItem({ visibility: 'PRIVATE' })]) },
    });
    const res = await getMyQuizzes();
    expect(res.content[0].isPublic).toBe(false);
  });

  it('id 는 그대로 두고 quizId 는 publicId 로 매핑한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: makePage([makeRawItem({ id: 42, quizId: 'uuid-42' })]),
      },
    });
    const res = await getMyQuizzes();
    expect(res.content[0].id).toBe(42);
    expect(res.content[0].publicId).toBe('uuid-42');
    expect(res.content[0]).not.toHaveProperty('quizId');
  });
});

describe('getUserQuizzes', () => {
  it('GET /api/users/{userId}/quizzes 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getUserQuizzes('uuid-123', { sort: 'latest', page: 0, size: 10 });
    expect(mockGet).toHaveBeenCalledWith('/api/users/uuid-123/quizzes', {
      params: { page: 0, size: 10, sort: 'latest' },
    });
  });

  it('응답 visibility 를 isPublic 으로 변환해 반환한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makePage([makeRawItem({ visibility: 'PUBLIC' })]) },
    });
    const res = await getUserQuizzes('uuid-123');
    expect(res.content[0].isPublic).toBe(true);
  });
});

describe('getQuizDetail', () => {
  const makeRawDetail = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    publicId: 'uuid-1',
    title: '상세 퀴즈',
    description: '설명',
    category: 'movie',
    categoryLabel: '영화',
    visibility: 'PUBLIC',
    thumbnailKey: null,
    thumbnailUrl: null,
    playCount: 12,
    shareCount: 3,
    starCount: 4,
    commentCount: 5,
    correctRate: 0.8,
    createdAt: '2026-05-01T00:00:00+09:00',
    updatedAt: '2026-05-01T00:00:00+09:00',
    questions: [
      {
        id: 11,
        questionText: 'Q1',
        imageKey: null,
        imageUrl: null,
        answerImageKey: null,
        answerImageUrl: null,
      },
      {
        id: 12,
        questionText: 'Q2',
        imageKey: null,
        imageUrl: null,
        answerImageKey: null,
        answerImageUrl: null,
      },
    ],
    ...overrides,
  });

  it('GET /api/quizzes/{quizId} 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeRawDetail() } });
    await getQuizDetail(42);
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes/42');
  });

  it('visibility PUBLIC 응답은 isPublic true 로 변환하고 visibility 키는 제거한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makeRawDetail({ visibility: 'PUBLIC' }) },
    });
    const res = await getQuizDetail(1);
    expect(res.isPublic).toBe(true);
    expect(res).not.toHaveProperty('visibility');
  });

  it('visibility PRIVATE 응답은 isPublic false 로 변환한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makeRawDetail({ visibility: 'PRIVATE' }) },
    });
    const res = await getQuizDetail(1);
    expect(res.isPublic).toBe(false);
    expect(res).not.toHaveProperty('visibility');
  });

  it('questions 배열을 그대로 보존한다', async () => {
    const questions = [
      {
        id: 101,
        questionText: '문제1',
        imageKey: null,
        imageUrl: null,
        answerImageKey: null,
        answerImageUrl: null,
      },
      {
        id: 102,
        questionText: '문제2',
        imageKey: null,
        imageUrl: null,
        answerImageKey: null,
        answerImageUrl: null,
      },
      {
        id: 103,
        questionText: '문제3',
        imageKey: null,
        imageUrl: null,
        answerImageKey: null,
        answerImageUrl: null,
      },
    ];
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makeRawDetail({ questions }) },
    });
    const res = await getQuizDetail(1);
    expect(res.questions).toEqual(questions);
  });

  it('title/category/playCount 등 다른 필드도 그대로 보존한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: makeRawDetail({
          id: 99,
          title: '보존 테스트',
          category: 'movie',
          playCount: 777,
        }),
      },
    });
    const res = await getQuizDetail(99);
    expect(res.id).toBe(99);
    expect(res.title).toBe('보존 테스트');
    expect(res.category).toBe('movie');
    expect(res.playCount).toBe(777);
  });
});

describe('updateQuiz', () => {
  it('PATCH /api/quizzes/{id} 로 본문을 보낸다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: {} } });
    await updateQuiz(7, { title: '새 제목', description: '설명' });
    expect(mockPatch).toHaveBeenCalledWith('/api/quizzes/7', {
      title: '새 제목',
      description: '설명',
    });
  });

  it('isPublic true 는 visibility PUBLIC 으로 보낸다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: {} } });
    await updateQuiz(7, { isPublic: true });
    expect(mockPatch).toHaveBeenCalledWith('/api/quizzes/7', { visibility: 'PUBLIC' });
  });

  it('isPublic false 는 visibility PRIVATE 으로 보낸다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: {} } });
    await updateQuiz(7, { isPublic: false });
    expect(mockPatch).toHaveBeenCalledWith('/api/quizzes/7', { visibility: 'PRIVATE' });
  });

  it('isPublic 와 다른 필드를 함께 보낸다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: {} } });
    await updateQuiz(7, { title: 't', isPublic: false });
    expect(mockPatch).toHaveBeenCalledWith('/api/quizzes/7', {
      title: 't',
      visibility: 'PRIVATE',
    });
  });

  it('payload.questions 가 PATCH 본문에 그대로 전달된다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: {} } });
    const questions = [
      {
        id: 1,
        imageKey: 'quiz-questions/a.png',
        answerImageKey: 'quiz-questions/a.png',
        questionText: '문제',
        answer: '정답',
      },
      {
        imageKey: null,
        answerImageKey: null,
        questionText: null,
        answer: '다른정답',
      },
    ];
    await updateQuiz(7, { questions });
    expect(mockPatch).toHaveBeenCalledWith('/api/quizzes/7', { questions });
  });
});

describe('updateQuizVisibility', () => {
  it('내부적으로 updateQuiz 와 동일하게 visibility 만 보낸다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: {} } });
    await updateQuizVisibility(7, true);
    expect(mockPatch).toHaveBeenCalledWith('/api/quizzes/7', { visibility: 'PUBLIC' });
  });
});

describe('deleteQuiz', () => {
  it('DELETE /api/quizzes/{id} 를 호출한다', async () => {
    mockDelete.mockResolvedValueOnce({ data: { success: true, data: null } });
    await deleteQuiz(7);
    expect(mockDelete).toHaveBeenCalledWith('/api/quizzes/7');
  });
});

describe('mapQuizError', () => {
  const err = (status?: number, code?: string) => ({
    response:
      status !== undefined ? { status, data: code ? { error: { code } } : undefined } : undefined,
  });

  it('code QUIZ_NOT_FOUND → QUIZ_NOT_FOUND', () => {
    expect(mapQuizError(err(404, 'QUIZ_NOT_FOUND'))).toBe('QUIZ_NOT_FOUND');
  });

  it('status 404 → QUIZ_NOT_FOUND', () => {
    expect(mapQuizError(err(404))).toBe('QUIZ_NOT_FOUND');
  });

  it('code QUIZ_FORBIDDEN → FORBIDDEN', () => {
    expect(mapQuizError(err(403, 'QUIZ_FORBIDDEN'))).toBe('FORBIDDEN');
  });

  it('status 403 → FORBIDDEN', () => {
    expect(mapQuizError(err(403))).toBe('FORBIDDEN');
  });

  it('status 400 → INVALID_INPUT', () => {
    expect(mapQuizError(err(400))).toBe('INVALID_INPUT');
  });

  it('status 401 → UNAUTHORIZED', () => {
    expect(mapQuizError(err(401))).toBe('UNAUTHORIZED');
  });

  it('네트워크 에러 → NETWORK', () => {
    expect(mapQuizError({})).toBe('NETWORK');
  });
});
