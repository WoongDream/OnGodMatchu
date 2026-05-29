import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizAnswer from './QuizAnswer';

describe('QuizAnswer', () => {
  let mockOnChange: (value: string) => void;
  let mockOnSubmit: () => void;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSubmit = vi.fn();
    vi.clearAllMocks();
  });

  describe('렌더링 & 마운트 focus', () => {
    it('placeholder "정답을 입력하고 enter" 텍스트가 노출된다', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByPlaceholderText('정답을 입력하고 enter')).toBeInTheDocument();
    });

    it('마운트 시 input 에 자동 focus 가 적용된다 (disabled 아닐 때)', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      expect(document.activeElement).toBe(input);
    });

    it('value prop 이 input 의 value 로 반영된다', () => {
      renderWithTheme(
        <QuizAnswer value="test answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );
      const input = screen.getByPlaceholderText('정답을 입력하고 enter') as HTMLInputElement;
      expect(input.value).toBe('test answer');
    });

    it('displayName 이 QuizAnswer 로 설정되어 있다', () => {
      expect(QuizAnswer.displayName).toBe('QuizAnswer');
    });
  });

  describe('onChange 콜백', () => {
    it('input 에 타이핑하면 onChange 가 새 값으로 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);

      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      await user.type(input, 'abc');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'a');
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'b');
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'c');
    });
  });

  describe('Enter 키 — form onSubmit', () => {
    it('Enter 키를 누르면 form 이 submit 되어 onSubmit 이 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      input.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('Enter 외 다른 키를 눌러도 onSubmit 이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      input.focus();
      await user.keyboard('a');
      await user.keyboard('{Tab}');
      await user.keyboard('{Escape}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('disabled prop', () => {
    it('disabled=true 이면 input 이 비활성화되고 Enter 시 onSubmit 이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      expect(input).toBeDisabled();

      // disabled input 은 user-event 의 click/focus 가 차단되지만,
      // 만약 form onSubmit 이 호출되더라도 handleSubmit 내부의 disabled 분기로 차단됨.
      await user.keyboard('{Enter}');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('disabled=true 로 마운트되면 focus 가 자동 적용되지 않는다', () => {
      renderWithTheme(
        <QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} disabled={true} />,
      );
      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      expect(document.activeElement).not.toBe(input);
    });

    it('disabled=true 이면 「제출」 버튼도 disabled 된다', () => {
      renderWithTheme(
        <QuizAnswer
          value="answer"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );
      expect(screen.getByLabelText('제출')).toBeDisabled();
    });
  });

  describe('제출 버튼', () => {
    it('「제출」 버튼을 클릭하면 onSubmit 이 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizAnswer value="answer" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
      );

      const submitButton = screen.getByLabelText('제출');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('빈 입력(value="") 일 때 「제출」 버튼은 disabled 된다', () => {
      renderWithTheme(<QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText('제출')).toBeDisabled();
    });

    it('공백만 입력된 경우(value="   ") 「제출」 버튼은 disabled 된다', () => {
      renderWithTheme(<QuizAnswer value="   " onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText('제출')).toBeDisabled();
    });

    it('의미 있는 값이 입력되면 「제출」 버튼이 활성화된다', () => {
      renderWithTheme(<QuizAnswer value="짱구" onChange={mockOnChange} onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText('제출')).not.toBeDisabled();
    });
  });

  describe('focusKey & disabled 전환에 따른 focus 재이동', () => {
    it('disabled=true → false 로 전환되면 input 이 다시 focus 를 받는다', () => {
      const { rerender } = renderWithTheme(
        <QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} disabled={true} />,
      );

      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      expect(document.activeElement).not.toBe(input);

      rerender(
        <QuizAnswer value="" onChange={mockOnChange} onSubmit={mockOnSubmit} disabled={false} />,
      );
      expect(document.activeElement).toBe(input);
    });

    it('focusKey 변경 시 input 으로 focus 가 재이동된다', () => {
      const { rerender } = renderWithTheme(
        <QuizAnswer
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          focusKey="0-answering"
        />,
      );
      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      // 마운트 후 다른 요소로 focus 이동
      (document.activeElement as HTMLElement | null)?.blur();
      expect(document.activeElement).not.toBe(input);

      // focusKey 변경 → focus 재이동
      rerender(
        <QuizAnswer
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          focusKey="1-answering"
        />,
      );
      expect(document.activeElement).toBe(input);
    });

    it('disabled=true 상태에서는 focusKey 가 변경되어도 focus 가 이동하지 않는다', () => {
      const { rerender } = renderWithTheme(
        <QuizAnswer
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
          focusKey="0-feedback"
        />,
      );
      const input = screen.getByPlaceholderText('정답을 입력하고 enter');
      expect(document.activeElement).not.toBe(input);

      rerender(
        <QuizAnswer
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          disabled={true}
          focusKey="1-feedback"
        />,
      );
      expect(document.activeElement).not.toBe(input);
    });
  });
});
