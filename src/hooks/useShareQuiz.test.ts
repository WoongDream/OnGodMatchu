import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import useSWR, { SWRConfig, useSWRConfig, unstable_serialize } from 'swr';
import useShareQuiz from './useShareQuiz';
import { recordQuizShare } from '@/api/quiz';

vi.mock('@/api/quiz', () => ({
  recordQuizShare: vi.fn(),
}));

const mockedRecordQuizShare = vi.mocked(recordQuizShare);

type CacheProvider = Map<string, unknown>;
type WrapperProps = { children: ReactNode };

const createWrapper = (provider: CacheProvider) => {
  // SWRConfig 의 provider 타입(`Cache<any>`)은 내부 옵션. 테스트에서 외부 Map 으로 직접 검증하기 위해 cast.
  const value = { provider: () => provider } as unknown as Parameters<typeof SWRConfig>[0]['value'];
  const Wrapper = ({ children }: WrapperProps) => createElement(SWRConfig, { value }, children);
  return Wrapper;
};

const QUIZ_ID = 1;

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const originalLocation = Object.getOwnPropertyDescriptor(window, 'location');
const originalExecCommand = document.execCommand;

const setNavigatorClipboard = (value: unknown) => {
  Object.defineProperty(navigator, 'clipboard', {
    value,
    configurable: true,
    writable: true,
  });
};

const restoreDescriptor = (
  target: object,
  key: string,
  descriptor: PropertyDescriptor | undefined,
) => {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
  } else {
    delete (target as Record<string, unknown>)[key];
  }
};

describe('useShareQuiz', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      configurable: true,
      writable: true,
    });
    setNavigatorClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    mockedRecordQuizShare.mockReset();
    mockedRecordQuizShare.mockResolvedValue({ shareCount: 1, alreadyShared: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
    restoreDescriptor(navigator, 'clipboard', originalClipboard);
    restoreDescriptor(window, 'location', originalLocation);
    document.execCommand = originalExecCommand;
  });

  it('clipboard 성공 시 copied 를 반환하고 origin 기반 URL 로 writeText 가 호출된다', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    setNavigatorClipboard({ writeText: writeTextSpy });

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), {
      wrapper: createWrapper(new Map()),
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share();
    });

    expect(outcome).toBe('copied');
    expect(writeTextSpy).toHaveBeenCalledWith('https://example.com/quiz/1');
    expect(mockedRecordQuizShare).toHaveBeenCalledTimes(1);
    expect(mockedRecordQuizShare).toHaveBeenCalledWith(QUIZ_ID);
  });

  it('clipboard 실패 → execCommand fallback 이 true 면 copied 를 반환한다', async () => {
    setNavigatorClipboard({ writeText: vi.fn().mockRejectedValue(new Error('no perm')) });
    document.execCommand = vi.fn().mockReturnValue(true) as typeof document.execCommand;

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), {
      wrapper: createWrapper(new Map()),
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share();
    });

    expect(outcome).toBe('copied');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(mockedRecordQuizShare).toHaveBeenCalledTimes(1);
  });

  it('clipboard 실패 + execCommand 도 false → failed, recordQuizShare 는 호출되지 않는다', async () => {
    setNavigatorClipboard({ writeText: vi.fn().mockRejectedValue(new Error('no perm')) });
    document.execCommand = vi.fn().mockReturnValue(false) as typeof document.execCommand;

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), {
      wrapper: createWrapper(new Map()),
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share();
    });

    expect(outcome).toBe('failed');
    expect(mockedRecordQuizShare).not.toHaveBeenCalled();
  });

  it('성공 응답의 shareCount 로 detail SWR 캐시를 덮어쓴다 (낙관적 증분 아님)', async () => {
    mockedRecordQuizShare.mockResolvedValue({ shareCount: 10, alreadyShared: false });

    const provider: CacheProvider = new Map();
    const wrapper = createWrapper(provider);

    const detailKey = ['quiz', QUIZ_ID];
    const seedDetail = { id: QUIZ_ID, title: '테스트', shareCount: 3, questions: [] };

    // detail 키를 활성(subscribed) 상태로 만들어 mutate 가 적용되도록.
    const { result: cfg } = renderHook(
      () => {
        const swr = useSWR(detailKey, () => seedDetail);
        const config = useSWRConfig();
        return { swr, config };
      },
      { wrapper },
    );
    await act(async () => {
      await cfg.current.config.mutate(detailKey, seedDetail, { revalidate: false });
    });

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), { wrapper });

    await act(async () => {
      await result.current.share();
    });

    const cached = cfg.current.config.cache.get(unstable_serialize(detailKey)) as
      | { data?: { shareCount: number } }
      | undefined;
    expect(cached?.data?.shareCount).toBe(10);
  });

  it('alreadyShared=true 응답도 동일하게 shareCount 를 그대로 캐시에 반영하고 copied 를 반환한다', async () => {
    mockedRecordQuizShare.mockResolvedValue({ shareCount: 5, alreadyShared: true });

    const provider: CacheProvider = new Map();
    const wrapper = createWrapper(provider);

    const detailKey = ['quiz', QUIZ_ID];
    const seedDetail = { id: QUIZ_ID, title: '테스트', shareCount: 5, questions: [] };

    const { result: cfg } = renderHook(
      () => {
        const swr = useSWR(detailKey, () => seedDetail);
        const config = useSWRConfig();
        return { swr, config };
      },
      { wrapper },
    );
    await act(async () => {
      await cfg.current.config.mutate(detailKey, seedDetail, { revalidate: false });
    });

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), { wrapper });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share();
    });

    expect(outcome).toBe('copied');

    const cached = cfg.current.config.cache.get(unstable_serialize(detailKey)) as
      | { data?: { shareCount: number } }
      | undefined;
    expect(cached?.data?.shareCount).toBe(5);
  });

  it('list SWR 캐시(quizzes 키)의 해당 quizId 항목만 shareCount 가 덮어쓰이고 다른 항목은 그대로 유지된다', async () => {
    mockedRecordQuizShare.mockResolvedValue({ shareCount: 42, alreadyShared: false });

    const provider: CacheProvider = new Map();
    const wrapper = createWrapper(provider);

    const listKey = ['quizzes', { page: 0 }];
    const seedData = {
      content: [
        { id: 1, title: 'a', shareCount: 0 },
        { id: 2, title: 'b', shareCount: 7 },
      ],
    };

    // list 키를 활성(subscribed) 상태로 만들어야 filter-key mutate 가 매칭한다
    const { result: cfg } = renderHook(
      () => {
        const swr = useSWR(listKey, () => seedData);
        const config = useSWRConfig();
        return { swr, config };
      },
      { wrapper },
    );
    await act(async () => {
      await cfg.current.config.mutate(listKey, seedData, { revalidate: false });
    });

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), { wrapper });

    await act(async () => {
      await result.current.share();
    });

    const cached = cfg.current.config.cache.get(unstable_serialize(listKey)) as
      | { data?: { content: Array<{ id: number; shareCount: number }> } }
      | undefined;
    expect(cached?.data?.content.find((q) => q.id === 1)?.shareCount).toBe(42);
    expect(cached?.data?.content.find((q) => q.id === 2)?.shareCount).toBe(7);
  });

  it('recordQuizShare 가 reject 해도 share() 는 throw 하지 않고 copied 를 반환한다', async () => {
    mockedRecordQuizShare.mockRejectedValue(new Error('server down'));

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), {
      wrapper: createWrapper(new Map()),
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share();
    });

    expect(outcome).toBe('copied');
  });

  it('share() 를 연속 2번 호출하면 cooldown 없이 매번 recordQuizShare 가 호출되고 둘 다 copied 를 반환한다', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    setNavigatorClipboard({ writeText: writeTextSpy });

    const { result } = renderHook(() => useShareQuiz(QUIZ_ID), {
      wrapper: createWrapper(new Map()),
    });

    let first: string | undefined;
    let second: string | undefined;
    await act(async () => {
      first = await result.current.share();
    });
    await act(async () => {
      second = await result.current.share();
    });

    expect(first).toBe('copied');
    expect(second).toBe('copied');
    expect(writeTextSpy).toHaveBeenCalledTimes(2);
    expect(mockedRecordQuizShare).toHaveBeenCalledTimes(2);
  });
});
