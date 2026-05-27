import type { ParsedReleaseNoteMeta, ReleaseNoteTag } from '@/types';

const META_PATTERN = /^<!--\s*v([^\s]+)(?:\s+\[([^\]]*)\])?\s*-->\s*$/;
const VALID_TAGS: ReleaseNoteTag[] = ['NEW', 'IMPROVED', 'FIXED'];

const parseTags = (raw: string): ReleaseNoteTag[] => {
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t): t is ReleaseNoteTag => (VALID_TAGS as string[]).includes(t));
};

export const parseReleaseNoteMeta = (content: string): ParsedReleaseNoteMeta => {
  const lines = content.split('\n');
  const firstLine = lines[0]?.trim() ?? '';
  const match = firstLine.match(META_PATTERN);

  if (!match) {
    return { version: null, tags: [], body: content };
  }

  const [, version, tagsRaw] = match;
  const body = lines
    .slice(1)
    .join('\n')
    .replace(/^\s*\n/, '');
  return { version, tags: parseTags(tagsRaw ?? ''), body };
};
