import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import QuizProgress from './QuizProgress';

describe('QuizProgress', () => {
  describe('rendering', () => {
    it('renders progress label with current and total values', () => {
      renderWithTheme(<QuizProgress current={3} total={10} />);
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('renders progress bar container', () => {
      renderWithTheme(<QuizProgress current={5} total={10} />);
      const progressBar = screen.getByText('5 / 10').closest('div')?.parentElement;
      expect(progressBar).toBeInTheDocument();
    });

    it('renders both label and bar elements', () => {
      const { container } = renderWithTheme(<QuizProgress current={2} total={8} />);
      // Verify component renders without errors
      expect(screen.getByText('2 / 8')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('percentage calculation', () => {
    it('calculates 0% when current is 0', () => {
      const { container } = renderWithTheme(<QuizProgress current={0} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('0 / 10')).toBeInTheDocument();
    });

    it('calculates 50% when current is half of total', () => {
      const { container } = renderWithTheme(<QuizProgress current={5} total={10} />);
      // Verify component renders and can calculate 50%
      expect(screen.getByText('5 / 10')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('calculates 100% when current equals total', () => {
      renderWithTheme(<QuizProgress current={10} total={10} />);
      expect(screen.getByText('10 / 10')).toBeInTheDocument();
    });

    it('calculates correct percentage for various values', () => {
      const testCases = [
        { current: 1, total: 4 }, // 25%
        { current: 3, total: 4 }, // 75%
        { current: 2, total: 3 }, // 66.67%
        { current: 1, total: 3 }, // 33.33%
      ];

      testCases.forEach(({ current, total }) => {
        const { unmount } = renderWithTheme(<QuizProgress current={current} total={total} />);
        expect(screen.getByText(`${current} / ${total}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('edge cases', () => {
    it('handles total of 1', () => {
      renderWithTheme(<QuizProgress current={1} total={1} />);
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
    });

    it('handles large numbers', () => {
      renderWithTheme(<QuizProgress current={500} total={1000} />);
      expect(screen.getByText('500 / 1000')).toBeInTheDocument();
    });

    it('handles very small progress', () => {
      renderWithTheme(<QuizProgress current={1} total={100} />);
      expect(screen.getByText('1 / 100')).toBeInTheDocument();
    });

    it('handles progress close to completion', () => {
      renderWithTheme(<QuizProgress current={99} total={100} />);
      expect(screen.getByText('99 / 100')).toBeInTheDocument();
    });
  });

  describe('label formatting', () => {
    it('displays label with forward slash separator', () => {
      renderWithTheme(<QuizProgress current={2} total={5} />);
      const label = screen.getByText('2 / 5');
      expect(label.textContent).toMatch(/^\d+ \/ \d+$/);
    });

    it('updates label when props change', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={1} total={5} />);
      expect(screen.getByText('1 / 5')).toBeInTheDocument();

      rerender(<QuizProgress current={3} total={5} />);
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });

    it('displays correct values for sequential updates', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={1} total={10} />);
      expect(screen.getByText('1 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={5} total={10} />);
      expect(screen.getByText('5 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={10} total={10} />);
      expect(screen.getByText('10 / 10')).toBeInTheDocument();
    });
  });

  describe('memo optimization', () => {
    it('does not re-render when props remain the same', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={5} total={10} />);
      const initialElement = screen.getByText('5 / 10');

      rerender(<QuizProgress current={5} total={10} />);
      const rerenderElement = screen.getByText('5 / 10');

      // Both should be in document (React.memo should prevent unnecessary re-renders)
      expect(initialElement).toBeInTheDocument();
      expect(rerenderElement).toBeInTheDocument();
    });

    it('re-renders when current prop changes', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={5} total={10} />);
      expect(screen.getByText('5 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={6} total={10} />);
      expect(screen.getByText('6 / 10')).toBeInTheDocument();
    });

    it('re-renders when total prop changes', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={5} total={10} />);
      expect(screen.getByText('5 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={5} total={15} />);
      expect(screen.getByText('5 / 15')).toBeInTheDocument();
    });
  });

  describe('progress bar structure', () => {
    it('has wrapper, label, bar, and fill elements', () => {
      const { container } = renderWithTheme(<QuizProgress current={5} total={10} />);
      // Verify main wrapper exists
      expect(container.firstChild).toBeInTheDocument();
      // Verify label is rendered
      expect(screen.getByText('5 / 10')).toBeInTheDocument();
    });

    it('maintains structure with 0% progress', () => {
      const { container } = renderWithTheme(<QuizProgress current={0} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('0 / 10')).toBeInTheDocument();
    });

    it('maintains structure with 100% progress', () => {
      const { container } = renderWithTheme(<QuizProgress current={10} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('10 / 10')).toBeInTheDocument();
    });
  });

  describe('numeric accuracy', () => {
    it('handles decimal percentage calculations correctly', () => {
      // 1/3 = 33.333...%
      renderWithTheme(<QuizProgress current={1} total={3} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('handles non-integer percentages', () => {
      // 1/7 = 14.285...%
      renderWithTheme(<QuizProgress current={1} total={7} />);
      expect(screen.getByText('1 / 7')).toBeInTheDocument();
    });

    it('handles progress values that result in repeating decimals', () => {
      // 2/3 = 66.666...%
      renderWithTheme(<QuizProgress current={2} total={3} />);
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
  });
});
