import { describe, it, expect } from 'vitest';
import { formatRelativeKo } from './relative';

const NOW = new Date('2026-05-07T12:00:00+09:00');

describe('formatRelativeKo', () => {
  it('returns "방금 전" within a minute', () => {
    expect(formatRelativeKo(new Date(NOW.getTime() - 30 * 1000), NOW)).toBe('방금 전');
  });

  it('returns "N분 전" between 1 and 60 minutes', () => {
    expect(formatRelativeKo(new Date(NOW.getTime() - 5 * 60 * 1000), NOW)).toBe('5분 전');
    expect(formatRelativeKo(new Date(NOW.getTime() - 59 * 60 * 1000), NOW)).toBe('59분 전');
  });

  it('returns "N시간 전" between 1 hour and 24 hours', () => {
    expect(formatRelativeKo(new Date(NOW.getTime() - 60 * 60 * 1000), NOW)).toBe('1시간 전');
    expect(formatRelativeKo(new Date(NOW.getTime() - 23 * 60 * 60 * 1000), NOW)).toBe('23시간 전');
  });

  it('returns "N일 전" between 1 day and 7 days', () => {
    expect(formatRelativeKo(new Date(NOW.getTime() - 24 * 60 * 60 * 1000), NOW)).toBe('1일 전');
    expect(formatRelativeKo(new Date(NOW.getTime() - 6 * 24 * 60 * 60 * 1000), NOW)).toBe('6일 전');
  });

  it('returns absolute YYYY.MM.DD beyond 7 days', () => {
    expect(formatRelativeKo(new Date('2026-04-01T10:00:00+09:00'), NOW)).toBe('2026.04.01');
  });

  it('accepts ISO string input', () => {
    expect(formatRelativeKo('2026-05-07T11:55:00+09:00', NOW)).toBe('5분 전');
  });

  it('returns empty string for invalid input', () => {
    expect(formatRelativeKo('not-a-date', NOW)).toBe('');
  });

  it('returns absolute date for future timestamps', () => {
    expect(formatRelativeKo(new Date(NOW.getTime() + 10 * 60 * 1000), NOW)).toMatch(
      /^\d{4}\.\d{2}\.\d{2}$/,
    );
  });
});
