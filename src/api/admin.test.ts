import { vi, describe, it, expect, beforeEach } from 'vitest';
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserSummary,
  MonthlyUserStat,
  AdminUserHistory,
  AdminUserUpdatePayload,
} from './admin';
import type {
  BoNotice,
  BoNoticeListItem,
  NoticeStats,
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
  getAdminUsers,
  suspendUser,
  unsuspendUser,
  changeUserRole,
  mapAdminError,
  getBoNotices,
  getBoNoticeStats,
  getBoNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  getAdminUserSummary,
  getMonthlyUserStats,
  getAdminUserDetail,
  updateAdminUser,
  sendUserNotification,
  getAdminUserHistories,
} from './admin';

const mockGet = vi.mocked(instance.get);
const mockPost = vi.mocked(instance.post);
const mockPatch = vi.mocked(instance.patch);
const mockDelete = vi.mocked(instance.delete);

const makeAdminUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  userId: 'u1',
  nickname: 'tester',
  email: 'test@example.com',
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'LOCAL',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makePage = (content: AdminUser[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: content.length === 0,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAdminUsers', () => {
  it('GET /api/admin/users 를 params 와 함께 호출한다', async () => {
    const page = makePage([makeAdminUser()]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const query = {
      status: 'ACTIVE' as const,
      role: 'USER' as const,
      query: '검색',
      page: 2,
      size: 10,
    };
    await getAdminUsers(query);

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users', { params: query });
  });

  it('query 없이 호출하면 params 가 undefined 이다', async () => {
    const page = makePage([]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    await getAdminUsers();

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users', { params: undefined });
  });

  it('ApiResponse 에서 Page 를 언랩해 반환한다', async () => {
    const page = makePage([makeAdminUser({ userId: 'a' }), makeAdminUser({ userId: 'b' })]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getAdminUsers();

    expect(result).toEqual(page);
    expect(result.content).toHaveLength(2);
  });

  it('빈 결과도 그대로 반환한다', async () => {
    const page = makePage([]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getAdminUsers();

    expect(result.content).toEqual([]);
    expect(result.empty).toBe(true);
  });

  it('목록 항목의 profileImageUrl 을 그대로 보존한다', async () => {
    const page = makePage([
      makeAdminUser({ userId: 'a', profileImageUrl: 'https://cdn.example.com/a.png' }),
      makeAdminUser({ userId: 'b', profileImageUrl: null }),
    ]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getAdminUsers();

    expect(result.content[0].profileImageUrl).toBe('https://cdn.example.com/a.png');
    expect(result.content[1].profileImageUrl).toBeNull();
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('forbidden'));

    await expect(getAdminUsers()).rejects.toThrow('forbidden');
  });
});

describe('suspendUser', () => {
  it('POST /api/admin/users/:publicId/suspend 를 { days } body 로 호출한다', async () => {
    const user = makeAdminUser({ status: 'SUSPENDED' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: user } });

    await suspendUser('u1', 7);

    expect(mockPost).toHaveBeenCalledWith('/api/admin/users/u1/suspend', { days: 7 });
  });

  it('언랩된 AdminUser 를 반환한다', async () => {
    const user = makeAdminUser({ status: 'SUSPENDED', suspendedUntil: '2026-06-11T00:00:00.000Z' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await suspendUser('u1', 7);

    expect(result).toEqual(user);
  });

  it('publicId 가 URL 에 반영된다', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: makeAdminUser() } });

    await suspendUser('abc', 1);
    await suspendUser('xyz', 30);

    expect(mockPost).toHaveBeenNthCalledWith(1, '/api/admin/users/abc/suspend', { days: 1 });
    expect(mockPost).toHaveBeenNthCalledWith(2, '/api/admin/users/xyz/suspend', { days: 30 });
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('target invalid'));

    await expect(suspendUser('u1', 7)).rejects.toThrow('target invalid');
  });
});

describe('unsuspendUser', () => {
  it('POST /api/admin/users/:publicId/unsuspend 를 호출한다', async () => {
    const user = makeAdminUser({ status: 'ACTIVE' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: user } });

    await unsuspendUser('u1');

    expect(mockPost).toHaveBeenCalledWith('/api/admin/users/u1/unsuspend');
  });

  it('언랩된 AdminUser 를 반환한다', async () => {
    const user = makeAdminUser({ status: 'ACTIVE', suspendedUntil: null });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await unsuspendUser('u1');

    expect(result).toEqual(user);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('not found'));

    await expect(unsuspendUser('u1')).rejects.toThrow('not found');
  });
});

describe('changeUserRole', () => {
  it('PATCH /api/admin/users/:publicId/role 를 { role } body 로 호출한다', async () => {
    const user = makeAdminUser({ role: 'ADMIN' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    await changeUserRole('u1', 'ADMIN');

    expect(mockPatch).toHaveBeenCalledWith('/api/admin/users/u1/role', { role: 'ADMIN' });
  });

  it('언랩된 AdminUser 를 반환한다', async () => {
    const user = makeAdminUser({ role: 'USER' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await changeUserRole('u1', 'USER');

    expect(result).toEqual(user);
  });

  it('role 값이 body 에 그대로 전달된다', async () => {
    mockPatch.mockResolvedValue({ data: { success: true, data: makeAdminUser() } });

    await changeUserRole('u1', 'ADMIN');
    await changeUserRole('u1', 'USER');

    expect(mockPatch).toHaveBeenNthCalledWith(1, '/api/admin/users/u1/role', { role: 'ADMIN' });
    expect(mockPatch).toHaveBeenNthCalledWith(2, '/api/admin/users/u1/role', { role: 'USER' });
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPatch.mockRejectedValueOnce(new Error('forbidden'));

    await expect(changeUserRole('u1', 'ADMIN')).rejects.toThrow('forbidden');
  });
});

// ── 유저 상세 / 통계 / 이력 / 알림 ──────────────────────────────────────────

const makeUserNotification = (overrides: Partial<UserNotification> = {}): UserNotification => ({
  id: 1,
  type: 'INFO',
  typeLabel: '안내',
  title: '알림 제목',
  content: '알림 본문',
  senderLabel: '운영팀',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeAdminUserDetail = (overrides: Partial<AdminUserDetail> = {}): AdminUserDetail => ({
  userId: 'u1',
  nickname: 'tester',
  email: 'test@example.com',
  profileImageUrl: 'https://cdn.example.com/u1.png',
  bio: null,
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'LOCAL',
  createdAt: '2026-01-01T00:00:00.000Z',
  solvedCount: 0,
  avgSolveRate: null,
  quizCount: 0,
  totalPlayCount: 0,
  totalStarCount: 0,
  ...overrides,
});

const makeSummary = (overrides: Partial<AdminUserSummary> = {}): AdminUserSummary => ({
  totalUsers: 100,
  ownerCount: 1,
  adminCount: 3,
  userCount: 90,
  suspendedCount: 6,
  newThisMonth: 12,
  ...overrides,
});

const makeMonthlyStat = (overrides: Partial<MonthlyUserStat> = {}): MonthlyUserStat => ({
  yearMonth: '2026-01',
  cumulative: 50,
  newCount: 10,
  churnCount: 2,
  ...overrides,
});

const makeHistory = (overrides: Partial<AdminUserHistory> = {}): AdminUserHistory => ({
  id: 1,
  actorId: 'admin1',
  actorNickname: '관리자',
  actorRole: 'ADMIN',
  changeType: 'ROLE_CHANGE',
  changeTypeLabel: '권한 변경',
  detail: 'USER → ADMIN',
  notification: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeHistoryPage = (content: AdminUserHistory[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: content.length === 0,
});

describe('getAdminUserSummary', () => {
  it('GET /api/admin/users/stats/summary 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeSummary() } });

    await getAdminUserSummary();

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users/stats/summary');
  });

  it('언랩된 AdminUserSummary 를 반환한다', async () => {
    const summary = makeSummary({ totalUsers: 42, suspendedCount: 3 });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: summary } });

    const result = await getAdminUserSummary();

    expect(result).toEqual(summary);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('forbidden'));

    await expect(getAdminUserSummary()).rejects.toThrow('forbidden');
  });
});

describe('getMonthlyUserStats', () => {
  it('months 기본값(6) 으로 GET /api/admin/users/stats/monthly 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [makeMonthlyStat()] } });

    await getMonthlyUserStats();

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users/stats/monthly', {
      params: { months: 6 },
    });
  });

  it('months 인자를 params 로 전달한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

    await getMonthlyUserStats(12);

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users/stats/monthly', {
      params: { months: 12 },
    });
  });

  it('언랩된 MonthlyUserStat[] 를 반환한다', async () => {
    const stats = [
      makeMonthlyStat({ yearMonth: '2026-01' }),
      makeMonthlyStat({ yearMonth: '2026-02', newCount: 20 }),
    ];
    mockGet.mockResolvedValueOnce({ data: { success: true, data: stats } });

    const result = await getMonthlyUserStats(2);

    expect(result).toEqual(stats);
    expect(result).toHaveLength(2);
  });

  it('빈 배열도 그대로 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

    const result = await getMonthlyUserStats();

    expect(result).toEqual([]);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('forbidden'));

    await expect(getMonthlyUserStats()).rejects.toThrow('forbidden');
  });
});

describe('getAdminUserDetail', () => {
  it('GET /api/admin/users/:publicId 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeAdminUserDetail() } });

    await getAdminUserDetail('u1');

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users/u1');
  });

  it('언랩된 AdminUserDetail 를 반환한다', async () => {
    const detail = makeAdminUserDetail({ userId: 'x', solvedCount: 5, avgSolveRate: 80 });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: detail } });

    const result = await getAdminUserDetail('x');

    expect(result).toEqual(detail);
  });

  it('publicId 가 URL 에 반영된다', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: makeAdminUserDetail() } });

    await getAdminUserDetail('abc');
    await getAdminUserDetail('xyz');

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/admin/users/abc');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/admin/users/xyz');
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getAdminUserDetail('u1')).rejects.toThrow('not found');
  });
});

describe('updateAdminUser', () => {
  it('PATCH /api/admin/users/:publicId 를 payload 와 함께 호출한다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: makeAdminUser() } });

    const payload: AdminUserUpdatePayload = {
      role: 'ADMIN',
      suspension: { suspend: true, until: '2026-07-01T00:00:00.000Z' },
    };
    await updateAdminUser('u1', payload);

    expect(mockPatch).toHaveBeenCalledWith('/api/admin/users/u1', payload);
  });

  it('언랩된 AdminUser 를 반환한다', async () => {
    const user = makeAdminUser({ role: 'ADMIN' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await updateAdminUser('u1', { role: 'ADMIN' });

    expect(result).toEqual(user);
  });

  it('publicId 가 URL 에 반영되고 부분 payload 도 그대로 전달된다', async () => {
    mockPatch.mockResolvedValue({ data: { success: true, data: makeAdminUser() } });

    await updateAdminUser('a', { resetNickname: true });
    await updateAdminUser('b', { notification: { type: 'WARNING', title: 't', content: 'c' } });

    expect(mockPatch).toHaveBeenNthCalledWith(1, '/api/admin/users/a', { resetNickname: true });
    expect(mockPatch).toHaveBeenNthCalledWith(2, '/api/admin/users/b', {
      notification: { type: 'WARNING', title: 't', content: 'c' },
    });
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPatch.mockRejectedValueOnce(new Error('forbidden'));

    await expect(updateAdminUser('u1', { role: 'USER' })).rejects.toThrow('forbidden');
  });
});

describe('sendUserNotification', () => {
  it('POST /api/admin/users/:publicId/notifications 를 draft body 로 호출한다', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: makeAdminUser() } });

    const draft: NotificationDraft = { type: 'INFO', title: '안내', content: '내용' };
    await sendUserNotification('u1', draft);

    expect(mockPost).toHaveBeenCalledWith('/api/admin/users/u1/notifications', draft);
  });

  it('언랩된 AdminUser 를 반환한다', async () => {
    const user = makeAdminUser();
    mockPost.mockResolvedValueOnce({ data: { success: true, data: user } });

    const result = await sendUserNotification('u1', {
      type: 'WARNING',
      title: '경고',
      content: '주의',
    });

    expect(result).toEqual(user);
  });

  it('publicId 가 URL 에 반영된다', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: makeAdminUser() } });

    await sendUserNotification('abc', { type: 'INFO', title: 't', content: 'c' });

    expect(mockPost).toHaveBeenCalledWith('/api/admin/users/abc/notifications', {
      type: 'INFO',
      title: 't',
      content: 'c',
    });
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('target invalid'));

    await expect(
      sendUserNotification('u1', { type: 'INFO', title: 't', content: 'c' }),
    ).rejects.toThrow('target invalid');
  });
});

describe('getAdminUserHistories', () => {
  it('GET /api/admin/users/:publicId/histories 를 params 와 함께 호출한다', async () => {
    const page = makeHistoryPage([makeHistory()]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    await getAdminUserHistories('u1', { page: 1, size: 10 });

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users/u1/histories', {
      params: { page: 1, size: 10 },
    });
  });

  it('query 없이 호출하면 params 가 undefined 이다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeHistoryPage([]) } });

    await getAdminUserHistories('u1');

    expect(mockGet).toHaveBeenCalledWith('/api/admin/users/u1/histories', { params: undefined });
  });

  it('ApiResponse 에서 Page 를 언랩해 반환한다 (notification 포함 케이스)', async () => {
    const page = makeHistoryPage([
      makeHistory({ id: 1 }),
      makeHistory({
        id: 2,
        changeType: null,
        changeTypeLabel: null,
        detail: null,
        notification: makeUserNotification(),
      }),
    ]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getAdminUserHistories('u1', { page: 0, size: 20 });

    expect(result).toEqual(page);
    expect(result.content).toHaveLength(2);
    expect(result.content[1].notification).toEqual(makeUserNotification());
  });

  it('빈 결과도 그대로 반환한다', async () => {
    const page = makeHistoryPage([]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getAdminUserHistories('u1');

    expect(result.content).toEqual([]);
    expect(result.empty).toBe(true);
  });

  it('publicId 가 URL 에 반영된다', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: makeHistoryPage([]) } });

    await getAdminUserHistories('abc');
    await getAdminUserHistories('xyz', { page: 3 });

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/admin/users/abc/histories', {
      params: undefined,
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/admin/users/xyz/histories', {
      params: { page: 3 },
    });
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getAdminUserHistories('u1')).rejects.toThrow('not found');
  });
});

// ── 공지 관리 ──────────────────────────────────────────────────────────────

const makeBoNoticeListItem = (overrides: Partial<BoNoticeListItem> = {}): BoNoticeListItem => ({
  id: 1,
  title: '공지 제목',
  status: 'PUBLISHED',
  pinned: false,
  viewCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeNoticePage = (content: BoNoticeListItem[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: content.length === 0,
});

const makeBoNotice = (overrides: Partial<BoNotice> = {}): BoNotice => ({
  id: 1,
  title: '공지 제목',
  content: '본문',
  status: 'PUBLISHED',
  pinned: false,
  viewCount: 0,
  publishedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  ...overrides,
});

const makeNoticeStats = (overrides: Partial<NoticeStats> = {}): NoticeStats => ({
  total: 10,
  published: 6,
  pinned: 2,
  draft: 4,
  ...overrides,
});

describe('getBoNotices', () => {
  it('GET /api/admin/notices 를 params 와 함께 호출한다', async () => {
    const page = makeNoticePage([makeBoNoticeListItem()]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const query = { filter: 'PINNED' as const, query: '검색', page: 1, size: 10 };
    await getBoNotices(query);

    expect(mockGet).toHaveBeenCalledWith('/api/admin/notices', { params: query });
  });

  it('query 없이 호출하면 params 가 undefined 이다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeNoticePage([]) } });

    await getBoNotices();

    expect(mockGet).toHaveBeenCalledWith('/api/admin/notices', { params: undefined });
  });

  it('ApiResponse 에서 Page 를 언랩해 반환한다', async () => {
    const page = makeNoticePage([makeBoNoticeListItem({ id: 1 }), makeBoNoticeListItem({ id: 2 })]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getBoNotices();

    expect(result).toEqual(page);
    expect(result.content).toHaveLength(2);
  });

  it('빈 결과도 그대로 반환한다', async () => {
    const page = makeNoticePage([]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: page } });

    const result = await getBoNotices();

    expect(result.content).toEqual([]);
    expect(result.empty).toBe(true);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('forbidden'));

    await expect(getBoNotices()).rejects.toThrow('forbidden');
  });
});

describe('getBoNoticeStats', () => {
  it('GET /api/admin/notices/stats 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeNoticeStats() } });

    await getBoNoticeStats();

    expect(mockGet).toHaveBeenCalledWith('/api/admin/notices/stats');
  });

  it('언랩된 NoticeStats 를 반환한다', async () => {
    const stats = makeNoticeStats({ total: 3, published: 2, pinned: 1, draft: 1 });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: stats } });

    const result = await getBoNoticeStats();

    expect(result).toEqual(stats);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('forbidden'));

    await expect(getBoNoticeStats()).rejects.toThrow('forbidden');
  });
});

describe('getBoNotice', () => {
  it('GET /api/admin/notices/:id 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeBoNotice() } });

    await getBoNotice(42);

    expect(mockGet).toHaveBeenCalledWith('/api/admin/notices/42');
  });

  it('언랩된 BoNotice 를 반환한다', async () => {
    const notice = makeBoNotice({ id: 7, title: '단건' });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: notice } });

    const result = await getBoNotice(7);

    expect(result).toEqual(notice);
  });

  it('id 가 URL 에 반영된다', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: makeBoNotice() } });

    await getBoNotice(1);
    await getBoNotice(99);

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/admin/notices/1');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/admin/notices/99');
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getBoNotice(1)).rejects.toThrow('not found');
  });
});

describe('createNotice', () => {
  it('POST /api/admin/notices 를 payload 와 함께 호출한다', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: makeBoNotice() } });

    const payload = {
      title: '새 공지',
      content: '본문',
      status: 'DRAFT' as const,
      pinned: false,
    };
    await createNotice(payload);

    expect(mockPost).toHaveBeenCalledWith('/api/admin/notices', payload);
  });

  it('언랩된 BoNotice 를 반환한다', async () => {
    const notice = makeBoNotice({ id: 11, status: 'DRAFT' });
    mockPost.mockResolvedValueOnce({ data: { success: true, data: notice } });

    const result = await createNotice({
      title: '새 공지',
      content: '본문',
      status: 'DRAFT',
      pinned: false,
    });

    expect(result).toEqual(notice);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('forbidden'));

    await expect(
      createNotice({ title: 't', content: 'c', status: 'PUBLISHED', pinned: true }),
    ).rejects.toThrow('forbidden');
  });
});

describe('updateNotice', () => {
  it('PATCH /api/admin/notices/:id 를 payload 와 함께 호출한다', async () => {
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: makeBoNotice() } });

    const payload = { title: '수정', pinned: true };
    await updateNotice(5, payload);

    expect(mockPatch).toHaveBeenCalledWith('/api/admin/notices/5', payload);
  });

  it('언랩된 BoNotice 를 반환한다', async () => {
    const notice = makeBoNotice({ id: 5, title: '수정됨' });
    mockPatch.mockResolvedValueOnce({ data: { success: true, data: notice } });

    const result = await updateNotice(5, { title: '수정됨' });

    expect(result).toEqual(notice);
  });

  it('id 가 URL 에 반영되고 부분 payload 도 그대로 전달된다', async () => {
    mockPatch.mockResolvedValue({ data: { success: true, data: makeBoNotice() } });

    await updateNotice(1, { status: 'PUBLISHED' });
    await updateNotice(2, { pinned: false });

    expect(mockPatch).toHaveBeenNthCalledWith(1, '/api/admin/notices/1', { status: 'PUBLISHED' });
    expect(mockPatch).toHaveBeenNthCalledWith(2, '/api/admin/notices/2', { pinned: false });
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPatch.mockRejectedValueOnce(new Error('not found'));

    await expect(updateNotice(1, { title: 'x' })).rejects.toThrow('not found');
  });
});

describe('deleteNotice', () => {
  it('DELETE /api/admin/notices/:id 를 호출한다', async () => {
    mockDelete.mockResolvedValueOnce({ data: { success: true, data: null } });

    await deleteNotice(8);

    expect(mockDelete).toHaveBeenCalledWith('/api/admin/notices/8');
  });

  it('void 를 반환한다 (응답 본문 무시)', async () => {
    mockDelete.mockResolvedValueOnce({ data: { success: true, data: null } });

    const result = await deleteNotice(8);

    expect(result).toBeUndefined();
  });

  it('id 가 URL 에 반영된다', async () => {
    mockDelete.mockResolvedValue({ data: { success: true, data: null } });

    await deleteNotice(1);
    await deleteNotice(2);

    expect(mockDelete).toHaveBeenNthCalledWith(1, '/api/admin/notices/1');
    expect(mockDelete).toHaveBeenNthCalledWith(2, '/api/admin/notices/2');
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockDelete.mockRejectedValueOnce(new Error('forbidden'));

    await expect(deleteNotice(1)).rejects.toThrow('forbidden');
  });
});

const makeAdminAxiosError = (
  status?: number,
  code?: string,
): { response?: { status?: number; data?: { error?: { code?: string } } } } => ({
  response: {
    status,
    data: code ? { error: { code } } : undefined,
  },
});

describe('mapAdminError', () => {
  describe('code 기반 매핑', () => {
    it('ADMIN_FORBIDDEN → FORBIDDEN', () => {
      expect(mapAdminError(makeAdminAxiosError(403, 'ADMIN_FORBIDDEN'))).toBe('FORBIDDEN');
    });

    it('ADMIN_TARGET_INVALID → TARGET_INVALID', () => {
      expect(mapAdminError(makeAdminAxiosError(400, 'ADMIN_TARGET_INVALID'))).toBe(
        'TARGET_INVALID',
      );
    });

    it('ACCOUNT_SUSPENDED → SUSPENDED (status 가 403/404 가 아닐 때)', () => {
      // 403 이면 status 매핑이 먼저 FORBIDDEN 으로 잡히므로 code 단독 효과는 다른 status 로 검증
      expect(mapAdminError(makeAdminAxiosError(400, 'ACCOUNT_SUSPENDED'))).toBe('SUSPENDED');
    });

    it('USER_NOT_FOUND → NOT_FOUND', () => {
      expect(mapAdminError(makeAdminAxiosError(404, 'USER_NOT_FOUND'))).toBe('NOT_FOUND');
    });
  });

  describe('status 기반 매핑 (code 없음)', () => {
    it('status 403 → FORBIDDEN', () => {
      expect(mapAdminError(makeAdminAxiosError(403))).toBe('FORBIDDEN');
    });

    it('status 404 → NOT_FOUND', () => {
      expect(mapAdminError(makeAdminAxiosError(404))).toBe('NOT_FOUND');
    });
  });

  describe('우선순위', () => {
    it('status 404 라도 code ADMIN_FORBIDDEN 이 우선되어 FORBIDDEN', () => {
      expect(mapAdminError(makeAdminAxiosError(404, 'ADMIN_FORBIDDEN'))).toBe('FORBIDDEN');
    });

    it('status 403 이지만 ACCOUNT_SUSPENDED 보다 403 매핑이 먼저 적용되어 FORBIDDEN', () => {
      // code !== ADMIN_FORBIDDEN 이지만 status 403 조건이 같은 if 에서 먼저 매칭됨
      expect(mapAdminError(makeAdminAxiosError(403, 'ACCOUNT_SUSPENDED'))).toBe('FORBIDDEN');
    });
  });

  describe('UNKNOWN fallback', () => {
    it('알 수 없는 code/status → UNKNOWN', () => {
      expect(mapAdminError(makeAdminAxiosError(500, 'SOMETHING_ELSE'))).toBe('UNKNOWN');
    });

    it('status 500 + code 없음 → UNKNOWN', () => {
      expect(mapAdminError(makeAdminAxiosError(500))).toBe('UNKNOWN');
    });

    it('response 없는 에러 → UNKNOWN', () => {
      expect(mapAdminError({})).toBe('UNKNOWN');
    });

    it('문자열 에러 → UNKNOWN', () => {
      expect(mapAdminError('boom')).toBe('UNKNOWN');
    });
  });
});
