import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, fireEvent, waitFor, act } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

// Modal 내부와 동일한 FOCUSABLE_SELECTOR
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// createPortal 은 jsdom 에서 document.body 에 실제 삽입되므로 별도 mock 불필요

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: '테스트 모달',
  children: <p>모달 내용</p>,
};

describe('Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen 분기', () => {
    it('isOpen=false 이면 아무것도 렌더되지 않는다', () => {
      renderWithTheme(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('isOpen=true 이면 role=dialog 가 렌더된다', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('isOpen=true 이면 aria-modal="true" 속성이 있다', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('isOpen=true 이면 title 이 노출된다', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      expect(screen.getByText('테스트 모달')).toBeInTheDocument();
    });

    it('isOpen=true 이면 children 이 렌더된다', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      expect(screen.getByText('모달 내용')).toBeInTheDocument();
    });
  });

  describe('닫기 버튼', () => {
    it('닫기 버튼 클릭 시 onClose 가 호출된다', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Modal {...defaultProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: '닫기' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Esc 키', () => {
    it('Esc 키 입력 시 onClose 가 호출된다', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Modal {...defaultProps} onClose={onClose} />);
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('isOpen=false 상태에서는 Esc 키가 onClose 를 호출하지 않는다', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Modal {...defaultProps} isOpen={false} onClose={onClose} />);
      await user.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('overlay 클릭', () => {
    it('closeOnOverlay 기본값(true) 일 때 overlay 클릭 시 onClose 가 호출된다', () => {
      const onClose = vi.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={onClose} />);
      // overlay 는 dialog 의 부모 div (role 없는 첫 번째 div)
      const dialog = screen.getByRole('dialog');
      const overlay = dialog.parentElement!;
      // e.target === e.currentTarget 조건 충족: overlay 자신을 직접 클릭
      fireEvent.click(overlay, { target: overlay });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closeOnOverlay=false 이면 overlay 클릭해도 onClose 가 호출되지 않는다', () => {
      const onClose = vi.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={onClose} closeOnOverlay={false} />);
      const dialog = screen.getByRole('dialog');
      const overlay = dialog.parentElement!;
      fireEvent.click(overlay, { target: overlay });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('dialog 내부 클릭 시에는 onClose 가 호출되지 않는다', () => {
      const onClose = vi.fn();
      renderWithTheme(<Modal {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('footer 렌더링', () => {
    it('footer prop 이 없으면 footer 영역이 없다', () => {
      renderWithTheme(<Modal {...defaultProps} />);
      // footer 텍스트가 없음을 확인
      expect(screen.queryByText('확인')).not.toBeInTheDocument();
    });

    it('footer prop 이 있으면 footer 내용이 렌더된다', () => {
      renderWithTheme(<Modal {...defaultProps} footer={<button>확인</button>} />);
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    });
  });

  describe('body overflow lock', () => {
    it('isOpen=true 일 때 document.body.style.overflow 가 hidden 으로 설정된다', () => {
      renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('isOpen=false 로 변경되면 overflow lock 이 해제된다', () => {
      const { rerender } = renderWithTheme(<Modal {...defaultProps} isOpen={true} />);
      rerender(
        <React.Fragment>
          <Modal {...defaultProps} isOpen={false} />
        </React.Fragment>,
      );
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('focus trap', () => {
    it('isOpen=true 마운트 후 dialog 내 첫 번째 focusable 요소에 포커스된다', async () => {
      renderWithTheme(
        <Modal {...defaultProps}>
          <button data-testid="first-btn">첫 버튼</button>
          <button data-testid="second-btn">두번째 버튼</button>
        </Modal>,
      );
      // requestAnimationFrame 이 실행될 때까지 대기
      await waitFor(() => {
        // 닫기 버튼이 header 의 첫 focusable, 이후 내부 버튼 순
        // FOCUSABLE_SELECTOR 순서상 header 닫기 버튼이 가장 먼저
        const focused = document.activeElement;
        expect(focused).not.toBe(document.body);
      });
    });

    it('Tab 키로 마지막 focusable → 첫 focusable 로 순환한다', () => {
      renderWithTheme(
        <Modal {...defaultProps} footer={<button data-testid="confirm-btn">확인</button>}>
          <button data-testid="body-btn">내부 버튼</button>
        </Modal>,
      );

      const dialog = screen.getByRole('dialog');
      const focusableEls = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));

      const firstFocusable = focusableEls[0];
      const lastFocusable = focusableEls[focusableEls.length - 1];

      // 마지막 focusable 에 포커스 후 Tab keydown 이벤트를 직접 발생시킨다.
      // Modal 핸들러는 document.addEventListener('keydown', ...) 로 등록되므로
      // fireEvent.keyDown(document, ...) 으로 정확히 트리거할 수 있다.
      act(() => lastFocusable.focus());
      expect(document.activeElement).toBe(lastFocusable);

      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      expect(document.activeElement).toBe(firstFocusable);
    });

    it('Shift+Tab 키로 첫 focusable → 마지막 focusable 로 순환한다', () => {
      renderWithTheme(
        <Modal {...defaultProps} footer={<button data-testid="confirm-btn">확인</button>}>
          <button data-testid="body-btn">내부 버튼</button>
        </Modal>,
      );

      const dialog = screen.getByRole('dialog');
      const focusableEls = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));

      const firstFocusable = focusableEls[0];
      const lastFocusable = focusableEls[focusableEls.length - 1];

      act(() => firstFocusable.focus());
      expect(document.activeElement).toBe(firstFocusable);

      // Shift+Tab → 마지막 focusable 로 wrap
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(lastFocusable);
    });
  });

  describe('size prop', () => {
    it('size="sm" 일 때도 role=dialog 가 렌더된다', () => {
      renderWithTheme(<Modal {...defaultProps} size="sm" />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('size="md" 일 때도 role=dialog 가 렌더된다', () => {
      renderWithTheme(<Modal {...defaultProps} size="md" />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "Modal" 이다', () => {
      expect(Modal.displayName).toBe('Modal');
    });
  });
});
