import { describe, it, expect } from 'vitest';
import {
  PROFILE_MENU_ITEMS,
  PROFILE_MENU_GROUPS,
  buildBaseTo,
  resolveTo,
  type MenuItem,
} from './menuItems';

const getItem = (key: MenuItem['key']): MenuItem => {
  const item = PROFILE_MENU_ITEMS.find((i) => i.key === key);
  if (!item) {
    throw new Error(`메뉴 항목을 찾을 수 없음: ${key}`);
  }
  return item;
};

describe('menuItems', () => {
  describe('quizzes-starred 항목', () => {
    it('PROFILE_MENU_ITEMS 에 quizzes-starred 항목이 존재한다', () => {
      expect(PROFILE_MENU_ITEMS.some((i) => i.key === 'quizzes-starred')).toBe(true);
    });

    it('label 이 "스타 준" 이다', () => {
      expect(getItem('quizzes-starred').label).toBe('스타 준');
    });

    it('to 가 "quizzes-starred" 이다', () => {
      expect(getItem('quizzes-starred').to).toBe('quizzes-starred');
    });

    it('myOnly=true 이다', () => {
      expect(getItem('quizzes-starred').myOnly).toBe(true);
    });

    it('groupId 가 "quiz" 이다', () => {
      expect(getItem('quizzes-starred').groupId).toBe('quiz');
    });

    it('퀴즈 그룹에 속한다 (PROFILE_MENU_GROUPS.quiz)', () => {
      const item = getItem('quizzes-starred');
      expect(item.groupId).toBe(PROFILE_MENU_GROUPS.quiz.id);
    });
  });

  describe('notifications 항목', () => {
    it('PROFILE_MENU_ITEMS 에 notifications 항목이 존재한다', () => {
      expect(PROFILE_MENU_ITEMS.some((i) => i.key === 'notifications')).toBe(true);
    });

    it('label 이 "받은 알림" 이다', () => {
      expect(getItem('notifications').label).toBe('받은 알림');
    });

    it('to 가 "notifications" 이다', () => {
      expect(getItem('notifications').to).toBe('notifications');
    });

    it('myOnly=true 이다', () => {
      expect(getItem('notifications').myOnly).toBe(true);
    });

    it('groupId 가 없다 (그룹에 속하지 않는 단독 항목)', () => {
      expect(getItem('notifications').groupId).toBeUndefined();
    });

    it("'계정'(account) 보다 앞에 위치한다", () => {
      const notiIndex = PROFILE_MENU_ITEMS.findIndex((i) => i.key === 'notifications');
      const accountIndex = PROFILE_MENU_ITEMS.findIndex((i) => i.key === 'account');
      expect(notiIndex).toBeGreaterThanOrEqual(0);
      expect(notiIndex).toBeLessThan(accountIndex);
    });
  });

  describe('resolveTo / buildBaseTo — notifications 경로', () => {
    it('userId 없을 때 /profile/notifications 로 해석된다', () => {
      const base = buildBaseTo();
      expect(resolveTo(base, getItem('notifications'))).toBe('/profile/notifications');
    });

    it('userId 지정 시 /profile/:userId/notifications 로 해석된다', () => {
      const base = buildBaseTo(42);
      expect(resolveTo(base, getItem('notifications'))).toBe('/profile/42/notifications');
    });
  });

  describe('resolveTo / buildBaseTo — quizzes-starred 경로', () => {
    it('userId 없을 때 /profile/quizzes-starred 로 해석된다', () => {
      const base = buildBaseTo();
      expect(base).toBe('/profile');
      expect(resolveTo(base, getItem('quizzes-starred'))).toBe('/profile/quizzes-starred');
    });

    it('userId 지정 시 /profile/:userId/quizzes-starred 로 해석된다', () => {
      const base = buildBaseTo(42);
      expect(base).toBe('/profile/42');
      expect(resolveTo(base, getItem('quizzes-starred'))).toBe('/profile/42/quizzes-starred');
    });
  });
});
