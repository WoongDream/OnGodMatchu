import { describe, it, expect } from 'vitest';

import { parseReleaseNoteMeta } from './parseReleaseNoteMeta';

describe('parseReleaseNoteMeta', () => {
  it('첫 줄이 메타 패턴이면 version, tags, body 를 추출한다 (happy path)', () => {
    const content = '<!-- v1.7.0 [NEW,IMPROVED] -->\n## 본문';

    const result = parseReleaseNoteMeta(content);

    expect(result).toEqual({
      version: '1.7.0',
      tags: ['NEW', 'IMPROVED'],
      body: '## 본문',
    });
  });

  it('태그 brackets 가 없으면 tags 는 빈 배열이다', () => {
    const content = '<!-- v1.7.0 -->\n본문';

    const result = parseReleaseNoteMeta(content);

    expect(result).toEqual({
      version: '1.7.0',
      tags: [],
      body: '본문',
    });
  });

  it('빈 태그 brackets 면 tags 는 빈 배열이다', () => {
    const content = '<!-- v1.7.0 [] -->\n본문';

    const result = parseReleaseNoteMeta(content);

    expect(result.version).toBe('1.7.0');
    expect(result.tags).toEqual([]);
    expect(result.body).toBe('본문');
  });

  it('단일 태그를 파싱한다', () => {
    const content = '<!-- v1.7.0 [FIXED] -->';

    const result = parseReleaseNoteMeta(content);

    expect(result.version).toBe('1.7.0');
    expect(result.tags).toEqual(['FIXED']);
    expect(result.body).toBe('');
  });

  it('유효하지 않은 태그는 필터링한다', () => {
    const content = '<!-- v1.7.0 [NEW,UNKNOWN,IMPROVED] -->';

    const result = parseReleaseNoteMeta(content);

    expect(result.tags).toEqual(['NEW', 'IMPROVED']);
  });

  it('소문자 태그도 대문자로 정규화한다', () => {
    const content = '<!-- v1.7.0 [new,improved] -->';

    const result = parseReleaseNoteMeta(content);

    expect(result.tags).toEqual(['NEW', 'IMPROVED']);
  });

  it('태그 사이의 공백을 무시한다', () => {
    const content = '<!-- v1.7.0 [ NEW , IMPROVED ] -->';

    const result = parseReleaseNoteMeta(content);

    expect(result.tags).toEqual(['NEW', 'IMPROVED']);
  });

  it('메타 패턴이 아니면 version null, tags 빈 배열, body 는 원본 그대로 반환한다', () => {
    const content = '## v1.7.0 본문\n...';

    const result = parseReleaseNoteMeta(content);

    expect(result).toEqual({
      version: null,
      tags: [],
      body: content,
    });
  });

  it('메타 줄 다음의 선행 빈 줄은 trim 된다', () => {
    const content = '<!-- v1.0.0 [NEW] -->\n\n본문';

    const result = parseReleaseNoteMeta(content);

    expect(result).toEqual({
      version: '1.0.0',
      tags: ['NEW'],
      body: '본문',
    });
  });

  it('빈 문자열 입력은 version null, tags 빈 배열, body 빈 문자열로 처리한다', () => {
    const result = parseReleaseNoteMeta('');

    expect(result).toEqual({
      version: null,
      tags: [],
      body: '',
    });
  });

  it('5종 태그 (NEW/IMPROVED/FIXED/NOTICE/SECURITY) 를 모두 파싱한다', () => {
    const content = '<!-- v2.0.0 [NEW,IMPROVED,FIXED,NOTICE,SECURITY] -->';

    const result = parseReleaseNoteMeta(content);

    expect(result.tags).toEqual(['NEW', 'IMPROVED', 'FIXED', 'NOTICE', 'SECURITY']);
  });

  it('소문자 신규 태그(notice/security)도 대문자로 정규화한다', () => {
    const content = '<!-- v2.0.0 [notice,security] -->';

    const result = parseReleaseNoteMeta(content);

    expect(result.tags).toEqual(['NOTICE', 'SECURITY']);
  });

  it('version 에 build suffix (pre-release) 가 포함되어도 허용한다', () => {
    const content = '<!-- v1.7.0-beta.1 -->';

    const result = parseReleaseNoteMeta(content);

    expect(result.version).toBe('1.7.0-beta.1');
    expect(result.tags).toEqual([]);
    expect(result.body).toBe('');
  });
});
