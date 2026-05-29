import { describe, it, expect } from 'vitest';
import { isTrackedPath } from './trackedPaths';

describe('isTrackedPath', () => {
  describe('트래킹 ON (true)', () => {
    it('/quiz → true', () => expect(isTrackedPath('/quiz')).toBe(true));
    it('/quiz/123 → true (숫자 id)', () => expect(isTrackedPath('/quiz/123')).toBe(true));
    it('/quiz/abc-uuid-456 → true (slug/uuid)', () =>
      expect(isTrackedPath('/quiz/abc-uuid-456')).toBe(true));
    it('/announcements → true', () => expect(isTrackedPath('/announcements')).toBe(true));
    it('/announcements/notices → true', () =>
      expect(isTrackedPath('/announcements/notices')).toBe(true));
    it('/announcements/notices/release-1 → true (공지 상세)', () =>
      expect(isTrackedPath('/announcements/notices/release-1')).toBe(true));
    it('/announcements/release-notes → true', () =>
      expect(isTrackedPath('/announcements/release-notes')).toBe(true));
    it('/announcements/release-notes/v1.0.0 → true (릴리즈 노트 상세)', () =>
      expect(isTrackedPath('/announcements/release-notes/v1.0.0')).toBe(true));
  });

  describe('트래킹 OFF (false) — 명시 제외', () => {
    it('/quiz/create → false (명시 제외)', () => expect(isTrackedPath('/quiz/create')).toBe(false));
  });

  describe('트래킹 OFF (false) — 자식 라우트', () => {
    it('/quiz/123/play → false', () => expect(isTrackedPath('/quiz/123/play')).toBe(false));
    it('/quiz/123/result → false', () => expect(isTrackedPath('/quiz/123/result')).toBe(false));
    it('/quiz/123/edit → false', () => expect(isTrackedPath('/quiz/123/edit')).toBe(false));
  });

  describe('트래킹 OFF (false) — 인증/약관', () => {
    it('/login → false', () => expect(isTrackedPath('/login')).toBe(false));
    it('/signup → false', () => expect(isTrackedPath('/signup')).toBe(false));
    it('/oauth2/callback → false', () => expect(isTrackedPath('/oauth2/callback')).toBe(false));
    it('/terms-agreement → false', () => expect(isTrackedPath('/terms-agreement')).toBe(false));
    it('/terms → false', () => expect(isTrackedPath('/terms')).toBe(false));
    it('/privacy → false', () => expect(isTrackedPath('/privacy')).toBe(false));
  });

  describe('트래킹 OFF (false) — 프로필', () => {
    it('/profile → false', () => expect(isTrackedPath('/profile')).toBe(false));
    it('/profile/quizzes-made → false', () =>
      expect(isTrackedPath('/profile/quizzes-made')).toBe(false));
    it('/profile/abc/quizzes-made → false', () =>
      expect(isTrackedPath('/profile/abc/quizzes-made')).toBe(false));
  });

  describe('트래킹 OFF (false) — 형식/엣지', () => {
    it('빈 문자열 → false', () => expect(isTrackedPath('')).toBe(false));
    it('/ (홈) → false', () => expect(isTrackedPath('/')).toBe(false));
    it('상대 경로 (relative-path) → false', () =>
      expect(isTrackedPath('relative-path')).toBe(false));
    it('/some-unknown-page → false', () => expect(isTrackedPath('/some-unknown-page')).toBe(false));
  });
});
