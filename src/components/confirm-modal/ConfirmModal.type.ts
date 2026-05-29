export type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** 모달 제목 (질문 형태 권장) */
  title: string;
  /** 본문 보조 카피. 줄바꿈(\n) 허용 */
  message?: string;
  /** 확인 버튼 라벨. 기본 "확인" */
  confirmLabel?: string;
  /** 취소 버튼 라벨. 기본 "취소" */
  cancelLabel?: string;
  /** 확인 버튼 톤. 위험 액션은 'danger'(기본), 일반 확인은 'primary' */
  confirmVariant?: 'danger' | 'primary';
  /** 확인 처리 중 — 버튼 비활성 + 오버레이/취소 잠금 */
  isConfirming?: boolean;
  /** 확인 처리 중 라벨. 기본 confirmLabel 그대로 */
  confirmingLabel?: string;
};
