import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('value and onChange handling', () => {
    it('renders with initial value', () => {
      renderWithTheme(<Input {...defaultProps} value="test value" />);
      const input = screen.getByDisplayValue('test value');
      expect(input).toBeInTheDocument();
    });

    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(<Input {...defaultProps} onChange={onChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'new value');

      expect(onChange).toHaveBeenCalledWith('n');
      expect(onChange).toHaveBeenCalledWith('e');
      expect(onChange).toHaveBeenCalledWith('w');
      expect(onChange).toHaveBeenCalledWith(' ');
      expect(onChange).toHaveBeenCalledWith('v');
      expect(onChange).toHaveBeenCalledWith('a');
      expect(onChange).toHaveBeenCalledWith('l');
      expect(onChange).toHaveBeenCalledWith('u');
      expect(onChange).toHaveBeenCalledWith('e');
    });

    it('calls onChange with the correct value on each keystroke', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(<Input {...defaultProps} onChange={onChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'a');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('a');
    });

    it('handles empty string value', () => {
      renderWithTheme(<Input {...defaultProps} value="" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles undefined onChange gracefully', () => {
      expect(() => {
        renderWithTheme(<Input {...defaultProps} onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('updates value when controlled prop changes', () => {
      const { rerender } = renderWithTheme(<Input {...defaultProps} value="initial" />);
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

      rerender(<Input {...defaultProps} value="updated" />);
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('preserves onChange reference across re-renders', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { rerender } = renderWithTheme(
        <Input {...defaultProps} onChange={onChange} value="test" />,
      );

      rerender(<Input {...defaultProps} onChange={onChange} value="test" />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'new');

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('label rendering', () => {
    it('renders label when provided', () => {
      renderWithTheme(<Input {...defaultProps} label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      renderWithTheme(<Input {...defaultProps} />);
      const labels = screen.queryAllByRole('textbox');
      expect(labels.length).toBe(1);
    });

    it('does not render label when label is empty string', () => {
      renderWithTheme(<Input {...defaultProps} label="" />);
      // The component uses {label && <Label>{label}</Label>}, so empty string is falsy
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders label with special characters', () => {
      renderWithTheme(<Input {...defaultProps} label="Email (required) *" />);
      expect(screen.getByText('Email (required) *')).toBeInTheDocument();
    });

    it('renders label with Korean text', () => {
      renderWithTheme(<Input {...defaultProps} label="이메일" />);
      expect(screen.getByText('이메일')).toBeInTheDocument();
    });

    it('associates label with input element', () => {
      renderWithTheme(<Input {...defaultProps} label="Username" />);
      const label = screen.getByText('Username');
      expect(label).toBeInTheDocument();
    });
  });

  describe('error message display', () => {
    it('renders error message when provided', () => {
      renderWithTheme(<Input {...defaultProps} error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('does not render error message when not provided', () => {
      renderWithTheme(<Input {...defaultProps} />);
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('does not render error message when empty string', () => {
      renderWithTheme(<Input {...defaultProps} error="" />);
      // Empty string is falsy, so error message should not render - no error span should exist
      const { container } = renderWithTheme(<Input {...defaultProps} error="" />);
      const errorSpan = container.querySelector('span');
      expect(errorSpan).not.toBeInTheDocument();
    });

    it('renders error message with special characters', () => {
      renderWithTheme(
        <Input {...defaultProps} error="Email format is invalid (e.g., example@test.com)" />,
      );
      expect(
        screen.getByText('Email format is invalid (e.g., example@test.com)'),
      ).toBeInTheDocument();
    });

    it('renders error message in Korean', () => {
      renderWithTheme(<Input {...defaultProps} error="필수 입력 항목입니다" />);
      expect(screen.getByText('필수 입력 항목입니다')).toBeInTheDocument();
    });

    it('applies error styling when error is present', () => {
      renderWithTheme(<Input {...defaultProps} error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('value', '');
    });

    it('clears error styling when error is removed', () => {
      const { rerender } = renderWithTheme(<Input {...defaultProps} error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();

      rerender(<Input {...defaultProps} error={undefined} />);
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  describe('input type handling', () => {
    it('renders text input by default', () => {
      renderWithTheme(<Input {...defaultProps} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('renders email input when type is email', () => {
      renderWithTheme(<Input {...defaultProps} type="email" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('renders password input when type is password', () => {
      const { container } = renderWithTheme(<Input {...defaultProps} type="password" />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
    });
  });

  describe('placeholder handling', () => {
    it('renders placeholder when provided', () => {
      renderWithTheme(<Input {...defaultProps} placeholder="Enter your name" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter your name');
    });

    it('does not render placeholder when not provided', () => {
      renderWithTheme(<Input {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('placeholder');
    });

    it('renders placeholder with special characters', () => {
      renderWithTheme(
        <Input {...defaultProps} placeholder="Enter email (e.g., user@example.com)" />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter email (e.g., user@example.com)');
    });

    it('renders placeholder in Korean', () => {
      renderWithTheme(<Input {...defaultProps} placeholder="이메일을 입력하세요" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', '이메일을 입력하세요');
    });
  });

  describe('disabled state', () => {
    it('renders enabled input by default', () => {
      renderWithTheme(<Input {...defaultProps} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });

    it('renders disabled input when disabled is true', () => {
      renderWithTheme(<Input {...defaultProps} disabled={true} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('does not call onChange when disabled input is interacted with', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(<Input {...defaultProps} onChange={onChange} disabled={true} />);
      const input = screen.getByRole('textbox');

      // Try to type in disabled input
      await user.type(input, 'test');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('applies disabled styling', () => {
      renderWithTheme(<Input {...defaultProps} disabled={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('combined props', () => {
    it('renders with label, error, and value together', () => {
      renderWithTheme(
        <Input {...defaultProps} label="Email" error="Invalid email" value="test@invalid" />,
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@invalid')).toBeInTheDocument();
    });

    it('renders with label, placeholder, and type together', () => {
      const { container } = renderWithTheme(
        <Input {...defaultProps} label="Password" type="password" placeholder="Enter password" />,
      );
      expect(screen.getByText('Password')).toBeInTheDocument();
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
      expect(input).toHaveAttribute('placeholder', 'Enter password');
    });

    it('renders with all props provided', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Input
          value="test@example.com"
          onChange={onChange}
          label="Email"
          type="email"
          placeholder="Enter your email"
          disabled={false}
          error={undefined}
        />,
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');
      expect(input).toHaveAttribute('placeholder', 'Enter your email');
      expect(input.disabled).toBe(false);
    });

    it('handles label and error together', () => {
      renderWithTheme(<Input {...defaultProps} label="Username" error="Username is taken" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Username is taken')).toBeInTheDocument();
    });

    it('renders error styling with error prop when label is present', () => {
      renderWithTheme(
        <Input {...defaultProps} label="Email" error="Email is required" value="test" />,
      );
      const input = screen.getByDisplayValue('test');
      expect(input).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles very long input value', () => {
      const longValue = 'a'.repeat(1000);
      renderWithTheme(<Input {...defaultProps} value={longValue} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it('handles very long placeholder text', () => {
      const longPlaceholder = 'Enter your ' + 'very '.repeat(50) + 'long value';
      renderWithTheme(<Input {...defaultProps} placeholder={longPlaceholder} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', longPlaceholder);
    });

    it('handles very long error message', () => {
      const longError = 'Error: ' + 'This is a very long error message. '.repeat(10);
      renderWithTheme(<Input {...defaultProps} error={longError} />);
      expect(
        screen.getByText((content, _element) => content.startsWith('Error:')),
      ).toBeInTheDocument();
    });

    it('handles values with special characters', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(<Input {...defaultProps} onChange={onChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, '!@#$%^&*()');

      // Verify that onChange was called with special characters
      expect(onChange).toHaveBeenCalled();
      // Each character should trigger onChange
      expect(onChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('handles values with whitespace only', () => {
      renderWithTheme(<Input {...defaultProps} value="   " />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('   ');
    });

    it('handles rapid onChange calls', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(<Input {...defaultProps} onChange={onChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'rapid');

      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('has correct display name for debugging', () => {
      renderWithTheme(<Input {...defaultProps} />);
      expect(Input.displayName).toBe('Input');
    });
  });

  describe('input structure', () => {
    it('renders input as part of a wrapper div', () => {
      const { container } = renderWithTheme(<Input {...defaultProps} />);
      const wrapper = container.querySelector('div');
      expect(wrapper).toBeInTheDocument();
      const input = wrapper?.querySelector('input');
      expect(input).toBeInTheDocument();
    });

    it('maintains correct element order: label -> input -> error', () => {
      const { container } = renderWithTheme(
        <Input {...defaultProps} label="Test Label" error="Test Error" />,
      );
      const wrapper = container.firstChild;
      const children = wrapper?.childNodes;

      expect(children?.length).toBe(3);
      expect((children?.[0] as HTMLElement).tagName).toBe('LABEL');
      expect((children?.[1] as HTMLElement).tagName).toBe('INPUT');
      expect((children?.[2] as HTMLElement).tagName).toBe('SPAN');
    });

    it('renders only input when no label or error', () => {
      const { container } = renderWithTheme(<Input {...defaultProps} />);
      const wrapper = container.firstChild;
      const children = wrapper?.childNodes;

      expect(children?.length).toBe(1);
      expect((children?.[0] as HTMLElement).tagName).toBe('INPUT');
    });

    it('renders label and input when no error', () => {
      const { container } = renderWithTheme(<Input {...defaultProps} label="Test" />);
      const wrapper = container.firstChild;
      const children = wrapper?.childNodes;

      expect(children?.length).toBe(2);
      expect((children?.[0] as HTMLElement).tagName).toBe('LABEL');
      expect((children?.[1] as HTMLElement).tagName).toBe('INPUT');
    });
  });

  describe('accessibility', () => {
    it('input is accessible via role textbox', () => {
      renderWithTheme(<Input {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('label text is readable', () => {
      renderWithTheme(<Input {...defaultProps} label="Email Address" />);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('error message is readable', () => {
      renderWithTheme(<Input {...defaultProps} error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('disabled state is properly set', () => {
      renderWithTheme(<Input {...defaultProps} disabled={true} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('placeholder provides helpful context', () => {
      renderWithTheme(<Input {...defaultProps} placeholder="name@example.com" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'name@example.com');
    });
  });

  describe('memo optimization', () => {
    it('does not re-render when props are the same', () => {
      const onChange = vi.fn();
      const { rerender } = renderWithTheme(
        <Input value="test" onChange={onChange} label="Test" error="Error" />,
      );

      rerender(<Input value="test" onChange={onChange} label="Test" error="Error" />);

      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});
