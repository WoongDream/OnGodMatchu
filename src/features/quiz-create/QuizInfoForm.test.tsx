import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizInfoForm from './QuizInfoForm';
import { CATEGORIES } from '@/types/quiz';
import type { Category } from '@/types';

vi.mock('@/components/input', () => ({
  default: ({ label, value, onChange, placeholder }: any) => {
    const inputId = `input-id-${label}`;
    return (
      <div>
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={`input-${label}`}
        />
      </div>
    );
  },
}));

vi.mock('@/components/chip-button', () => ({
  default: ({ active, onClick, children }: any) => (
    <button onClick={onClick} data-active={active} data-testid={`chip-${children}`}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/image-upload', () => ({
  default: ({ label, previewUrl, onChange, onRemove }: any) => (
    <div data-testid="image-upload">
      {label && <div>{label}</div>}
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="preview" data-testid="preview-image" />
          <button onClick={onRemove} data-testid="remove-image-button">
            Remove
          </button>
        </>
      ) : (
        <div>No image</div>
      )}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            onChange(file, url);
          }
        }}
        data-testid="hidden-file-input"
      />
    </div>
  ),
}));

describe('QuizInfoForm', () => {
  const mockOnTitleChange = vi.fn();
  const mockOnDescriptionChange = vi.fn();
  const mockOnCategoryChange = vi.fn();
  const mockOnThumbnailChange = vi.fn();
  const mockOnThumbnailRemove = vi.fn();

  const defaultProps = {
    title: '',
    description: '',
    category: null as Category | null,
    thumbnailPreviewUrl: null,
    onTitleChange: mockOnTitleChange,
    onDescriptionChange: mockOnDescriptionChange,
    onCategoryChange: mockOnCategoryChange,
    onThumbnailChange: mockOnThumbnailChange,
    onThumbnailRemove: mockOnThumbnailRemove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the form section with title', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByText('퀴즈 정보')).toBeInTheDocument();
    });

    it('renders the image upload component', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });

    it('renders title input with correct label', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('renders description input with correct label', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
    });

    it('renders all category chips', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      CATEGORIES.forEach(({ label }) => {
        expect(screen.getByTestId(`chip-${label}`)).toBeInTheDocument();
      });
    });

    it('renders exactly 5 category chips', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      const chips = screen.getAllByRole('button');
      const categoryChips = chips.filter((btn) => btn.getAttribute('data-active') !== null);
      expect(categoryChips).toHaveLength(5);
    });
  });

  describe('Title Input Handling', () => {
    it('displays initial title prop value', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} title="My Quiz" />);
      const titleInput = screen.getByTestId('input-제목') as HTMLInputElement;
      expect(titleInput.value).toBe('My Quiz');
    });

    it('displays empty string when title prop is empty', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} title="" />);
      const titleInput = screen.getByTestId('input-제목') as HTMLInputElement;
      expect(titleInput.value).toBe('');
    });

    it('calls onTitleChange when title input changes', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} title="" />);

      const titleInput = screen.getByTestId('input-제목');
      await user.type(titleInput, 'New Title');

      expect(mockOnTitleChange).toHaveBeenCalled();
    });

    it('calls onTitleChange with each keystroke', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} title="" />);

      const titleInput = screen.getByTestId('input-제목');
      await user.type(titleInput, 'ABC');

      expect(mockOnTitleChange).toHaveBeenCalledTimes(3);
    });

    it('shows correct placeholder text for title input', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      const titleInput = screen.getByPlaceholderText('퀴즈 제목을 입력하세요');
      expect(titleInput).toBeInTheDocument();
    });

    it('handles empty title input', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} title="Initial" />);

      const titleInput = screen.getByTestId('input-제목');
      await user.clear(titleInput);

      expect(mockOnTitleChange).toHaveBeenCalledWith('');
    });

    it('handles special characters in title', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} title="" />);

      const titleInput = screen.getByTestId('input-제목');
      await user.type(titleInput, '!@#$%');

      expect(mockOnTitleChange).toHaveBeenCalledTimes(5);
    });

    it('handles korean characters in title', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} title="" />);

      const titleInput = screen.getByTestId('input-제목');
      await user.type(titleInput, '한글 테스트');

      expect(mockOnTitleChange).toHaveBeenCalled();
    });
  });

  describe('Description Input Handling', () => {
    it('displays initial description prop value', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} description="My Description" />);
      const descriptionInput = screen.getByTestId('input-설명') as HTMLInputElement;
      expect(descriptionInput.value).toBe('My Description');
    });

    it('displays empty string when description prop is empty', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} description="" />);
      const descriptionInput = screen.getByTestId('input-설명') as HTMLInputElement;
      expect(descriptionInput.value).toBe('');
    });

    it('calls onDescriptionChange when description input changes', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} description="" />);

      const descriptionInput = screen.getByTestId('input-설명');
      await user.type(descriptionInput, 'New Description');

      expect(mockOnDescriptionChange).toHaveBeenCalled();
    });

    it('calls onDescriptionChange with each keystroke', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} description="" />);

      const descriptionInput = screen.getByTestId('input-설명');
      await user.type(descriptionInput, 'ABC');

      expect(mockOnDescriptionChange).toHaveBeenCalledTimes(3);
    });

    it('shows correct placeholder text for description input', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      const descriptionInput = screen.getByPlaceholderText('퀴즈에 대한 설명을 입력하세요');
      expect(descriptionInput).toBeInTheDocument();
    });

    it('handles empty description input', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} description="Initial" />);

      const descriptionInput = screen.getByTestId('input-설명');
      await user.clear(descriptionInput);

      expect(mockOnDescriptionChange).toHaveBeenCalledWith('');
    });

    it('handles multiline text in description', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} description="" />);

      const descriptionInput = screen.getByTestId('input-설명');
      await user.type(descriptionInput, 'Line 1\nLine 2');

      expect(mockOnDescriptionChange).toHaveBeenCalled();
    });

    it('handles very long description text', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(500);
      renderWithTheme(<QuizInfoForm {...defaultProps} description="" />);

      const descriptionInput = screen.getByTestId('input-설명');
      await user.type(descriptionInput, longText);

      expect(mockOnDescriptionChange).toHaveBeenCalledTimes(500);
    });
  });

  describe('Category Selection', () => {
    it('renders all category options from CATEGORIES', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);

      const expectedCategories = ['게임', '음악', '문화', '방송', '기타'];
      expectedCategories.forEach((category) => {
        expect(screen.getByTestId(`chip-${category}`)).toBeInTheDocument();
      });
    });

    it('renders categories in correct order', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      const chips = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('data-active') !== null);

      CATEGORIES.forEach((cat, index) => {
        expect(chips[index]).toHaveTextContent(cat.label);
      });
    });

    it('no category chip is active when category prop is null', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} category={null} />);

      CATEGORIES.forEach(({ label }) => {
        const chip = screen.getByTestId(`chip-${label}`);
        expect(chip).toHaveAttribute('data-active', 'false');
      });
    });

    it('marks correct chip as active when category is selected', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} category="game" />);

      const gameChip = screen.getByTestId('chip-게임');
      expect(gameChip).toHaveAttribute('data-active', 'true');
    });

    it('only one category chip is active at a time', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} category="music" />);

      const activeChips = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('data-active') === 'true');
      expect(activeChips).toHaveLength(1);
      expect(activeChips[0]).toHaveTextContent('음악');
    });

    it('calls onCategoryChange when category chip is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} category={null} />);

      const gameChip = screen.getByTestId('chip-게임');
      await user.click(gameChip);

      expect(mockOnCategoryChange).toHaveBeenCalledWith('game');
    });

    it('calls onCategoryChange with correct category value for all categories', async () => {
      const user = userEvent.setup();
      const testCases: { value: Category; label: string }[] = [
        { value: 'game', label: '게임' },
        { value: 'music', label: '음악' },
        { value: 'culture', label: '문화' },
        { value: 'broadcast', label: '방송' },
        { value: 'etc', label: '기타' },
      ];

      for (const { value, label } of testCases) {
        const { unmount } = renderWithTheme(<QuizInfoForm {...defaultProps} category={null} />);
        const chip = screen.getByTestId(`chip-${label}`);
        await user.click(chip);
        expect(mockOnCategoryChange).toHaveBeenCalledWith(value);
        mockOnCategoryChange.mockClear();
        unmount();
      }
    });

    it('allows changing from one category to another', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<QuizInfoForm {...defaultProps} category="game" />);

      const musicChip = screen.getByTestId('chip-음악');
      await user.click(musicChip);

      expect(mockOnCategoryChange).toHaveBeenCalledWith('music');

      rerender(<QuizInfoForm {...defaultProps} category="music" />);

      const gameChip = screen.getByTestId('chip-게임');
      expect(gameChip).toHaveAttribute('data-active', 'false');
      const updatedMusicChip = screen.getByTestId('chip-음악');
      expect(updatedMusicChip).toHaveAttribute('data-active', 'true');
    });

    it('handles clicking the same category multiple times', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} category="game" />);

      const gameChip = screen.getByTestId('chip-게임');
      await user.click(gameChip);
      await user.click(gameChip);
      await user.click(gameChip);

      expect(mockOnCategoryChange).toHaveBeenCalledTimes(3);
      expect(mockOnCategoryChange).toHaveBeenCalledWith('game');
    });

    it('displays inactive state for non-selected category', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} category="game" />);

      const musicChip = screen.getByTestId('chip-음악');
      expect(musicChip).toHaveAttribute('data-active', 'false');
    });

    it('correctly updates active state after category change', () => {
      const { rerender } = renderWithTheme(<QuizInfoForm {...defaultProps} category={null} />);

      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');

      rerender(<QuizInfoForm {...defaultProps} category="game" />);

      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');
    });
  });

  describe('Thumbnail Handling', () => {
    it('renders image upload component with correct label', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByText('썸네일 (선택)')).toBeInTheDocument();
    });

    it('displays preview image when thumbnailPreviewUrl is provided', () => {
      renderWithTheme(
        <QuizInfoForm {...defaultProps} thumbnailPreviewUrl="https://example.com/image.jpg" />,
      );
      expect(screen.getByTestId('preview-image')).toBeInTheDocument();
    });

    it('does not display preview image when thumbnailPreviewUrl is null', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} thumbnailPreviewUrl={null} />);
      expect(screen.queryByTestId('preview-image')).not.toBeInTheDocument();
    });

    it('calls onThumbnailRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizInfoForm {...defaultProps} thumbnailPreviewUrl="https://example.com/image.jpg" />,
      );

      const removeButton = screen.getByTestId('remove-image-button');
      await user.click(removeButton);

      expect(mockOnThumbnailRemove).toHaveBeenCalledTimes(1);
    });

    it('passes preview URL to image upload component', () => {
      const previewUrl = 'https://example.com/quiz-thumb.jpg';
      renderWithTheme(<QuizInfoForm {...defaultProps} thumbnailPreviewUrl={previewUrl} />);
      const previewImage = screen.getByTestId('preview-image') as HTMLImageElement;
      expect(previewImage.src).toBe(previewUrl);
    });

    it('handles null thumbnail preview URL', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} thumbnailPreviewUrl={null} />);
      expect(screen.getByText('No image')).toBeInTheDocument();
    });
  });

  describe('Combined Props Scenarios', () => {
    it('renders form with all props filled', () => {
      renderWithTheme(
        <QuizInfoForm
          {...defaultProps}
          title="Quiz Title"
          description="Quiz Description"
          category="game"
          thumbnailPreviewUrl="https://example.com/image.jpg"
        />,
      );

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe('Quiz Title');
      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe('Quiz Description');
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('preview-image')).toBeInTheDocument();
    });

    it('renders form with minimal props (all empty/null)', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe('');
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.queryByTestId('preview-image')).not.toBeInTheDocument();
    });

    it('handles updating title while category is selected', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} category="music" />);

      const titleInput = screen.getByTestId('input-제목');
      await user.type(titleInput, 'Updated Title');

      expect(mockOnTitleChange).toHaveBeenCalled();
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'true');
    });

    it('handles updating description and category together', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} />);

      const descriptionInput = screen.getByTestId('input-설명');
      await user.type(descriptionInput, 'Updated description');

      const gameChip = screen.getByTestId('chip-게임');
      await user.click(gameChip);

      expect(mockOnDescriptionChange).toHaveBeenCalled();
      expect(mockOnCategoryChange).toHaveBeenCalledWith('game');
    });
  });

  describe('Display Name', () => {
    it('has correct display name for debugging', () => {
      expect(QuizInfoForm.displayName).toBe('QuizInfoForm');
    });
  });

  describe('Memo Optimization', () => {
    it('does not re-render when props remain the same', () => {
      const { rerender } = renderWithTheme(
        <QuizInfoForm {...defaultProps} title="Quiz" category="game" />,
      );

      const titleBefore = screen.getByTestId('input-제목');
      expect((titleBefore as HTMLInputElement).value).toBe('Quiz');

      rerender(<QuizInfoForm {...defaultProps} title="Quiz" category="game" />);

      const titleAfter = screen.getByTestId('input-제목');
      expect((titleAfter as HTMLInputElement).value).toBe('Quiz');
    });

    it('re-renders when title prop changes', () => {
      const { rerender } = renderWithTheme(<QuizInfoForm {...defaultProps} title="First Title" />);

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe('First Title');

      rerender(<QuizInfoForm {...defaultProps} title="Second Title" />);

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe('Second Title');
    });

    it('re-renders when description prop changes', () => {
      const { rerender } = renderWithTheme(
        <QuizInfoForm {...defaultProps} description="First Description" />,
      );

      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe(
        'First Description',
      );

      rerender(<QuizInfoForm {...defaultProps} description="Second Description" />);

      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe(
        'Second Description',
      );
    });

    it('re-renders when category prop changes', () => {
      const { rerender } = renderWithTheme(<QuizInfoForm {...defaultProps} category="game" />);

      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');

      rerender(<QuizInfoForm {...defaultProps} category="music" />);

      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'true');
    });

    it('re-renders when thumbnail prop changes', () => {
      const { rerender } = renderWithTheme(
        <QuizInfoForm {...defaultProps} thumbnailPreviewUrl={null} />,
      );

      expect(screen.queryByTestId('preview-image')).not.toBeInTheDocument();

      rerender(
        <QuizInfoForm {...defaultProps} thumbnailPreviewUrl="https://example.com/image.jpg" />,
      );

      expect(screen.getByTestId('preview-image')).toBeInTheDocument();
    });
  });

  describe('Event Handler Isolation', () => {
    it('title changes do not affect other callbacks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} />);

      const titleInput = screen.getByTestId('input-제목');
      await user.type(titleInput, 'New Title');

      expect(mockOnTitleChange).toHaveBeenCalled();
      expect(mockOnDescriptionChange).not.toHaveBeenCalled();
      expect(mockOnCategoryChange).not.toHaveBeenCalled();
    });

    it('description changes do not affect other callbacks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} />);

      const descriptionInput = screen.getByTestId('input-설명');
      await user.type(descriptionInput, 'New Description');

      expect(mockOnDescriptionChange).toHaveBeenCalled();
      expect(mockOnTitleChange).not.toHaveBeenCalled();
      expect(mockOnCategoryChange).not.toHaveBeenCalled();
    });

    it('category changes do not affect other callbacks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} />);

      const gameChip = screen.getByTestId('chip-게임');
      await user.click(gameChip);

      expect(mockOnCategoryChange).toHaveBeenCalled();
      expect(mockOnTitleChange).not.toHaveBeenCalled();
      expect(mockOnDescriptionChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty strings for all text inputs', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} title="" description="" />);

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe('');
    });

    it('handles very long title text', () => {
      const longTitle = 'a'.repeat(1000);
      renderWithTheme(<QuizInfoForm {...defaultProps} title={longTitle} />);

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe(longTitle);
    });

    it('handles special characters in description', () => {
      const specialDesc = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      renderWithTheme(<QuizInfoForm {...defaultProps} description={specialDesc} />);

      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe(specialDesc);
    });

    it('handles korean characters throughout', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} title="한글 제목" description="한글 설명" />);

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe('한글 제목');
      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe('한글 설명');
    });

    it('handles all category types', () => {
      const categories: Category[] = ['game', 'music', 'culture', 'broadcast', 'etc'];

      categories.forEach((cat) => {
        const { unmount } = renderWithTheme(<QuizInfoForm {...defaultProps} category={cat} />);
        const categoryLabel = CATEGORIES.find((c) => c.value === cat)?.label;
        expect(screen.getByTestId(`chip-${categoryLabel}`)).toHaveAttribute('data-active', 'true');
        unmount();
      });
    });

    it('handles empty URL for thumbnail', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} thumbnailPreviewUrl="" />);

      const previewImage = screen.queryByTestId('preview-image');
      expect(previewImage).not.toBeInTheDocument();
    });

    it('handles null values for all optional props', () => {
      renderWithTheme(
        <QuizInfoForm
          {...defaultProps}
          title=""
          description=""
          category={null}
          thumbnailPreviewUrl={null}
        />,
      );

      expect((screen.getByTestId('input-제목') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('input-설명') as HTMLInputElement).value).toBe('');
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.queryByTestId('preview-image')).not.toBeInTheDocument();
    });
  });
});
