import type { ImageTransform, NormalizedCrop, Rotation } from '../../types/image';

/** 회전·반전의 net 상태 (crop 제외). 에디터가 버튼 입력을 D4 합성으로 누적해 이 표준형으로 보관한다. */
export type Orientation = { flipH: boolean; rotate: Rotation };

export const FULL_CROP: NormalizedCrop = { x: 0, y: 0, width: 1, height: 1 };
export const IDENTITY_ORIENTATION: Orientation = { flipH: false, rotate: 0 };

const normalizeRotation = (deg: number): Rotation => (((deg % 360) + 360) % 360) as Rotation;

/** 「90° 회전」 — 시계방향 +90. flipH 불변. */
export const rotateOrientationCw = (o: Orientation): Orientation => ({
  flipH: o.flipH,
  rotate: normalizeRotation(o.rotate + 90),
});

/**
 * 「좌우 반전」 — 화면에 보이는 이미지를 수직축 기준 미러. D4 항등 `F∘R^a = R^(-a)∘F` 를 이용해
 * "flip 먼저, rotate 나중" 표준 분해를 유지한다: rotate → (360 - rotate), flipH 토글.
 */
export const flipOrientation = (o: Orientation): Orientation => ({
  flipH: !o.flipH,
  rotate: normalizeRotation(360 - o.rotate),
});

/** crop 을 수직축 기준 x 미러. 반전 시 같은 시각 영역을 유지하기 위함 (flip 은 치수 불변). */
export const mirrorCropX = (c: NormalizedCrop): NormalizedCrop => ({
  x: 1 - c.x - c.width,
  y: c.y,
  width: c.width,
  height: c.height,
});

/** 원본 natural 치수 → 회전 적용 후(화면) 치수. flip 은 치수 불변, 90/270 에서 가로·세로 스왑. */
export const rotatedDimensions = (
  naturalWidth: number,
  naturalHeight: number,
  rotate: Rotation,
): { width: number; height: number } =>
  rotate === 90 || rotate === 270
    ? { width: naturalHeight, height: naturalWidth }
    : { width: naturalWidth, height: naturalHeight };

type PercentRect = { x: number; y: number; width: number; height: number };

/** react-image-crop PercentCrop(0~100) → 정규화(0~1). */
export const percentToNormalizedCrop = (c: PercentRect): NormalizedCrop => ({
  x: c.x / 100,
  y: c.y / 100,
  width: c.width / 100,
  height: c.height / 100,
});

/** 정규화(0~1) → react-image-crop PercentCrop(0~100). */
export const normalizedToPercentCrop = (
  c: NormalizedCrop,
): { unit: '%'; x: number; y: number; width: number; height: number } => ({
  unit: '%',
  x: c.x * 100,
  y: c.y * 100,
  width: c.width * 100,
  height: c.height * 100,
});

/** orientation + crop → 저장용 ImageTransform. */
export const buildTransform = (o: Orientation, crop: NormalizedCrop): ImageTransform => ({
  v: 1,
  flipH: o.flipH,
  rotate: o.rotate,
  crop,
});

/** 편집 없음(항등) 여부 — 저장 시 transform=null 로 보낼지, croppedKey=originalKey 로 둘지 판단. */
export const isIdentityTransform = (t: ImageTransform): boolean =>
  !t.flipH &&
  t.rotate === 0 &&
  t.crop.x === 0 &&
  t.crop.y === 0 &&
  t.crop.width === 1 &&
  t.crop.height === 1;
