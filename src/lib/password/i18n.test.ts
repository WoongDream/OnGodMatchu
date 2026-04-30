import { describe, it, expect } from 'vitest';
import { translateCrackTimes, translateFeedback } from './i18n';

describe('translateFeedback', () => {
  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(translateFeedback('')).toBe('');
  });

  it('알려진 영어 메시지를 한글로 변환한다', () => {
    expect(translateFeedback('This is a very common password')).toBe('매우 흔한 비밀번호입니다.');
    expect(translateFeedback('Add another word or two. Uncommon words are better.')).toContain(
      '한두 단어',
    );
    expect(translateFeedback('A word by itself is easy to guess')).toContain('단어 하나');
  });

  it('알려지지 않은 문자열은 그대로 통과시킨다 (방어적 fallback)', () => {
    expect(translateFeedback('Totally unknown feedback string')).toBe(
      'Totally unknown feedback string',
    );
  });
});

describe('translateCrackTimes', () => {
  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(translateCrackTimes('')).toBe('');
  });

  it('"less than a second" → "1초 미만"', () => {
    expect(translateCrackTimes('less than a second')).toBe('1초 미만');
  });

  it('"less than a minute" → "1분 미만"', () => {
    expect(translateCrackTimes('less than a minute')).toBe('1분 미만');
  });

  it('"centuries" → "수세기"', () => {
    expect(translateCrackTimes('centuries')).toBe('수세기');
  });

  it('"3 hours" → "3시간"', () => {
    expect(translateCrackTimes('3 hours')).toBe('3시간');
  });

  it('"1 second" → "1초"', () => {
    expect(translateCrackTimes('1 second')).toBe('1초');
  });

  it('"30 seconds" → "30초"', () => {
    expect(translateCrackTimes('30 seconds')).toBe('30초');
  });

  it('"5 minutes" → "5분"', () => {
    expect(translateCrackTimes('5 minutes')).toBe('5분');
  });

  it('"1 day" → "1일"', () => {
    expect(translateCrackTimes('1 day')).toBe('1일');
  });

  it('"3 months" → "3개월"', () => {
    expect(translateCrackTimes('3 months')).toBe('3개월');
  });

  it('"100 years" → "100년"', () => {
    expect(translateCrackTimes('100 years')).toBe('100년');
  });

  it('알려지지 않은 패턴은 그대로 통과시킨다', () => {
    expect(translateCrackTimes('eternity')).toBe('eternity');
  });
});
