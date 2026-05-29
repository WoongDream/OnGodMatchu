import type { ImageEditResult } from '@/components/image-edit-modal';
import type { ImageSlot } from '@/lib/image/imageSlot';

export type ImageUploadProps = {
  /** 현재 슬롯 상태 (controlled). previewUrl 으로 표시, 재편집 시 원본 소스로 사용. */
  slot: ImageSlot;
  /** 크롭 잠금 비율 (width / height). 썸네일·문제·정답 = 16/9, 프로필 = 1. */
  aspect: number;
  /** 편집 모달 적용 결과 — 부모가 `applyEditResult` 로 슬롯에 병합. */
  onApply: (result: ImageEditResult) => void;
  /** 이미지 삭제 (모달 「이미지 삭제」). */
  onRemove: () => void;
  label?: string;
  /** 외부 검증 invalid 시 빨간 border. */
  invalid?: boolean;
};
