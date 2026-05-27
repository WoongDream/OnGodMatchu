import type { ReleaseNoteTag } from '@/types';

export type ReleaseNoteManifestItem = {
  version: string;
  publishedAt: string;
  title: string;
  tags: ReleaseNoteTag[];
  bodyFile: string;
};

export const RELEASE_NOTES_MANIFEST: ReleaseNoteManifestItem[] = [
  {
    version: '1.0.0',
    publishedAt: '2026-05-27',
    title: '첫 릴리즈',
    tags: ['NEW'],
    bodyFile: 'v1.0.0.md',
  },
];
