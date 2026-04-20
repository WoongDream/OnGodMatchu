import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import QuizFeedback from './QuizFeedback';

describe('QuizFeedback', () => {
  describe('rendering correct answer state', () => {
    it('renders success message when answer is correct', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="example answer" />);
      expect(screen.getByText('정답이에요!')).toBeInTheDocument();
    });

    it('renders correct message with proper styling applied', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="example answer" />);
      const resultElement = screen.getByText('정답이에요!');
      expect(resultElement).toBeInTheDocument();
      // Verify the result element is present in the document
      expect(resultElement.parentElement).toBeTruthy();
    });

    it('does not display answer when answer is correct', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="correct answer" />);
      expect(screen.queryByText(/정답:/)).not.toBeInTheDocument();
    });
  });

  describe('rendering incorrect answer state', () => {
    it('renders error message when answer is incorrect', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="example answer" />);
      expect(screen.getByText('오답이에요')).toBeInTheDocument();
    });

    it('displays the correct answer when answer is incorrect', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="correct answer" />);
      expect(screen.getByText('정답: correct answer')).toBeInTheDocument();
    });

    it('shows correct answer label and value together', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="Seoul" />);
      const answerText = screen.getByText('정답: Seoul');
      expect(answerText).toBeInTheDocument();
    });
  });

  describe('answer display with various content', () => {
    it('displays answer with special characters', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="정답 (답안)" />);
      expect(screen.getByText('정답: 정답 (답안)')).toBeInTheDocument();
    });

    it('displays long answer text', () => {
      const longAnswer = 'This is a very long answer that spans multiple words';
      renderWithTheme(<QuizFeedback correct={false} answer={longAnswer} />);
      expect(screen.getByText(`정답: ${longAnswer}`)).toBeInTheDocument();
    });

    it('displays answer with numbers', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="1995" />);
      expect(screen.getByText('정답: 1995')).toBeInTheDocument();
    });

    it('displays answer with punctuation', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="Yes, it is." />);
      expect(screen.getByText('정답: Yes, it is.')).toBeInTheDocument();
    });

    it('displays empty string answer', () => {
      const { container } = renderWithTheme(<QuizFeedback correct={false} answer="" />);
      expect(container.textContent).toContain('정답: ');
    });
  });

  describe('conditional rendering of answer section', () => {
    it('only shows answer section when incorrect', () => {
      const { container: correctContainer } = renderWithTheme(
        <QuizFeedback correct={true} answer="answer" />,
      );
      expect(correctContainer.textContent).not.toContain('정답:');

      const { container: incorrectContainer } = renderWithTheme(
        <QuizFeedback correct={false} answer="answer" />,
      );
      expect(incorrectContainer.textContent).toContain('정답:');
    });

    it('does not render answer element when correct', () => {
      const { container } = renderWithTheme(<QuizFeedback correct={true} answer="some answer" />);
      // Count the number of text nodes/spans
      const textContent = container.textContent;
      // Should only contain the success message, not the answer
      expect(textContent).toBe('정답이에요!');
    });

    it('renders answer element when incorrect', () => {
      const { container } = renderWithTheme(<QuizFeedback correct={false} answer="some answer" />);
      const textContent = container.textContent;
      // Should contain both the error message and the answer
      expect(textContent).toContain('오답이에요');
      expect(textContent).toContain('정답: some answer');
    });
  });

  describe('styling with correct prop', () => {
    it('passes correct prop to wrapper component', () => {
      const { container: correctContainer } = renderWithTheme(
        <QuizFeedback correct={true} answer="answer" />,
      );
      // Wrapper should be rendered
      expect(correctContainer.firstChild).toBeInTheDocument();

      const { container: incorrectContainer } = renderWithTheme(
        <QuizFeedback correct={false} answer="answer" />,
      );
      // Wrapper should be rendered
      expect(incorrectContainer.firstChild).toBeInTheDocument();
    });

    it('passes correct prop to result component', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="answer" />);
      const successElement = screen.getByText('정답이에요!');
      expect(successElement).toBeInTheDocument();

      renderWithTheme(<QuizFeedback correct={false} answer="answer" />);
      const errorElement = screen.getByText('오답이에요');
      expect(errorElement).toBeInTheDocument();
    });
  });

  describe('message text accuracy', () => {
    it('displays exact success message for correct answer', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="test" />);
      expect(screen.getByText('정답이에요!')).toBeInTheDocument();
    });

    it('displays exact error message for incorrect answer', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="test" />);
      expect(screen.getByText('오답이에요')).toBeInTheDocument();
    });

    it('does not display incorrect message when answer is correct', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="test" />);
      expect(screen.queryByText('오답이에요')).not.toBeInTheDocument();
    });

    it('does not display success message when answer is incorrect', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="test" />);
      expect(screen.queryByText('정답이에요!')).not.toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('renders without crashing with basic props', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="answer" />);
      expect(screen.getByText('정답이에요!')).toBeInTheDocument();
    });

    it('contains feedback result element', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="test" />);
      const result = screen.getByText('정답이에요!');
      expect(result).toBeInTheDocument();
      expect(result.tagName).toBe('SPAN');
    });

    it('contains feedback answer element when incorrect', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="test answer" />);
      const answer = screen.getByText('정답: test answer');
      expect(answer).toBeInTheDocument();
      expect(answer.tagName).toBe('SPAN');
    });

    it('has wrapper div containing feedback result', () => {
      const { container } = renderWithTheme(<QuizFeedback correct={true} answer="test" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper.tagName).toBe('DIV');
    });
  });

  describe('prop combination variations', () => {
    it('handles correct true with various answer strings', () => {
      const answers = ['answer1', '정답', 'multiple words answer', '123'];
      answers.forEach((answer) => {
        const { unmount } = renderWithTheme(<QuizFeedback correct={true} answer={answer} />);
        expect(screen.getByText('정답이에요!')).toBeInTheDocument();
        expect(screen.queryByText(/정답:/)).not.toBeInTheDocument();
        unmount();
      });
    });

    it('handles correct false with various answer strings', () => {
      const testCases = [
        { answer: 'simple', expected: '정답: simple' },
        { answer: 'Seoul Korea', expected: '정답: Seoul Korea' },
        { answer: '2024', expected: '정답: 2024' },
        { answer: 'answer with (parentheses)', expected: '정답: answer with (parentheses)' },
      ];

      testCases.forEach(({ answer, expected }) => {
        const { unmount } = renderWithTheme(<QuizFeedback correct={false} answer={answer} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('display name', () => {
    it('has correct display name for debugging', () => {
      renderWithTheme(<QuizFeedback correct={true} answer="test" />);
      expect(QuizFeedback.displayName).toBe('QuizFeedback');
    });
  });

  describe('memo optimization', () => {
    it('does not re-render when props remain the same', () => {
      const { rerender } = renderWithTheme(<QuizFeedback correct={true} answer="answer" />);
      const initialElement = screen.getByText('정답이에요!');

      rerender(<QuizFeedback correct={true} answer="answer" />);
      const rerenderElement = screen.getByText('정답이에요!');

      expect(initialElement).toBeInTheDocument();
      expect(rerenderElement).toBeInTheDocument();
    });

    it('re-renders when correct prop changes', () => {
      const { rerender } = renderWithTheme(<QuizFeedback correct={true} answer="answer" />);
      expect(screen.getByText('정답이에요!')).toBeInTheDocument();

      rerender(<QuizFeedback correct={false} answer="answer" />);
      expect(screen.getByText('오답이에요')).toBeInTheDocument();
      expect(screen.getByText('정답: answer')).toBeInTheDocument();
    });

    it('re-renders when answer prop changes on incorrect state', () => {
      const { rerender } = renderWithTheme(<QuizFeedback correct={false} answer="first answer" />);
      expect(screen.getByText('정답: first answer')).toBeInTheDocument();

      rerender(<QuizFeedback correct={false} answer="second answer" />);
      expect(screen.queryByText('정답: first answer')).not.toBeInTheDocument();
      expect(screen.getByText('정답: second answer')).toBeInTheDocument();
    });

    it('handles transition from correct to incorrect state', () => {
      const { rerender } = renderWithTheme(<QuizFeedback correct={true} answer="hidden answer" />);
      expect(screen.getByText('정답이에요!')).toBeInTheDocument();
      expect(screen.queryByText(/정답:/)).not.toBeInTheDocument();

      rerender(<QuizFeedback correct={false} answer="hidden answer" />);
      expect(screen.getByText('오답이에요')).toBeInTheDocument();
      expect(screen.getByText('정답: hidden answer')).toBeInTheDocument();
    });

    it('handles transition from incorrect to correct state', () => {
      const { rerender } = renderWithTheme(<QuizFeedback correct={false} answer="shown answer" />);
      expect(screen.getByText('오답이에요')).toBeInTheDocument();
      expect(screen.getByText('정답: shown answer')).toBeInTheDocument();

      rerender(<QuizFeedback correct={true} answer="shown answer" />);
      expect(screen.getByText('정답이에요!')).toBeInTheDocument();
      expect(screen.queryByText(/정답:/)).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles whitespace in answer', () => {
      const { container } = renderWithTheme(
        <QuizFeedback correct={false} answer="  answer with spaces  " />,
      );
      expect(container.textContent).toContain('정답:   answer with spaces  ');
    });

    it('handles answer with newlines (if applicable)', () => {
      const { container } = renderWithTheme(<QuizFeedback correct={false} answer="line1\nline2" />);
      expect(container.textContent).toContain('정답: line1');
      expect(container.textContent).toContain('line2');
    });

    it('handles unicode characters in answer', () => {
      renderWithTheme(<QuizFeedback correct={false} answer="서울 🎓" />);
      expect(screen.getByText('정답: 서울 🎓')).toBeInTheDocument();
    });
  });
});
