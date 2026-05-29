import { describe, it, expect } from 'vitest';
import type { ImageTransform, NormalizedCrop } from '../../types/image';
import {
  FULL_CROP,
  IDENTITY_ORIENTATION,
  type Orientation,
  rotateOrientationCw,
  flipOrientation,
  mirrorCropX,
  rotatedDimensions,
  percentToNormalizedCrop,
  normalizedToPercentCrop,
  buildTransform,
  isIdentityTransform,
} from './transform';

describe('rotateOrientationCw', () => {
  it('시계방향 +90 누적 (0→90→180→270→0)', () => {
    let o: Orientation = { flipH: false, rotate: 0 };
    o = rotateOrientationCw(o);
    expect(o.rotate).toBe(90);
    o = rotateOrientationCw(o);
    expect(o.rotate).toBe(180);
    o = rotateOrientationCw(o);
    expect(o.rotate).toBe(270);
    o = rotateOrientationCw(o);
    expect(o.rotate).toBe(0);
  });

  it('360 wrap (270 + 90 = 0)', () => {
    expect(rotateOrientationCw({ flipH: false, rotate: 270 }).rotate).toBe(0);
  });

  it('flipH 는 불변', () => {
    expect(rotateOrientationCw({ flipH: true, rotate: 90 })).toEqual({
      flipH: true,
      rotate: 180,
    });
    expect(rotateOrientationCw({ flipH: false, rotate: 90 }).flipH).toBe(false);
  });
});

describe('flipOrientation', () => {
  it('flipH 토글 + rotate→(360-rotate) 표준형', () => {
    expect(flipOrientation({ flipH: false, rotate: 0 })).toEqual({ flipH: true, rotate: 0 });
    expect(flipOrientation({ flipH: false, rotate: 90 })).toEqual({ flipH: true, rotate: 270 });
    expect(flipOrientation({ flipH: false, rotate: 270 })).toEqual({ flipH: true, rotate: 90 });
    expect(flipOrientation({ flipH: true, rotate: 90 })).toEqual({ flipH: false, rotate: 270 });
  });

  it('rotate 180 은 flip 후에도 180 (360-180=180)', () => {
    expect(flipOrientation({ flipH: false, rotate: 180 })).toEqual({ flipH: true, rotate: 180 });
  });

  it('두 번 flip 하면 원상복귀 (flipH·rotate 모두)', () => {
    const cases: Orientation[] = [
      { flipH: false, rotate: 0 },
      { flipH: false, rotate: 90 },
      { flipH: false, rotate: 180 },
      { flipH: false, rotate: 270 },
      { flipH: true, rotate: 90 },
      { flipH: true, rotate: 270 },
    ];
    for (const o of cases) {
      expect(flipOrientation(flipOrientation(o))).toEqual(o);
    }
  });

  it('연속 회전이 D4 에서 일관 (rotate 두 번 = rotate 180)', () => {
    const start: Orientation = { flipH: false, rotate: 0 };
    const twice = rotateOrientationCw(rotateOrientationCw(start));
    expect(twice).toEqual({ flipH: false, rotate: 180 });
  });

  it('D4 합성 일관: flip→rotate→flip = rotate^(-1) (R^a 회전 부호 반전)', () => {
    // F∘R∘F = R^(-1): flipH:false, rotate:90 에서 시작
    const o: Orientation = { flipH: false, rotate: 90 };
    const composed = flipOrientation(rotateOrientationCw(flipOrientation(o)));
    // flip(o)={true,270} → rotateCw={true,0} → flip={false,0}... 표준형 누적 일관성 확인
    expect(composed).toEqual({ flipH: false, rotate: 0 });
  });
});

describe('mirrorCropX', () => {
  it('x = 1 - x - width 로 미러, y/width/height 불변', () => {
    const c: NormalizedCrop = { x: 0.1, y: 0.2, width: 0.5, height: 0.3 };
    const m = mirrorCropX(c);
    expect(m.x).toBeCloseTo(0.4);
    expect(m.y).toBeCloseTo(0.2);
    expect(m.width).toBeCloseTo(0.5);
    expect(m.height).toBeCloseTo(0.3);
  });

  it('두 번 적용 시 원복', () => {
    const c: NormalizedCrop = { x: 0.1, y: 0.2, width: 0.5, height: 0.3 };
    const back = mirrorCropX(mirrorCropX(c));
    expect(back.x).toBeCloseTo(c.x);
    expect(back.y).toBeCloseTo(c.y);
    expect(back.width).toBeCloseTo(c.width);
    expect(back.height).toBeCloseTo(c.height);
  });

  it('FULL_CROP 은 미러해도 동일', () => {
    expect(mirrorCropX(FULL_CROP)).toEqual(FULL_CROP);
  });
});

describe('rotatedDimensions', () => {
  it('0/180 은 (W,H) 유지', () => {
    expect(rotatedDimensions(800, 600, 0)).toEqual({ width: 800, height: 600 });
    expect(rotatedDimensions(800, 600, 180)).toEqual({ width: 800, height: 600 });
  });

  it('90/270 은 (H,W) 스왑', () => {
    expect(rotatedDimensions(800, 600, 90)).toEqual({ width: 600, height: 800 });
    expect(rotatedDimensions(800, 600, 270)).toEqual({ width: 600, height: 800 });
  });
});

describe('percentToNormalizedCrop / normalizedToPercentCrop', () => {
  it('percent(0~100) → normalized(0~1)', () => {
    const n = percentToNormalizedCrop({ x: 10, y: 20, width: 50, height: 30 });
    expect(n.x).toBeCloseTo(0.1);
    expect(n.y).toBeCloseTo(0.2);
    expect(n.width).toBeCloseTo(0.5);
    expect(n.height).toBeCloseTo(0.3);
  });

  it('normalized(0~1) → percent(0~100), unit:%', () => {
    const p = normalizedToPercentCrop({ x: 0.1, y: 0.2, width: 0.5, height: 0.3 });
    expect(p.unit).toBe('%');
    expect(p.x).toBeCloseTo(10);
    expect(p.y).toBeCloseTo(20);
    expect(p.width).toBeCloseTo(50);
    expect(p.height).toBeCloseTo(30);
  });

  it('왕복(round-trip) 항등: normalized → percent → normalized', () => {
    const c: NormalizedCrop = { x: 0.123, y: 0.456, width: 0.321, height: 0.099 };
    const back = percentToNormalizedCrop(normalizedToPercentCrop(c));
    expect(back.x).toBeCloseTo(c.x);
    expect(back.y).toBeCloseTo(c.y);
    expect(back.width).toBeCloseTo(c.width);
    expect(back.height).toBeCloseTo(c.height);
  });

  it('왕복(round-trip) 항등: percent → normalized → percent', () => {
    const p = { x: 12.5, y: 33.3, width: 40, height: 25 };
    const out = normalizedToPercentCrop(percentToNormalizedCrop(p));
    expect(out.x).toBeCloseTo(p.x);
    expect(out.y).toBeCloseTo(p.y);
    expect(out.width).toBeCloseTo(p.width);
    expect(out.height).toBeCloseTo(p.height);
  });
});

describe('buildTransform', () => {
  it('orientation + crop → {v:1, flipH, rotate, crop}', () => {
    const o: Orientation = { flipH: true, rotate: 90 };
    const crop: NormalizedCrop = { x: 0.1, y: 0.2, width: 0.5, height: 0.3 };
    expect(buildTransform(o, crop)).toEqual({
      v: 1,
      flipH: true,
      rotate: 90,
      crop,
    });
  });

  it('IDENTITY_ORIENTATION + FULL_CROP → 항등 transform', () => {
    expect(buildTransform(IDENTITY_ORIENTATION, FULL_CROP)).toEqual({
      v: 1,
      flipH: false,
      rotate: 0,
      crop: FULL_CROP,
    });
  });
});

describe('isIdentityTransform', () => {
  const identity: ImageTransform = {
    v: 1,
    flipH: false,
    rotate: 0,
    crop: { x: 0, y: 0, width: 1, height: 1 },
  };

  it('항등(flipH=false, rotate=0, full crop)만 true', () => {
    expect(isIdentityTransform(identity)).toBe(true);
  });

  it('flipH=true 면 false', () => {
    expect(isIdentityTransform({ ...identity, flipH: true })).toBe(false);
  });

  it('rotate≠0 이면 false', () => {
    expect(isIdentityTransform({ ...identity, rotate: 90 })).toBe(false);
  });

  it('부분 크롭이면 false', () => {
    expect(isIdentityTransform({ ...identity, crop: { x: 0.1, y: 0, width: 1, height: 1 } })).toBe(
      false,
    );
    expect(isIdentityTransform({ ...identity, crop: { x: 0, y: 0, width: 0.5, height: 1 } })).toBe(
      false,
    );
  });
});

describe('상수', () => {
  it('FULL_CROP 값 확인', () => {
    expect(FULL_CROP).toEqual({ x: 0, y: 0, width: 1, height: 1 });
  });

  it('IDENTITY_ORIENTATION 값 확인', () => {
    expect(IDENTITY_ORIENTATION).toEqual({ flipH: false, rotate: 0 });
  });
});
