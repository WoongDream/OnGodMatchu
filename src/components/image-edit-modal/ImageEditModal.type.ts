import type { ImageTransform } from '@/types';

/** 편집 확정 결과. transform=null 이면 "편집 없음" → 호출자는 원본을 그대로 사용(재인코딩 X). */
export type ImageEditResult = {
  transform: ImageTransform | null;
  /** 크롭 결과 (webp). transform=null 이면 null. */
  cropped: { blob: Blob; previewUrl: string } | null;
  /** 새로 선택/교체한 원본 파일. 기존 원본(서버/드래프트)을 그대로 재편집했으면 null. */
  originalFile: File | null;
};

export type ImageEditModalProps = {
  isOpen: boolean;
  /** 편집할 원본 이미지 URL — 새 파일은 objectURL, 재편집은 원본 presigned URL. */
  src: string | null;
  /** src 가 새로 선택한 파일이면 그 File (적용 시 originalFile 로 반환). */
  initialFile?: File | null;
  /** 크롭 잠금 비율 (width / height). 썸네일·문제·정답 = 16/9, 프로필 = 1. */
  aspect: number;
  /** 파일명 라벨 (선택). 예: `my-photo.jpg`. */
  fileName?: string;
  /** 재편집 시 기존 변환값으로 에디터 복원. 없으면 항등에서 시작. */
  initialTransform?: ImageTransform | null;
  /** 「이미지 삭제」 노출 여부 — 기존 이미지가 있는 슬롯의 재편집일 때만 true. */
  canDelete?: boolean;
  onCancel: () => void;
  onApply: (result: ImageEditResult) => void;
  /** 「이미지 삭제」 확정 시 호출 (canDelete=true 일 때만). */
  onDelete?: () => void;
};
