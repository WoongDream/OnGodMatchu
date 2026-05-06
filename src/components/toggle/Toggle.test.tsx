import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import Toggle from './Toggle';

describe('Toggle', () => {
  describe('aria-checked', () => {
    it('sets aria-checked to false when checked=false', () => {
      renderWithTheme(<Toggle checked={false} onChange={vi.fn()} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('sets aria-checked to true when checked=true', () => {
      renderWithTheme(<Toggle checked={true} onChange={vi.fn()} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('onChange callback', () => {
    it('calls onChange(true) when clicked with checked=false', () => {
      const onChange = vi.fn();
      renderWithTheme(<Toggle checked={false} onChange={onChange} />);
      fireEvent.click(screen.getByRole('switch'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange(false) when clicked with checked=true', () => {
      const onChange = vi.fn();
      renderWithTheme(<Toggle checked={true} onChange={onChange} />);
      fireEvent.click(screen.getByRole('switch'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe('disabled', () => {
    it('does not call onChange when disabled button is clicked', () => {
      const onChange = vi.fn();
      renderWithTheme(<Toggle checked={false} onChange={onChange} disabled={true} />);
      fireEvent.click(screen.getByRole('switch'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('button has disabled attribute when disabled=true', () => {
      renderWithTheme(<Toggle checked={false} onChange={vi.fn()} disabled={true} />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('button is not disabled when disabled=false (default)', () => {
      renderWithTheme(<Toggle checked={false} onChange={vi.fn()} />);
      expect(screen.getByRole('switch')).not.toBeDisabled();
    });
  });

  describe('ariaLabel', () => {
    it('sets aria-label when ariaLabel prop is provided', () => {
      renderWithTheme(<Toggle checked={false} onChange={vi.fn()} ariaLabel="알림 설정" />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-label', '알림 설정');
    });

    it('does not set aria-label when ariaLabel is not provided', () => {
      renderWithTheme(<Toggle checked={false} onChange={vi.fn()} />);
      // aria-label 미지정 시 속성 자체가 없거나 undefined — attribute 없음을 검증
      expect(screen.getByRole('switch')).not.toHaveAttribute('aria-label');
    });
  });

  describe('displayName', () => {
    it('has displayName equal to "Toggle"', () => {
      expect(Toggle.displayName).toBe('Toggle');
    });
  });
});
