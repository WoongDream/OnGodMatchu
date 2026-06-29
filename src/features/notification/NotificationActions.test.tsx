import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import NotificationActions from './NotificationActions';

const renderActions = (props?: Partial<React.ComponentProps<typeof NotificationActions>>) => {
  const onConfirm = vi.fn();
  const onInquiry = vi.fn();
  renderWithTheme(
    <NotificationActions type="INFO" onConfirm={onConfirm} onInquiry={onInquiry} {...props} />,
  );
  return { onConfirm, onInquiry };
};

describe('NotificationActions', () => {
  describe('종류별 버튼 규칙', () => {
    it('INFO 면 「확인」 버튼만 표시하고 「문의하기」는 없다', () => {
      renderActions({ type: 'INFO' });
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '문의하기' })).not.toBeInTheDocument();
    });

    it('WARNING 이면 「확인」/「문의하기」 버튼을 모두 표시한다', () => {
      renderActions({ type: 'WARNING' });
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문의하기' })).toBeInTheDocument();
    });
  });

  describe('confirmLabel', () => {
    it('기본값은 「확인」 이다', () => {
      renderActions();
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    });

    it('confirmLabel 을 주면 그 텍스트로 확인 버튼을 렌더한다', () => {
      renderActions({ confirmLabel: '닫기' });
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
    });
  });

  describe('클릭 핸들러', () => {
    it('확인 클릭 시 onConfirm 을 호출한다', async () => {
      const user = userEvent.setup();
      const { onConfirm, onInquiry } = renderActions({ type: 'WARNING' });
      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onInquiry).not.toHaveBeenCalled();
    });

    it('문의하기 클릭 시 onInquiry 를 호출한다', async () => {
      const user = userEvent.setup();
      const { onInquiry, onConfirm } = renderActions({ type: 'WARNING' });
      await user.click(screen.getByRole('button', { name: '문의하기' }));
      expect(onInquiry).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "NotificationActions" 이다', () => {
      expect(NotificationActions.displayName).toBe('NotificationActions');
    });
  });
});
