export type NoticeListItem = {
  slug: string;
  title: string;
  publishedAt: string;
};

export type NoticeDetail = {
  slug: string;
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
