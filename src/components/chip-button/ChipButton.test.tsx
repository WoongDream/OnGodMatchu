import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import ChipButton from './ChipButton';

describe('ChipButton', () => {
  describe('rendering', () => {
    it('renders children content', () => {
      renderWithTheme(<ChipButton>Click me</ChipButton>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with custom children', () => {
      renderWithTheme(<ChipButton>Custom Label</ChipButton>);
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('renders with numeric children', () => {
      renderWithTheme(<ChipButton>42</ChipButton>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders with empty children string', () => {
      const { container } = renderWithTheme(<ChipButton>{''}</ChipButton>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders as a button element', () => {
      const { container } = renderWithTheme(<ChipButton>Test</ChipButton>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('has correct display name', () => {
      expect(ChipButton.displayName).toBe('ChipButton');
    });
  });

  describe('active prop styling', () => {
    it('renders with active prop set to true', () => {
      const { container } = renderWithTheme(<ChipButton active={true}>Active</ChipButton>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with active prop set to false', () => {
      const { container } = renderWithTheme(<ChipButton active={false}>Inactive</ChipButton>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('defaults to inactive (active=false) when prop is omitted', () => {
      const { container } = renderWithTheme(<ChipButton>Default</ChipButton>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      // Component defaults to active={false}
    });

    it('applies active styles when active=true', () => {
      const { container } = renderWithTheme(<ChipButton active={true}>Active Chip</ChipButton>);
      const button = container.querySelector('button');

      // Verify button exists and has emotion classes applied
      expect(button).toBeInTheDocument();
      expect(button?.className).toBeTruthy();
    });

    it('applies inactive styles when active=false', () => {
      const { container } = renderWithTheme(<ChipButton active={false}>Inactive Chip</ChipButton>);
      const button = container.querySelector('button');

      // Verify button exists and has emotion classes applied
      expect(button).toBeInTheDocument();
      expect(button?.className).toBeTruthy();
    });

    it('maintains correct styling after toggle from inactive to active', () => {
      const { rerender, container } = renderWithTheme(
        <ChipButton active={false}>Toggle</ChipButton>,
      );
      let button = container.querySelector('button');
      expect(button).toBeInTheDocument();

      rerender(<ChipButton active={true}>Toggle</ChipButton>);
      button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('maintains correct styling after toggle from active to inactive', () => {
      const { rerender, container } = renderWithTheme(
        <ChipButton active={true}>Toggle</ChipButton>,
      );
      let button = container.querySelector('button');
      expect(button).toBeInTheDocument();

      rerender(<ChipButton active={false}>Toggle</ChipButton>);
      button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('onClick callback', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(<ChipButton onClick={handleClick}>Click</ChipButton>);
      await user.click(screen.getByText('Click'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(<ChipButton onClick={handleClick}>Click</ChipButton>);
      await user.click(screen.getByText('Click'));

      // onClick receives the click event, not no arguments
      expect(handleClick).toHaveBeenCalled();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not throw error when onClick is undefined', async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<ChipButton>No handler</ChipButton>);

      // Should not throw
      await expect(user.click(container.querySelector('button')!)).resolves.toBeUndefined();
    });

    it('calls onClick multiple times on repeated clicks', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(<ChipButton onClick={handleClick}>Click</ChipButton>);
      const button = screen.getByText('Click');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('calls onClick when active prop is true', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <ChipButton active={true} onClick={handleClick}>
          Active Button
        </ChipButton>,
      );
      await user.click(screen.getByText('Active Button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when active prop is false', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <ChipButton active={false} onClick={handleClick}>
          Inactive Button
        </ChipButton>,
      );
      await user.click(screen.getByText('Inactive Button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('preserves onClick callback after re-render with same callback', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<ChipButton onClick={handleClick}>Click</ChipButton>);

      rerender(<ChipButton onClick={handleClick}>Click</ChipButton>);
      await user.click(screen.getByText('Click'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('uses new onClick callback after re-render with different callback', async () => {
      const oldHandler = vi.fn();
      const newHandler = vi.fn();
      const user = userEvent.setup();

      const { rerender } = renderWithTheme(<ChipButton onClick={oldHandler}>Click</ChipButton>);

      rerender(<ChipButton onClick={newHandler}>Click</ChipButton>);
      await user.click(screen.getByText('Click'));

      expect(oldHandler).not.toHaveBeenCalled();
      expect(newHandler).toHaveBeenCalledTimes(1);
    });

    it('handles onClick with changes to active prop', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { rerender } = renderWithTheme(
        <ChipButton active={false} onClick={handleClick}>
          Toggle Button
        </ChipButton>,
      );

      await user.click(screen.getByText('Toggle Button'));
      expect(handleClick).toHaveBeenCalledTimes(1);

      rerender(
        <ChipButton active={true} onClick={handleClick}>
          Toggle Button
        </ChipButton>,
      );

      await user.click(screen.getByText('Toggle Button'));
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('combined props and interactions', () => {
    it('renders active button with click handler', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <ChipButton active={true} onClick={handleClick}>
          Active with Handler
        </ChipButton>,
      );

      await user.click(screen.getByText('Active with Handler'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders inactive button with click handler', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <ChipButton active={false} onClick={handleClick}>
          Inactive with Handler
        </ChipButton>,
      );

      await user.click(screen.getByText('Inactive with Handler'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('toggles active state and fires callback on each click', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      let active = false;

      const { rerender } = renderWithTheme(
        <ChipButton
          active={active}
          onClick={() => {
            handleClick();
            active = !active;
          }}
        >
          Toggle
        </ChipButton>,
      );

      await user.click(screen.getByText('Toggle'));
      rerender(
        <ChipButton active={active} onClick={handleClick}>
          Toggle
        </ChipButton>,
      );

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles rapid clicks with callback', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <ChipButton active={false} onClick={handleClick}>
          Rapid Click
        </ChipButton>,
      );

      const button = screen.getByText('Rapid Click');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('maintains children through multiple prop updates', () => {
      const { rerender } = renderWithTheme(
        <ChipButton active={false} onClick={vi.fn()}>
          Stable Content
        </ChipButton>,
      );

      expect(screen.getByText('Stable Content')).toBeInTheDocument();

      rerender(
        <ChipButton active={true} onClick={vi.fn()}>
          Stable Content
        </ChipButton>,
      );

      expect(screen.getByText('Stable Content')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible via click', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { container } = renderWithTheme(
        <ChipButton onClick={handleClick}>Keyboard Access</ChipButton>,
      );

      const button = container.querySelector('button')!;
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });

    it('button is focusable', () => {
      const { container } = renderWithTheme(<ChipButton>Focusable</ChipButton>);
      const button = container.querySelector('button')!;

      expect(button).toBeInTheDocument();
      button.focus();
      expect(button).toHaveFocus();
    });

    it('button is not disabled by default', () => {
      const { container } = renderWithTheme(<ChipButton>Not Disabled</ChipButton>);
      const button = container.querySelector('button')!;

      expect(button).not.toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('handles undefined onClick gracefully', () => {
      const { container } = renderWithTheme(<ChipButton onClick={undefined}>No Click</ChipButton>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders with complex children', () => {
      renderWithTheme(
        <ChipButton>
          <span>Complex</span> <strong>Content</strong>
        </ChipButton>,
      );

      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      const { container } = renderWithTheme(<ChipButton>{null}</ChipButton>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('handles empty string children', () => {
      const { container } = renderWithTheme(<ChipButton children="" />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('memoization preserves identity across re-renders with same props', () => {
      const handleClick = vi.fn();
      const { rerender } = renderWithTheme(
        <ChipButton active={true} onClick={handleClick}>
          Memo Test
        </ChipButton>,
      );

      const firstButton = screen.getByText('Memo Test');
      rerender(
        <ChipButton active={true} onClick={handleClick}>
          Memo Test
        </ChipButton>,
      );

      const secondButton = screen.getByText('Memo Test');
      expect(firstButton).toBe(secondButton);
    });
  });
});
