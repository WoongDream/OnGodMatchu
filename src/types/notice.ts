export type NoticeListItem = {
  id: number;
  title: string;
  publishedAt: string;
};

export type NoticeDetail = {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
};

export type ReleaseNoteTag = 'NEW' | 'IMPROVED' | 'FIXED';

export type ParsedReleaseNoteMeta = {
  version: string | null;
  tags: ReleaseNoteTag[];
  body: string;
};
