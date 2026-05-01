import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import Button from './Button';
import type { ButtonVariant, ButtonSize } from './Button.type';

describe('Button', () => {
  let mockOnClick: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClick = vi.fn();
  });

  describe('rendering', () => {
    it('renders button element', () => {
      renderWithTheme(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders button with children text', () => {
      renderWithTheme(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders button with React node children', () => {
      renderWithTheme(
        <Button>
          <span data-testid="icon">Icon</span>
          Text
        </Button>,
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('has displayName set to Button', () => {
      expect(Button.displayName).toBe('Button');
    });
  });

  describe('variant prop', () => {
    const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];

    variants.forEach((variant) => {
      it(`renders button with variant="${variant}"`, () => {
        renderWithTheme(<Button variant={variant}>Test</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('defaults to "primary" variant when not specified', () => {
      renderWithTheme(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('rerenders when variant prop changes', () => {
      const { rerender } = renderWithTheme(<Button variant="secondary">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="ghost">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      it(`renders button with size="${size}"`, () => {
        renderWithTheme(<Button size={size}>Test</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('defaults to "md" size when not specified', () => {
      renderWithTheme(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('rerenders when size prop changes', () => {
      const { rerender } = renderWithTheme(<Button size="sm">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="lg">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('fullWidth prop', () => {
    it('renders button without fullWidth by default', () => {
      renderWithTheme(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders button with fullWidth=true when specified', () => {
      renderWithTheme(<Button fullWidth>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders button with fullWidth=false when explicitly set', () => {
      renderWithTheme(<Button fullWidth={false}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('is not disabled by default', () => {
      renderWithTheme(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('is disabled when disabled={true}', () => {
      renderWithTheme(<Button disabled={true}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('is not disabled when disabled={false}', () => {
      renderWithTheme(<Button disabled={false}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('renders disabled attribute on native button element', () => {
      renderWithTheme(<Button disabled>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('does not render disabled attribute when disabled={false}', () => {
      renderWithTheme(<Button disabled={false}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  describe('onClick callback', () => {
    it('calls onClick handler when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Button onClick={mockOnClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick handler with correct call count on multiple clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Button onClick={mockOnClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('does not call onClick when button is disabled', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <Button disabled onClick={mockOnClick}>
          Click me
        </Button>,
      );
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('handles onClick being undefined', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Button>Click me</Button>);
      const button = screen.getByRole('button');

      expect(() => {
        user.click(button);
      }).not.toThrow();
    });
  });

  describe('type prop', () => {
    it('defaults to "button" type', () => {
      renderWithTheme(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders button with type="submit"', () => {
      renderWithTheme(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders button with type="reset"', () => {
      renderWithTheme(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('renders button with type="button"', () => {
      renderWithTheme(<Button type="button">Click</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('combined props', () => {
    it('renders with all props specified', () => {
      renderWithTheme(
        <Button
          variant="secondary"
          size="lg"
          fullWidth={true}
          disabled={false}
          onClick={mockOnClick}
          type="submit"
        >
          Submit Form
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('type', 'submit');
      expect(screen.getByText('Submit Form')).toBeInTheDocument();
    });

    it('renders with variant, size, and fullWidth combined', () => {
      renderWithTheme(
        <Button variant="ghost" size="sm" fullWidth>
          Ghost Button
        </Button>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles disabled state with onClick handler', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <Button disabled onClick={mockOnClick}>
          Disabled Button
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('renders with primary variant and submit type', () => {
      renderWithTheme(
        <Button variant="primary" type="submit">
          Submit
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('edge cases', () => {
    it('renders button with empty children', () => {
      renderWithTheme(<Button>Text</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders button with whitespace children', () => {
      renderWithTheme(<Button> </Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders button with numeric children', () => {
      renderWithTheme(<Button>{123}</Button>);
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('renders button with boolean and null children', () => {
      renderWithTheme(
        <Button>
          {true}
          {false}
          {null}
          Text
        </Button>,
      );
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('calls onClick multiple times with correct count', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Button onClick={mockOnClick}>Click</Button>);

      await user.click(screen.getByRole('button'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles rapid successive clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Button onClick={mockOnClick}>Click</Button>);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(5);
    });
  });

  describe('prop changes', () => {
    it('updates variant when prop changes', () => {
      const { rerender } = renderWithTheme(<Button variant="primary">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="ghost">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('updates size when prop changes', () => {
      const { rerender } = renderWithTheme(<Button size="md">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="lg">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('updates fullWidth when prop changes', () => {
      const { rerender } = renderWithTheme(<Button fullWidth={false}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button fullWidth={true}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('updates disabled state when prop changes', () => {
      const { rerender } = renderWithTheme(<Button disabled={false}>Test</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();

      rerender(<Button disabled={true}>Test</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('updates children when content changes', () => {
      const { rerender } = renderWithTheme(<Button>Initial</Button>);
      expect(screen.getByText('Initial')).toBeInTheDocument();

      rerender(<Button>Updated</Button>);
      expect(screen.queryByText('Initial')).not.toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });
  });
});
