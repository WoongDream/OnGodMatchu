import type { PublicProfileSummary } from '@/types';

/** 데이터 컨테이너 props. publicId 가 null 이면 닫힘 상태. */
export type ProfileModalProps = {
  publicId: string | null;
  onClose: () => void;
};

/** 프레젠테이션 props — 데이터 주입형(테스트/스토리 용이). */
export type ProfileModalViewProps = {
  isOpen: boolean;
  onClose: () => void;
  summary?: PublicProfileSummary;
  isLoading: boolean;
  error: boolean;
  /** "프로필 보러가기" — 공개 프로필일 때만 노출 */
  onGoProfile: () => void;
};
