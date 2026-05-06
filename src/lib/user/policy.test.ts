import { describe, it, expect } from 'vitest';
import {
  BIO_MAX_LENGTH,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_ALLOWED_MIME,
  isWithinBioLength,
  isAllowedProfileImageMime,
  isWithinProfileImageSize,
} from './policy';

describe('상수', () => {
  it('BIO_MAX_LENGTH 는 40 이다', () => {
    expect(BIO_MAX_LENGTH).toBe(40);
  });

  it('PROFILE_IMAGE_MAX_BYTES 는 3MB(3145728 bytes) 이다', () => {
    expect(PROFILE_IMAGE_MAX_BYTES).toBe(3 * 1024 * 1024);
  });

  it('PROFILE_IMAGE_ALLOWED_MIME 는 jpeg/png/webp 3가지를 포함한다', () => {
    expect(PROFILE_IMAGE_ALLOWED_MIME).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });
});

describe('isWithinBioLength', () => {
  it('빈 문자열(0자)은 true 를 반환한다', () => {
    expect(isWithinBioLength('')).toBe(true);
  });

  it('40자(최댓값 경계)는 true 를 반환한다', () => {
    expect(isWithinBioLength('a'.repeat(40))).toBe(true);
  });

  it('41자(최댓값 초과)는 false 를 반환한다', () => {
    expect(isWithinBioLength('a'.repeat(41))).toBe(false);
  });

  it('한글 40자(최댓값 경계)는 true 를 반환한다', () => {
    expect(isWithinBioLength('가'.repeat(40))).toBe(true);
  });

  it('한글 41자(최댓값 초과)는 false 를 반환한다', () => {
    expect(isWithinBioLength('가'.repeat(41))).toBe(false);
  });

  it('20자(중간 길이)는 true 를 반환한다', () => {
    expect(isWithinBioLength('a'.repeat(20))).toBe(true);
  });
});

describe('isAllowedProfileImageMime', () => {
  it('image/jpeg 는 허용한다', () => {
    expect(isAllowedProfileImageMime('image/jpeg')).toBe(true);
  });

  it('image/png 는 허용한다', () => {
    expect(isAllowedProfileImageMime('image/png')).toBe(true);
  });

  it('image/webp 는 허용한다', () => {
    expect(isAllowedProfileImageMime('image/webp')).toBe(true);
  });

  it('image/gif 는 거부한다', () => {
    expect(isAllowedProfileImageMime('image/gif')).toBe(false);
  });

  it('image/svg+xml 은 거부한다', () => {
    expect(isAllowedProfileImageMime('image/svg+xml')).toBe(false);
  });

  it('image/heic 은 거부한다', () => {
    expect(isAllowedProfileImageMime('image/heic')).toBe(false);
  });

  it('빈 문자열은 거부한다', () => {
    expect(isAllowedProfileImageMime('')).toBe(false);
  });

  it('IMAGE/PNG (대문자)는 거부한다 — 구현은 대소문자 일치 필요', () => {
    expect(isAllowedProfileImageMime('IMAGE/PNG')).toBe(false);
  });

  it('image/JPEG (혼합 대소문자)는 거부한다 — 구현은 대소문자 일치 필요', () => {
    expect(isAllowedProfileImageMime('image/JPEG')).toBe(false);
  });
});

describe('isWithinProfileImageSize', () => {
  const THREE_MB = 3 * 1024 * 1024;

  it('정확히 3MB 는 허용한다', () => {
    expect(isWithinProfileImageSize(THREE_MB)).toBe(true);
  });

  it('3MB + 1 byte 는 거부한다', () => {
    expect(isWithinProfileImageSize(THREE_MB + 1)).toBe(false);
  });

  it('0 byte 는 허용한다', () => {
    expect(isWithinProfileImageSize(0)).toBe(true);
  });

  it('1MB 는 허용한다', () => {
    expect(isWithinProfileImageSize(1 * 1024 * 1024)).toBe(true);
  });

  it('10MB 는 거부한다', () => {
    expect(isWithinProfileImageSize(10 * 1024 * 1024)).toBe(false);
  });

  it('음수 bytes 는 true 를 반환한다 — 정상 입력 가정 외, 구현상 <= 조건', () => {
    expect(isWithinProfileImageSize(-1)).toBe(true);
  });
});
