import {
  RELEASE_NOTES_MANIFEST,
  type ReleaseNoteManifestItem,
} from '@/content/release-notes/manifest';
import { parseReleaseNoteMeta } from '@/lib/notice/parseReleaseNoteMeta';
import type { ReleaseNoteTag } from '@/types';

const bodyModules = import.meta.glob('/src/content/release-notes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export type ReleaseNoteEntry = ReleaseNoteManifestItem & {
  body: string;
  tags: ReleaseNoteTag[];
};

const findRaw = (bodyFile: string): string => {
  const key = `/src/content/release-notes/${bodyFile}`;
  return bodyModules[key] ?? '';
};

const sortByPublishedDesc = (a: ReleaseNoteEntry, b: ReleaseNoteEntry): number =>
  b.publishedAt.localeCompare(a.publishedAt) || b.version.localeCompare(a.version);

export const getAllReleaseNotes = (): ReleaseNoteEntry[] =>
  RELEASE_NOTES_MANIFEST.map((item) => {
    const meta = parseReleaseNoteMeta(findRaw(item.bodyFile));
    return { ...item, body: meta.body, tags: meta.tags };
  }).sort(sortByPublishedDesc);

export const getReleaseNoteByVersion = (version: string): ReleaseNoteEntry | undefined =>
  getAllReleaseNotes().find((n) => n.version === version);

export const getReleaseNotesCount = (): number => RELEASE_NOTES_MANIFEST.length;
