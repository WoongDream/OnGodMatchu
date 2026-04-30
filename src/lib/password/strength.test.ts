import { describe, it, expect } from 'vitest';
import { evaluateStrength, canSubmitByStrength } from './strength';

describe('evaluateStrength', () => {
  describe('score 범위', () => {
    it('반환된 score 는 0~4 사이의 정수다', () => {
      const { score } = evaluateStrength('password');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(4);
    });

    it('"password" 는 score 0 또는 1 이하로 평가된다 (매우 약함)', () => {
      const { score } = evaluateStrength('password');
      expect(score).toBeLessThanOrEqual(1);
    });

    it('긴 한국어 문장은 score >= 2 로 평가된다', () => {
      const { score } = evaluateStrength('내고양이는오늘도잠만잔다');
      expect(score).toBeGreaterThanOrEqual(2);
    });
  });

  describe('feedbackWarning', () => {
    it('"password" 는 비어있지 않은 feedbackWarning 을 갖는다', () => {
      const { feedbackWarning } = evaluateStrength('password');
      expect(typeof feedbackWarning).toBe('string');
      expect(feedbackWarning.length).toBeGreaterThan(0);
    });
  });

  describe('crackTimesDisplay', () => {
    it('crackTimesDisplay 는 문자열을 반환한다', () => {
      const { crackTimesDisplay } = evaluateStrength('somePassword1!');
      expect(typeof crackTimesDisplay).toBe('string');
    });
  });

  describe('feedbackSuggestions', () => {
    it('feedbackSuggestions 는 배열을 반환한다', () => {
      const { feedbackSuggestions } = evaluateStrength('password');
      expect(Array.isArray(feedbackSuggestions)).toBe(true);
    });
  });

  describe('userInputs 페널티', () => {
    it('비밀번호와 동일한 문자열을 userInputs 에 전달하면 score 가 0 이 된다', () => {
      const email = 'test@example.com';
      const { score } = evaluateStrength(email, [email]);
      expect(score).toBe(0);
    });

    it('userInputs 를 빈 배열로 전달하면 기본 동작과 동일하다', () => {
      const base = evaluateStrength('SomePw123!');
      const withEmpty = evaluateStrength('SomePw123!', []);
      expect(withEmpty.score).toBe(base.score);
    });
  });
});

describe('canSubmitByStrength', () => {
  it('score 0 은 false 를 반환한다', () => {
    expect(canSubmitByStrength(0)).toBe(false);
  });

  it('score 1 은 true 를 반환한다', () => {
    expect(canSubmitByStrength(1)).toBe(true);
  });

  it('score 2 는 true 를 반환한다', () => {
    expect(canSubmitByStrength(2)).toBe(true);
  });

  it('score 3 은 true 를 반환한다', () => {
    expect(canSubmitByStrength(3)).toBe(true);
  });

  it('score 4 는 true 를 반환한다', () => {
    expect(canSubmitByStrength(4)).toBe(true);
  });
});
