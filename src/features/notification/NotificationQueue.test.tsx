import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { UserNotification } from '@/types';
import NotificationQueue from './NotificationQueue';

const {
  useAuthStoreMock,
  usePendingNotificationsMock,
  markNotificationReadMock,
  navigateMock,
  refreshMock,
} = vi.hoisted(() => ({
  useAuthStoreMock: vi.fn(),
  usePendingNotificationsMock: vi.fn(),
  markNotificationReadMock: vi.fn(),
  navigateMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock('@/store/authStore', () => ({ default: useAuthStoreMock }));
vi.mock('@/hooks/usePendingNotifications', () => ({ default: usePendingNotificationsMock }));
vi.mock('@/api/notification', () => ({ markNotificationRead: markNotificationReadMock }));
vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));

// 콜백 분기/큐 진행을 결정적으로 검증하기 위해 modal 을 단순 test double 로 대체.
vi.mock('./NotificationModal', () => ({
  default: ({ notification, total, index, onNext, onConfirm, onInquiry }: any) => (
    <div data-testid="notification-modal">
      <span data-testid="modal-title">{notification.title}</span>
      <span data-testid="modal-total">{total}</span>
      <span data-testid="modal-index">{index}</span>
      <button onClick={onNext}>next</button>
      <button onClick={onConfirm}>confirm</button>
      <button onClick={onInquiry}>inquiry</button>
    </div>
  ),
}));

const makeNotification = (id: number): UserNotification => ({
  id,
  type: 'INFO',
  typeLabel: '안내',
  title: `알림 ${id}`,
  content: `내용 ${id}`,
  senderLabel: '운영팀',
  createdAt: '2026-06-01T09:00:00.000Z',
});

const setAuth = (isLoggedIn: boolean) => {
  useAuthStoreMock.mockImplementation((sel: any) => sel({ isLoggedIn }));
};

const setNotifications = (notifications: UserNotification[]) => {
  usePendingNotificationsMock.mockReturnValue({
    notifications,
    isLoading: false,
    error: null,
    refresh: refreshMock,
  });
};

describe('NotificationQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markNotificationReadMock.mockResolvedValue(undefined);
  });

  describe('비로그인', () => {
    it('비로그인이면 아무것도 렌더하지 않는다', () => {
      setAuth(false);
      setNotifications([makeNotification(1)]);
      renderWithTheme(<NotificationQueue />);
      expect(screen.queryByTestId('notification-modal')).not.toBeInTheDocument();
    });
  });

  describe('로그인 - pending 없음', () => {
    it('미확인 알림이 없으면 modal 을 렌더하지 않는다', () => {
      setAuth(true);
      setNotifications([]);
      renderWithTheme(<NotificationQueue />);
      expect(screen.queryByTestId('notification-modal')).not.toBeInTheDocument();
    });
  });

  describe('로그인 - pending 있음', () => {
    it('미확인 알림이 있으면 첫 알림 modal 을 렌더한다', () => {
      setAuth(true);
      setNotifications([makeNotification(1), makeNotification(2)]);
      renderWithTheme(<NotificationQueue />);
      expect(screen.getByTestId('notification-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('알림 1');
      expect(screen.getByTestId('modal-total')).toHaveTextContent('2');
      expect(screen.getByTestId('modal-index')).toHaveTextContent('0');
    });
  });

  describe('큐 진행 (다음)', () => {
    it('다음 시 markNotificationRead 호출 후 다음 알림으로 이동한다', async () => {
      const user = userEvent.setup();
      setAuth(true);
      setNotifications([makeNotification(1), makeNotification(2)]);
      renderWithTheme(<NotificationQueue />);

      await user.click(screen.getByText('next'));

      expect(markNotificationReadMock).toHaveBeenCalledWith(1);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('알림 2');
      expect(screen.getByTestId('modal-index')).toHaveTextContent('1');
    });

    it('마지막에서 다음(확인) 시 read 처리 후 큐를 비우고 refresh 한다', async () => {
      const user = userEvent.setup();
      setAuth(true);
      setNotifications([makeNotification(1)]);
      renderWithTheme(<NotificationQueue />);

      await user.click(screen.getByText('next'));

      expect(markNotificationReadMock).toHaveBeenCalledWith(1);
      expect(refreshMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('notification-modal')).not.toBeInTheDocument();
    });
  });

  describe('확인', () => {
    it('확인 시 read 처리하고 다음으로 진행한다', async () => {
      const user = userEvent.setup();
      setAuth(true);
      setNotifications([makeNotification(1), makeNotification(2)]);
      renderWithTheme(<NotificationQueue />);

      await user.click(screen.getByText('confirm'));

      expect(markNotificationReadMock).toHaveBeenCalledWith(1);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('알림 2');
    });
  });

  describe('문의하기', () => {
    it('문의하기 시 read 처리 후 /inquiry 로 이동하고 refresh 한다', async () => {
      const user = userEvent.setup();
      setAuth(true);
      setNotifications([makeNotification(1), makeNotification(2)]);
      renderWithTheme(<NotificationQueue />);

      await user.click(screen.getByText('inquiry'));

      expect(markNotificationReadMock).toHaveBeenCalledWith(1);
      expect(navigateMock).toHaveBeenCalledWith('/inquiry');
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it('단일 알림 문의하기 시 큐를 비운다(빈 화면)', async () => {
      const user = userEvent.setup();
      setAuth(true);
      setNotifications([makeNotification(1)]);
      renderWithTheme(<NotificationQueue />);

      await user.click(screen.getByText('inquiry'));

      expect(navigateMock).toHaveBeenCalledWith('/inquiry');
      expect(screen.queryByTestId('notification-modal')).not.toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "NotificationQueue" 이다', () => {
      expect(NotificationQueue.displayName).toBe('NotificationQueue');
    });
  });
});
