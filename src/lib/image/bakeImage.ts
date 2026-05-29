import type { ImageTransform, Rotation } from '../../types/image';
import { rotatedDimensions } from './transform';

const DEFAULT_MIME = 'image/webp';
const DEFAULT_QUALITY = 0.85;

export type CroppedOutput = { blob: Blob; previewUrl: string };

/**
 * 원본 이미지를 flip(좌우 반전) → rotate(시계방향) 적용해 그린 캔버스를 반환한다.
 * crop 은 적용하지 않음 — 에디터 프리뷰(react-image-crop 의 대상 이미지) 와 bake 의 1단계 공용.
 */
const renderOriented = (
  source: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  flipH: boolean,
  rotate: Rotation,
): HTMLCanvasElement => {
  const { width, height } = rotatedDimensions(naturalWidth, naturalHeight, rotate);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d context를 생성할 수 없습니다.');
  }

  // 화면(회전 후) 캔버스 중심으로 이동 → 회전 → 반전 → 원본을 자기 중심에 그림.
  // 캔버스 변환은 마지막에 그린 것이 가장 안쪽이므로, 이미지 기준 적용 순서는 flip → rotate → translate.
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  if (flipH) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, -naturalWidth / 2, -naturalHeight / 2, naturalWidth, naturalHeight);
  return canvas;
};

/** 원본 + orientation 으로 에디터 프리뷰용 data URL 생성 (크롭 전, 무손실 PNG). */
export const renderOrientedDataUrl = (
  source: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  flipH: boolean,
  rotate: Rotation,
): string =>
  renderOriented(source, naturalWidth, naturalHeight, flipH, rotate).toDataURL('image/png');

const canvasToBlob = (canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas toBlob 실패'))),
      mime,
      quality,
    );
  });

/**
 * 원본 이미지에 transform(flip → rotate → crop)을 적용해 크롭 결과 Blob + 미리보기 URL 을 생성한다.
 * crop 은 회전·반전 후 좌표계 기준 0~1 정규화 (계약 v1). 출력 기본값 webp q0.85.
 */
export const bakeCroppedImage = async (
  source: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  transform: ImageTransform,
  options?: { mime?: string; quality?: number },
): Promise<CroppedOutput> => {
  const mime = options?.mime ?? DEFAULT_MIME;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  const oriented = renderOriented(
    source,
    naturalWidth,
    naturalHeight,
    transform.flipH,
    transform.rotate,
  );
  const { width: dispW, height: dispH } = rotatedDimensions(
    naturalWidth,
    naturalHeight,
    transform.rotate,
  );

  const sx = Math.round(transform.crop.x * dispW);
  const sy = Math.round(transform.crop.y * dispH);
  const sw = Math.max(1, Math.round(transform.crop.width * dispW));
  const sh = Math.max(1, Math.round(transform.crop.height * dispH));

  const out = document.createElement('canvas');
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d context를 생성할 수 없습니다.');
  }
  ctx.drawImage(oriented, sx, sy, sw, sh, 0, 0, sw, sh);

  const blob = await canvasToBlob(out, mime, quality);
  return { blob, previewUrl: URL.createObjectURL(blob) };
};
