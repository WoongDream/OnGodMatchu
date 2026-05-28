export type LoginPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** 안내 카피. 기본: "로그인이 필요해요" */
  title?: string;
  /** 본문 보조 카피. 기본: 카드 별 누르기 안내 */
  message?: string;
};
