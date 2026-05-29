import { describe, it, expect } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('원본 배열을 mutate 하지 않는다', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr, 42);
    expect(arr).toEqual(copy);
  });

  it('같은 seed 면 같은 결과 (결정성)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = shuffle(arr, 42);
    const b = shuffle(arr, 42);
    expect(a).toEqual(b);
  });

  it('다른 seed 면 다른 결과 (대부분 케이스)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = shuffle(arr, 1);
    const b = shuffle(arr, 2);
    expect(a).not.toEqual(b);
  });

  it('결과는 같은 길이 + 같은 요소 (permutation)', () => {
    const arr = [1, 2, 3, 4, 5];
    const out = shuffle(arr, 7);
    expect(out).toHaveLength(arr.length);
    expect([...out].sort()).toEqual([...arr].sort());
  });

  it('빈 배열은 빈 배열 반환', () => {
    expect(shuffle([], 1)).toEqual([]);
  });

  it('단일 요소 배열은 그대로 반환', () => {
    expect(shuffle([42], 99)).toEqual([42]);
  });

  it('seed 미지정 시도 길이/요소는 보존', () => {
    const arr = [1, 2, 3, 4, 5];
    const out = shuffle(arr);
    expect(out).toHaveLength(arr.length);
    expect([...out].sort()).toEqual([...arr].sort());
  });
});
