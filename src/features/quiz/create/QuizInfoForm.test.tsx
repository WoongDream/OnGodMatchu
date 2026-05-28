import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizInfoForm from './QuizInfoForm';
import { CATEGORIES } from '@/types/quiz';
import type { Category } from '@/types';

// Input mock: label 은 이제 ReactNode 일 수 있으므로 그대로 렌더한다.
// 식별을 위해 placeholder 기반으로 노출 (제목 input 은 `퀴즈 제목을 입력하세요`).
vi.mock('@/components/input', () => ({
  default: ({ label, value, onChange, placeholder, error }: any) => (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="title-input"
      />
      {error && <span data-testid="title-error">{error}</span>}
    </div>
  ),
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

  describe('초기 렌더', () => {
    it('퀴즈 정보 섹션 제목을 노출한다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByText('퀴즈 정보')).toBeInTheDocument();
    });

    it('이미지 업로드 컴포넌트를 노출한다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
      expect(screen.getByText('썸네일 (선택)')).toBeInTheDocument();
    });

    it('제목 input 을 노출한다 (placeholder 기준)', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('퀴즈 제목을 입력하세요')).toBeInTheDocument();
    });

    it('설명 textarea 를 노출한다 (placeholder 기준)', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('퀴즈에 대한 설명을 입력하세요');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('카테고리 라벨과 모든 카테고리 칩을 노출한다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      CATEGORIES.forEach(({ label }) => {
        expect(screen.getByTestId(`chip-${label}`)).toBeInTheDocument();
      });
    });
  });

  describe('제목 콜백', () => {
    it('초기 title prop 이 input 에 반영된다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} title="My Quiz" />);
      const input = screen.getByPlaceholderText('퀴즈 제목을 입력하세요') as HTMLInputElement;
      expect(input.value).toBe('My Quiz');
    });

    it('input 변경 시 onTitleChange 가 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} title="" />);

      const input = screen.getByPlaceholderText('퀴즈 제목을 입력하세요');
      await user.type(input, 'ABC');

      expect(mockOnTitleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('설명 textarea 동작', () => {
    it('초기 description prop 이 textarea 에 반영된다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} description="My Description" />);
      const textarea = screen.getByPlaceholderText(
        '퀴즈에 대한 설명을 입력하세요',
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('My Description');
    });

    it('textarea 입력 시 onDescriptionChange 가 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} description="" />);

      const textarea = screen.getByPlaceholderText('퀴즈에 대한 설명을 입력하세요');
      await user.type(textarea, 'ABC');

      expect(mockOnDescriptionChange).toHaveBeenCalledTimes(3);
    });

    it('textarea 는 멀티라인 입력을 지원한다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} description="" />);

      const textarea = screen.getByPlaceholderText('퀴즈에 대한 설명을 입력하세요');
      await user.type(textarea, 'L1\nL2');

      expect(mockOnDescriptionChange).toHaveBeenCalled();
    });
  });

  describe('카테고리 콜백', () => {
    it('category prop 에 따라 active 칩이 정확히 하나만 표시된다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} category="game" />);

      const activeChips = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('data-active') === 'true');
      expect(activeChips).toHaveLength(1);
      expect(activeChips[0]).toHaveTextContent('게임');
    });

    it('칩 클릭 시 onCategoryChange 가 해당 value 로 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizInfoForm {...defaultProps} category={null} />);

      await user.click(screen.getByTestId('chip-게임'));

      expect(mockOnCategoryChange).toHaveBeenCalledWith('game');
    });
  });

  describe('썸네일', () => {
    it('thumbnailPreviewUrl 이 있으면 preview-image 가 노출된다', () => {
      renderWithTheme(
        <QuizInfoForm {...defaultProps} thumbnailPreviewUrl="https://example.com/image.jpg" />,
      );
      expect(screen.getByTestId('preview-image')).toBeInTheDocument();
    });

    it('thumbnailPreviewUrl 이 null 이면 preview-image 가 없다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} thumbnailPreviewUrl={null} />);
      expect(screen.queryByTestId('preview-image')).not.toBeInTheDocument();
    });

    it('remove 버튼 클릭 시 onThumbnailRemove 가 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <QuizInfoForm {...defaultProps} thumbnailPreviewUrl="https://example.com/image.jpg" />,
      );

      await user.click(screen.getByTestId('remove-image-button'));

      expect(mockOnThumbnailRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('errors prop', () => {
    it('title 에러가 있으면 제목 옆에 빨간 dot 과 인라인 에러 메시지가 노출된다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} errors={{ title: '제목을 입력해주세요' }} />);

      // Input mock 이 error 를 별도 노출
      expect(screen.getByTestId('title-error')).toHaveTextContent('제목을 입력해주세요');
      // ReactNode label 에 dot 이 포함됐는지
      expect(screen.getAllByText('•').length).toBeGreaterThanOrEqual(1);
    });

    it('title 에러가 없으면 title-error 가 노출되지 않는다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.queryByTestId('title-error')).not.toBeInTheDocument();
    });

    it('description 에러가 있으면 라벨 옆 dot 과 인라인 에러 메시지가 노출된다', () => {
      renderWithTheme(
        <QuizInfoForm {...defaultProps} errors={{ description: '설명을 입력해주세요' }} />,
      );

      expect(screen.getByText('설명을 입력해주세요')).toBeInTheDocument();
      // 라벨 옆 dot 존재
      expect(screen.getAllByText('•').length).toBeGreaterThanOrEqual(1);
    });

    it('description 에러가 없으면 인라인 에러 메시지가 없다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.queryByText('설명을 입력해주세요')).not.toBeInTheDocument();
    });

    it('category 에러가 있으면 라벨 옆 dot 과 인라인 에러 메시지가 노출된다', () => {
      renderWithTheme(
        <QuizInfoForm {...defaultProps} errors={{ category: '카테고리를 선택해주세요' }} />,
      );

      expect(screen.getByText('카테고리를 선택해주세요')).toBeInTheDocument();
      expect(screen.getAllByText('•').length).toBeGreaterThanOrEqual(1);
    });

    it('category 에러가 없으면 인라인 에러 메시지가 없다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.queryByText('카테고리를 선택해주세요')).not.toBeInTheDocument();
    });

    it('errors 전체가 undefined 이면 dot 이 노출되지 않는다', () => {
      renderWithTheme(<QuizInfoForm {...defaultProps} />);
      expect(screen.queryByText('•')).not.toBeInTheDocument();
    });
  });

  describe('슬롯', () => {
    it('belowTitleSlot 의 children 이 렌더된다', () => {
      renderWithTheme(
        <QuizInfoForm
          {...defaultProps}
          belowTitleSlot={<div data-testid="below-title-slot">below-title</div>}
        />,
      );

      expect(screen.getByTestId('below-title-slot')).toHaveTextContent('below-title');
    });

    it('belowCategorySlot 의 children 이 렌더된다', () => {
      renderWithTheme(
        <QuizInfoForm
          {...defaultProps}
          belowCategorySlot={<div data-testid="below-category-slot">below-category</div>}
        />,
      );

      expect(screen.getByTestId('below-category-slot')).toHaveTextContent('below-category');
    });

    it('belowTitleSlot 은 belowCategorySlot 보다 DOM 상 앞에 위치한다', () => {
      renderWithTheme(
        <QuizInfoForm
          {...defaultProps}
          belowTitleSlot={<div data-testid="below-title-slot">A</div>}
          belowCategorySlot={<div data-testid="below-category-slot">B</div>}
        />,
      );

      const titleSlot = screen.getByTestId('below-title-slot');
      const categorySlot = screen.getByTestId('below-category-slot');
      // compareDocumentPosition: 4 = FOLLOWING (categorySlot 이 titleSlot 보다 뒤)

      expect(
        titleSlot.compareDocumentPosition(categorySlot) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe('memo 회귀', () => {
    it('displayName 이 QuizInfoForm 이다', () => {
      expect(QuizInfoForm.displayName).toBe('QuizInfoForm');
    });

    it('title prop 이 바뀌면 화면이 갱신된다', () => {
      const { rerender } = renderWithTheme(<QuizInfoForm {...defaultProps} title="A" />);
      expect(
        (screen.getByPlaceholderText('퀴즈 제목을 입력하세요') as HTMLInputElement).value,
      ).toBe('A');

      rerender(<QuizInfoForm {...defaultProps} title="B" />);
      expect(
        (screen.getByPlaceholderText('퀴즈 제목을 입력하세요') as HTMLInputElement).value,
      ).toBe('B');
    });

    it('category prop 이 바뀌면 active 칩이 갱신된다', () => {
      const { rerender } = renderWithTheme(<QuizInfoForm {...defaultProps} category="game" />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'true');

      rerender(<QuizInfoForm {...defaultProps} category="music" />);
      expect(screen.getByTestId('chip-게임')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('chip-음악')).toHaveAttribute('data-active', 'true');
    });
  });
});
