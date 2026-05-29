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
import { recordVisit } from './visit';

const mockPost = vi.mocked(instance.post);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('recordVisit', () => {
  it('POST /api/visits 를 path 본문과 함께 호출한다', () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: null } });
    recordVisit('/quiz');
    expect(mockPost).toHaveBeenCalledWith('/api/visits', { path: '/quiz' });
  });

  it('빈 문자열이면 instance.post 를 호출하지 않는다 (early return)', () => {
    recordVisit('');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('instance.post 가 reject 해도 동기적으로 throw 하지 않는다 (fire-and-forget)', async () => {
    mockPost.mockRejectedValueOnce(new Error('boom'));
    expect(() => recordVisit('/x')).not.toThrow();
    expect(mockPost).toHaveBeenCalledWith('/api/visits', { path: '/x' });
    // micro-task flush — 내부 .catch 가 rejection 을 삼키는지 확인
    await new Promise((r) => setTimeout(r, 0));
  });

  it('반환값이 undefined (void) 이다', () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: null } });
    expect(recordVisit('/x')).toBeUndefined();
  });
});
