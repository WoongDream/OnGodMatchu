import { describe, it, expect } from 'vitest';

import { RELEASE_NOTES_MANIFEST } from '@/content/release-notes/manifest';

import { getAllReleaseNotes, getReleaseNoteByVersion, getReleaseNotesCount } from './getAll';

describe('getAllReleaseNotes', () => {
  it('manifest 길이와 동일한 개수의 entry 를 반환한다', () => {
    const result = getAllReleaseNotes();

    expect(result).toHaveLength(RELEASE_NOTES_MANIFEST.length);
  });

  it('각 entry 에 body 필드가 string 타입으로 포함된다 (빈 문자열 허용)', () => {
    const result = getAllReleaseNotes();

    result.forEach((entry) => {
      expect(entry).toHaveProperty('body');
      expect(typeof entry.body).toBe('string');
    });
  });

  it('각 entry 의 manifest 필드(version/publishedAt/title/bodyFile)가 manifest 의 동일 version 항목과 일치한다', () => {
    const result = getAllReleaseNotes();

    result.forEach((entry) => {
      const source = RELEASE_NOTES_MANIFEST.find((m) => m.version === entry.version);

      expect(source).toBeDefined();
      expect(entry.version).toBe(source!.version);
      expect(entry.publishedAt).toBe(source!.publishedAt);
      expect(entry.title).toBe(source!.title);
      expect(entry.bodyFile).toBe(source!.bodyFile);
    });
  });

  it('각 entry 의 tags 가 markdown 첫 줄 메타 주석에서 추출된 배열이다', () => {
    const result = getAllReleaseNotes();

    result.forEach((entry) => {
      expect(Array.isArray(entry.tags)).toBe(true);
    });
  });

  // 현재 manifest 가 1건이면 정렬 검증은 trivially pass. 다건 추가 시 자동으로 정렬 회귀 검증.
  it('publishedAt DESC 정렬 — 첫 항목의 publishedAt 이 다른 모든 항목보다 같거나 크다 (localeCompare 기준)', () => {
    const result = getAllReleaseNotes();

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].publishedAt).toBeDefined();
    expect(typeof result[0].publishedAt).toBe('string');

    for (let i = 1; i < result.length; i += 1) {
      expect(result[0].publishedAt.localeCompare(result[i].publishedAt)).toBeGreaterThanOrEqual(0);
    }
  });

  // 다건 추가 시 정렬 회귀 검증: 인접 항목 간 publishedAt DESC, 동률이면 version DESC.
  it('인접 항목 간 publishedAt DESC, 동률이면 version DESC tiebreaker 가 유지된다', () => {
    const result = getAllReleaseNotes();

    for (let i = 0; i < result.length - 1; i += 1) {
      const prev = result[i];
      const next = result[i + 1];
      const publishedCompare = prev.publishedAt.localeCompare(next.publishedAt);

      if (publishedCompare === 0) {
        expect(prev.version.localeCompare(next.version)).toBeGreaterThanOrEqual(0);
      } else {
        expect(publishedCompare).toBeGreaterThan(0);
      }
    }
  });
});

describe('getReleaseNoteByVersion', () => {
  it('manifest 에 존재하는 version 으로 호출하면 해당 entry 를 반환한다', () => {
    const target = RELEASE_NOTES_MANIFEST[0];

    const result = getReleaseNoteByVersion(target.version);

    expect(result).toBeDefined();
    expect(result!.version).toBe(target.version);
    expect(result!.publishedAt).toBe(target.publishedAt);
    expect(result!.title).toBe(target.title);
    expect(result!.bodyFile).toBe(target.bodyFile);
    expect(typeof result!.body).toBe('string');
    expect(Array.isArray(result!.tags)).toBe(true);
  });

  it('존재하지 않는 version 으로 호출하면 undefined 를 반환한다', () => {
    const result = getReleaseNoteByVersion('99.99.99-nonexistent');

    expect(result).toBeUndefined();
  });
});

describe('getReleaseNotesCount', () => {
  it('manifest.length 와 동일한 값을 반환한다', () => {
    expect(getReleaseNotesCount()).toBe(RELEASE_NOTES_MANIFEST.length);
  });
});
