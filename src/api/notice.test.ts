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
import { getAnnouncements, getAnnouncementDetail, type NoticePage } from './notice';

const mockGet = vi.mocked(instance.get);

const makeListItem = (overrides: Partial<NoticeListItem> = {}): NoticeListItem => ({
  slug: 'service-open',
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
  slug: 'service-open',
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
      makeListItem({ slug: 'service-open', title: '첫 공지' }),
      makeListItem({ slug: 'maintenance-notice', title: '둘째 공지' }),
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

describe('getAnnouncementDetail', () => {
  it('GET /api/announcements/{slug} 를 호출한다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: makeDetail({ slug: 'service-open' }) },
    });

    await getAnnouncementDetail('service-open');

    expect(mockGet).toHaveBeenCalledWith('/api/announcements/service-open');
  });

  it('ApiResponse 에서 data.data (NoticeDetail) 를 언랩해서 반환한다', async () => {
    const fixture = makeDetail({
      slug: 'service-open',
      title: '공지 상세',
      content: '본문 내용',
    });
    mockGet.mockResolvedValueOnce({ data: { success: true, data: fixture } });

    const result = await getAnnouncementDetail('service-open');

    expect(result).toEqual(fixture);
  });

  it('slug 가 다른 경우 각각 다른 URL 로 호출한다', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: makeDetail() } });

    await getAnnouncementDetail('service-open');
    await getAnnouncementDetail('maintenance-notice');

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/announcements/service-open');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/announcements/maintenance-notice');
  });

  it('slug 에 특수문자가 있으면 encodeURIComponent 로 escape 한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: makeDetail() } });

    await getAnnouncementDetail('한글 슬러그/test');

    expect(mockGet).toHaveBeenCalledWith(
      '/api/announcements/%ED%95%9C%EA%B8%80%20%EC%8A%AC%EB%9F%AC%EA%B7%B8%2Ftest',
    );
  });

  it('axios 에러를 그대로 throw 한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('not found'));

    await expect(getAnnouncementDetail('missing')).rejects.toThrow('not found');
  });
});
