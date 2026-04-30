import { describe, it, expect } from 'vitest';
import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
  NICKNAME_ALLOWED_REGEX,
  normalizeNickname,
  isWithinNicknameLength,
  matchesNicknamePolicy,
} from './policy';

describe('nickname/policy 상수', () => {
  it('NICKNAME_MIN_LENGTH 는 2 이다', () => {
    expect(NICKNAME_MIN_LENGTH).toBe(2);
  });

  it('NICKNAME_MAX_LENGTH 는 20 이다', () => {
    expect(NICKNAME_MAX_LENGTH).toBe(20);
  });

  it('NICKNAME_ALLOWED_REGEX 는 한글·영문·숫자·_ 만 허용한다', () => {
    expect(NICKNAME_ALLOWED_REGEX.test('홍길동')).toBe(true);
    expect(NICKNAME_ALLOWED_REGEX.test('Hong_2024')).toBe(true);
    expect(NICKNAME_ALLOWED_REGEX.test('홍 길동')).toBe(false);
    expect(NICKNAME_ALLOWED_REGEX.test('hong-gil')).toBe(false);
    expect(NICKNAME_ALLOWED_REGEX.test('hong!')).toBe(false);
  });
});

describe('normalizeNickname', () => {
  it('양쪽 공백을 제거한다', () => {
    expect(normalizeNickname('  hello  ')).toBe('hello');
  });

  it('Unicode NFC 로 정규화한다 (조합형 → 완성형)', () => {
    const decomposed = '홍';
    expect(normalizeNickname(decomposed)).toBe('홍');
  });

  it('빈 문자열을 입력하면 빈 문자열을 반환한다', () => {
    expect(normalizeNickname('')).toBe('');
  });

  it('공백만 있으면 빈 문자열로 정규화된다', () => {
    expect(normalizeNickname('   ')).toBe('');
  });
});

describe('isWithinNicknameLength', () => {
  it('1자는 false', () => {
    expect(isWithinNicknameLength('a')).toBe(false);
  });

  it('2자는 true (경계)', () => {
    expect(isWithinNicknameLength('ab')).toBe(true);
  });

  it('20자는 true (경계)', () => {
    expect(isWithinNicknameLength('a'.repeat(20))).toBe(true);
  });

  it('21자는 false', () => {
    expect(isWithinNicknameLength('a'.repeat(21))).toBe(false);
  });
});

describe('matchesNicknamePolicy', () => {
  it('길이·문자 모두 통과하면 true', () => {
    expect(matchesNicknamePolicy('홍길동')).toBe(true);
    expect(matchesNicknamePolicy('Hong_2024')).toBe(true);
  });

  it('길이 미달이면 false', () => {
    expect(matchesNicknamePolicy('a')).toBe(false);
  });

  it('금지 문자가 있으면 false', () => {
    expect(matchesNicknamePolicy('hong-gil')).toBe(false);
    expect(matchesNicknamePolicy('hello!')).toBe(false);
  });

  it('빈 문자열은 false', () => {
    expect(matchesNicknamePolicy('')).toBe(false);
  });
});
