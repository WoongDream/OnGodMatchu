import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { UserNotification } from '@/types';

vi.mock('./instance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import instance from './instance';
import { getPendingNotifications, markNotificationRead } from './notification';

const mockGet = vi.mocked(instance.get);
const mockPost = vi.mocked(instance.post);

const makeNotification = (overrides: Partial<UserNotification> = {}): UserNotification => ({
  id: 1,
  type: 'INFO',
  typeLabel: '안내',
  title: '알림 제목',
  content: '알림 본문',
  senderLabel: '운영팀',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPendingNotifications', () => {
  it('GET /api/users/me/notifications/pending 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

    await getPendingNotifications();

    expect(mockGet).toHaveBeenCalledWith('/api/users/me/notifications/pending');
  });

  it('ApiResponse 에서 UserNotification[] 를 언랩해 반환한다', async () => {
    const notifications = [
      makeNotification({ id: 1, title: '첫 알림' }),
      makeNotification({ id: 2, type: 'WARNING', typeLabel: '경고', title: '둘째 알림' }),
    ];
    mockGet.mockResolvedValueOnce({ data: { success: true, data: notifications } });

    const result = await getPendingNotifications();

    expect(result).toEqual(notifications);
    expect(result).toHaveLength(2);
  });

  it('미확인 알림이 없으면 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

    const result = await getPendingNotifications();

    expect(result).toEqual([]);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('unauthorized'));

    await expect(getPendingNotifications()).rejects.toThrow('unauthorized');
  });
});

describe('markNotificationRead', () => {
  it('POST /api/users/me/notifications/:id/read 를 호출한다', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: null } });

    await markNotificationRead(7);

    expect(mockPost).toHaveBeenCalledWith('/api/users/me/notifications/7/read');
  });

  it('void 를 반환한다 (응답 본문 무시)', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: null } });

    const result = await markNotificationRead(7);

    expect(result).toBeUndefined();
  });

  it('id 가 URL 에 반영된다', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: null } });

    await markNotificationRead(1);
    await markNotificationRead(99);

    expect(mockPost).toHaveBeenNthCalledWith(1, '/api/users/me/notifications/1/read');
    expect(mockPost).toHaveBeenNthCalledWith(2, '/api/users/me/notifications/99/read');
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockPost.mockRejectedValueOnce(new Error('forbidden'));

    await expect(markNotificationRead(1)).rejects.toThrow('forbidden');
  });
});
