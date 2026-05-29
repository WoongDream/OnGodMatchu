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
import { getVisitorSummary, type VisitorSummary } from './stats';

const mockGet = vi.mocked(instance.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getVisitorSummary', () => {
  it('GET /api/stats/visitors 를 호출한다', async () => {
    const payload: VisitorSummary = { today: 0, total: 0, daily: [] };
    mockGet.mockResolvedValueOnce({ data: { success: true, data: payload } });

    await getVisitorSummary();

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/api/stats/visitors');
  });

  it('응답 data 를 언랩해 VisitorSummary 를 그대로 반환한다', async () => {
    const payload: VisitorSummary = {
      today: 63,
      total: 7_600_000,
      daily: [
        { date: '2026-05-22', visitorCount: 10 },
        { date: '2026-05-23', visitorCount: 20 },
        { date: '2026-05-24', visitorCount: 0 },
        { date: '2026-05-25', visitorCount: 5 },
        { date: '2026-05-26', visitorCount: 12 },
        { date: '2026-05-27', visitorCount: 31 },
        { date: '2026-05-28', visitorCount: 63 },
      ],
    };
    mockGet.mockResolvedValueOnce({ data: { success: true, data: payload } });

    const res = await getVisitorSummary();

    expect(res).toEqual(payload);
    expect(res.today).toBe(63);
    expect(res.total).toBe(7_600_000);
    expect(res.daily).toHaveLength(7);
  });

  it('daily 가 빈 배열이어도 정상 반환한다', async () => {
    const payload: VisitorSummary = { today: 0, total: 0, daily: [] };
    mockGet.mockResolvedValueOnce({ data: { success: true, data: payload } });

    const res = await getVisitorSummary();

    expect(res).toEqual(payload);
    expect(res.daily).toEqual([]);
  });

  it('instance.get 이 reject 하면 그대로 전파한다', async () => {
    mockGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getVisitorSummary()).rejects.toThrow('network down');
  });
});
