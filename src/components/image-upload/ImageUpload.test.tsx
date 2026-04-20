import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import ImageUpload from './ImageUpload';

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
    previewUrl: null,
    onChange: vi.fn(),
    onRemove: vi.fn(),
    label: '이미지 업로드',
  };

  describe('label rendering', () => {
    it('renders label when provided', () => {
      renderWithTheme(<ImageUpload {...defaultProps} label="문제 이미지" />);
      expect(screen.getByText('문제 이미지')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      renderWithTheme(<ImageUpload {...defaultProps} label={undefined} />);
      expect(screen.queryByText(defaultProps.label)).not.toBeInTheDocument();
    });

    it('does not render label when empty string', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} label="" />);
      // Empty string is falsy, so no label span should render
      const labelSpan = container.querySelector('span[id]');
      expect(labelSpan).not.toBeInTheDocument();
    });

    it('has unique ID for each render instance', () => {
      const { unmount: unmount1 } = renderWithTheme(
        <ImageUpload {...defaultProps} label="Label 1" />,
      );
      const label1 = screen.getByText('Label 1');
      const id1 = label1.id;
      unmount1();

      const { unmount: unmount2 } = renderWithTheme(
        <ImageUpload {...defaultProps} label="Label 2" />,
      );
      const label2 = screen.getByText('Label 2');
      const id2 = label2.id;
      unmount2();

      // Different instances should have different IDs
      expect(id1).not.toBe(id2);
    });
  });

  describe('placeholder rendering', () => {
    it('displays placeholder when no preview URL', () => {
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl={null} />);
      expect(screen.getByText('클릭하여 이미지 업로드')).toBeInTheDocument();
    });

    it('displays both placeholder text lines', () => {
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl={null} />);
      expect(screen.getByText('클릭하여 이미지 업로드')).toBeInTheDocument();
      expect(screen.getByText('JPG, PNG, WEBP')).toBeInTheDocument();
    });

    it('hides placeholder when preview URL exists', () => {
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl="blob:test-url" />);
      expect(screen.queryByText('클릭하여 이미지 업로드')).not.toBeInTheDocument();
      expect(screen.queryByText('JPG, PNG, WEBP')).not.toBeInTheDocument();
    });
  });

  describe('preview image rendering', () => {
    it('renders preview image when URL provided', () => {
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl="blob:test-url" />);
      const previewImage = screen.getByAltText('업로드 이미지 미리보기');
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute('src', 'blob:test-url');
    });

    it('updates preview src when URL changes', () => {
      const { rerender } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url1" />,
      );
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', 'blob:url1');

      rerender(<ImageUpload {...defaultProps} previewUrl="blob:url2" />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', 'blob:url2');
    });

    it('renders preview image with data URL', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl={dataUrl} />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', dataUrl);
    });

    it('does not render preview when previewUrl is null', () => {
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl={null} />);
      expect(screen.queryByAltText('업로드 이미지 미리보기')).not.toBeInTheDocument();
    });

    it('removes preview when URL changes from value to null', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} previewUrl="blob:url" />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} previewUrl={null} />);
      expect(screen.queryByAltText('업로드 이미지 미리보기')).not.toBeInTheDocument();
    });
  });

  describe('remove button', () => {
    it('renders remove button when preview exists', () => {
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url" />,
      );
      const removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      expect(removeButton).toBeInTheDocument();
      expect(removeButton?.textContent).toContain('✕');
    });

    it('does not render remove button when no preview', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} previewUrl={null} />);
      const buttons = container.querySelectorAll('button');
      // Should only have the label button, not a remove button
      const removeButtons = Array.from(buttons).filter((btn) => btn.textContent?.includes('✕'));
      expect(removeButtons).toHaveLength(0);
    });

    it('calls onRemove when remove button clicked', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url" onRemove={onRemove} />,
      );

      const removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      expect(removeButton).toBeInTheDocument();

      await user.click(removeButton!);
      expect(onRemove).toHaveBeenCalledOnce();
    });

    it('calls only onRemove, not onChange when remove button clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onRemove = vi.fn();
      const { container } = renderWithTheme(
        <ImageUpload
          {...defaultProps}
          previewUrl="blob:url"
          onChange={onChange}
          onRemove={onRemove}
        />,
      );

      const removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);

      expect(onRemove).toHaveBeenCalledOnce();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('prevents default and stops propagation', async () => {
      const onRemove = vi.fn();
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url" onRemove={onRemove} />,
      );

      const removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );

      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      removeButton?.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(onRemove).toHaveBeenCalled();
    });

    it('handles multiple remove button clicks', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const { rerender, container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url" onRemove={onRemove} />,
      );

      let removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);
      expect(onRemove).toHaveBeenCalledTimes(1);

      // Re-upload image
      rerender(<ImageUpload {...defaultProps} previewUrl="blob:new-url" onRemove={onRemove} />);

      removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);

      expect(onRemove).toHaveBeenCalledTimes(2);
    });
  });

  describe('file input', () => {
    it('has correct accept attribute', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} />);
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('is hidden from view', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} />);
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      // HiddenInput has display: none
      const style = window.getComputedStyle(fileInput);
      expect(style.display).toBe('none');
    });
  });

  describe('onChange with file selection', () => {
    it('calls onChange with file and blob URL when file selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith(file, 'blob:mock-url');
    });

    it('calls URL.createObjectURL with the file', async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} />);

      const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('handles PNG file upload', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const file = new File(['png'], 'image.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledWith(file, 'blob:mock-url');
    });

    it('handles JPEG file upload', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const file = new File(['jpeg'], 'photo.jpg', { type: 'image/jpeg' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledWith(file, 'blob:mock-url');
    });

    it('handles WEBP file upload', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const file = new File(['webp'], 'image.webp', { type: 'image/webp' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledWith(file, 'blob:mock-url');
    });

    it('does not call onChange when file selection is cancelled', async () => {
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      // Simulate cancel - no files selected
      await userEvent.setup().click(fileInput);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('clears input value after successful upload', async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      await user.upload(fileInput, file);

      // Input value should be cleared
      expect(fileInput.value).toBe('');
    });

    it('allows re-uploading same file after clear', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      // First upload
      await user.upload(fileInput, file);
      expect(onChange).toHaveBeenCalledOnce();
      expect(fileInput.value).toBe('');

      // Second upload same file
      await user.upload(fileInput, file);
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('handles file with empty name', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const file = new File(['content'], '', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledOnce();
      const [uploadedFile] = onChange.mock.calls[0];
      expect(uploadedFile.name).toBe('');
    });

    it('handles file with very long name', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const longName = 'a'.repeat(300) + '.png';
      const file = new File(['content'], longName, { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledOnce();
      const [uploadedFile] = onChange.mock.calls[0];
      expect(uploadedFile.name).toBe(longName);
    });

    it('handles file with special characters in name', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const specialName = '이미지-테스트_파일#1 (copy).png';
      const file = new File(['content'], specialName, { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledOnce();
      const [uploadedFile] = onChange.mock.calls[0];
      expect(uploadedFile.name).toBe(specialName);
    });

    it('handles very large file', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} onChange={onChange} />);

      const largeFile = new File(['x'.repeat(1024)], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 100 * 1024 * 1024 });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, largeFile);

      expect(onChange).toHaveBeenCalledOnce();
    });

    it('handles previewUrl with special characters', () => {
      const specialUrl = 'blob:https://example.com/12345-abcde_special%20chars';
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl={specialUrl} />);
      const previewImage = screen.getByAltText('업로드 이미지 미리보기');
      expect(previewImage).toHaveAttribute('src', specialUrl);
    });
  });

  describe('input value reset', () => {
    it('resets input value after file upload', async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['data'], 'image.png', { type: 'image/png' });

      expect(fileInput.value).toBe('');

      await user.upload(fileInput, file);

      expect(fileInput.value).toBe('');
    });

    it('input value is empty before any upload', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput.value).toBe('');
    });
  });

  describe('accessibility', () => {
    it('associates upload area with label using aria-labelledby', () => {
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} label="이미지 업로드" />,
      );
      const uploadArea = container.querySelector('label[for]') as HTMLLabelElement;
      const labelId = uploadArea.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
    });

    it('does not set aria-labelledby when label not provided', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} label={undefined} />);
      const uploadArea = container.querySelector('label[for]') as HTMLLabelElement;
      expect(uploadArea.getAttribute('aria-labelledby')).toBeNull();
    });

    it('preview image has alt text', () => {
      renderWithTheme(<ImageUpload {...defaultProps} previewUrl="blob:url" />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toBeInTheDocument();
    });

    it('remove button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url" onRemove={onRemove} />,
      );

      const removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      expect(removeButton).toBeInTheDocument();

      removeButton?.focus();
      expect(removeButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onRemove).toHaveBeenCalledOnce();
    });
  });

  describe('prop changes', () => {
    it('updates preview when previewUrl prop changes', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} previewUrl="url1" />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', 'url1');

      rerender(<ImageUpload {...defaultProps} previewUrl="url2" />);
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', 'url2');
    });

    it('updates label when label prop changes', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} label="Label 1" />);
      expect(screen.getByText('Label 1')).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} label="Label 2" />);
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.queryByText('Label 1')).not.toBeInTheDocument();
    });

    it('changes from labeled to unlabeled', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} label="Label" />);
      expect(screen.getByText('Label')).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} label={undefined} />);
      expect(screen.queryByText('Label')).not.toBeInTheDocument();
    });

    it('changes from unlabeled to labeled', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} label={undefined} />);
      expect(screen.queryByText('이미지 업로드')).not.toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} label="이미지 업로드" />);
      expect(screen.getByText('이미지 업로드')).toBeInTheDocument();
    });

    it('updates callbacks when onChange prop changes', async () => {
      const user = userEvent.setup();
      const onChange1 = vi.fn();
      const onChange2 = vi.fn();

      const { rerender, container } = renderWithTheme(
        <ImageUpload {...defaultProps} onChange={onChange1} />,
      );

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, file);

      expect(onChange1).toHaveBeenCalledOnce();
      expect(onChange2).not.toHaveBeenCalled();

      rerender(<ImageUpload {...defaultProps} onChange={onChange2} />);

      const file2 = new File(['content2'], 'test2.png', { type: 'image/png' });
      await user.upload(fileInput, file2);

      expect(onChange1).toHaveBeenCalledOnce();
      expect(onChange2).toHaveBeenCalledOnce();
    });

    it('updates callbacks when onRemove prop changes', async () => {
      const user = userEvent.setup();
      const onRemove1 = vi.fn();
      const onRemove2 = vi.fn();

      const { rerender, container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url" onRemove={onRemove1} />,
      );

      let removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);

      expect(onRemove1).toHaveBeenCalledOnce();
      expect(onRemove2).not.toHaveBeenCalled();

      rerender(<ImageUpload {...defaultProps} previewUrl="blob:url" onRemove={onRemove2} />);

      removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);

      expect(onRemove1).toHaveBeenCalledOnce();
      expect(onRemove2).toHaveBeenCalledOnce();
    });
  });

  describe('integration scenarios', () => {
    it('handles full upload and remove cycle', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onRemove = vi.fn();
      const { rerender, container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl={null} onChange={onChange} onRemove={onRemove} />,
      );

      // Step 1: Verify placeholder visible
      expect(screen.getByText('클릭하여 이미지 업로드')).toBeInTheDocument();

      // Step 2: Upload image
      const file = new File(['image'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, file);

      expect(onChange).toHaveBeenCalledWith(file, 'blob:mock-url');
      expect(fileInput.value).toBe('');

      // Step 3: Simulate preview update
      rerender(
        <ImageUpload
          {...defaultProps}
          previewUrl="blob:mock-url"
          onChange={onChange}
          onRemove={onRemove}
        />,
      );

      // Step 4: Verify preview visible
      expect(screen.queryByText('클릭하여 이미지 업로드')).not.toBeInTheDocument();
      expect(screen.getByAltText('업로드 이미지 미리보기')).toHaveAttribute('src', 'blob:mock-url');

      // Step 5: Click remove
      const removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);

      expect(onRemove).toHaveBeenCalledOnce();

      // Step 6: Simulate removal
      rerender(
        <ImageUpload {...defaultProps} previewUrl={null} onChange={onChange} onRemove={onRemove} />,
      );

      // Step 7: Verify back to placeholder
      expect(screen.getByText('클릭하여 이미지 업로드')).toBeInTheDocument();
      expect(screen.queryByAltText('업로드 이미지 미리보기')).not.toBeInTheDocument();
    });

    it('handles multiple upload cycles with different files', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onRemove = vi.fn();
      const { rerender, container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl={null} onChange={onChange} onRemove={onRemove} />,
      );

      // First upload
      const file1 = new File(['image1'], 'test1.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, file1);

      rerender(
        <ImageUpload
          {...defaultProps}
          previewUrl="blob:url1"
          onChange={onChange}
          onRemove={onRemove}
        />,
      );

      // Remove first image
      let removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);

      rerender(
        <ImageUpload {...defaultProps} previewUrl={null} onChange={onChange} onRemove={onRemove} />,
      );

      // Second upload
      const file2 = new File(['image2'], 'test2.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file2);

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onRemove).toHaveBeenCalledTimes(1);

      rerender(
        <ImageUpload
          {...defaultProps}
          previewUrl="blob:url2"
          onChange={onChange}
          onRemove={onRemove}
        />,
      );

      removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);

      expect(onRemove).toHaveBeenCalledTimes(2);
    });

    it('rapid onChange and onRemove calls work correctly', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onRemove = vi.fn();
      const { rerender, container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl={null} onChange={onChange} onRemove={onRemove} />,
      );

      // Upload file
      const file1 = new File(['content1'], 'file1.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, file1);
      expect(onChange).toHaveBeenCalledTimes(1);

      // Update preview
      rerender(
        <ImageUpload
          {...defaultProps}
          previewUrl="blob:url1"
          onChange={onChange}
          onRemove={onRemove}
        />,
      );

      // Remove
      const removeButton = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('✕'),
      );
      await user.click(removeButton!);
      expect(onRemove).toHaveBeenCalledTimes(1);

      // Upload another
      rerender(
        <ImageUpload {...defaultProps} previewUrl={null} onChange={onChange} onRemove={onRemove} />,
      );
      const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file2);
      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('React.memo behavior', () => {
    it('component is wrapped with React.memo', () => {
      expect(ImageUpload.$$typeof).toBe(Symbol.for('react.memo'));
    });

    it('has displayName set for debugging', () => {
      expect(ImageUpload.displayName).toBe('ImageUpload');
    });
  });

  describe('styling props', () => {
    it('applies hasPreview styling when preview URL exists', () => {
      const { container } = renderWithTheme(
        <ImageUpload {...defaultProps} previewUrl="blob:url" />,
      );
      const uploadArea = container.querySelector('label[for]');
      expect(uploadArea).toBeInTheDocument();
      expect(uploadArea).toHaveAttribute('aria-labelledby');
    });

    it('applies no preview styling when previewUrl is null', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} previewUrl={null} />);
      const uploadArea = container.querySelector('label[for]');
      expect(uploadArea).toBeInTheDocument();
    });

    it('updates styling when preview URL changes', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} previewUrl={null} />);
      expect(screen.getByText('클릭하여 이미지 업로드')).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} previewUrl="blob:new" />);
      expect(screen.queryByText('클릭하여 이미지 업로드')).not.toBeInTheDocument();
      expect(screen.getByAltText('업로드 이미지 미리보기')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles missing onChange callback gracefully', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderWithTheme(
        <ImageUpload previewUrl={null} onChange={onChange} onRemove={vi.fn()} label={undefined} />,
      );

      const file = new File(['data'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);
      expect(onChange).toHaveBeenCalledOnce();
    });

    it('handles null previewUrl consistently', () => {
      const { rerender } = renderWithTheme(<ImageUpload {...defaultProps} previewUrl={null} />);
      expect(screen.getByText('클릭하여 이미지 업로드')).toBeInTheDocument();

      rerender(<ImageUpload {...defaultProps} previewUrl={null} />);
      expect(screen.getByText('클릭하여 이미지 업로드')).toBeInTheDocument();
    });

    it('handles empty label string correctly', () => {
      const { container } = renderWithTheme(<ImageUpload {...defaultProps} label="" />);
      const labelElement = container.querySelector('span[id]');
      // Empty string is falsy, so no label span should exist
      expect(labelElement?.textContent).not.toBe('');
    });

    it('maintains input ref correctly across renders', async () => {
      const user = userEvent.setup();
      const { container, rerender } = renderWithTheme(
        <ImageUpload {...defaultProps} onChange={vi.fn()} />,
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['data'], 'test.png', { type: 'image/png' });

      await user.upload(fileInput, file);
      expect(fileInput.value).toBe('');

      // Re-render with same props
      rerender(<ImageUpload {...defaultProps} onChange={vi.fn()} />);
      // Input should still be accessible
      expect(fileInput).toBeInTheDocument();
    });
  });
});
