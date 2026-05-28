import { describe, it, expect } from 'vitest';
import { formatCount } from './count';

describe('formatCount', () => {
  it('0 → "0"', () => expect(formatCount(0)).toBe('0'));
  it('1 → "1"', () => expect(formatCount(1)).toBe('1'));
  it('999 → "999"', () => expect(formatCount(999)).toBe('999'));
  it('1000 → "1k"', () => expect(formatCount(1000)).toBe('1k'));
  it('1200 → "1.2k"', () => expect(formatCount(1200)).toBe('1.2k'));
  it('12800 → "12.8k"', () => expect(formatCount(12800)).toBe('12.8k'));
  it('99000 → "99k"', () => expect(formatCount(99000)).toBe('99k'));
  it('100000 → "100k"', () => expect(formatCount(100000)).toBe('100k'));
  it('999999 → "999k"', () => expect(formatCount(999999)).toBe('999k'));
  it('1000000 → "1m"', () => expect(formatCount(1000000)).toBe('1m'));
  it('1500000 → "1.5m"', () => expect(formatCount(1500000)).toBe('1.5m'));
  it('음수는 "0" 으로 클램프', () => expect(formatCount(-5)).toBe('0'));
  it('NaN 은 "0"', () => expect(formatCount(NaN)).toBe('0'));
  it('Infinity 는 "0"', () => expect(formatCount(Infinity)).toBe('0'));
  it('비정수는 floor', () => expect(formatCount(1.9)).toBe('1'));
  it('1k 경계 — 1099 → "1.1k" (toFixed(1) 반올림)', () => expect(formatCount(1099)).toBe('1.1k'));
  it('1k 경계 — 1049 → "1k" (.0 trim)', () => expect(formatCount(1049)).toBe('1k'));
});
