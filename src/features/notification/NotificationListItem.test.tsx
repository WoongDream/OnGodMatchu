import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { UserNotification } from '@/types';
import NotificationListItem from './NotificationListItem';

const makeNotification = (overrides?: Partial<UserNotification>): UserNotification => ({
  id: 1,
  type: 'INFO',
  typeLabel: '안내',
  title: '점검 안내',
  content: '오늘 밤 점검이 있어요.',
  senderLabel: '운영팀',
  createdAt: '2026-06-01T09:00:00.000Z',
  ...overrides,
});

const renderItem = (notification?: UserNotification) => {
  const onSelect = vi.fn();
  renderWithTheme(
    <NotificationListItem notification={notification ?? makeNotification()} onSelect={onSelect} />,
  );
  return { onSelect };
};

describe('NotificationListItem', () => {
  describe('내용 렌더', () => {
    it('제목/본문/유형 라벨/날짜(앞 10자)를 표시한다', () => {
      renderItem();
      expect(screen.getByText('점검 안내')).toBeInTheDocument();
      expect(screen.getByText('오늘 밤 점검이 있어요.')).toBeInTheDocument();
      expect(screen.getByText('안내')).toBeInTheDocument();
      expect(screen.getByText('2026-06-01')).toBeInTheDocument();
    });

    it('role="button" 과 tabIndex 를 가진다', () => {
      renderItem();
      const row = screen.getByRole('button');
      expect(row).toHaveAttribute('tabindex', '0');
    });
  });

  describe('유형 배지 분기', () => {
    it('INFO 알림의 typeLabel 을 표시한다', () => {
      renderItem(makeNotification({ type: 'INFO', typeLabel: '안내' }));
      expect(screen.getByText('안내')).toBeInTheDocument();
    });

    it('WARNING 알림의 typeLabel 을 표시한다', () => {
      renderItem(makeNotification({ type: 'WARNING', typeLabel: '경고' }));
      expect(screen.getByText('경고')).toBeInTheDocument();
    });
  });

  describe('선택 동작', () => {
    it('클릭 시 해당 notification 으로 onSelect 를 호출한다', async () => {
      const user = userEvent.setup();
      const notification = makeNotification({ id: 7 });
      const onSelect = vi.fn();
      renderWithTheme(<NotificationListItem notification={notification} onSelect={onSelect} />);
      await user.click(screen.getByRole('button'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(notification);
    });

    it('Enter 키 입력 시 onSelect 를 호출한다', async () => {
      const user = userEvent.setup();
      const notification = makeNotification({ id: 9 });
      const onSelect = vi.fn();
      renderWithTheme(<NotificationListItem notification={notification} onSelect={onSelect} />);
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(notification);
    });

    it('Space 키 입력 시 onSelect 를 호출한다', async () => {
      const user = userEvent.setup();
      const notification = makeNotification({ id: 11 });
      const onSelect = vi.fn();
      renderWithTheme(<NotificationListItem notification={notification} onSelect={onSelect} />);
      screen.getByRole('button').focus();
      await user.keyboard('{ }');
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(notification);
    });
  });

  describe('displayName', () => {
    it('displayName 이 "NotificationListItem" 이다', () => {
      expect(NotificationListItem.displayName).toBe('NotificationListItem');
    });
  });
});
