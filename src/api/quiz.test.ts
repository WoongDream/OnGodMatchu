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
  getQuizzes,
  getMyQuizzes,
  getUserQuizzes,
  getQuizDetail,
  getQuizScoreDistribution,
  updateQuiz,
  updateQuizVisibility,
  deleteQuiz,
  mapQuizError,
  recordQuizShare,
  getMyStarredQuizzes,
} from './quiz';

const mockGet = vi.mocked(instance.get);
const mockPatch = vi.mocked(instance.patch);
const mockPost = vi.mocked(instance.post);
const mockDelete = vi.mocked(instance.delete);

const makeRawItem = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  quizId: 'uuid-1',
  title: '테스트 퀴즈',
  category: 'culture',
  categoryLabel: '문화',
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

describe('getQuizzes', () => {
  it('GET /api/quizzes 를 page/size 기본값(0, 20)으로 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes();
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20 },
    });
  });

  it('category 를 지정하면 쿼리에 포함한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ category: 'culture' });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20, category: 'culture' },
    });
  });

  it("sort='latest' 는 쿼리에 createdAt,desc 로 변환해 전달한다", async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ sort: 'latest' });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20, sort: 'createdAt,desc' },
    });
  });

  it("sort='plays' 는 쿼리에서 제외한다 (latest 분기만 매핑)", async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ sort: 'plays' });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20 },
    });
  });

  it('q 를 지정하면 쿼리에 q 로 포함한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ q: '리액트' });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20, q: '리액트' },
    });
  });

  it('q 앞뒤 공백은 trim 해서 전송한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ q: '  리액트  ' });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20, q: '리액트' },
    });
  });

  it('q 가 빈 문자열이면 쿼리에서 제외한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ q: '' });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20 },
    });
  });

  it('q 가 공백뿐이면 쿼리에서 제외한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ q: '   ' });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 0, size: 20 },
    });
  });

  it('category·q·sort·page·size 를 모두 함께 전달한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getQuizzes({ category: 'culture', q: ' 퀴즈 ', sort: 'latest', page: 2, size: 5 });
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes', {
      params: { page: 2, size: 5, category: 'culture', q: '퀴즈', sort: 'createdAt,desc' },
    });
  });

  it('ApiResponse 의 data(Page<Quiz>) 를 언랩해 반환한다', async () => {
    const page = makePage([makeRawItem({ id: 9 })]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });
    const res = await getQuizzes();
    expect(res).toBe(page);
    expect(res.content[0].id).toBe(9);
  });
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
    category: 'culture',
    categoryLabel: '문화',
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
          category: 'culture',
          playCount: 777,
        }),
      },
    });
    const res = await getQuizDetail(99);
    expect(res.id).toBe(99);
    expect(res.title).toBe('보존 테스트');
    expect(res.category).toBe('culture');
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

describe('recordQuizShare', () => {
  it('POST /api/quizzes/{quizId}/share 를 본문 없이 호출한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { shareCount: 1, alreadyShared: false } },
    });
    await recordQuizShare(1);
    expect(mockPost).toHaveBeenCalledWith('/api/quizzes/1/share');
  });

  it('응답 data 를 언랩해 { shareCount, alreadyShared } 를 반환한다', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { shareCount: 5, alreadyShared: false } },
    });
    const res = await recordQuizShare(1);
    expect(res).toEqual({ shareCount: 5, alreadyShared: false });
  });

  it('alreadyShared=true 인 응답도 그대로 반환한다 (카운트 유지 시나리오)', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, data: { shareCount: 5, alreadyShared: true } },
    });
    const res = await recordQuizShare(1);
    expect(res).toEqual({ shareCount: 5, alreadyShared: true });
  });

  it('instance.post 가 reject 하면 그대로 전파한다 (catch 안 함)', async () => {
    mockPost.mockRejectedValueOnce(new Error('boom'));
    await expect(recordQuizShare(1)).rejects.toThrow('boom');
  });
});

describe('getQuizScoreDistribution', () => {
  const makeDistribution = (overrides: Partial<Record<string, unknown>> = {}) => ({
    totalAttempts: 42,
    averageScore: 3.4,
    distribution: [
      { score: 0, count: 1 },
      { score: 1, count: 3 },
      { score: 2, count: 8 },
      { score: 3, count: 15 },
      { score: 4, count: 10 },
      { score: 5, count: 5 },
    ],
    ...overrides,
  });

  it('GET /api/quizzes/{id}/score-distribution 을 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeDistribution() } });
    await getQuizScoreDistribution(5);
    expect(mockGet).toHaveBeenCalledWith('/api/quizzes/5/score-distribution');
  });

  it('ApiResponse 의 data 를 언랩해 { totalAttempts, averageScore, distribution } 를 반환한다', async () => {
    const payload = makeDistribution({ totalAttempts: 10, averageScore: 2.5 });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: payload } });
    const res = await getQuizScoreDistribution(7);
    expect(res).toEqual(payload);
    expect(res.totalAttempts).toBe(10);
    expect(res.averageScore).toBe(2.5);
  });

  it('distribution 배열을 그대로 보존한다 (순서·길이)', async () => {
    const distribution = [
      { score: 0, count: 0 },
      { score: 1, count: 2 },
      { score: 2, count: 0 },
    ];
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makeDistribution({ distribution }) },
    });
    const res = await getQuizScoreDistribution(7);
    expect(res.distribution).toEqual(distribution);
  });

  it('instance.get 이 reject 하면 그대로 전파한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('boom'));
    await expect(getQuizScoreDistribution(7)).rejects.toThrow('boom');
  });
});

describe('getMyStarredQuizzes', () => {
  it('GET /api/users/me/stars 를 page/size 기본값(0, 20)으로 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyStarredQuizzes();
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/stars', {
      params: { page: 0, size: 20 },
    });
  });

  it('page/size 를 지정하면 그대로 전달한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyStarredQuizzes({ page: 2, size: 5 });
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/stars', {
      params: { page: 2, size: 5 },
    });
  });

  it('title 이 있으면 trim 후 쿼리에 포함한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyStarredQuizzes({ title: '  리액트  ' });
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/stars', {
      params: { page: 0, size: 20, title: '리액트' },
    });
  });

  it('title 이 빈 문자열이면 쿼리에서 제외한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyStarredQuizzes({ title: '' });
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/stars', {
      params: { page: 0, size: 20 },
    });
  });

  it('title 이 공백뿐이면 쿼리에서 제외한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });
    await getMyStarredQuizzes({ title: '   ' });
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/stars', {
      params: { page: 0, size: 20 },
    });
  });

  it('ApiResponse 의 data(Page<Quiz>) 를 언랩해 반환한다', async () => {
    const page = makePage([makeRawItem({ id: 7 })]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });
    const res = await getMyStarredQuizzes();
    expect(res).toBe(page);
    expect(res.content[0].id).toBe(7);
    expect(res.totalElements).toBe(1);
  });

  it('instance.get 이 reject 하면 그대로 전파한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('boom'));
    await expect(getMyStarredQuizzes()).rejects.toThrow('boom');
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
