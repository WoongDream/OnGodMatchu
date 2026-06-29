export type NoticeListItem = {
  id: number;
  title: string;
  /** 고정 공지 — 목록 상단 + 핀 아이콘 */
  pinned: boolean;
  publishedAt: string;
  /** 최종 수정 시각. 작성/변경일 표시용(최신) */
  updatedAt: string | null;
  viewCount: number;
};

export type NoticeDetail = {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  publishedAt: string;
  updatedAt: string | null;
  viewCount: number;
};

/** 백오피스 공지 상태 — 게시(고정 포함) / 임시저장. */
export type NoticeStatus = 'DRAFT' | 'PUBLISHED';

/** 백오피스 리스트 필터 탭. 고정 = 게시+pinned. */
export type NoticeFilter = 'ALL' | 'PINNED' | 'PUBLISHED' | 'DRAFT';

export type BoNoticeListItem = {
  id: number;
  title: string;
  status: NoticeStatus;
  pinned: boolean;
  viewCount: number;
  createdAt: string;
};

export type BoNotice = {
  id: number;
  title: string;
  content: string;
  status: NoticeStatus;
  pinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type NoticeStats = {
  total: number;
  published: number;
  pinned: number;
  draft: number;
};

export type ReleaseNoteTag = 'NEW' | 'IMPROVED' | 'FIXED' | 'NOTICE' | 'SECURITY';

export type ParsedReleaseNoteMeta = {
  version: string | null;
  tags: ReleaseNoteTag[];
  body: string;
};
