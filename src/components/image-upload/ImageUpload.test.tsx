import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { EMPTY_SLOT, type ImageSlot } from '@/lib/image/imageSlot';
import ImageUpload from './ImageUpload';

// ImageEditModal 은 react-image-crop + canvas 에 의존하므로 더미로 대체 (렌더 안전).
vi.mock('@/components/image-edit-modal', () => ({ default: () => null }));
vi.mock('react-image-crop', () => ({ default: () => null }));

const PLACEHOLDER_TEXT = '클릭하거나 이미지를 끌어다 놓으세요';
const PLACEHOLDER_SUBTEXT = 'JPG, PNG, WEBP · 최대 5MB';

const withImage = (previewUrl = 'blob:test-url'): ImageSlot => ({ ...EMPTY_SLOT, previewUrl });

describe('ImageUpload', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    slot: EMPTY_SLOT,
    aspect: 16 / 9,
    onApply: vi.fn(),
    onRemove: vi.fn(),
    label: '이미지 업로드',
  };

  describe('empty slot (placeholder)', () => {
    it('displays placeholder text when slot is empty', () => {
      renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);
      expect(screen.getByText(PLACEHOLDER_TEXT)).toBeInTheDocument();
    });

    it('displays both placeholder text lines', () => {
      renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);
      expect(screen.getByText(PLACEHOLDER_TEXT)).toBeInTheDocument();
      expect(screen.getByText(PLACEHOLDER_SUBTEXT)).toBeInTheDocument();
    });

    it('renders a hidden file input with image accept', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('does not render preview image when slot is empty', () => {
      renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);
      expect(screen.queryByAltText('업로드 이미지 미리보기')).not.toBeInTheDocument();
    });
  });

  describe('slot with image (preview)', () => {
    it('renders preview image with the slot previewUrl', () => {
      renderWithTheme(<ImageUpload {...defaultProps} slot={withImage('blob:test-url')} />);
      const previewImage = screen.getByAltText('업로드 이미지 미리보기');
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute('src', 'blob:test-url');
    });

    it('renders preview image with a data URL', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      renderWithTheme(<ImageUpload {...defaultProps} slot={withImage(dataUrl)} />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', dataUrl);
    });

    it('hides placeholder when an image is present', () => {
      renderWithTheme(<ImageUpload {...defaultProps} slot={withImage()} />);
      expect(screen.queryByText(PLACEHOLDER_TEXT)).not.toBeInTheDocument();
      expect(screen.queryByText(PLACEHOLDER_SUBTEXT)).not.toBeInTheDocument();
    });

    it('renders a button hosting the preview (clickable for edit)', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} slot={withImage()} />);
      const button = container.querySelector('button[type="button"]');
      expect(button).toBeInTheDocument();
      expect(button?.querySelector('img')).toBeInTheDocument();
    });
  });

  describe('label rendering', () => {
    it('renders label when provided', () => {
      renderWithTheme(<ImageUpload {...defaultProps} label="문제 이미지" />);
      expect(screen.getByText('문제 이미지')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} label={undefined} />);
      const labelSpan = container.querySelector('span[id]');
      expect(labelSpan).not.toBeInTheDocument();
    });

    it('does not render label when empty string', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} label="" />);
      const labelSpan = container.querySelector('span[id]');
      expect(labelSpan).not.toBeInTheDocument();
    });

    it('updates label when label prop changes', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} label="Label 1" />);
      expect(screen.getByText('Label 1')).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} label="Label 2" />);
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.queryByText('Label 1')).not.toBeInTheDocument();
    });
  });

  describe('invalid prop', () => {
    it('renders the upload area in empty slot when invalid', () => {
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} slot={EMPTY_SLOT} invalid />,
      );
      const uploadArea = container.querySelector('label[for]');
      expect(uploadArea).toBeInTheDocument();
      expect(screen.getByText(PLACEHOLDER_TEXT)).toBeInTheDocument();
    });

    it('renders the preview button when invalid with image', () => {
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} slot={withImage()} invalid />,
      );
      expect(container.querySelector('button[type="button"]')).toBeInTheDocument();
    });
  });

  describe('file input change', () => {
    it('does not throw when a valid file is selected', async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);

      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      // openWithFile 경로: 검증 통과 → createObjectURL 호출, 인라인 에러 없음.
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('clears the input value after selection', async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      await user.upload(fileInput, file);

      expect(fileInput.value).toBe('');
    });

    it('rejects files larger than 5MB with an inline error', async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);

      const largeFile = new File(['x'.repeat(1024)], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, largeFile);

      expect(screen.getByRole('alert')).toHaveTextContent('5MB');
    });

    it('rejects non-image MIME types with an inline error', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);

      const pdfFile = new File(['pdf-content'], 'doc.pdf', { type: 'application/pdf' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [pdfFile] } });

      expect(screen.getByRole('alert')).toHaveTextContent('JPG, PNG, WEBP');
    });

    it('clears the error after a subsequent valid file', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);

      const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [pdfFile] } });
      expect(screen.getByRole('alert')).toBeInTheDocument();

      const validFile = new File(['png'], 'image.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('associates upload area with label via aria-labelledby', () => {
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} label="이미지 업로드" />,
      );
      const uploadArea = container.querySelector('label[for]') as HTMLLabelElement;
      expect(uploadArea.getAttribute('aria-labelledby')).toBeTruthy();
    });

    it('does not set aria-labelledby when label not provided', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} label={undefined} />);
      const uploadArea = container.querySelector('label[for]') as HTMLLabelElement;
      expect(uploadArea.getAttribute('aria-labelledby')).toBeNull();
    });

    it('preview image has alt text', () => {
      renderWithTheme(<ImageUpload {...defaultProps} slot={withImage()} />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toBeInTheDocument();
    });
  });

  describe('React.memo behavior', () => {
    it('component is wrapped with React.memo', () => {
      expect((ImageUpload as unknown as { $$typeof: symbol }).$$typeof).toBe(
        Symbol.for('react.memo'),
      );
    });

    it('has displayName set for debugging', () => {
      expect(ImageUpload.displayName).toBe('ImageUpload');
    });
  });

  describe('prop changes', () => {
    it('switches from empty to image slot', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);
      expect(screen.getByText(PLACEHOLDER_TEXT)).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} slot={withImage('blob:new')} />);
      expect(screen.queryByText(PLACEHOLDER_TEXT)).not.toBeInTheDocument();
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', 'blob:new');
    });

    it('switches from image to empty slot', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} slot={withImage()} />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} slot={EMPTY_SLOT} />);
      expect(screen.queryByAltText('업로드 이미지 미리보기')).not.toBeInTheDocument();
      expect(screen.getByText(PLACEHOLDER_TEXT)).toBeInTheDocument();
    });
  });
});
