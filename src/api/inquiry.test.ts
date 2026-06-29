import { vi, describe, it, expect, beforeEach } from 'vitest';
import type {
  BoInquiry,
  BoInquiryListItem,
  InquiryListItem,
  InquiryStats,
  NotificationDraft,
  UserNotification,
} from '@/types';

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
  answerInquiry,
  changeInquiryStatus,
  createInquiry,
  getBoInquiries,
  getBoInquiry,
  getBoInquiryStats,
  getMyInquiries,
} from './inquiry';

const mockGet = vi.mocked(instance.get);
const mockPost = vi.mocked(instance.post);
const mockPatch = vi.mocked(instance.patch);

// ── 샘플 데이터 팩토리 ─────────────────────────────────────────────────────────
const makeNotification = (overrides: Partial<UserNotification> = {}): UserNotification => ({
  id: 1,
  type: 'INFO',
  typeLabel: '안내',
  title: '답변 제목',
  content: '답변 본문',
  senderLabel: '운영팀',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeMyItem = (overrides: Partial<InquiryListItem> = {}): InquiryListItem => ({
  id: 1,
  title: '내 문의',
  content: '내용',
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-01-01T00:00:00.000Z',
  answers: [],
  ...overrides,
});

const makeBoItem = (overrides: Partial<BoInquiryListItem> = {}): BoInquiryListItem => ({
  id: 1,
  title: '문의 제목',
  author: { publicId: 'pub-1', nickname: '유저', profileImageUrl: null },
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeBoInquiry = (overrides: Partial<BoInquiry> = {}): BoInquiry => ({
  id: 1,
  title: '문의 제목',
  content: '문의 내용',
  author: { publicId: 'pub-1', nickname: '유저', profileImageUrl: null },
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-01-01T00:00:00.000Z',
  answers: [],
  ...overrides,
});

const makeStats = (overrides: Partial<InquiryStats> = {}): InquiryStats => ({
  total: 10,
  pending: 4,
  inProgress: 3,
  done: 3,
  ...overrides,
});

const makePage = <T>(content: T[], overrides: Record<string, unknown> = {}) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: content.length === 0,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createInquiry', () => {
  it('POST /api/inquiries 를 payload 바디로 호출한다', async () => {
    const item = makeMyItem();
    mockPost.mockResolvedValueOnce({ data: { success: true, data: item } });

    const payload = { title: '제목', content: '내용' };
    await createInquiry(payload);

    expect(mockPost).toHaveBeenCalledWith('/api/inquiries', payload);
  });

  it('ApiResponse 에서 InquiryListItem 을 언랩해 반환한다', async () => {
    const item = makeMyItem({ id: 7, title: '접수됨' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: item } });

    const result = await createInquiry({ title: '제목', content: '내용' });

    expect(result).toEqual(item);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('unauthorized'));

    await expect(createInquiry({ title: 'a', content: 'b' })).rejects.toThrow('unauthorized');
  });
});

describe('getMyInquiries', () => {
  it('인자 없이 호출하면 page 0 / size 20 기본값으로 GET /api/users/me/inquiries 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyInquiries();

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/inquiries', {
      params: { page: 0, size: 20 },
    });
  });

  it('명시한 page/size 가 params 로 전달된다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyInquiries({ page: 3, size: 5 });

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/inquiries', {
      params: { page: 3, size: 5 },
    });
  });

  it('일부만 지정하면 나머지는 기본값으로 채운다 (page 만 지정)', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getMyInquiries({ page: 2 });

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/inquiries', {
      params: { page: 2, size: 20 },
    });
  });

  it('ApiResponse 에서 Page 를 언랩해 반환한다 (content/totalElements 보존)', async () => {
    const page = makePage([makeMyItem({ id: 1 }), makeMyItem({ id: 2 })], {
      totalElements: 42,
      last: false,
    });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getMyInquiries();

    expect(result).toEqual(page);
    expect(result.content).toHaveLength(2);
    expect(result.totalElements).toBe(42);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('unauthorized'));

    await expect(getMyInquiries()).rejects.toThrow('unauthorized');
  });
});

describe('getBoInquiries', () => {
  it('인자 없이 호출하면 params 가 undefined 인 채로 GET /api/admin/inquiries 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    await getBoInquiries();

    expect(mockGet).toHaveBeenCalledWith('/api/admin/inquiries', { params: undefined });
  });

  it('filter/query/page/size 가 params 로 그대로 전달된다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage([]) } });

    const q = { filter: 'PENDING' as const, query: '환불', page: 1, size: 10 };
    await getBoInquiries(q);

    expect(mockGet).toHaveBeenCalledWith('/api/admin/inquiries', { params: q });
  });

  it('ApiResponse 에서 Page<BoInquiryListItem> 를 언랩해 반환한다', async () => {
    const page = makePage([makeBoItem({ id: 1 }), makeBoItem({ id: 2 })], { totalElements: 2 });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getBoInquiries({ filter: 'ALL' });

    expect(result).toEqual(page);
    expect(result.content).toHaveLength(2);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('forbidden'));

    await expect(getBoInquiries()).rejects.toThrow('forbidden');
  });
});

describe('getBoInquiryStats', () => {
  it('GET /api/admin/inquiries/stats 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeStats() } });

    await getBoInquiryStats();

    expect(mockGet).toHaveBeenCalledWith('/api/admin/inquiries/stats');
  });

  it('ApiResponse 에서 InquiryStats 를 언랩해 반환한다', async () => {
    const stats = makeStats({ total: 100, pending: 10, inProgress: 20, done: 70 });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: stats } });

    const result = await getBoInquiryStats();

    expect(result).toEqual(stats);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('forbidden'));

    await expect(getBoInquiryStats()).rejects.toThrow('forbidden');
  });
});

describe('getBoInquiry', () => {
  it('GET /api/admin/inquiries/:id 를 호출한다 (id 가 URL 에 반영)', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeBoInquiry({ id: 7 }) } });

    await getBoInquiry(7);

    expect(mockGet).toHaveBeenCalledWith('/api/admin/inquiries/7');
  });

  it('ApiResponse 에서 BoInquiry 를 언랩해 반환한다', async () => {
    const inquiry = makeBoInquiry({ id: 9, answers: [makeNotification()] });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: inquiry } });

    const result = await getBoInquiry(9);

    expect(result).toEqual(inquiry);
    expect(result.answers).toHaveLength(1);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getBoInquiry(1)).rejects.toThrow('not found');
  });
});

describe('changeInquiryStatus', () => {
  it('PATCH /api/admin/inquiries/:id/status 를 { status } 바디로 호출한다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: makeBoInquiry() } });

    await changeInquiryStatus(7, 'IN_PROGRESS');

    expect(mockPatch).toHaveBeenCalledWith('/api/admin/inquiries/7/status', {
      status: 'IN_PROGRESS',
    });
  });

  it('ApiResponse 에서 갱신된 BoInquiry 를 언랩해 반환한다', async () => {
    const updated = makeBoInquiry({ id: 7, status: 'DONE', statusLabel: '완료' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: updated } });

    const result = await changeInquiryStatus(7, 'DONE');

    expect(result).toEqual(updated);
    expect(result.status).toBe('DONE');
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPatch.mockRejectedValueOnce(new Error('forbidden'));

    await expect(changeInquiryStatus(1, 'DONE')).rejects.toThrow('forbidden');
  });
});

describe('answerInquiry', () => {
  const draft: NotificationDraft = { type: 'INFO', title: '답변', content: '처리했습니다' };

  it('POST /api/admin/inquiries/:id/answers 를 draft 바디로 호출한다', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: makeNotification() } });

    await answerInquiry(7, draft);

    expect(mockPost).toHaveBeenCalledWith('/api/admin/inquiries/7/answers', draft);
  });

  it('ApiResponse 에서 발송된 UserNotification 을 언랩해 반환한다', async () => {
    const sent = makeNotification({ id: 55, title: '답변' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: sent } });

    const result = await answerInquiry(7, draft);

    expect(result).toEqual(sent);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('forbidden'));

    await expect(answerInquiry(1, draft)).rejects.toThrow('forbidden');
  });
});
