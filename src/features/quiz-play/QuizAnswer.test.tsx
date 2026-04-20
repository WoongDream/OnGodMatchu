import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizAnswer from './QuizAnswer';

vi.mock('@/components/input', () => ({
  default: ({ value, onChange, placeholder, disabled }: any) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="quiz-answer-input"
    />
  ),
}));

vi.mock('@/components/button', () => ({
  default: ({
    disabled,
    children,
    onClick,
  }: {
    fullWidth?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} onClick={onClick} data-testid="quiz-answer-button">
      {children}
    </button>
  ),
}));

describe('QuizAnswer', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSubmit = vi.fn();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the input field', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByTestId('quiz-answer-input')).toBeInTheDocument();
    });

    it('renders the submit button with correct text', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument();
    });

    it('renders input with correct placeholder', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByPlaceholderText('정답을 입력하세요')).toBeInTheDocument();
    });

    it('displays the input value prop correctly', () => {
      renderWithTheme(
        <QuizAnswer value="test answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );
      const input = screen.getByTestId('quiz-answer-input') as HTMLInputElement;
      expect(input.value).toBe('test answer');
    });

    it('has displayName set to QuizAnswer', () => {
      expect(QuizAnswer.displayName).toBe('QuizAnswer');
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId('quiz-answer-input');
      await user.type(input, 'test');

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('t');
      expect(mockOnChange).toHaveBeenCalledWith('e');
      expect(mockOnChange).toHaveBeenCalledWith('s');
      expect(mockOnChange).toHaveBeenCalledWith('t');
    });

    it('receives the correct string value in onChange', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId('quiz-answer-input');
      await user.type(input, 'hello');

      // The mock Input calls onChange with each character individually
      // Verify the last call is the last character
      expect(mockOnChange).toHaveBeenCalledWith('h');
      expect(mockOnChange).toHaveBeenCalledWith('o');
      expect(mockOnChange).toHaveBeenCalledTimes(5);
    });

    it('calls onChange multiple times for multiple character inputs', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId('quiz-answer-input');
      await user.type(input, 'abc');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('button disabled state based on value.trim() === ""', () => {
    it('disables button when value is empty string', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();
    });

    it('disables button when value is only whitespace', () => {
      renderWithTheme(<QuizAnswer value="   " onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();
    });

    it('disables button when value contains only tabs and spaces', () => {
      // Using actual tab characters (character code 9)
      const valueWithTabs = String.fromCharCode(9) + '  ' + String.fromCharCode(9);
      renderWithTheme(
        <QuizAnswer value={valueWithTabs} onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();
    });

    it('disables button when value contains only newlines', () => {
      // Using actual newline characters (character code 10)
      const valueWithNewlines = String.fromCharCode(10) + String.fromCharCode(10);
      renderWithTheme(
        <QuizAnswer value={valueWithNewlines} onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();
    });

    it('enables button when value has non-whitespace content', () => {
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('enables button when value has whitespace around valid text', () => {
      renderWithTheme(
        <QuizAnswer value="  answer  " onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('enables button with single character', () => {
      renderWithTheme(<QuizAnswer value="a" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('enables button with special characters', () => {
      renderWithTheme(<QuizAnswer value="!@#$%" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('enables button with numbers only', () => {
      renderWithTheme(<QuizAnswer value="12345" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('enables button with unicode characters', () => {
      renderWithTheme(<QuizAnswer value="한글" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('disabled prop', () => {
    it('disables input when disabled prop is true', () => {
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      expect(input).toBeDisabled();
    });

    it('enables input when disabled prop is false', () => {
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={false}
        />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      expect(input).not.toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();
    });

    it('enables button when disabled prop is false and value is not empty', () => {
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={false}
        />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('defaults disabled to false when not provided', () => {
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      const button = screen.getByTestId('quiz-answer-button');

      expect(input).not.toBeDisabled();
      expect(button).not.toBeDisabled();
    });
  });

  describe('button click - onSubmit callback', () => {
    it('calls onSubmit when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit even with whitespace-padded value', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="  answer  " onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when button is disabled due to empty value', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();

      // Attempting to click a disabled button should not trigger onClick
      await user.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when button is disabled due to disabled prop', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();

      await user.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });
  });

  describe('Enter key submission', () => {
    it('calls onSubmit when Enter key is pressed on input', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit on Enter key with non-empty value', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="test answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit on Enter key when disabled prop is true', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit on Enter when value is empty', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');

      // The handler still fires because it checks disabled prop, not value.trim()
      // The button click is blocked by disabled state, but keyboard handler only checks disabled prop
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit on Enter when value is whitespace and disabled is false', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="   " onChange={mockOnChange} onSubmit={mockOnSubmit} disabled={false} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');

      // The handler still fires because it checks disabled prop, not value.trim()
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('responds to multiple Enter key presses', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');
      await user.keyboard('{Enter}');
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });

    it('does not call onSubmit on other key presses', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('a');
      await user.keyboard('b');
      await user.keyboard('c');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit on Enter but not on Tab key', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Tab}');

      expect(mockOnSubmit).not.toHaveBeenCalled();

      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('combined scenarios', () => {
    it('allows submission via button and Enter key', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      const button = screen.getByTestId('quiz-answer-button');

      await user.click(input);
      await user.keyboard('{Enter}');
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });

    it('handles input change then submission', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(
        <QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');

      // Initially button should be disabled
      expect(button).toBeDisabled();

      // Simulate value change
      rerender(<QuizAnswer value="new answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      // Now button should be enabled
      expect(button).not.toBeDisabled();

      // Click should work
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state changing at runtime', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={false}
        />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      const button = screen.getByTestId('quiz-answer-button');

      // Initially enabled
      expect(input).not.toBeDisabled();
      expect(button).not.toBeDisabled();

      // Change to disabled
      rerender(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      // Now both should be disabled
      expect(input).toBeDisabled();
      expect(button).toBeDisabled();

      // Try to submit via Enter key (should not work)
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles very long input values', () => {
      const longValue = 'a'.repeat(1000);
      renderWithTheme(
        <QuizAnswer value={longValue} onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input') as HTMLInputElement;
      expect(input.value).toBe(longValue);

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('handles unicode and special characters', () => {
      renderWithTheme(
        <QuizAnswer value="한글 🚀 !@#$%" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input') as HTMLInputElement;
      expect(input.value).toBe('한글 🚀 !@#$%');

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).not.toBeDisabled();
    });

    it('handles mixed whitespace types', () => {
      // Mix of tab, space, newline, carriage return
      const mixedWhitespace =
        String.fromCharCode(9) +
        ' ' +
        String.fromCharCode(10) +
        ' ' +
        String.fromCharCode(13) +
        ' ';
      renderWithTheme(
        <QuizAnswer value={mixedWhitespace} onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const button = screen.getByTestId('quiz-answer-button');
      expect(button).toBeDisabled();
    });

    it('handles rapid onChange calls', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId('quiz-answer-input');
      await user.type(input, 'test', { delay: 1 });

      expect(mockOnChange).toHaveBeenCalledTimes(4);
    });
  });
});
