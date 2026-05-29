import { describe, it, expect } from 'vitest';
import { toPolylinePoints } from './sparkline';

describe('toPolylinePoints', () => {
  it('빈 배열 → 빈 문자열', () => {
    expect(toPolylinePoints([], 100, 40)).toBe('');
  });

  it('width 가 0 이면 빈 문자열', () => {
    expect(toPolylinePoints([1, 2, 3], 0, 40)).toBe('');
  });

  it('height 가 0 이면 빈 문자열', () => {
    expect(toPolylinePoints([1, 2, 3], 100, 0)).toBe('');
  });

  it('단일 값은 가로/세로 중앙 한 점', () => {
    expect(toPolylinePoints([5], 100, 40)).toBe('50.00,20.00');
  });

  it('평탄(min===max) 분포는 모든 점이 height 중앙선(y = height/2)', () => {
    const result = toPolylinePoints([10, 10, 10], 100, 40);
    expect(result).toBe('0.00,20.00 50.00,20.00 100.00,20.00');
  });

  it('정상 분포 [1,2,3] / 100x40 → 좌→우 균등, y 는 min/max 정규화 (큰 값일수록 작은 y)', () => {
    // x: 0, 50, 100 (균등)
    // range = 2 → y = 40 - ((v-1)/2)*40 → v=1:40, v=2:20, v=3:0
    expect(toPolylinePoints([1, 2, 3], 100, 40)).toBe('0.00,40.00 50.00,20.00 100.00,0.00');
  });

  it('7개 점은 x 가 0, w/6, 2w/6, ..., w 로 균등 분포한다 (헤더 sparkline 케이스)', () => {
    const width = 120;
    const height = 40;
    // 평탄한 값으로 두면 x 좌표만 검증 가능 (y 는 모두 height/2)
    const result = toPolylinePoints([5, 5, 5, 5, 5, 5, 5], width, height);
    const parts = result.split(' ');
    expect(parts).toHaveLength(7);

    const xs = parts.map((p) => Number(p.split(',')[0]));
    const stepX = width / 6;
    for (let i = 0; i < 7; i += 1) {
      expect(xs[i]).toBeCloseTo(i * stepX, 2);
    }
    // 평탄 분포이므로 모든 y 는 height/2
    parts.forEach((p) => {
      expect(p.split(',')[1]).toBe('20.00');
    });
  });

  it('소수 좌표는 toFixed(2) 로 직렬화된다', () => {
    // values.length=2 → stepX = width/1 = width, 두 점만
    const result = toPolylinePoints([0, 1], 10, 5);
    // x: 0, 10 / y: 5(v=0), 0(v=1)
    expect(result).toBe('0.00,5.00 10.00,0.00');
  });
});
