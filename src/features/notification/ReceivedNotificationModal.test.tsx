import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { UserNotification } from '@/types';
import ReceivedNotificationModal from './ReceivedNotificationModal';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

const renderModal = (notification?: UserNotification) => {
  const onClose = vi.fn();
  renderWithTheme(
    <ReceivedNotificationModal
      notification={notification ?? makeNotification()}
      onClose={onClose}
    />,
  );
  return { onClose };
};

describe('ReceivedNotificationModal', () => {
  describe('내용 렌더', () => {
    it('제목/본문/유형 배지/발신자·날짜를 표시한다', () => {
      renderModal();
      expect(screen.getByText('점검 안내')).toBeInTheDocument();
      expect(screen.getByText('오늘 밤 점검이 있어요.')).toBeInTheDocument();
      expect(screen.getByText('안내')).toBeInTheDocument();
      expect(screen.getByText('운영팀 · 2026-06-01')).toBeInTheDocument();
    });

    it('dialog role 과 aria-modal/title aria-label 을 가진다', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', '점검 안내');
    });
  });

  describe('버튼 분기 (알림 종류별 규칙)', () => {
    it('INFO 면 「확인」만 표시하고 「문의하기」는 없다', () => {
      renderModal(makeNotification({ type: 'INFO', typeLabel: '안내' }));
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '문의하기' })).not.toBeInTheDocument();
    });

    it('WARNING 이면 「확인」/「문의하기」를 모두 표시한다', () => {
      renderModal(makeNotification({ type: 'WARNING', typeLabel: '경고' }));
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문의하기' })).toBeInTheDocument();
    });
  });

  describe('동작', () => {
    it('확인 클릭 시 onClose 를 호출한다', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();
      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('문의하기 클릭 시 onClose 후 navigate("/inquiry") 를 호출한다 (WARNING)', async () => {
      mockNavigate.mockClear();
      const user = userEvent.setup();
      const { onClose } = renderModal(makeNotification({ type: 'WARNING', typeLabel: '경고' }));
      await user.click(screen.getByRole('button', { name: '문의하기' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
    });

    it('오버레이(바깥) 클릭 시 onClose 를 호출한다', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();
      // 오버레이는 dialog 카드의 바깥 영역. 본문 텍스트의 상위 오버레이를 클릭.
      const dialog = screen.getByRole('dialog');
      const overlay = dialog.parentElement!.parentElement!;
      await user.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('카드 내부 클릭은 onClose 를 호출하지 않는다 (stopPropagation)', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();
      await user.click(screen.getByText('오늘 밤 점검이 있어요.'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "ReceivedNotificationModal" 이다', () => {
      expect(ReceivedNotificationModal.displayName).toBe('ReceivedNotificationModal');
    });
  });
});
