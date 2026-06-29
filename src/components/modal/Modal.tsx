import { memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ModalProps } from './Modal.type';
import {
  overlayStyle,
  dialogStyle,
  headerStyle,
  titleStyle,
  closeButtonStyle,
  bodyStyle,
  footerStyle,
} from './Modal.style';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = memo(
  ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    closeOnOverlay = true,
    size = 'md',
  }: ModalProps) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (!isOpen) {
        return;
      }
      previouslyFocused.current = document.activeElement as HTMLElement | null;

      const focusFirst = () => {
        const node = dialogRef.current;
        if (!node) {
          return;
        }
        const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        const target = focusable[0] ?? node;
        target.focus();
      };
      const raf = window.requestAnimationFrame(focusFirst);

      const previousOverflow = document.body.style.overflow;
      const previousPaddingRight = document.body.style.paddingRight;
      // 스크롤바가 사라지며 배경이 우측으로 밀리는 현상 방지 — 사라진 스크롤바 폭만큼 보정.
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        window.cancelAnimationFrame(raf);
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
        previouslyFocused.current?.focus?.();
      };
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
          return;
        }
        if (e.key !== 'Tab') {
          return;
        }
        const node = dialogRef.current;
        if (!node) {
          return;
        }
        const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (el) => !el.hasAttribute('disabled'),
        );
        if (focusable.length === 0) {
          e.preventDefault();
          node.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
      return null;
    }

    const node = (
      <div
        css={overlayStyle}
        onClick={(e) => {
          if (closeOnOverlay && e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          ref={dialogRef}
          css={dialogStyle(size)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
        >
          <header css={headerStyle}>
            <h2 css={titleStyle}>{title}</h2>
            <button type="button" css={closeButtonStyle} onClick={onClose} aria-label="닫기">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>
          <div css={bodyStyle}>{children}</div>
          {footer && <div css={footerStyle}>{footer}</div>}
        </div>
      </div>
    );

    return createPortal(node, document.body);
  },
);

Modal.displayName = 'Modal';
export default Modal;
