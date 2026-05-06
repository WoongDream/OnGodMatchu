import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import CategoryFilter from './CategoryFilter';
import type { Category } from '@/types';

// Mock ChipButton component
vi.mock('@/components/chip-button', () => ({
  default: ({ active, onClick, children }: any) => (
    <button data-testid={`chip-${children}`} data-active={active} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('CategoryFilter', () => {
  describe('rendering categories', () => {
    it('renders "전체" (All) button', () => {
      renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      expect(screen.getByText('전체')).toBeInTheDocument();
    });

    it('renders all category buttons', () => {
      renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      expect(screen.getByText('연예인')).toBeInTheDocument();
      expect(screen.getByText('영화')).toBeInTheDocument();
      expect(screen.getByText('드라마')).toBeInTheDocument();
      expect(screen.getByText('애니메이션')).toBeInTheDocument();
      expect(screen.getByText('게임')).toBeInTheDocument();
      expect(screen.getByText('음악')).toBeInTheDocument();
      expect(screen.getByText('스포츠')).toBeInTheDocument();
      expect(screen.getByText('상식')).toBeInTheDocument();
      expect(screen.getByText('기타')).toBeInTheDocument();
    });

    it('renders exactly 10 buttons (1 all + 9 categories)', () => {
      const { container } = renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(10);
    });
  });

  describe('active state for "전체" button', () => {
    it('marks "전체" as active when selected is null', () => {
      renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      const allButton = screen.getByTestId('chip-전체');
      expect(allButton).toHaveAttribute('data-active', 'true');
    });

    it('marks "전체" as inactive when a category is selected', () => {
      renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      const allButton = screen.getByTestId('chip-전체');
      expect(allButton).toHaveAttribute('data-active', 'false');
    });
  });

  describe('active state for category buttons', () => {
    it('marks selected category as active', () => {
      renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      const gameButton = screen.getByTestId('chip-게임');
      expect(gameButton).toHaveAttribute('data-active', 'true');
    });

    it('marks non-selected categories as inactive', () => {
      renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-영화')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-드라마')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-기타')).toHaveAttribute('data-active', 'false');
    });

    it('marks all categories as inactive when selected is null', () => {
      renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-영화')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-드라마')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-기타')).toHaveAttribute('data-active', 'false');
    });

    it('only marks one category as active at a time', () => {
      const { rerender } = renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'false');

      rerender(<CategoryFilter selected="music" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'true');
    });
  });

  describe('clicking "전체" button', () => {
    it('calls onSelect with null when "전체" is clicked and currently null', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      await user.click(screen.getByText('전체'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('calls onSelect with null when "전체" is clicked with a category selected', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="game" onSelect={onSelect} />);

      await user.click(screen.getByText('전체'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('calls onSelect once when clicking "전체"', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="game" onSelect={onSelect} />);

      await user.click(screen.getByText('전체'));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('clicking category buttons - selection', () => {
    it('calls onSelect with category when unselected category is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      expect(onSelect).toHaveBeenCalledWith('game');
    });

    it('calls onSelect with category when different category is selected', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="music" onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      expect(onSelect).toHaveBeenCalledWith('game');
    });

    it('handles clicking all different categories', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const { rerender } = renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      const testCases: Array<[string, Category]> = [
        ['연예인', 'entertainment'],
        ['영화', 'movie'],
        ['드라마', 'drama'],
        ['애니메이션', 'anime'],
        ['게임', 'game'],
        ['음악', 'music'],
        ['스포츠', 'sports'],
        ['상식', 'general'],
        ['기타', 'etc'],
      ];

      for (const [label, value] of testCases) {
        onSelect.mockClear();
        rerender(<CategoryFilter selected={null} onSelect={onSelect} />);
        await user.click(screen.getByText(label));
        expect(onSelect).toHaveBeenCalledWith(value);
      }
    });
  });

  describe('clicking category buttons - deselection (toggle)', () => {
    it('calls onSelect with null when selected category is clicked again', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="game" onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('toggles off "music" when it is selected and clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="music" onSelect={onSelect} />);

      await user.click(screen.getByText('음악'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('toggles off "movie" when it is selected and clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="movie" onSelect={onSelect} />);

      await user.click(screen.getByText('영화'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('toggles off "sports" when it is selected and clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="sports" onSelect={onSelect} />);

      await user.click(screen.getByText('스포츠'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('toggles off "etc" when it is selected and clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="etc" onSelect={onSelect} />);

      await user.click(screen.getByText('기타'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('multiple clicks', () => {
    it('calls onSelect twice when clicking different buttons in sequence', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      await user.click(screen.getByText('음악'));

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenNthCalledWith(1, 'game');
      expect(onSelect).toHaveBeenNthCalledWith(2, 'music');
    });

    it('handles rapid successive clicks on same button', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      let selected: Category | null = null;

      const { rerender } = renderWithTheme(
        <CategoryFilter
          selected={selected}
          onSelect={(newSelected) => {
            selected = newSelected;
            onSelect(newSelected);
            rerender(<CategoryFilter selected={newSelected} onSelect={onSelect} />);
          }}
        />,
      );

      const gameButton = screen.getByText('게임');
      await user.click(gameButton);
      await user.click(gameButton);

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenNthCalledWith(1, 'game');
      expect(onSelect).toHaveBeenNthCalledWith(2, null);
    });

    it('handles clicking "전체" then a category', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      await user.click(screen.getByText('전체'));
      await user.click(screen.getByText('게임'));

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenNthCalledWith(1, null);
      expect(onSelect).toHaveBeenNthCalledWith(2, 'game');
    });

    it('handles clicking category then "전체"', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      await user.click(screen.getByText('전체'));

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenNthCalledWith(1, 'game');
      expect(onSelect).toHaveBeenNthCalledWith(2, null);
    });
  });

  describe('prop updates', () => {
    it('updates active state when selected prop changes', () => {
      const { rerender } = renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');

      rerender(<CategoryFilter selected="music" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'true');
    });

    it('updates active state when selected changes to null', () => {
      const { rerender } = renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('chip-전체')).toHaveAttribute('data-active', 'false');

      rerender(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-전체')).toHaveAttribute('data-active', 'true');
    });

    it('updates active state across all categories', () => {
      const { rerender } = renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'false');

      rerender(<CategoryFilter selected="music" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('chip-연예인')).toHaveAttribute('data-active', 'false');
    });
  });

  describe('callback correctness', () => {
    it('calls onSelect with correct category values', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      expect(onSelect).toHaveBeenCalledWith('game');

      await user.click(screen.getByText('음악'));
      expect(onSelect).toHaveBeenCalledWith('music');

      await user.click(screen.getByText('영화'));
      expect(onSelect).toHaveBeenCalledWith('movie');

      await user.click(screen.getByText('드라마'));
      expect(onSelect).toHaveBeenCalledWith('drama');

      await user.click(screen.getByText('기타'));
      expect(onSelect).toHaveBeenCalledWith('etc');
    });

    it('does not call onSelect when component mounts', () => {
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="game" onSelect={onSelect} />);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('calls onSelect only once per click', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      expect(onSelect).toHaveBeenCalledTimes(1);

      await user.click(screen.getByText('음악'));
      expect(onSelect).toHaveBeenCalledTimes(2);
    });

    it('passes null to onSelect when deselecting via toggle', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected="game" onSelect={onSelect} />);

      await user.click(screen.getByText('게임'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('edge cases and null handling', () => {
    it('renders correctly when selected is null and "전체" is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      // "전체" should already be active
      expect(screen.getByTestId('chip-전체')).toHaveAttribute('data-active', 'true');

      // Clicking it should still call onSelect with null
      await user.click(screen.getByText('전체'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('handles switching between null and all categories', () => {
      const { rerender } = renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-전체')).toHaveAttribute('data-active', 'true');

      rerender(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-전체')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');

      rerender(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      expect(screen.getByTestId('chip-전체')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
    });
  });

  describe('component structure', () => {
    it('renders with FilterWrapper container', () => {
      const { container } = renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      const wrapper = container.firstChild;
      expect(wrapper).toBeInTheDocument();
    });

    it('renders all buttons inside wrapper', () => {
      const { container } = renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(container.contains(button)).toBe(true);
      });
    });
  });

  describe('display name and memoization', () => {
    it('has correct display name for debugging', () => {
      expect(CategoryFilter.displayName).toBe('CategoryFilter');
    });

    it('renders without errors with valid props', () => {
      renderWithTheme(<CategoryFilter selected="game" onSelect={vi.fn()} />);
      expect(screen.getByText('게임')).toBeInTheDocument();
    });
  });

  describe('accessibility and interaction', () => {
    it('all buttons are clickable', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(<CategoryFilter selected={null} onSelect={onSelect} />);

      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        await user.click(button);
      }

      expect(onSelect.mock.calls.length).toBe(buttons.length);
    });

    it('button elements are in DOM', () => {
      renderWithTheme(<CategoryFilter selected={null} onSelect={vi.fn()} />);
      expect(screen.getAllByRole('button').length).toBe(10);
    });
  });

  describe('state transitions', () => {
    it('handles transition from "게임" selected to "음악" selected', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const { rerender } = renderWithTheme(<CategoryFilter selected="game" onSelect={onSelect} />);

      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');

      await user.click(screen.getByText('음악'));
      expect(onSelect).toHaveBeenCalledWith('music');

      rerender(<CategoryFilter selected="music" onSelect={onSelect} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'true');
    });

    it('handles transition from selected to null via toggle', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const { rerender } = renderWithTheme(<CategoryFilter selected="game" onSelect={onSelect} />);

      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');

      await user.click(screen.getByText('게임'));
      expect(onSelect).toHaveBeenCalledWith(null);

      rerender(<CategoryFilter selected={null} onSelect={onSelect} />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-전체')).toHaveAttribute('data-active', 'true');
    });
  });
});
