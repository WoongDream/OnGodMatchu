import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: '정말 삭제할까요?',
};

describe('ConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isOpen=false 면 렌더되지 않는다', () => {
    renderWithTheme(<ConfirmModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen=true 면 title 과 message 가 렌더된다', () => {
    renderWithTheme(<ConfirmModal {...baseProps} message="되돌릴 수 없어요." />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('정말 삭제할까요?')).toBeInTheDocument();
    expect(screen.getByText('되돌릴 수 없어요.')).toBeInTheDocument();
  });

  it('message 가 없으면 본문 문단이 렌더되지 않는다', () => {
    const { container } = renderWithTheme(<ConfirmModal {...baseProps} />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('기본 라벨은 "확인" / "취소" 이다', () => {
    renderWithTheme(<ConfirmModal {...baseProps} />);
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('custom confirmLabel / cancelLabel 이 표시된다', () => {
    renderWithTheme(<ConfirmModal {...baseProps} confirmLabel="삭제" cancelLabel="그만두기" />);
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '그만두기' })).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm 이 호출된다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithTheme(<ConfirmModal {...baseProps} onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 시 onClose 가 호출된다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(<ConfirmModal {...baseProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('isConfirming=true', () => {
    it('취소/확인 버튼이 모두 disabled 된다', () => {
      renderWithTheme(<ConfirmModal {...baseProps} isConfirming confirmingLabel="삭제 중..." />);
      expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '삭제 중...' })).toBeDisabled();
    });

    it('confirmingLabel 이 제공되면 확인 버튼에 표시된다', () => {
      renderWithTheme(<ConfirmModal {...baseProps} isConfirming confirmingLabel="삭제 중..." />);
      expect(screen.getByRole('button', { name: '삭제 중...' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
    });

    it('confirmingLabel 이 없으면 confirmLabel 을 그대로 표시한다', () => {
      renderWithTheme(<ConfirmModal {...baseProps} confirmLabel="삭제" isConfirming />);
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "ConfirmModal" 이다', () => {
      expect(ConfirmModal.displayName).toBe('ConfirmModal');
    });
  });
});
