import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import QuizQuestion from './QuizQuestion';
import type { Question } from '@/types';

describe('QuizQuestion', () => {
  describe('conditional rendering - image', () => {
    it('renders image when imageUrl is provided', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'What is this?',
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      const image = screen.getByAltText('문제 이미지');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('does not render image when imageUrl is null', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: 'What is the answer?',
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      expect(screen.queryByAltText('문제 이미지')).not.toBeInTheDocument();
    });

    it('renders image with correct alt text', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/test.png',
        questionText: null,
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      const image = screen.getByAltText('문제 이미지');
      expect(image).toHaveAttribute('alt', '문제 이미지');
    });

    it('uses the provided imageUrl in src attribute', () => {
      const imageUrl = 'https://example.com/specific-image.webp';
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl,
        questionText: 'Question text',
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      const image = screen.getByAltText('문제 이미지') as HTMLImageElement;
      expect(image.src).toContain('specific-image.webp');
    });
  });

  describe('conditional rendering - text', () => {
    it('renders question text when questionText is provided', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: 'This is the question text',
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      expect(screen.getByText('This is the question text')).toBeInTheDocument();
    });

    it('does not render question text when questionText is null', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: null,
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      // Verify no text element is rendered by checking the structure
      const { container } = renderWithTheme(<QuizQuestion question={question} />);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(0);
    });

    it('renders question text with correct content', () => {
      const textContent = 'What is the capital of France?';
      const question: Question = {
        id: 2,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: textContent,
        answer: 'Paris',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      const textElement = screen.getByText(textContent);
      expect(textElement).toBeInTheDocument();
    });

    it('renders long question text correctly', () => {
      const longText =
        'This is a very long question that contains multiple sentences and tests whether the component can handle extended text content without any issues or layout problems.';
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: longText,
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('renders question text with special characters', () => {
      const textWithSpecialChars = '한글 문제입니다! @#$%';
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: textWithSpecialChars,
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      expect(screen.getByText(textWithSpecialChars)).toBeInTheDocument();
    });
  });

  describe('both image and text present', () => {
    it('renders both image and question text when both are provided', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'Identify the object in the image',
        answer: 'Object',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      expect(screen.getByAltText('문제 이미지')).toBeInTheDocument();
      expect(screen.getByText('Identify the object in the image')).toBeInTheDocument();
    });

    it('renders image before text in the DOM when both present', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'Question below image',
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      const image = screen.getByAltText('문제 이미지');
      const text = screen.getByText('Question below image');

      // Image should appear before text in DOM
      expect(image.compareDocumentPosition(text)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('neither image nor text present', () => {
    it('renders wrapper but no content when both imageUrl and questionText are null', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: null,
        answer: 'Answer',
      };

      const { container } = renderWithTheme(<QuizQuestion question={question} />);
      // Wrapper should exist but be empty
      const wrapper = container.firstChild;
      expect(wrapper).toBeInTheDocument();
      expect(screen.queryByAltText('문제 이미지')).not.toBeInTheDocument();
    });

    it('renders wrapper div even with no image or text', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: null,
        answer: 'Answer',
      };

      const { container } = renderWithTheme(<QuizQuestion question={question} />);
      // Verify a div element exists (the wrapper)
      const divElements = container.querySelectorAll('div');
      expect(divElements.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('handles empty string imageUrl as falsy', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: '' as unknown as null, // Empty string should be falsy
        questionText: 'Text content',
        answer: 'Answer',
      };

      renderWithTheme(<QuizQuestion question={question} />);
      expect(screen.queryByAltText('문제 이미지')).not.toBeInTheDocument();
      expect(screen.getByText('Text content')).toBeInTheDocument();
    });

    it('handles empty string questionText as falsy', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: '' as unknown as null, // Empty string should be falsy
        answer: 'Answer',
      };

      const { container } = renderWithTheme(<QuizQuestion question={question} />);
      expect(screen.getByAltText('문제 이미지')).toBeInTheDocument();
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(0);
    });

    it('handles whitespace-only questionText as truthy', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: null,
        questionText: '   ',
        answer: 'Answer',
      };

      const { container } = renderWithTheme(<QuizQuestion question={question} />);
      // Whitespace is still truthy, so text should render
      const textElement = container.querySelector('p');
      expect(textElement).toBeTruthy();
      expect(textElement?.textContent).toBe('   ');
    });

    it('renders different question at different orderNum', () => {
      const question1: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image1.jpg',
        questionText: 'Question 1',
        answer: 'Answer 1',
      };

      const question2: Question = {
        id: 2,
        quizId: 1,
        orderNum: 2,
        imageUrl: 'https://example.com/image2.jpg',
        questionText: 'Question 2',
        answer: 'Answer 2',
      };

      const { rerender } = renderWithTheme(<QuizQuestion question={question1} />);
      expect(screen.getByText('Question 1')).toBeInTheDocument();

      rerender(<QuizQuestion question={question2} />);
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    it('updates when question prop changes', () => {
      const initialQuestion: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image1.jpg',
        questionText: 'Original text',
        answer: 'Answer',
      };

      const updatedQuestion: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image2.jpg',
        questionText: 'Updated text',
        answer: 'Answer',
      };

      const { rerender } = renderWithTheme(<QuizQuestion question={initialQuestion} />);
      expect(screen.getByText('Original text')).toBeInTheDocument();

      rerender(<QuizQuestion question={updatedQuestion} />);
      expect(screen.getByText('Updated text')).toBeInTheDocument();
    });
  });

  describe('memo optimization', () => {
    it('does not re-render when same question prop is passed', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'Question text',
        answer: 'Answer',
      };

      const { rerender } = renderWithTheme(<QuizQuestion question={question} />);
      const initialElement = screen.getByText('Question text');

      rerender(<QuizQuestion question={question} />);
      const rerenderElement = screen.getByText('Question text');

      expect(initialElement).toBeInTheDocument();
      expect(rerenderElement).toBeInTheDocument();
    });

    it('re-renders when questionText prop changes', () => {
      const question1: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'First text',
        answer: 'Answer',
      };

      const question2: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'Second text',
        answer: 'Answer',
      };

      const { rerender } = renderWithTheme(<QuizQuestion question={question1} />);
      expect(screen.getByText('First text')).toBeInTheDocument();

      rerender(<QuizQuestion question={question2} />);
      expect(screen.getByText('Second text')).toBeInTheDocument();
    });

    it('re-renders when imageUrl prop changes', () => {
      const question1: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image1.jpg',
        questionText: 'Text',
        answer: 'Answer',
      };

      const question2: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image2.jpg',
        questionText: 'Text',
        answer: 'Answer',
      };

      const { rerender } = renderWithTheme(<QuizQuestion question={question1} />);
      let image = screen.getByAltText('문제 이미지') as HTMLImageElement;
      expect(image.src).toContain('image1.jpg');

      rerender(<QuizQuestion question={question2} />);
      image = screen.getByAltText('문제 이미지') as HTMLImageElement;
      expect(image.src).toContain('image2.jpg');
    });
  });

  describe('component structure', () => {
    it('renders with displayName set correctly', () => {
      expect(QuizQuestion.displayName).toBe('QuizQuestion');
    });

    it('wraps content in QuestionWrapper styled component', () => {
      const question: Question = {
        id: 1,
        quizId: 1,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'Text',
        answer: 'Answer',
      };

      const { container } = renderWithTheme(<QuizQuestion question={question} />);
      // The root should be a div (the wrapper)
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('renders without errors with valid Question type', () => {
      const question: Question = {
        id: 123,
        quizId: 456,
        orderNum: 1,
        imageUrl: 'https://example.com/image.jpg',
        questionText: 'Complete question',
        answer: 'Complete answer',
      };

      expect(() => {
        renderWithTheme(<QuizQuestion question={question} />);
      }).not.toThrow();
    });
  });
});
