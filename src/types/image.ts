/** 시계방향 회전 각도 (90 단위). */
export type Rotation = 0 | 90 | 180 | 270;

/** 0~1 정규화 크롭 사각형. 회전·반전이 적용된(=화면에 보이는) 좌표계 기준, 좌상단 (x, y). */
export type NormalizedCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * 이미지 크롭/변환 파라미터. BE 에는 opaque JSON 으로 저장되고 FE 가 셰이프를 소유한다.
 * 적용 순서: flip(좌우 반전) → rotate(시계방향) → crop. crop 은 회전·반전 후 좌표계 기준.
 * "편집 없음"(원본 그대로) 은 transform = null 로 표현하며 저장하지 않는다 (croppedKey === originalKey).
 */
export type ImageTransform = {
  v: 1;
  flipH: boolean;
  rotate: Rotation;
  crop: NormalizedCrop;
};
