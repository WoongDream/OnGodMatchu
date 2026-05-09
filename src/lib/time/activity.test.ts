import { describe, it, expect } from 'vitest';
import { getActivityDays } from './activity';

// UTC 기준 자정을 만드는 헬퍼
const utcMidnight = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

const NOW = utcMidnight(2026, 5, 8);

describe('getActivityDays', () => {
  describe('days 계산', () => {
    it('오늘 가입하면 days=1 을 반환한다', () => {
      const result = getActivityDays(NOW, NOW);
      expect(result?.days).toBe(1);
    });

    it('어제 가입하면 days=2 를 반환한다', () => {
      const yesterday = utcMidnight(2026, 5, 7);
      const result = getActivityDays(yesterday, NOW);
      expect(result?.days).toBe(2);
    });

    it('9일 전 가입하면 days=10 을 반환한다', () => {
      const nineAgo = utcMidnight(2026, 4, 29);
      const result = getActivityDays(nineAgo, NOW);
      expect(result?.days).toBe(10);
    });

    it('미래 createdAt 은 days=1 을 반환한다 (음수 방어)', () => {
      const tomorrow = utcMidnight(2026, 5, 9);
      const result = getActivityDays(tomorrow, NOW);
      expect(result?.days).toBe(1);
    });

    it('같은 로컬 날짜 내에서 시각만 다를 때 days=1 이다', () => {
      // startOfDayUtc 는 로컬 getFullYear/getMonth/getDate 를 사용하므로
      // 같은 로컬 날짜이면 startOfDay 가 동일 → elapsed=0 → days=1
      const morning = new Date(2026, 4, 8, 6, 0, 0); // 로컬 2026-05-08 06:00
      const evening = new Date(2026, 4, 8, 22, 0, 0); // 로컬 2026-05-08 22:00
      const result = getActivityDays(morning, evening);
      expect(result?.days).toBe(1);
    });

    it('로컬 날짜가 하루 다르면 days=2 이다', () => {
      // 로컬 기준 어제와 오늘
      const yesterday = new Date(2026, 4, 7, 23, 59, 0); // 로컬 2026-05-07 23:59
      const today = new Date(2026, 4, 8, 0, 1, 0); // 로컬 2026-05-08 00:01
      const result = getActivityDays(yesterday, today);
      expect(result?.days).toBe(2);
    });

    it('30일 전 가입하면 days=31 을 반환한다', () => {
      const thirtyAgo = utcMidnight(2026, 4, 8);
      const result = getActivityDays(thirtyAgo, NOW);
      expect(result?.days).toBe(31);
    });
  });

  describe('joinedDate 포맷', () => {
    it('오늘 가입 시 joinedDate 가 YYYY-MM-DD 형식이다', () => {
      const result = getActivityDays(NOW, NOW);
      expect(result?.joinedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('특정 날짜의 joinedDate 가 정확히 포맷된다', () => {
      const date = new Date(Date.UTC(2025, 0, 5, 12, 0, 0)); // 2025-01-05
      const result = getActivityDays(date, NOW);
      expect(result?.joinedDate).toBe('2025-01-05');
    });

    it('월과 일이 한 자리일 때 0 패딩이 붙는다', () => {
      const date = new Date(Date.UTC(2026, 2, 3, 0, 0, 0)); // 2026-03-03
      const result = getActivityDays(date, NOW);
      expect(result?.joinedDate).toBe('2026-03-03');
    });
  });

  describe('입력 타입 호환', () => {
    it('string(ISO) 입력을 처리한다', () => {
      const result = getActivityDays('2026-05-07T00:00:00.000Z', NOW);
      expect(result).not.toBeNull();
      expect(result?.days).toBe(2);
    });

    it('Date 객체 입력을 처리한다', () => {
      const result = getActivityDays(utcMidnight(2026, 5, 7), NOW);
      expect(result).not.toBeNull();
      expect(result?.days).toBe(2);
    });

    it('number(timestamp) 입력을 처리한다', () => {
      const ts = utcMidnight(2026, 5, 7).getTime();
      const result = getActivityDays(ts, NOW);
      expect(result).not.toBeNull();
      expect(result?.days).toBe(2);
    });
  });

  describe('잘못된 입력', () => {
    it('"invalid" 문자열 입력 시 null 을 반환한다', () => {
      expect(getActivityDays('invalid', NOW)).toBeNull();
    });

    it('빈 문자열 입력 시 null 을 반환한다', () => {
      expect(getActivityDays('', NOW)).toBeNull();
    });

    it('NaN timestamp 입력 시 null 을 반환한다', () => {
      expect(getActivityDays(NaN, NOW)).toBeNull();
    });

    it('파싱 불가능한 날짜 문자열 시 null 을 반환한다', () => {
      expect(getActivityDays('not-a-date-at-all', NOW)).toBeNull();
    });
  });

  describe('now 기본값', () => {
    it('now 를 생략하면 현재 시각 기준으로 계산한다 (최소 1)', () => {
      // now 를 전달하지 않으면 new Date() 가 사용되므로 항상 days >= 1
      const result = getActivityDays(new Date());
      expect(result).not.toBeNull();
      expect(result!.days).toBeGreaterThanOrEqual(1);
    });
  });
});
