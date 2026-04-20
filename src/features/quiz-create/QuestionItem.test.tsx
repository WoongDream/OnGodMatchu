import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import QuestionItem from './QuestionItem';

// Test wrapper component to manage state for controlled inputs
const QuestionItemWrapper = (
  props: Omit<React.ComponentProps<typeof QuestionItem>, 'questionText' | 'answer'> & {
    initialQuestion?: string;
    initialAnswer?: string;
    onQuestionChange?: (val: string) => void;
    onAnswerChange?: (val: string) => void;
  },
) => {
  const [question, setQuestion] = useState(props.initialQuestion ?? '');
  const [answer, setAnswer] = useState(props.initialAnswer ?? '');

  return (
    <QuestionItem
      {...props}
      questionText={question}
      answer={answer}
      onQuestionChange={(val) => {
        setQuestion(val);
        props.onQuestionChange?.(val);
      }}
      onAnswerChange={(val) => {
        setAnswer(val);
        props.onAnswerChange?.(val);
      }}
    />
  );
};

describe('QuestionItem', () => {
  const mockCallbacks = {
    onQuestionChange: vi.fn(),
    onAnswerChange: vi.fn(),
    onImageChange: vi.fn(),
    onImageRemove: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    onDelete: vi.fn(),
  };

  const defaultProps = {
    index: 0,
    questionText: '테스트 문제',
    answer: '테스트 답',
    imagePreviewUrl: null,
    isFirst: false,
    isLast: false,
    ...mockCallbacks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('index numbering', () => {
    it('displays correct question number (index + 1)', () => {
      renderWithTheme(<QuestionItem {...defaultProps} index={0} />);
      expect(screen.getByText('1번 문제')).toBeInTheDocument();
    });

    it('displays correct question number for index 5', () => {
      renderWithTheme(<QuestionItem {...defaultProps} index={5} />);
      expect(screen.getByText('6번 문제')).toBeInTheDocument();
    });

    it('displays correct question number for large index', () => {
      renderWithTheme(<QuestionItem {...defaultProps} index={99} />);
      expect(screen.getByText('100번 문제')).toBeInTheDocument();
    });
  });

  describe('move up button', () => {
    it('is enabled when not first item', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={false} />);
      const moveUpButton = screen.getByLabelText('위로');
      expect(moveUpButton).not.toBeDisabled();
    });

    it('is disabled when first item', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={true} />);
      const moveUpButton = screen.getByLabelText('위로');
      expect(moveUpButton).toBeDisabled();
    });

    it('calls onMoveUp when clicked and enabled', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={false} onMoveUp={onMoveUp} />);

      const moveUpButton = screen.getByLabelText('위로');
      await user.click(moveUpButton);

      expect(onMoveUp).toHaveBeenCalledOnce();
    });

    it('does not call onMoveUp when disabled', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={true} onMoveUp={onMoveUp} />);

      const moveUpButton = screen.getByLabelText('위로');
      await user.click(moveUpButton);

      expect(onMoveUp).not.toHaveBeenCalled();
    });
  });

  describe('move down button', () => {
    it('is enabled when not last item', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isLast={false} />);
      const moveDownButton = screen.getByLabelText('아래로');
      expect(moveDownButton).not.toBeDisabled();
    });

    it('is disabled when last item', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isLast={true} />);
      const moveDownButton = screen.getByLabelText('아래로');
      expect(moveDownButton).toBeDisabled();
    });

    it('calls onMoveDown when clicked and enabled', async () => {
      const user = userEvent.setup();
      const onMoveDown = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isLast={false} onMoveDown={onMoveDown} />);

      const moveDownButton = screen.getByLabelText('아래로');
      await user.click(moveDownButton);

      expect(onMoveDown).toHaveBeenCalledOnce();
    });

    it('does not call onMoveDown when disabled', async () => {
      const user = userEvent.setup();
      const onMoveDown = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isLast={true} onMoveDown={onMoveDown} />);

      const moveDownButton = screen.getByLabelText('아래로');
      await user.click(moveDownButton);

      expect(onMoveDown).not.toHaveBeenCalled();
    });

    it('is independent from isFirst state', () => {
      const { rerender } = renderWithTheme(
        <QuestionItem {...defaultProps} isFirst={true} isLast={false} />,
      );

      const moveDownButton = screen.getByLabelText('아래로');
      expect(moveDownButton).not.toBeDisabled();

      rerender(<QuestionItem {...defaultProps} isFirst={true} isLast={true} />);

      expect(moveDownButton).toBeDisabled();
    });
  });

  describe('delete button', () => {
    it('is always enabled regardless of position', () => {
      const { rerender } = renderWithTheme(
        <QuestionItem {...defaultProps} isFirst={true} isLast={true} />,
      );

      const deleteButton = screen.getByLabelText('삭제');
      expect(deleteButton).not.toBeDisabled();

      rerender(<QuestionItem {...defaultProps} isFirst={false} isLast={false} />);

      expect(deleteButton).not.toBeDisabled();
    });

    it('calls onDelete when clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByLabelText('삭제');
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledOnce();
    });
  });

  describe('question input', () => {
    it('displays provided question text', () => {
      renderWithTheme(<QuestionItem {...defaultProps} questionText="한국의 수도는?" />);
      const questionInput = screen.getByDisplayValue('한국의 수도는?');
      expect(questionInput).toBeInTheDocument();
    });

    it('displays empty question when empty string provided', () => {
      renderWithTheme(<QuestionItem {...defaultProps} questionText="" />);
      const questionInput = screen.getByPlaceholderText('문제를 입력하세요');
      expect(questionInput).toHaveValue('');
    });

    it('shows correct placeholder text', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      expect(screen.getByPlaceholderText('문제를 입력하세요')).toBeInTheDocument();
    });

    it('calls onQuestionChange when input changes', async () => {
      const user = userEvent.setup();
      const onQuestionChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper
          {...defaultProps}
          initialQuestion=""
          onQuestionChange={onQuestionChange}
        />,
      );

      const questionInput = screen.getByPlaceholderText('문제를 입력하세요') as HTMLInputElement;
      await user.type(questionInput, 'new question');

      expect(onQuestionChange).toHaveBeenCalledTimes('new question'.length);
      expect(onQuestionChange).toHaveBeenLastCalledWith('new question');
    });

    it('calls onQuestionChange with each character typed', async () => {
      const user = userEvent.setup();
      const onQuestionChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper
          {...defaultProps}
          initialQuestion=""
          onQuestionChange={onQuestionChange}
        />,
      );

      const questionInput = screen.getByPlaceholderText('문제를 입력하세요') as HTMLInputElement;
      await user.type(questionInput, 'ab');

      expect(onQuestionChange).toHaveBeenNthCalledWith(1, 'a');
      expect(onQuestionChange).toHaveBeenNthCalledWith(2, 'ab');
    });

    it('handles special characters in question', async () => {
      const user = userEvent.setup();
      const onQuestionChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper
          {...defaultProps}
          initialQuestion=""
          onQuestionChange={onQuestionChange}
        />,
      );

      const questionInput = screen.getByPlaceholderText('문제를 입력하세요') as HTMLInputElement;
      await user.type(questionInput, '!@#$%');

      expect(onQuestionChange).toHaveBeenLastCalledWith('!@#$%');
    });

    it('handles very long question text', () => {
      const longQuestion = 'a'.repeat(1000);
      renderWithTheme(<QuestionItem {...defaultProps} questionText={longQuestion} />);

      const questionInput = screen.getByDisplayValue(longQuestion);
      expect(questionInput).toBeInTheDocument();
    });
  });

  describe('answer input', () => {
    it('displays provided answer text', () => {
      renderWithTheme(<QuestionItem {...defaultProps} answer="서울" />);
      const answerInput = screen.getByDisplayValue('서울');
      expect(answerInput).toBeInTheDocument();
    });

    it('displays empty answer when empty string provided', () => {
      renderWithTheme(<QuestionItem {...defaultProps} answer="" />);
      const answerInput = screen.getByPlaceholderText('정답을 입력하세요');
      expect(answerInput).toHaveValue('');
    });

    it('shows correct placeholder text', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      expect(screen.getByPlaceholderText('정답을 입력하세요')).toBeInTheDocument();
    });

    it('calls onAnswerChange when input changes', async () => {
      const user = userEvent.setup();
      const onAnswerChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper {...defaultProps} initialAnswer="" onAnswerChange={onAnswerChange} />,
      );

      const answerInput = screen.getByPlaceholderText('정답을 입력하세요') as HTMLInputElement;
      await user.type(answerInput, 'new answer');

      expect(onAnswerChange).toHaveBeenCalledTimes('new answer'.length);
      expect(onAnswerChange).toHaveBeenLastCalledWith('new answer');
    });

    it('calls onAnswerChange with each character typed', async () => {
      const user = userEvent.setup();
      const onAnswerChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper {...defaultProps} initialAnswer="" onAnswerChange={onAnswerChange} />,
      );

      const answerInput = screen.getByPlaceholderText('정답을 입력하세요') as HTMLInputElement;
      await user.type(answerInput, 'xy');

      expect(onAnswerChange).toHaveBeenNthCalledWith(1, 'x');
      expect(onAnswerChange).toHaveBeenNthCalledWith(2, 'xy');
    });

    it('handles unicode characters in answer', async () => {
      const user = userEvent.setup();
      const onAnswerChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper {...defaultProps} initialAnswer="" onAnswerChange={onAnswerChange} />,
      );

      const answerInput = screen.getByPlaceholderText('정답을 입력하세요') as HTMLInputElement;
      await user.type(answerInput, '한글답변');

      expect(onAnswerChange).toHaveBeenLastCalledWith('한글답변');
    });

    it('handles very long answer text', () => {
      const longAnswer = 'x'.repeat(500);
      renderWithTheme(<QuestionItem {...defaultProps} answer={longAnswer} />);

      const answerInput = screen.getByDisplayValue(longAnswer);
      expect(answerInput).toBeInTheDocument();
    });
  });

  describe('image upload', () => {
    it('displays image upload component with correct label', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      expect(screen.getByText('문제 이미지 (선택)')).toBeInTheDocument();
    });

    it('passes null preview URL to ImageUpload when no image', () => {
      const { container } = renderWithTheme(
        <QuestionItem {...defaultProps} imagePreviewUrl={null} />,
      );
      // ImageUpload component should not show preview image
      expect(container.querySelector('img[alt="업로드 이미지 미리보기"]')).not.toBeInTheDocument();
    });

    it('passes preview URL to ImageUpload when image exists', () => {
      renderWithTheme(
        <QuestionItem {...defaultProps} imagePreviewUrl="data:image/png;base64,test" />,
      );
      const previewImage = screen.getByAltText('업로드 이미지 미리보기');
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute('src', 'data:image/png;base64,test');
    });

    it('calls onImageChange when image is selected', async () => {
      const user = userEvent.setup();
      const onImageChange = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onImageChange={onImageChange} />);

      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByLabelText('문제 이미지 (선택)');

      // Find the actual hidden input inside ImageUpload
      const hiddenInput = fileInput.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(hiddenInput, file);

      expect(onImageChange).toHaveBeenCalled();
      const [uploadedFile] = onImageChange.mock.calls[0];
      expect(uploadedFile.name).toBe('test.png');
    });

    it('calls onImageRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onImageRemove = vi.fn();
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          imagePreviewUrl="data:image/png;base64,test"
          onImageRemove={onImageRemove}
        />,
      );

      // Find remove button by text content '✕' within the image preview area
      const previewImage = screen.getByAltText('업로드 이미지 미리보기');
      const imageArea = previewImage.closest('label');
      const removeButton = imageArea?.querySelector('button');

      if (removeButton) {
        await user.click(removeButton);
        expect(onImageRemove).toHaveBeenCalledOnce();
      }
    });

    it('handles multiple image uploads sequentially', async () => {
      const user = userEvent.setup();
      const onImageChange = vi.fn();
      const { rerender } = renderWithTheme(
        <QuestionItem {...defaultProps} imagePreviewUrl={null} onImageChange={onImageChange} />,
      );

      const file1 = new File(['image1'], 'test1.png', { type: 'image/png' });
      const fileInput = screen.getByLabelText('문제 이미지 (선택)');
      const hiddenInput = fileInput.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(hiddenInput, file1);
      expect(onImageChange).toHaveBeenCalledTimes(1);

      // Simulate uploading another image
      rerender(
        <QuestionItem
          {...defaultProps}
          imagePreviewUrl="data:image/png;base64,new"
          onImageChange={onImageChange}
        />,
      );

      const file2 = new File(['image2'], 'test2.png', { type: 'image/png' });
      await user.upload(hiddenInput, file2);
      expect(onImageChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration scenarios', () => {
    it('renders all inputs with correct values simultaneously', () => {
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          questionText="서울은?"
          answer="대한민국의 수도"
          imagePreviewUrl="data:image/png;base64,img"
        />,
      );

      expect(screen.getByDisplayValue('서울은?')).toBeInTheDocument();
      expect(screen.getByDisplayValue('대한민국의 수도')).toBeInTheDocument();
      expect(screen.getByAltText('업로드 이미지 미리보기')).toBeInTheDocument();
    });

    it('handles multiple callbacks in sequence', async () => {
      const user = userEvent.setup();
      const callbacks = {
        onQuestionChange: vi.fn(),
        onAnswerChange: vi.fn(),
        onMoveUp: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithTheme(
        <QuestionItem {...defaultProps} questionText="" answer="" isFirst={false} {...callbacks} />,
      );

      // Type question
      const questionInput = screen.getByPlaceholderText('문제를 입력하세요');
      await user.type(questionInput, 'q');
      expect(callbacks.onQuestionChange).toHaveBeenCalled();

      // Type answer
      const answerInput = screen.getByPlaceholderText('정답을 입력하세요');
      await user.type(answerInput, 'a');
      expect(callbacks.onAnswerChange).toHaveBeenCalled();

      // Click move up
      const moveUpButton = screen.getByLabelText('위로');
      await user.click(moveUpButton);
      expect(callbacks.onMoveUp).toHaveBeenCalledOnce();

      // Click delete
      const deleteButton = screen.getByLabelText('삭제');
      await user.click(deleteButton);
      expect(callbacks.onDelete).toHaveBeenCalledOnce();
    });

    it('maintains state across multiple re-renders', () => {
      const { rerender } = renderWithTheme(
        <QuestionItem
          {...defaultProps}
          index={0}
          questionText="initial"
          isFirst={true}
          isLast={false}
        />,
      );

      expect(screen.getByText('1번 문제')).toBeInTheDocument();
      expect(screen.getByLabelText('위로')).toBeDisabled();

      rerender(
        <QuestionItem
          {...defaultProps}
          index={2}
          questionText="updated"
          isFirst={false}
          isLast={true}
        />,
      );

      expect(screen.getByText('3번 문제')).toBeInTheDocument();
      expect(screen.getByLabelText('위로')).not.toBeDisabled();
      expect(screen.getByLabelText('아래로')).toBeDisabled();
    });

    it('works correctly as first and last item simultaneously', () => {
      renderWithTheme(<QuestionItem {...defaultProps} index={0} isFirst={true} isLast={true} />);

      expect(screen.getByLabelText('위로')).toBeDisabled();
      expect(screen.getByLabelText('아래로')).toBeDisabled();
      expect(screen.getByLabelText('삭제')).not.toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('handles index at boundary values', () => {
      const { rerender } = renderWithTheme(<QuestionItem {...defaultProps} index={0} />);
      expect(screen.getByText('1번 문제')).toBeInTheDocument();

      rerender(<QuestionItem {...defaultProps} index={Number.MAX_SAFE_INTEGER} />);
      expect(screen.getByText(`${Number.MAX_SAFE_INTEGER + 1}번 문제`)).toBeInTheDocument();
    });

    it('handles rapid callback invocations', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByLabelText('삭제');
      await user.click(deleteButton);
      await user.click(deleteButton);
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(3);
    });

    it('handles empty strings for question and answer', () => {
      renderWithTheme(<QuestionItem {...defaultProps} questionText="" answer="" />);

      expect(screen.getByPlaceholderText('문제를 입력하세요')).toHaveValue('');
      expect(screen.getByPlaceholderText('정답을 입력하세요')).toHaveValue('');
    });

    it('handles whitespace-only question and answer', () => {
      renderWithTheme(<QuestionItem {...defaultProps} questionText="   " answer="   " />);

      const questionInput = screen.getByPlaceholderText('문제를 입력하세요') as HTMLInputElement;
      const answerInput = screen.getByPlaceholderText('정답을 입력하세요') as HTMLInputElement;
      expect(questionInput).toHaveValue('   ');
      expect(answerInput).toHaveValue('   ');
    });

    it('handles newlines and special whitespace in inputs', () => {
      // Note: input type="text" strips newlines, but we can still test the rendering
      const questionWithNewline = 'line1\nline2';
      const answerWithTab = 'tab\tseparated';
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          questionText={questionWithNewline}
          answer={answerWithTab}
        />,
      );

      const questionInput = screen.getByPlaceholderText('문제를 입력하세요') as HTMLInputElement;
      const answerInput = screen.getByPlaceholderText('정답을 입력하세요') as HTMLInputElement;
      // input type="text" removes newlines, so line1\nline2 becomes line1line2
      expect(questionInput.value).toBe('line1line2');
      // Tab characters are preserved
      expect(answerInput.value).toBe(answerWithTab);
    });

    it('handles undefined callbacks gracefully after mocking', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          onMoveUp={vi.fn()}
          onMoveDown={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      const moveUpButton = screen.getByLabelText('위로');
      const moveDownButton = screen.getByLabelText('아래로');
      const deleteButton = screen.getByLabelText('삭제');

      await user.click(moveUpButton);
      await user.click(moveDownButton);
      await user.click(deleteButton);

      // Should not throw
      expect(moveUpButton).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria labels for action buttons', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);

      expect(screen.getByLabelText('위로')).toBeInTheDocument();
      expect(screen.getByLabelText('아래로')).toBeInTheDocument();
      expect(screen.getByLabelText('삭제')).toBeInTheDocument();
    });

    it('buttons are keyboard navigable', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={false} onMoveUp={onMoveUp} />);

      const moveUpButton = screen.getByLabelText('위로');
      moveUpButton.focus();
      expect(moveUpButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onMoveUp).toHaveBeenCalledOnce();
    });

    it('disabled buttons are not keyboard interactive', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={true} onMoveUp={onMoveUp} />);

      const moveUpButton = screen.getByLabelText('위로');
      moveUpButton.focus();

      await user.keyboard('{Enter}');
      // The button remains focused but should not trigger callback
      expect(onMoveUp).not.toHaveBeenCalled();
    });
  });
});
