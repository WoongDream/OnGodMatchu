import { describe, it, expect } from 'vitest';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_SCORE,
  isLengthValid,
} from './policy';

describe('password/policy 상수', () => {
  it('PASSWORD_MIN_LENGTH 는 10 이다', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(10);
  });

  it('PASSWORD_MAX_LENGTH 는 64 이다', () => {
    expect(PASSWORD_MAX_LENGTH).toBe(64);
  });

  it('PASSWORD_MIN_SCORE 는 1 이다', () => {
    expect(PASSWORD_MIN_SCORE).toBe(1);
  });
});

describe('isLengthValid', () => {
  it('빈 문자열은 false 를 반환한다', () => {
    expect(isLengthValid('')).toBe(false);
  });

  it('9자(최솟값 미만)는 false 를 반환한다', () => {
    expect(isLengthValid('a'.repeat(9))).toBe(false);
  });

  it('10자(최솟값)는 true 를 반환한다', () => {
    expect(isLengthValid('a'.repeat(10))).toBe(true);
  });

  it('64자(최댓값)는 true 를 반환한다', () => {
    expect(isLengthValid('a'.repeat(64))).toBe(true);
  });

  it('65자(최댓값 초과)는 false 를 반환한다', () => {
    expect(isLengthValid('a'.repeat(65))).toBe(false);
  });

  it('중간 길이(32자)는 true 를 반환한다', () => {
    expect(isLengthValid('a'.repeat(32))).toBe(true);
  });

  it('1자는 false 를 반환한다', () => {
    expect(isLengthValid('a')).toBe(false);
  });
});
