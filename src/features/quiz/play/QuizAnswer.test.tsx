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

describe('QuizAnswer', () => {
  let mockOnChange: (value: string) => void;
  let mockOnSubmit: () => void;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSubmit = vi.fn();
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('입력 필드를 렌더링한다', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByTestId('quiz-answer-input')).toBeInTheDocument();
    });

    it('placeholder 텍스트를 표시한다', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByPlaceholderText('정답을 입력하세요')).toBeInTheDocument();
    });

    it('value prop 을 입력 필드에 표시한다', () => {
      renderWithTheme(
        <QuizAnswer value="test answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );
      const input = screen.getByTestId('quiz-answer-input') as HTMLInputElement;
      expect(input.value).toBe('test answer');
    });

    it('displayName 이 QuizAnswer 로 설정되어 있다', () => {
      expect(QuizAnswer.displayName).toBe('QuizAnswer');
    });

    it('버튼을 렌더링하지 않는다', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('onChange 콜백', () => {
    it('입력 값이 변경될 때 onChange 를 호출한다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId('quiz-answer-input');
      await user.type(input, 'abc');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenCalledWith('a');
      expect(mockOnChange).toHaveBeenCalledWith('b');
      expect(mockOnChange).toHaveBeenCalledWith('c');
    });
  });

  describe('disabled prop', () => {
    it('disabled=true 이면 입력 필드를 비활성화한다', () => {
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );
      expect(screen.getByTestId('quiz-answer-input')).toBeDisabled();
    });

    it('disabled=false 이면 입력 필드를 활성화한다', () => {
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={false}
        />,
      );
      expect(screen.getByTestId('quiz-answer-input')).not.toBeDisabled();
    });

    it('disabled prop 기본값은 false 이다', () => {
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );
      expect(screen.getByTestId('quiz-answer-input')).not.toBeDisabled();
    });
  });

  describe('Enter 키 — onSubmit 호출', () => {
    it('Enter 키를 누르면 onSubmit 을 호출한다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('Enter 키를 여러 번 누르면 그 횟수만큼 onSubmit 이 호출된다', async () => {
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

    it('disabled=true 이면 Enter 키를 눌러도 onSubmit 을 호출하지 않는다', async () => {
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
      // disabled 인풋은 click/focus 가 차단되므로 onKeyDown 핸들러가 실행되지 않음
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('Enter 외 다른 키를 눌러도 onSubmit 을 호출하지 않는다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Tab}');
      await user.keyboard('{Escape}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('value 가 빈 문자열이어도 Enter 키 핸들러는 disabled 여부만 확인한다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId('quiz-answer-input');
      await user.click(input);
      await user.keyboard('{Enter}');

      // 핸들러는 disabled prop 만 체크하므로 value 가 비어 있어도 호출됨
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('런타임 disabled 전환', () => {
    it('disabled 가 false → true 로 바뀌면 Enter 키 입력을 차단한다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={false}
        />,
      );

      rerender(
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
  });

  describe('엣지 케이스', () => {
    it('매우 긴 value 를 입력 필드에 표시한다', () => {
      const longValue = 'a'.repeat(1000);
      renderWithTheme(
        <QuizAnswer value={longValue} onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input') as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it('유니코드와 특수문자를 포함한 value 를 표시한다', () => {
      renderWithTheme(
        <QuizAnswer value="한글 🚀 !@#$%" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByTestId('quiz-answer-input') as HTMLInputElement;
      expect(input.value).toBe('한글 🚀 !@#$%');
    });
  });
});
