import type { ImageEditResult } from '@/components/image-edit-modal';
import type { ImageTransform } from '@/types';

/**
 * 한 이미지 슬롯(썸네일 / 문제 / 정답 / 프로필)의 FE 상태.
 * - `*File` : 업로드 대기 중인 새 파일 (제출 시 업로드).
 * - `imageKey`/`originalImageKey` : 이미 서버에 있는 key (재편집 시 재사용).
 * - `originalUrl` : 서버 원본 presigned URL (재편집 모달 src).
 */
export type ImageSlot = {
  previewUrl: string | null;
  croppedFile: File | null;
  originalFile: File | null;
  transform: ImageTransform | null;
  imageKey: string | null;
  originalImageKey: string | null;
  originalUrl: string | null;
};

export const EMPTY_SLOT: ImageSlot = {
  previewUrl: null,
  croppedFile: null,
  originalFile: null,
  transform: null,
  imageKey: null,
  originalImageKey: null,
  originalUrl: null,
};

/** 서버 응답(기존 이미지)으로 슬롯 초기화 — 재편집 페이지 hydrate 용. */
export const slotFromServer = (params: {
  imageKey?: string | null;
  imageUrl?: string | null;
  originalImageKey?: string | null;
  originalImageUrl?: string | null;
  transform?: ImageTransform | null;
}): ImageSlot => ({
  ...EMPTY_SLOT,
  previewUrl: params.imageUrl ?? null,
  imageKey: params.imageKey ?? null,
  // 소유자 응답이면 원본 key 를 보존 — 재편집/저장 시 그대로 재전송해 원본 재업로드·삭제를 막는다.
  originalImageKey: params.originalImageKey ?? null,
  originalUrl: params.originalImageUrl ?? params.imageUrl ?? null,
  transform: params.transform ?? null,
});

const blobToFile = (blob: Blob, name: string): File =>
  blob instanceof File ? blob : new File([blob], name, { type: blob.type || 'image/webp' });

/**
 * 편집 모달 결과를 슬롯에 병합한다. 새 원본을 골랐으면 기존 서버 key 를 무효화하고,
 * 크롭/원본 교체가 일어나면 미리보기와 업로드 대기 파일을 갱신한다.
 */
export const applyEditResult = (prev: ImageSlot, result: ImageEditResult): ImageSlot => {
  const replacedOriginal = result.originalFile != null;
  const originalFile = result.originalFile ?? prev.originalFile;
  const croppedFile = result.cropped ? blobToFile(result.cropped.blob, 'cropped.webp') : null;

  const previewUrl = result.cropped
    ? result.cropped.previewUrl
    : replacedOriginal
      ? URL.createObjectURL(result.originalFile as File)
      : prev.previewUrl;

  return {
    previewUrl,
    croppedFile,
    originalFile,
    transform: result.transform,
    // 새로 편집(크롭) 했거나 원본을 교체했으면 기존 서버 크롭 key 는 무효.
    imageKey: result.cropped || replacedOriginal ? null : prev.imageKey,
    originalImageKey: replacedOriginal ? null : prev.originalImageKey,
    originalUrl: replacedOriginal ? null : prev.originalUrl,
  };
};

/** 슬롯에 이미지가 있는지 (제출/검증용). */
export const slotHasImage = (slot: ImageSlot): boolean =>
  slot.croppedFile != null ||
  slot.originalFile != null ||
  slot.imageKey != null ||
  slot.previewUrl != null;

export type ResolvedSlot = {
  imageKey?: string;
  originalImageKey?: string;
  transform?: ImageTransform | null;
};

/**
 * 제출 시 슬롯을 업로드해 key 들로 변환한다. 새 원본/크롭은 업로드하고, 변경 없는 기존 key 는 재사용한다.
 * 편집 없음(transform=null)이면 croppedKey=originalKey (별도 크롭 객체 없음).
 */
export const resolveSlot = async (
  slot: ImageSlot,
  upload: (file: File) => Promise<string>,
): Promise<ResolvedSlot> => {
  const newOriginalKey = slot.originalFile ? await upload(slot.originalFile) : null;
  const originalImageKey = newOriginalKey ?? slot.originalImageKey ?? undefined;

  let imageKey: string | undefined;
  if (slot.croppedFile) {
    // 새로 크롭함 → 크롭 결과 업로드.
    imageKey = await upload(slot.croppedFile);
  } else if (newOriginalKey) {
    // 새 원본만(크롭 안 함) → cropped == original.
    imageKey = newOriginalKey;
  } else {
    // 변경 없음 → 기존 크롭 key 보존 (없으면 undefined).
    imageKey = slot.imageKey ?? undefined;
  }

  return { imageKey, originalImageKey, transform: slot.transform ?? undefined };
};
