import type { UserNotification } from './notification';

/** 문의 처리 상태 — 대기(PENDING)/처리중(IN_PROGRESS)/완료(DONE). 표시 라벨은 statusLabel. */
export type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

/** BO 목록 필터 탭. */
export type InquiryFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DONE';

/** 문의한 사용자 표시 — 탈퇴 사용자는 publicId/profileImageUrl 가 null(프로필 모달 진입 비활성 신호). */
export type InquiryAuthor = {
  publicId: string | null;
  nickname: string;
  profileImageUrl: string | null;
};

/** 본인 문의 카드 — 받은 답변(연결 알림) 포함. */
export type InquiryListItem = {
  id: number;
  title: string;
  content: string;
  status: InquiryStatus;
  statusLabel: string;
  createdAt: string;
  /** 받은 답변(연결 알림). 받기 전이면 빈 배열. */
  answers: UserNotification[];
};

/** BO 목록 아이템 — 제목 + 문의 유저 + 접수일 + 상태. */
export type BoInquiryListItem = {
  id: number;
  title: string;
  author: InquiryAuthor;
  status: InquiryStatus;
  statusLabel: string;
  createdAt: string;
};

/** BO 상세 — 제목/내용 + 문의 유저 + 보낸 답변 목록. */
export type BoInquiry = {
  id: number;
  title: string;
  content: string;
  author: InquiryAuthor;
  status: InquiryStatus;
  statusLabel: string;
  createdAt: string;
  /** 보낸 답변(연결 알림), 오래된 순. */
  answers: UserNotification[];
};

/** BO 상단 stats 카드 — 전체/대기/처리중/완료. */
export type InquiryStats = {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
};
