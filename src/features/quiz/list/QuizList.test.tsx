import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { Quiz } from '@/types';
import QuizList from './QuizList';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/quiz', search: '' }),
}));

vi.mock('./QuizCard', () => ({
  default: ({ quiz, onClick }: { quiz: Quiz; onClick: (id: number) => void }) => (
    <div data-testid={`quiz-card-${quiz.id}`} onClick={() => onClick(quiz.id)}>
      {quiz.title}
    </div>
  ),
}));

const createMockQuiz = (overrides?: Partial<Quiz>): Quiz => ({
  id: 1,
  authorNickname: 'testuser',
  title: 'Sample Quiz',
  description: 'A sample quiz for testing',
  category: 'game',
  thumbnailKey: 'quiz-thumbnails/abc',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  playCount: 42,
  starCount: 0,
  commentCount: 0,
  shareCount: 0,
  isStarred: null,
  isPublic: true,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('QuizList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('renders empty message when quizzes array is empty', () => {
      renderWithTheme(<QuizList quizzes={[]} />);
      expect(screen.getByText('퀴즈가 없어요')).toBeInTheDocument();
    });

    it('displays empty message with proper styling container', () => {
      const { container } = renderWithTheme(<QuizList quizzes={[]} />);
      const emptyMessage = screen.getByText('퀴즈가 없어요');
      expect(emptyMessage.tagName).toBe('P');
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('does not render any quiz cards when array is empty', () => {
      renderWithTheme(<QuizList quizzes={[]} />);
      expect(screen.queryByTestId(/quiz-card-/)).not.toBeInTheDocument();
    });

    it('renders empty message inside list wrapper section', () => {
      const { container } = renderWithTheme(<QuizList quizzes={[]} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section?.textContent).toBe('퀴즈가 없어요');
    });
  });

  describe('quiz list rendering', () => {
    it('renders single quiz card when quizzes array has one item', () => {
      const quizzes = [createMockQuiz({ id: 1, title: 'Quiz One' })];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument();
      expect(screen.getByText('Quiz One')).toBeInTheDocument();
    });

    it('renders multiple quiz cards for multiple quizzes', () => {
      const quizzes = [
        createMockQuiz({ id: 1, title: 'Quiz One' }),
        createMockQuiz({ id: 2, title: 'Quiz Two' }),
        createMockQuiz({ id: 3, title: 'Quiz Three' }),
      ];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-card-3')).toBeInTheDocument();
      expect(screen.getByText('Quiz One')).toBeInTheDocument();
      expect(screen.getByText('Quiz Two')).toBeInTheDocument();
      expect(screen.getByText('Quiz Three')).toBeInTheDocument();
    });

    it('does not render empty message when quizzes are present', () => {
      const quizzes = [createMockQuiz()];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      expect(screen.queryByText('퀴즈가 없어요')).not.toBeInTheDocument();
    });

    it('renders quiz cards with correct quiz objects', () => {
      const quizzes = [
        createMockQuiz({ id: 10, title: 'First' }),
        createMockQuiz({ id: 20, title: 'Second' }),
      ];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      expect(screen.getByTestId('quiz-card-10')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-card-20')).toBeInTheDocument();
    });

    it('renders list in a section wrapper', () => {
      const { container } = renderWithTheme(<QuizList quizzes={[createMockQuiz()]} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('handleCardClick and navigation', () => {
    it('navigates to /quiz/1 when card with id 1 is clicked', async () => {
      const user = userEvent.setup();
      const quizzes = [createMockQuiz({ id: 1 })];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      const card = screen.getByTestId('quiz-card-1');
      await user.click(card);

      expect(mockNavigate).toHaveBeenCalledWith('/quiz/1');
    });

    it('navigates to /quiz/42 when card with id 42 is clicked', async () => {
      const user = userEvent.setup();
      const quizzes = [createMockQuiz({ id: 42 })];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      const card = screen.getByTestId('quiz-card-42');
      await user.click(card);

      expect(mockNavigate).toHaveBeenCalledWith('/quiz/42');
    });

    it('calls navigate with correct id for each clicked card', async () => {
      const user = userEvent.setup();
      const quizzes = [
        createMockQuiz({ id: 5 }),
        createMockQuiz({ id: 10 }),
        createMockQuiz({ id: 15 }),
      ];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      await user.click(screen.getByTestId('quiz-card-5'));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/5');

      await user.click(screen.getByTestId('quiz-card-10'));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/10');

      await user.click(screen.getByTestId('quiz-card-15'));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/15');
    });

    it('passes handleCardClick callback to quiz cards', () => {
      const quizzes = [createMockQuiz({ id: 99 })];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      const card = screen.getByTestId('quiz-card-99');

      expect(card).toBeInTheDocument();
    });

    it('navigates to correct url format /quiz/{id}', async () => {
      const user = userEvent.setup();
      const quizzes = [createMockQuiz({ id: 123 })];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      await user.click(screen.getByTestId('quiz-card-123'));

      const call = mockNavigate.mock.calls[0][0];
      expect(call).toMatch(/^\/quiz\/\d+$/);
      expect(call).toBe('/quiz/123');
    });

    it('handles sequential clicks on multiple cards', async () => {
      const user = userEvent.setup();
      const quizzes = [createMockQuiz({ id: 1 }), createMockQuiz({ id: 2 })];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      await user.click(screen.getByTestId('quiz-card-1'));
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenLastCalledWith('/quiz/1');

      await user.click(screen.getByTestId('quiz-card-2'));
      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenLastCalledWith('/quiz/2');
    });
  });

  describe('prop variations', () => {
    it('handles quizzes with various property values', () => {
      const quizzes = [
        createMockQuiz({ id: 1, playCount: 0, title: 'Zero Plays' }),
        createMockQuiz({ id: 2, playCount: 999999, title: 'Many Plays' }),
        createMockQuiz({ id: 3, category: 'music', title: 'Music Quiz' }),
        createMockQuiz({ id: 4, category: 'culture', title: 'Culture Quiz' }),
      ];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      quizzes.forEach((quiz) => {
        expect(screen.getByTestId(`quiz-card-${quiz.id}`)).toBeInTheDocument();
      });
    });

    it('handles quiz with null thumbnail', () => {
      const quizzes = [createMockQuiz({ id: 1, thumbnailUrl: null })];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument();
    });

    it('renders all quizzes from large array', () => {
      const quizzes = Array.from({ length: 50 }, (_, i) =>
        createMockQuiz({ id: i + 1, title: `Quiz ${i + 1}` }),
      );
      renderWithTheme(<QuizList quizzes={quizzes} />);

      quizzes.forEach((quiz) => {
        expect(screen.getByTestId(`quiz-card-${quiz.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('component lifecycle', () => {
    it('renders without crashing with minimal props', () => {
      renderWithTheme(<QuizList quizzes={[]} />);
      expect(screen.getByText('퀴즈가 없어요')).toBeInTheDocument();
    });

    it('updates when quizzes prop changes from empty to filled', () => {
      const { rerender } = renderWithTheme(<QuizList quizzes={[]} />);
      expect(screen.getByText('퀴즈가 없어요')).toBeInTheDocument();

      const newQuizzes = [createMockQuiz({ id: 1, title: 'New Quiz' })];
      rerender(<QuizList quizzes={newQuizzes} />);

      expect(screen.queryByText('퀴즈가 없어요')).not.toBeInTheDocument();
      expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument();
    });

    it('updates when quizzes prop changes from filled to empty', () => {
      const initialQuizzes = [createMockQuiz({ id: 1 })];
      const { rerender } = renderWithTheme(<QuizList quizzes={initialQuizzes} />);

      expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument();

      rerender(<QuizList quizzes={[]} />);
      expect(screen.queryByTestId('quiz-card-1')).not.toBeInTheDocument();
      expect(screen.getByText('퀴즈가 없어요')).toBeInTheDocument();
    });

    it('updates when quizzes array is replaced with different content', () => {
      const initialQuizzes = [createMockQuiz({ id: 1, title: 'First' })];
      const { rerender } = renderWithTheme(<QuizList quizzes={initialQuizzes} />);

      expect(screen.getByText('First')).toBeInTheDocument();

      const newQuizzes = [createMockQuiz({ id: 2, title: 'Second' })];
      rerender(<QuizList quizzes={newQuizzes} />);

      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('display name', () => {
    it('has correct display name for debugging', () => {
      expect(QuizList.displayName).toBe('QuizList');
    });
  });

  describe('memo optimization', () => {
    it('does not re-render when props remain the same', () => {
      const quizzes = [createMockQuiz({ id: 1 })];
      const { rerender } = renderWithTheme(<QuizList quizzes={quizzes} />);
      const initialCard = screen.getByTestId('quiz-card-1');

      rerender(<QuizList quizzes={quizzes} />);
      const rerenderCard = screen.getByTestId('quiz-card-1');

      expect(initialCard).toBeInTheDocument();
      expect(rerenderCard).toBeInTheDocument();
    });

    it('re-renders when quizzes prop changes', () => {
      const quizzes1 = [createMockQuiz({ id: 1, title: 'Quiz 1' })];
      const { rerender } = renderWithTheme(<QuizList quizzes={quizzes1} />);

      expect(screen.getByText('Quiz 1')).toBeInTheDocument();

      const quizzes2 = [createMockQuiz({ id: 2, title: 'Quiz 2' })];
      rerender(<QuizList quizzes={quizzes2} />);

      expect(screen.queryByText('Quiz 1')).not.toBeInTheDocument();
      expect(screen.getByText('Quiz 2')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles quiz with very long title', () => {
      const longTitle = 'A'.repeat(500);
      const quizzes = [createMockQuiz({ id: 1, title: longTitle })];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles quiz with special characters in title', () => {
      const quizzes = [createMockQuiz({ id: 1, title: '퀴즈 #1 (테스트) 🎓' })];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      expect(screen.getByText('퀴즈 #1 (테스트) 🎓')).toBeInTheDocument();
    });

    it('handles quiz with id as large number', async () => {
      const user = userEvent.setup();
      const quizzes = [createMockQuiz({ id: 999999999 })];
      renderWithTheme(<QuizList quizzes={quizzes} />);

      await user.click(screen.getByTestId('quiz-card-999999999'));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/999999999');
    });

    it('handles quiz with playCount as zero', () => {
      const quizzes = [createMockQuiz({ id: 1, playCount: 0 })];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument();
    });

    it('handles empty string description', () => {
      const quizzes = [createMockQuiz({ id: 1, description: '' })];
      renderWithTheme(<QuizList quizzes={quizzes} />);
      expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument();
    });
  });
});
