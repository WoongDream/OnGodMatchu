import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { UserNotification } from '@/types';
import NotificationModal from './NotificationModal';

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

const renderModal = (props?: Partial<React.ComponentProps<typeof NotificationModal>>) => {
  const onNext = vi.fn();
  const onConfirm = vi.fn();
  const onInquiry = vi.fn();
  renderWithTheme(
    <NotificationModal
      notification={makeNotification()}
      total={1}
      index={0}
      onNext={onNext}
      onConfirm={onConfirm}
      onInquiry={onInquiry}
      {...props}
    />,
  );
  return { onNext, onConfirm, onInquiry };
};

describe('NotificationModal', () => {
  describe('내용 렌더', () => {
    it('제목/본문/유형 라벨/발신자·날짜를 표시한다', () => {
      renderModal();
      expect(screen.getByText('점검 안내')).toBeInTheDocument();
      expect(screen.getByText('오늘 밤 점검이 있어요.')).toBeInTheDocument();
      expect(screen.getByText('안내')).toBeInTheDocument();
      expect(screen.getByText('운영팀 · 2026-06-01')).toBeInTheDocument();
    });

    it('alertdialog role 과 title aria-label 을 가진다', () => {
      renderModal();
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', '점검 안내');
    });
  });

  describe('카운트 표시', () => {
    it('total 이 1 이면 카운트 pill 을 표시하지 않는다', () => {
      renderModal({ total: 1, index: 0 });
      expect(screen.queryByText(/새 알림/)).not.toBeInTheDocument();
    });

    it('total 이 1보다 크면 "새 알림 N개 · M/N" 카운트를 표시한다', () => {
      renderModal({ total: 3, index: 0 });
      expect(screen.getByText('새 알림 3개 · 1 / 3')).toBeInTheDocument();
    });

    it('index 에 따라 현재 위치(M)가 1-based 로 갱신된다', () => {
      renderModal({ total: 3, index: 1 });
      expect(screen.getByText('새 알림 3개 · 2 / 3')).toBeInTheDocument();
    });
  });

  describe('버튼 분기 - 마지막이 아닐 때', () => {
    it('「다음 (N개 남음)」 버튼만 표시한다', () => {
      renderModal({ total: 3, index: 0 });
      expect(screen.getByRole('button', { name: '다음 (2개 남음)' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '문의하기' })).not.toBeInTheDocument();
    });

    it('남은 개수를 index 기준으로 계산한다', () => {
      renderModal({ total: 5, index: 2 });
      expect(screen.getByRole('button', { name: '다음 (2개 남음)' })).toBeInTheDocument();
    });

    it('다음 클릭 시 onNext 를 호출한다', async () => {
      const user = userEvent.setup();
      const { onNext, onConfirm } = renderModal({ total: 3, index: 0 });
      await user.click(screen.getByRole('button', { name: '다음 (2개 남음)' }));
      expect(onNext).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('버튼 분기 - 마지막일 때', () => {
    it('「확인」/「문의하기」 버튼을 표시하고 다음 버튼은 없다', () => {
      renderModal({ total: 3, index: 2 });
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문의하기' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /다음/ })).not.toBeInTheDocument();
    });

    it('total 이 1 이면(단일·마지막) 확인/문의하기를 표시한다', () => {
      renderModal({ total: 1, index: 0 });
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문의하기' })).toBeInTheDocument();
    });

    it('확인 클릭 시 onConfirm 을 호출한다', async () => {
      const user = userEvent.setup();
      const { onConfirm, onInquiry } = renderModal({ total: 1, index: 0 });
      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onInquiry).not.toHaveBeenCalled();
    });

    it('문의하기 클릭 시 onInquiry 를 호출한다', async () => {
      const user = userEvent.setup();
      const { onInquiry, onConfirm } = renderModal({ total: 1, index: 0 });
      await user.click(screen.getByRole('button', { name: '문의하기' }));
      expect(onInquiry).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('유형 라벨', () => {
    it('WARNING 알림의 typeLabel 을 그대로 표시한다', () => {
      renderModal({ notification: makeNotification({ type: 'WARNING', typeLabel: '경고' }) });
      expect(screen.getByText('경고')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "NotificationModal" 이다', () => {
      expect(NotificationModal.displayName).toBe('NotificationModal');
    });
  });
});
