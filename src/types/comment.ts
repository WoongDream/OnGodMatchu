export type Comment = {
  id: number;
  content: string;
  /** 탈퇴 사용자는 BE 가 null 로 마스킹 → FE 가 프로필 모달 진입(클릭) 비활성화. */
  authorPublicId: string | null;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommentPage = {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
