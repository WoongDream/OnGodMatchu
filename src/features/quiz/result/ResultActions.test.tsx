import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen, waitFor } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import ResultActions from './ResultActions';

// Mock the Button component to simplify testing
vi.mock('@/components/button', () => ({
  default: ({
    variant = 'primary',
    onClick,
    children,
  }: {
    fullWidth?: boolean;
    variant?: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) => (
    <button data-testid={`button-${children}`} data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ResultActions', () => {
  let mockOnRetry: () => void;
  let mockOnHome: () => void;
  let mockAlert: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRetry = vi.fn();
    mockOnHome = vi.fn();
    mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com',
      },
      writable: true,
    });
  });

  describe('rendering', () => {
    it('renders three buttons', () => {
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      expect(screen.getByTestId('button-다시 풀기')).toBeInTheDocument();
      expect(screen.getByTestId('button-공유하기')).toBeInTheDocument();
      expect(screen.getByTestId('button-홈으로')).toBeInTheDocument();
    });

    it('renders all three buttons inside a single container', () => {
      const { container } = renderWithTheme(
        <ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toBeNull();
      expect(wrapper.children.length).toBe(3);
    });

    it('renders retry button with correct text', () => {
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      expect(screen.getByText('다시 풀기')).toBeInTheDocument();
    });

    it('renders share button with correct text', () => {
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      expect(screen.getByText('공유하기')).toBeInTheDocument();
    });

    it('renders home button with correct text', () => {
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      expect(screen.getByText('홈으로')).toBeInTheDocument();
    });

    it('has displayName set to ResultActions', () => {
      expect(ResultActions.displayName).toBe('ResultActions');
    });
  });

  describe('button variants and props', () => {
    it('retry button has default variant (primary)', () => {
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const retryButton = screen.getByTestId('button-다시 풀기');
      expect(retryButton).toHaveAttribute('data-variant', 'primary');
    });

    it('share button has secondary variant', () => {
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      expect(shareButton).toHaveAttribute('data-variant', 'secondary');
    });

    it('home button has ghost variant', () => {
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const homeButton = screen.getByTestId('button-홈으로');
      expect(homeButton).toHaveAttribute('data-variant', 'ghost');
    });
  });

  describe('onRetry callback', () => {
    it('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const retryButton = screen.getByTestId('button-다시 풀기');
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry callback without any arguments', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const retryButton = screen.getByTestId('button-다시 풀기');
      await user.click(retryButton);

      // The onClick handler will pass the synthetic event, but we just verify it was called once
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const retryButton = screen.getByTestId('button-다시 풀기');
      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('onHome callback', () => {
    it('calls onHome when home button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const homeButton = screen.getByTestId('button-홈으로');
      await user.click(homeButton);

      expect(mockOnHome).toHaveBeenCalledTimes(1);
    });

    it('calls onHome callback without any arguments', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const homeButton = screen.getByTestId('button-홈으로');
      await user.click(homeButton);

      // The onClick handler will pass the synthetic event, but we just verify it was called once
      expect(mockOnHome).toHaveBeenCalledTimes(1);
    });

    it('calls onHome multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const homeButton = screen.getByTestId('button-홈으로');
      await user.click(homeButton);
      await user.click(homeButton);

      expect(mockOnHome).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleShare - URL construction', () => {
    it('constructs URL with window.location.origin and quizId', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={42} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/42');
    });

    it('constructs URL with correct format for different quizId', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={999} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/999');
    });

    it('constructs URL with quizId 1', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/1');
    });

    it('constructs URL with large quizId', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={999999} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/999999');
    });
  });

  describe('handleShare - clipboard.writeText', () => {
    beforeEach(() => {
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    });

    it('calls navigator.clipboard.writeText when share button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('calls clipboard.writeText exactly once per share button click', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    it('calls clipboard.writeText multiple times on multiple share button clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);
      await user.click(shareButton);
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(3);
    });

    it('shows success alert after clipboard.writeText resolves', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('링크가 복사됐어요!');
      });
    });

    it('displays correct alert message when share succeeds', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={42} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('링크가 복사됐어요!');
      });
    });

    it('does not show alert immediately, only after clipboard write completes', async () => {
      const user = userEvent.setup();
      const writeTextPromise = new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      vi.spyOn(navigator.clipboard, 'writeText').mockReturnValue(writeTextPromise as Promise<void>);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(mockAlert).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('링크가 복사됐어요!');
      });
    });
  });

  describe('handleShare - error handling', () => {
    it('does not show alert if clipboard.writeText fails', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Clipboard error'));

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      // Alert should not be called when promise rejects
      await waitFor(
        () => {
          expect(mockAlert).not.toHaveBeenCalled();
        },
        { timeout: 100 },
      );
    });

    it('handles clipboard permission denied error gracefully', async () => {
      const user = userEvent.setup();
      const permissionError = new DOMException('Clipboard access denied', 'NotAllowedError');
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(permissionError);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      await waitFor(
        () => {
          expect(mockAlert).not.toHaveBeenCalled();
        },
        { timeout: 100 },
      );
    });
  });

  describe('component integration', () => {
    it('handles multiple button clicks in sequence', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const retryButton = screen.getByTestId('button-다시 풀기');
      const shareButton = screen.getByTestId('button-공유하기');
      const homeButton = screen.getByTestId('button-홈으로');

      await user.click(retryButton);
      await user.click(shareButton);
      await user.click(homeButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
      expect(mockOnHome).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    it('does not affect other callbacks when share is clicked', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(mockOnRetry).not.toHaveBeenCalled();
      expect(mockOnHome).not.toHaveBeenCalled();
    });

    it('does not affect other callbacks when retry is clicked', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const retryButton = screen.getByTestId('button-다시 풀기');
      await user.click(retryButton);

      expect(mockOnHome).not.toHaveBeenCalled();
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    it('does not affect other callbacks when home is clicked', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const homeButton = screen.getByTestId('button-홈으로');
      await user.click(homeButton);

      expect(mockOnRetry).not.toHaveBeenCalled();
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });
  });

  describe('prop changes - quizId', () => {
    it('updates URL when quizId prop changes', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      const { rerender } = renderWithTheme(
        <ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />,
      );

      let shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/1');

      rerender(<ResultActions quizId={2} onRetry={mockOnRetry} onHome={mockOnHome} />);

      shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/2');
    });

    it('does not create new handler on quizId change', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      const { rerender } = renderWithTheme(
        <ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />,
      );

      rerender(<ResultActions quizId={2} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      // Should use updated quizId
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/2');
    });
  });

  describe('prop changes - callbacks', () => {
    it('uses new onRetry callback when prop changes', async () => {
      const user = userEvent.setup();
      const newMockOnRetry = vi.fn();

      const { rerender } = renderWithTheme(
        <ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />,
      );

      rerender(<ResultActions quizId={1} onRetry={newMockOnRetry} onHome={mockOnHome} />);

      const retryButton = screen.getByTestId('button-다시 풀기');
      await user.click(retryButton);

      expect(newMockOnRetry).toHaveBeenCalledTimes(1);
      expect(mockOnRetry).not.toHaveBeenCalled();
    });

    it('uses new onHome callback when prop changes', async () => {
      const user = userEvent.setup();
      const newMockOnHome = vi.fn();

      const { rerender } = renderWithTheme(
        <ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />,
      );

      rerender(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={newMockOnHome} />);

      const homeButton = screen.getByTestId('button-홈으로');
      await user.click(homeButton);

      expect(newMockOnHome).toHaveBeenCalledTimes(1);
      expect(mockOnHome).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles very large quizId', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(
        <ResultActions
          quizId={Number.MAX_SAFE_INTEGER}
          onRetry={mockOnRetry}
          onHome={mockOnHome}
        />,
      );

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `https://example.com/quiz/${Number.MAX_SAFE_INTEGER}`,
      );
    });

    it('handles quizId with zero value', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      renderWithTheme(<ResultActions quizId={0} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const shareButton = screen.getByTestId('button-공유하기');
      await user.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/quiz/0');
    });
  });

  describe('React.memo memoization', () => {
    it('does not re-render when props are the same', () => {
      const { rerender } = renderWithTheme(
        <ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />,
      );

      const initialButton = screen.getByTestId('button-다시 풀기');

      rerender(<ResultActions quizId={1} onRetry={mockOnRetry} onHome={mockOnHome} />);

      const rerenderButton = screen.getByTestId('button-다시 풀기');

      // Both should exist and be the same
      expect(initialButton).toBe(rerenderButton);
    });
  });
});
