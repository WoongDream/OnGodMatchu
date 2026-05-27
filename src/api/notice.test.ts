import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { NoticeListItem, NoticeDetail } from '@/types';

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
  getAnnouncements,
  getReleaseNotes,
  getAnnouncementDetail,
  getReleaseNoteDetail,
  type NoticePage,
} from './notice';

const mockGet = vi.mocked(instance.get);

const makeListItem = (overrides: Partial<NoticeListItem> = {}): NoticeListItem => ({
  id: 1,
  title: '공지 제목',
  publishedAt: '2026-05-01T00:00:00+09:00',
  ...overrides,
});

const makePage = (
  content: NoticeListItem[] = [],
  overrides: Partial<NoticePage> = {},
): NoticePage => ({
  content,
  totalElements: content.length,
  totalPages: content.length === 0 ? 0 : 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: content.length === 0,
  ...overrides,
});

const makeDetail = (overrides: Partial<NoticeDetail> = {}): NoticeDetail => ({
  id: 1,
  title: '상세 제목',
  content: '본문',
  publishedAt: '2026-05-01T00:00:00+09:00',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAnnouncements', () => {
  it('쿼리 없이 호출하면 GET /api/announcements 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getAnnouncements();

    expect(mockGet).toHaveBeenCalledWith('/api/announcements');
  });

  it('page/size 가 모두 주어지면 쿼리스트링으로 포함한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getAnnouncements({ page: 0, size: 20 });

    expect(mockGet).toHaveBeenCalledWith('/api/announcements?page=0&size=20');
  });

  it('page 만 주어지면 size 는 쿼리에 포함하지 않는다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getAnnouncements({ page: 2 });

    expect(mockGet).toHaveBeenCalledWith('/api/announcements?page=2');
  });

  it('size 만 주어지면 page 는 쿼리에 포함하지 않는다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getAnnouncements({ size: 5 });

    expect(mockGet).toHaveBeenCalledWith('/api/announcements?size=5');
  });

  it('빈 객체 쿼리는 쿼리스트링을 만들지 않는다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getAnnouncements({});

    expect(mockGet).toHaveBeenCalledWith('/api/announcements');
  });

  it('ApiResponse 에서 data.data (NoticePage) 를 언랩해서 반환한다', async () => {
    const fixture = makePage([
      makeListItem({ id: 10, title: '첫 공지' }),
      makeListItem({ id: 11, title: '둘째 공지' }),
    ]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: fixture } });

    const result = await getAnnouncements({ page: 0, size: 20 });

    expect(result).toEqual(fixture);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'));

    await expect(getAnnouncements()).rejects.toThrow('network');
  });
});

describe('getReleaseNotes', () => {
  it('쿼리 없이 호출하면 GET /api/release-notes 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getReleaseNotes();

    expect(mockGet).toHaveBeenCalledWith('/api/release-notes');
  });

  it('page/size 가 모두 주어지면 쿼리스트링으로 포함한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getReleaseNotes({ page: 0, size: 20 });

    expect(mockGet).toHaveBeenCalledWith('/api/release-notes?page=0&size=20');
  });

  it('page 만 주어지면 size 는 쿼리에 포함하지 않는다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getReleaseNotes({ page: 2 });

    expect(mockGet).toHaveBeenCalledWith('/api/release-notes?page=2');
  });

  it('size 만 주어지면 page 는 쿼리에 포함하지 않는다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makePage() } });

    await getReleaseNotes({ size: 5 });

    expect(mockGet).toHaveBeenCalledWith('/api/release-notes?size=5');
  });

  it('ApiResponse 에서 data.data (NoticePage) 를 언랩해서 반환한다', async () => {
    const fixture = makePage([makeListItem({ id: 100, title: 'v1.0.0' })]);
    mockGet.mockResolvedValueOnce({ data: { success: true, data: fixture } });

    const result = await getReleaseNotes();

    expect(result).toEqual(fixture);
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'));

    await expect(getReleaseNotes()).rejects.toThrow('network');
  });
});

describe('getAnnouncementDetail', () => {
  it('GET /api/announcements/{id} 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeDetail({ id: 123 }) } });

    await getAnnouncementDetail(123);

    expect(mockGet).toHaveBeenCalledWith('/api/announcements/123');
  });

  it('ApiResponse 에서 data.data (NoticeDetail) 를 언랩해서 반환한다', async () => {
    const fixture = makeDetail({ id: 123, title: '공지 상세', content: '본문 내용' });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: fixture } });

    const result = await getAnnouncementDetail(123);

    expect(result).toEqual(fixture);
  });

  it('id 가 다른 경우 각각 다른 URL 로 호출한다', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: makeDetail() } });

    await getAnnouncementDetail(1);
    await getAnnouncementDetail(2);

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/announcements/1');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/announcements/2');
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getAnnouncementDetail(999)).rejects.toThrow('not found');
  });
});

describe('getReleaseNoteDetail', () => {
  it('GET /api/release-notes/{id} 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeDetail({ id: 456 }) } });

    await getReleaseNoteDetail(456);

    expect(mockGet).toHaveBeenCalledWith('/api/release-notes/456');
  });

  it('ApiResponse 에서 data.data (NoticeDetail) 를 언랩해서 반환한다', async () => {
    const fixture = makeDetail({ id: 456, title: 'v1.2.0 릴리스 노트', content: '변경 내역' });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: fixture } });

    const result = await getReleaseNoteDetail(456);

    expect(result).toEqual(fixture);
  });

  it('id 가 다른 경우 각각 다른 URL 로 호출한다', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: makeDetail() } });

    await getReleaseNoteDetail(10);
    await getReleaseNoteDetail(20);

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/release-notes/10');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/release-notes/20');
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getReleaseNoteDetail(999)).rejects.toThrow('not found');
  });
});
