import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizCard from './QuizCard';
import type { Quiz } from '@/types';

const getCard = () => screen.getByRole('article');
const getTitle = () => screen.getByRole('heading', { level: 3 });

describe('QuizCard', () => {
  let mockOnClick: Mock<(id: number) => void>;
  const mockQuiz: Quiz = {
    id: 1,
    authorNickname: 'testuser',
    title: 'Test Quiz Title',
    description: 'Test quiz description',
    category: 'game',
    thumbnailKey: 'quiz-thumbnails/abc',
    thumbnailUrl: 'https://example.com/image.jpg',
    playCount: 1234,
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClick = vi.fn<(id: number) => void>();
  });

  describe('rendering', () => {
    it('renders the card article landmark', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(getCard()).toBeInTheDocument();
    });

    it('renders quiz title', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('Test Quiz Title')).toBeInTheDocument();
    });

    it('renders quiz description', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('Test quiz description')).toBeInTheDocument();
    });

    it('renders quiz category', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('game')).toBeInTheDocument();
    });

    it('renders the thumbnail image when present', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders both category and play count text', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('game')).toBeInTheDocument();
      expect(screen.getByText('· 1,234명 플레이')).toBeInTheDocument();
    });

    it('has displayName set to QuizCard', () => {
      expect(QuizCard.displayName).toBe('QuizCard');
    });
  });

  describe('thumbnail rendering', () => {
    it('renders img tag when thumbnailUrl is provided', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('renders img with correct src when thumbnailUrl is provided', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toBe('https://example.com/image.jpg');
    });

    it('renders img with quiz title as alt text', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Test Quiz Title');
    });

    it('does not render img tag when thumbnailUrl is null', () => {
      const quizWithoutThumbnail: Quiz = {
        ...mockQuiz,
        thumbnailUrl: null,
      };
      renderWithTheme(<QuizCard quiz={quizWithoutThumbnail} onClick={mockOnClick} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('still renders the card with no thumbnail URL', () => {
      const quizWithoutThumbnail: Quiz = {
        ...mockQuiz,
        thumbnailUrl: null,
      };
      renderWithTheme(<QuizCard quiz={quizWithoutThumbnail} onClick={mockOnClick} />);
      expect(getCard()).toBeInTheDocument();
      expect(getTitle()).toBeInTheDocument();
    });

    it('renders img with different URL when thumbnailUrl changes', () => {
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      let img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toBe('https://example.com/image.jpg');

      const updatedQuiz: Quiz = {
        ...mockQuiz,
        thumbnailUrl: 'https://example.com/new-image.jpg',
      };
      rerender(<QuizCard quiz={updatedQuiz} onClick={mockOnClick} />);

      img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toBe('https://example.com/new-image.jpg');
    });
  });

  describe('playCount formatting with toLocaleString()', () => {
    it('formats playCount as 1,234 for 1234', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('· 1,234명 플레이')).toBeInTheDocument();
    });

    it('formats playCount with comma separator for large numbers', () => {
      const quizWithHighPlayCount: Quiz = {
        ...mockQuiz,
        playCount: 1000000,
        isPublic: true,
      };
      renderWithTheme(<QuizCard quiz={quizWithHighPlayCount} onClick={mockOnClick} />);
      expect(screen.getByText('· 1,000,000명 플레이')).toBeInTheDocument();
    });

    it('formats playCount as 0 without comma for single digit', () => {
      const quizWithLowPlayCount: Quiz = {
        ...mockQuiz,
        playCount: 0,
        isPublic: true,
      };
      renderWithTheme(<QuizCard quiz={quizWithLowPlayCount} onClick={mockOnClick} />);
      expect(screen.getByText('· 0명 플레이')).toBeInTheDocument();
    });

    it('formats playCount as 1 without comma for 1', () => {
      const quizWithOnePlay: Quiz = {
        ...mockQuiz,
        playCount: 1,
        isPublic: true,
      };
      renderWithTheme(<QuizCard quiz={quizWithOnePlay} onClick={mockOnClick} />);
      expect(screen.getByText('· 1명 플레이')).toBeInTheDocument();
    });

    it('formats playCount as 999 without comma', () => {
      const quizWith999Plays: Quiz = {
        ...mockQuiz,
        playCount: 999,
        isPublic: true,
      };
      renderWithTheme(<QuizCard quiz={quizWith999Plays} onClick={mockOnClick} />);
      expect(screen.getByText('· 999명 플레이')).toBeInTheDocument();
    });

    it('includes bullet point before playCount', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      const playCountElement = screen.getByText('· 1,234명 플레이');
      expect(playCountElement.textContent).toMatch(/^·/);
    });

    it('includes correct Korean text "명 플레이"', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('· 1,234명 플레이')).toBeInTheDocument();
    });

    it('updates formatted playCount when quiz changes', () => {
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('· 1,234명 플레이')).toBeInTheDocument();

      const updatedQuiz: Quiz = {
        ...mockQuiz,
        playCount: 5000,
        isPublic: true,
      };
      rerender(<QuizCard quiz={updatedQuiz} onClick={mockOnClick} />);

      expect(screen.getByText('· 5,000명 플레이')).toBeInTheDocument();
    });
  });

  describe('onClick callback with quiz.id', () => {
    it('calls onClick when card is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick with quiz.id as argument', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(1);
    });

    it('calls onClick with correct quiz.id for different quizzes', async () => {
      const user = userEvent.setup();
      const quizWithDifferentId: Quiz = {
        ...mockQuiz,
        id: 42,
      };

      renderWithTheme(<QuizCard quiz={quizWithDifferentId} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(42);
    });

    it('calls onClick multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      await user.click(getCard());
      await user.click(getCard());
      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledTimes(3);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, 1);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, 1);
      expect(mockOnClick).toHaveBeenNthCalledWith(3, 1);
    });

    it('calls onClick with quiz.id 0', async () => {
      const user = userEvent.setup();
      const quizWithZeroId: Quiz = {
        ...mockQuiz,
        id: 0,
      };

      renderWithTheme(<QuizCard quiz={quizWithZeroId} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(0);
    });

    it('calls onClick with very large quiz.id', async () => {
      const user = userEvent.setup();
      const quizWithLargeId: Quiz = {
        ...mockQuiz,
        id: 999999999,
      };

      renderWithTheme(<QuizCard quiz={quizWithLargeId} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(999999999);
    });

    it('passes quiz.id to onClick, not other quiz properties', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(expect.any(Number));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      const callArg = mockOnClick.mock.calls[0][0];
      expect(typeof callArg).toBe('number');
      expect(callArg).toBe(mockQuiz.id);
    });

    it('updates onClick handler when quiz.id changes', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      const updatedQuiz: Quiz = {
        ...mockQuiz,
        id: 999,
      };

      rerender(<QuizCard quiz={updatedQuiz} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(999);
    });

    it('uses new onClick callback when prop changes', async () => {
      const user = userEvent.setup();
      const newMockOnClick = vi.fn();

      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      rerender(<QuizCard quiz={mockQuiz} onClick={newMockOnClick} />);

      await user.click(getCard());

      expect(newMockOnClick).toHaveBeenCalledWith(1);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('category rendering', () => {
    it('renders all supported categories correctly', async () => {
      const categories = [
        'entertainment',
        'movie',
        'drama',
        'anime',
        'game',
        'music',
        'sports',
        'general',
        'etc',
      ] as const;

      for (const category of categories) {
        const { unmount } = renderWithTheme(
          <QuizCard quiz={{ ...mockQuiz, category }} onClick={mockOnClick} />,
        );
        expect(screen.getByText(category)).toBeInTheDocument();
        unmount();
      }
    });

    it('updates category when quiz changes', () => {
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('game')).toBeInTheDocument();

      const updatedQuiz: Quiz = {
        ...mockQuiz,
        category: 'music',
      };
      rerender(<QuizCard quiz={updatedQuiz} onClick={mockOnClick} />);

      expect(screen.queryByText('game')).not.toBeInTheDocument();
      expect(screen.getByText('music')).toBeInTheDocument();
    });
  });

  describe('title and description rendering', () => {
    it('renders title with correct text', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(getTitle()).toHaveTextContent('Test Quiz Title');
    });

    it('renders description with correct text', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('Test quiz description')).toBeInTheDocument();
    });

    it('handles title with special characters', () => {
      const quizWithSpecialChars: Quiz = {
        ...mockQuiz,
        title: 'Quiz & <Title> "Special"',
      };
      renderWithTheme(<QuizCard quiz={quizWithSpecialChars} onClick={mockOnClick} />);
      expect(screen.getByText('Quiz & <Title> "Special"')).toBeInTheDocument();
    });

    it('handles long title', () => {
      const longTitle =
        'This is a very long quiz title that might wrap across multiple lines in the UI';
      const quizWithLongTitle: Quiz = {
        ...mockQuiz,
        title: longTitle,
      };
      renderWithTheme(<QuizCard quiz={quizWithLongTitle} onClick={mockOnClick} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles long description', () => {
      const longDescription =
        'This is a very long description that provides detailed information about the quiz and what it covers.';
      const quizWithLongDescription: Quiz = {
        ...mockQuiz,
        description: longDescription,
      };
      renderWithTheme(<QuizCard quiz={quizWithLongDescription} onClick={mockOnClick} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('updates title and description when quiz changes', () => {
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('Test Quiz Title')).toBeInTheDocument();
      expect(screen.getByText('Test quiz description')).toBeInTheDocument();

      const updatedQuiz: Quiz = {
        ...mockQuiz,
        title: 'New Title',
        description: 'New Description',
      };
      rerender(<QuizCard quiz={updatedQuiz} onClick={mockOnClick} />);

      expect(screen.queryByText('Test Quiz Title')).not.toBeInTheDocument();
      expect(screen.queryByText('Test quiz description')).not.toBeInTheDocument();
      expect(screen.getByText('New Title')).toBeInTheDocument();
      expect(screen.getByText('New Description')).toBeInTheDocument();
    });
  });

  describe('React.memo optimization', () => {
    it('does not re-render when props remain the same', () => {
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      const initialTitle = getTitle();

      rerender(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      const rerenderTitle = getTitle();

      expect(initialTitle).toBe(rerenderTitle);
    });

    it('re-renders when quiz prop changes', () => {
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);
      expect(screen.getByText('Test Quiz Title')).toBeInTheDocument();

      const updatedQuiz: Quiz = {
        ...mockQuiz,
        title: 'Updated Title',
      };
      rerender(<QuizCard quiz={updatedQuiz} onClick={mockOnClick} />);

      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });

    it('re-renders when onClick prop changes', () => {
      const newMockOnClick = vi.fn();
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      rerender(<QuizCard quiz={mockQuiz} onClick={newMockOnClick} />);

      expect(getCard()).toBeInTheDocument();
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('handles empty string title', () => {
      const quizWithEmptyTitle: Quiz = {
        ...mockQuiz,
        title: '',
      };
      renderWithTheme(<QuizCard quiz={quizWithEmptyTitle} onClick={mockOnClick} />);
      expect(getTitle()).toBeInTheDocument();
    });

    it('handles empty string description', () => {
      const quizWithEmptyDescription: Quiz = {
        ...mockQuiz,
        description: '',
      };
      renderWithTheme(<QuizCard quiz={quizWithEmptyDescription} onClick={mockOnClick} />);
      expect(getCard()).toBeInTheDocument();
    });

    it('handles playCount of exactly 1000 with comma formatting', () => {
      const quizWith1000Plays: Quiz = {
        ...mockQuiz,
        playCount: 1000,
        isPublic: true,
      };
      renderWithTheme(<QuizCard quiz={quizWith1000Plays} onClick={mockOnClick} />);
      expect(screen.getByText('· 1,000명 플레이')).toBeInTheDocument();
    });

    it('handles all category types without errors', () => {
      const categories = [
        'entertainment',
        'movie',
        'drama',
        'anime',
        'game',
        'music',
        'sports',
        'general',
        'etc',
      ] as const;

      categories.forEach((category) => {
        const { unmount } = renderWithTheme(
          <QuizCard quiz={{ ...mockQuiz, category }} onClick={mockOnClick} />,
        );
        expect(getCard()).toBeInTheDocument();
        unmount();
      });
    });

    it('handles click when thumbnail is absent', async () => {
      const user = userEvent.setup();
      const quizWithoutThumbnail: Quiz = {
        ...mockQuiz,
        thumbnailUrl: null,
      };

      renderWithTheme(<QuizCard quiz={quizWithoutThumbnail} onClick={mockOnClick} />);

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(mockQuiz.id);
    });

    it('handles emojis in title', () => {
      const quizWithEmojis: Quiz = {
        ...mockQuiz,
        title: '🎮 Gaming Quiz 🎮',
      };
      renderWithTheme(<QuizCard quiz={quizWithEmojis} onClick={mockOnClick} />);
      expect(screen.getByText('🎮 Gaming Quiz 🎮')).toBeInTheDocument();
    });

    it('handles emojis in description', () => {
      const quizWithEmojis: Quiz = {
        ...mockQuiz,
        description: 'Test 🎯 description',
      };
      renderWithTheme(<QuizCard quiz={quizWithEmojis} onClick={mockOnClick} />);
      expect(screen.getByText('Test 🎯 description')).toBeInTheDocument();
    });
  });

  describe('integration tests', () => {
    it('displays all quiz information correctly', () => {
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      expect(screen.getByText('Test Quiz Title')).toBeInTheDocument();
      expect(screen.getByText('Test quiz description')).toBeInTheDocument();
      expect(screen.getByText('game')).toBeInTheDocument();
      expect(screen.getByText('· 1,234명 플레이')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('handles click after all content is rendered', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      expect(screen.getByText('Test Quiz Title')).toBeInTheDocument();
      expect(screen.getByText('· 1,234명 플레이')).toBeInTheDocument();

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenCalledWith(1);
    });

    it('maintains correct state with multiple prop updates', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<QuizCard quiz={mockQuiz} onClick={mockOnClick} />);

      await user.click(getCard());
      expect(mockOnClick).toHaveBeenLastCalledWith(1);

      const secondQuiz: Quiz = {
        ...mockQuiz,
        id: 2,
        title: 'Second Quiz',
        playCount: 5000,
        isPublic: true,
      };
      rerender(<QuizCard quiz={secondQuiz} onClick={mockOnClick} />);

      expect(screen.getByText('Second Quiz')).toBeInTheDocument();
      expect(screen.getByText('· 5,000명 플레이')).toBeInTheDocument();

      await user.click(getCard());

      expect(mockOnClick).toHaveBeenLastCalledWith(2);
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });
});
