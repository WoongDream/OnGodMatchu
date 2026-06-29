import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent } from '@testing-library/react';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { UserNotification } from '@/types';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockUseOutletContext = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: mockUseOutletContext,
    // ReceivedNotificationModal 이 useNavigate 를 사용하므로 안전한 stub 제공
    useNavigate: () => mockNavigate,
    Navigate: (props: { to: string }) => {
      mockNavigate(props.to);
      return <div data-testid="navigate" data-to={props.to} />;
    },
  };
});

// ── useReceivedNotifications mock ─────────────────────────────────────────────
const mockUseReceivedNotifications = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useReceivedNotifications', () => ({
  default: mockUseReceivedNotifications,
}));

import ProfileNotifications from './ProfileNotifications';

// ── helpers ───────────────────────────────────────────────────────────────────
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

const baseHook = {
  items: [] as UserNotification[],
  totalElements: 0,
  isLoading: false,
  isLoadingMore: false,
  hasNext: false,
  error: undefined as unknown,
  loadMore: vi.fn(),
};

const setHook = (overrides: Partial<typeof baseHook>) => {
  mockUseReceivedNotifications.mockReturnValue({ ...baseHook, ...overrides });
};

beforeEach(() => {
  vi.clearAllMocks();
  // 기본: 본인(isMe)
  mockUseOutletContext.mockReturnValue({ profile: { id: 'u1' }, isMe: true });
  setHook({});
  // IntersectionObserver 스텁
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('ProfileNotifications', () => {
  describe('접근 제어', () => {
    it('isMe=false 면 상위 경로로 redirect 한다', () => {
      mockUseOutletContext.mockReturnValue({ profile: { id: 'u1' }, isMe: false });
      renderWithTheme(<ProfileNotifications />);

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '..');
      expect(mockNavigate).toHaveBeenCalledWith('..');
    });
  });

  describe('헤더', () => {
    it('"받은 알림" 제목과 전체 개수를 렌더한다', () => {
      setHook({ totalElements: 5, items: [makeNotification()] });
      renderWithTheme(<ProfileNotifications />);

      expect(screen.getByText('받은 알림')).toBeInTheDocument();
      expect(screen.getByText('전체 5개')).toBeInTheDocument();
    });
  });

  describe('상태별 렌더링', () => {
    it('items 가 있으면 알림 리스트 아이템을 렌더한다', () => {
      setHook({
        items: [
          makeNotification({ id: 1, title: '점검 안내' }),
          makeNotification({ id: 2, title: '이벤트 안내' }),
        ],
        totalElements: 2,
      });
      renderWithTheme(<ProfileNotifications />);

      expect(screen.getByText('점검 안내')).toBeInTheDocument();
      expect(screen.getByText('이벤트 안내')).toBeInTheDocument();
    });

    it('초기 로딩 중이면 "불러오는 중..." 을 보여준다', () => {
      setHook({ isLoading: true, items: [] });
      renderWithTheme(<ProfileNotifications />);

      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });

    it('error 가 있으면 에러 메시지를 보여준다', () => {
      setHook({ error: new Error('boom'), items: [] });
      renderWithTheme(<ProfileNotifications />);

      expect(screen.getByText('받은 알림을 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('빈 결과면 "아직 받은 알림이 없어요." 를 보여준다', () => {
      setHook({ items: [], totalElements: 0 });
      renderWithTheme(<ProfileNotifications />);

      expect(screen.getByText('아직 받은 알림이 없어요.')).toBeInTheDocument();
    });
  });

  describe('아이템 클릭 → 모달', () => {
    it('아이템 클릭 시 ReceivedNotificationModal 이 열려 제목/본문을 보여준다', () => {
      setHook({
        items: [makeNotification({ id: 1, title: '점검 안내', content: '오늘 밤 점검이 있어요.' })],
        totalElements: 1,
      });
      renderWithTheme(<ProfileNotifications />);

      // 모달이 열리기 전엔 dialog 없음
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /점검 안내/ }));
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-label', '점검 안내');
      // 본문 텍스트가 모달 안에 노출됨
      expect(screen.getAllByText('오늘 밤 점검이 있어요.').length).toBeGreaterThan(0);
    });
  });

  describe('memoization', () => {
    it('displayName 이 "ProfileNotifications" 이다', () => {
      expect(ProfileNotifications.displayName).toBe('ProfileNotifications');
    });
  });
});
